import { Test } from '@nestjs/testing';
import { tool } from 'ai';
import z from 'zod';
import { AiToolsModule } from '../../src/lib/ai-tools.module';
import { AiTool } from '../../src/lib/decorators/ai-tool.decorator';
import type { AiToolProvider } from '../../src/lib/interfaces/ai-tool-provider.interface';
import { ToolRegistryService } from '../../src/lib/tool-registry.service';

@AiTool({ name: 'testTool', modes: ['agent'], tags: ['test'] })
class TestToolProvider implements AiToolProvider {
	build(ctx: Record<string, unknown>) {
		return tool({
			description: 'A test tool',
			inputSchema: z.object({ input: z.string() }),
			execute: async ({ input }) => `processed: ${input} for ${ctx['projectId']}`,
		});
	}
}

@AiTool({ name: 'planOnlyTool', modes: ['plan'] })
class PlanOnlyToolProvider implements AiToolProvider {
	build() {
		return tool({
			description: 'Plan mode only',
			inputSchema: z.object({}),
			execute: async () => 'plan result',
		});
	}
}

describe('AiToolsModule integration', () => {
	let registry: ToolRegistryService;

	beforeEach(async () => {
		const module = await Test.createTestingModule({
			imports: [AiToolsModule],
			providers: [TestToolProvider, PlanOnlyToolProvider],
		}).compile();

		await module.init();
		registry = module.get(ToolRegistryService);
	});

	it('should discover all @AiTool() providers', () => {
		const tools = registry.getTools();
		expect(tools).toHaveLength(2);
		expect(tools.map((t) => t.name).sort()).toEqual(['planOnlyTool', 'testTool']);
	});

	it('should build a tool set with context', () => {
		const toolSet = registry.buildToolSet({ projectId: 'p-123' });
		expect(Object.keys(toolSet).sort()).toEqual(['planOnlyTool', 'testTool']);
	});

	it('should filter by mode', () => {
		const agentTools = registry.buildToolSet({}, { mode: 'agent' });
		expect(Object.keys(agentTools)).toEqual(['testTool']);
	});

	it('should get a specific tool provider', () => {
		const provider = registry.getToolProvider('testTool');
		expect(provider).toBeDefined();
		expect(typeof provider.build).toBe('function');
	});

	it('should execute a built tool', async () => {
		const toolSet = registry.buildToolSet({ projectId: 'p-123' });
		const result = await toolSet['testTool'].execute!({ input: 'hello' }, { toolCallId: 'test-call', messages: [], abortSignal: new AbortController().signal });
		expect(result).toBe('processed: hello for p-123');
	});
});
