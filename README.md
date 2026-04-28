# nestjs-ai-toolkit

NestJS module that bridges [Vercel AI SDK](https://ai-sdk.dev/) tools with NestJS dependency injection. Define AI tools as injectable providers, auto-discover them via decorator metadata, and build typed tool sets for `streamText`/`generateText` calls.

## Installation

```ts
npm install nestjs-ai-toolkit
```

## Quick Start

### 1. Define your app's context (once)

`ToolContext` is an empty interface. Extend it once in your app with the per-request fields your
tools need — typically a tenant/project ID and anything else passed at call time (e.g. a stream
writer):

```ts
import { ToolContext } from 'nestjs-ai-toolkit';
import type { UIMessageStreamWriter } from 'ai';

// Define once, use everywhere
export interface AppToolContext extends ToolContext {
  userId: string;
  writer?: UIMessageStreamWriter; // optional — only tools that stream need it
}
```

### 2. Define a tool

```ts
import { AiTool, AiToolProvider } from 'nestjs-ai-toolkit';
import { tool } from 'ai';
import z from 'zod';
import type { AppToolContext } from './app-tool-context';

@AiTool('readFile')
export class ReadFileTool implements AiToolProvider<AppToolContext> {
  constructor(private readonly sandboxService: SandboxService) {}

  build(ctx: AppToolContext) {
    return tool({
      description: 'Read a file from the project',
      inputSchema: z.object({
        path: z.string().describe('File path relative to project root'),
      }),
      execute: async ({ path }) => {
        return this.sandboxService.readFile(ctx.projectId, path); // ✅ typed, no cast
      },
    });
  }
}
```

Tools that write to the AI SDK stream read `ctx.writer`:

```ts
@AiTool('askQuestion')
export class AskQuestionTool implements AiToolProvider<AppToolContext> {
  build(ctx: AppToolContext) {
    return tool({
      description: 'Ask the user a question',
      inputSchema: z.object({ question: z.string() }),
      execute: async ({ question }) => {
        ctx.writer?.write({ type: 'data-ask-question', question });
        return 'Question sent';
      },
    });
  }
}
```

The `@AiTool()` decorator accepts a string (tool name) or a full metadata object:

```ts
@AiTool({
  name: 'editFile',
  modes: ['agent'],
  tags: ['file-ops', 'writes-files'],
})
export class EditFileTool implements AiToolProvider<AppToolContext> { ... }
```

### 3. Register in a module

```ts
import { Module } from '@nestjs/common';
import { AiToolsModule } from 'nestjs-ai-toolkit';

@Module({
  imports: [AiToolsModule],
  providers: [ReadFileTool, EditFileTool, AskQuestionTool, SandboxService],
})
export class AiModule {}
```

### 4. Build tool sets in your service

Pass the per-request context — including any stream writer — to `buildToolSet`:

```ts
import { Injectable } from '@nestjs/common';
import { ToolRegistryService } from 'nestjs-ai-toolkit';
import { streamText } from 'ai';
import type { AppToolContext } from './app-tool-context';

@Injectable()
export class ChatService {
  constructor(private readonly toolRegistry: ToolRegistryService) {}

  async chat(projectId: string, writer: UIMessageStreamWriter, messages: Message[]) {
    const tools = this.toolRegistry.buildToolSet<AppToolContext>(
      { projectId, writer },
      { mode: 'agent' }, // optional filter
    );

    return streamText({ model: myModel, messages, tools });
  }
}
```

## API Reference

### `AiToolsModule`

NestJS module. Import it in any module where you want to use the tool registry.

### `@AiTool(nameOrMetadata)`

Class decorator. Marks a class as an AI tool provider. Composes `@Injectable()` + metadata.

| Parameter | Type | Description |
|-----------|------|-------------|
| `nameOrMetadata` | `string \| AiToolMetadata` | Tool name (shorthand) or full metadata object |

### `AiToolProvider<TContext>`

Interface that tool classes must implement.

```ts
interface AiToolProvider<TContext extends ToolContext = ToolContext> {
  build(ctx: TContext): Tool;
}
```

### `ToolRegistryService`

Injectable service — the main public API.

| Method | Signature | Description |
|--------|-----------|-------------|
| `buildToolSet` | `(ctx: TContext, filter?: ToolFilter) => Record<string, Tool>` | Builds AI SDK tools from all matching providers |
| `getTools` | `(filter?: ToolFilter) => AiToolMetadata[]` | Returns metadata for matching tools |
| `getToolProvider` | `(name: string) => AiToolProvider` | Gets a single provider by name (throws if missing) |

### `ToolFilter`

```ts
interface ToolFilter {
  mode?: string;         // Only tools available in this mode
  tags?: string[];       // Only tools with ALL of these tags
  exclude?: string[];    // Exclude tools by name
  include?: string[];    // Include ONLY these tools (allowlist)
}
```

### `ToolContext`

```ts
interface ToolContext {}
```

An empty interface. Extend it in your app with the per-request fields your tools need. The library
does not prescribe any specific fields — every app has a different context shape:

```ts
// Your app defines this once
interface AppToolContext extends ToolContext {
  projectId: string;         // whatever your app needs
  writer?: UIMessageStreamWriter; // include if any tools stream data parts
}

// Each tool is typed against it
class MyTool implements AiToolProvider<AppToolContext> {
  build(ctx: AppToolContext) { /* ctx.projectId is typed */ }
}

// Registry call is typed end-to-end
registry.buildToolSet<AppToolContext>({ projectId: '123', writer });
```

## Testing

Because tools are `@AiTool()` providers — ordinary NestJS injectables — you test them with
`Test.createTestingModule()` and mock their service dependencies the standard NestJS way. No custom
test harness needed, and no manual re-wiring when tools are added or removed.

Import testing utilities from the `./testing` subpath:

```ts
import {
  TestToolRegistry,
  createMockToolProvider,
  createMockToolContext,
} from 'nestjs-ai-toolkit/testing';
```

### Unit-test a single tool

Mock only the services that tool depends on. Everything else is standard NestJS:

```ts
const module = await Test.createTestingModule({
  providers: [
    ReadFileTool,
    { provide: SandboxService, useValue: { readFile: jest.fn().mockResolvedValue('content') } },
  ],
}).compile();

const readFileTool = module.get(ReadFileTool);
const builtTool = readFileTool.build<AppToolContext>({ projectId: 'test-123' });
const result = await builtTool.execute!(
  { path: 'index.ts' },
  { toolCallId: 'call-1', messages: [], abortSignal: new AbortController().signal },
);
expect(result).toContain('content');
```

### Test the full registry

```ts
const module = await Test.createTestingModule({
  imports: [AiToolsModule],
  providers: [
    ReadFileTool,
    EditFileTool,
    { provide: SandboxService, useValue: mockSandbox },
  ],
}).compile();
await module.init();

const registry = module.get(ToolRegistryService);
const toolSet = registry.buildToolSet<AppToolContext>(
  { projectId: 'test' },
  { mode: 'agent' },
);
expect(Object.keys(toolSet)).toContain('readFile');
```

### TestToolRegistry (non-NestJS environments)

For test suites that run outside the Nest process (e.g. AI integration / end-to-end agent tests):

```ts
const registry = new TestToolRegistry();
registry.register(createMockToolProvider(), { name: 'readFile' });
registry.register(createMockToolProvider(), { name: 'editFile', modes: ['agent'] });

const planTools = registry.buildToolSet(
  createMockToolContext<AppToolContext>({ projectId: 'test' }),
  { mode: 'plan' },
);
expect(Object.keys(planTools)).not.toContain('editFile');
```

## Architecture

```
Consumer App                   nestjs-ai-toolkit              Vercel AI SDK
┌──────────────┐               ┌─────────────────────┐       ┌────────────┐
│ @AiTool()    │──discovered───│  AiToolsExplorer    │       │            │
│  providers   │    by         │    (internal)       │       │ streamText │
│              │               │        ↑            │       │            │
│ ChatService ─┼───────────────│→ ToolRegistryService│─tools─│─→ tools    │
│              │  buildToolSet │    (exported)       │       │            │
└──────────────┘               └─────────────────────┘       └────────────┘
```

The library uses a 3-layer architecture:

1. **AiToolsMetadataAccessor** (internal) — reads `@AiTool()` decorator metadata via NestJS Reflector
2. **AiToolsExplorer** (internal) — discovers providers on module init, validates them, stores in a Map
3. **ToolRegistryService** (exported) — public API for consumers to build tool sets with filtering
