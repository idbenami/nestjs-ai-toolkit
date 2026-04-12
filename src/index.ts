export { AiToolsModule } from './lib/ai-tools.module';
export { ToolRegistryService } from './lib/tool-registry.service';
export { AiTool } from './lib/decorators/ai-tool.decorator';
export { AI_TOOL_METADATA } from './lib/constants';

export type { AiToolMetadata } from './lib/interfaces/ai-tool-metadata.interface';
export type { AiToolProvider } from './lib/interfaces/ai-tool-provider.interface';
export type { ToolContext } from './lib/interfaces/tool-context.interface';
export type { ToolFilter } from './lib/interfaces/tool-filter.interface';
export type { ToolEntry } from './lib/ai-tools.explorer';

// Testing utilities
export { TestToolRegistry } from './lib/testing/test-tool-registry';
export { createMockToolProvider } from './lib/testing/mock-tool-provider';
export type { MockToolProviderOptions } from './lib/testing/mock-tool-provider';
export { createMockToolContext } from './lib/testing/mock-tool-context';
