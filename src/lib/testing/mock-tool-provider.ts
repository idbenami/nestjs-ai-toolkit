import { tool } from 'ai';
import type { Tool } from 'ai';
import z from 'zod';
import type { AiToolProvider } from '../interfaces/ai-tool-provider.interface';
import type { ToolContext } from '../interfaces/tool-context.interface';

export interface MockToolProviderOptions {
	buildResult?: Tool;
}

export interface MockAiToolProvider extends AiToolProvider {
	build: (ctx: ToolContext) => Tool;
	calls: ToolContext[];
}

/**
 * Creates a mock AiToolProvider that records calls.
 * Compatible with any test framework (jest, vitest, etc.).
 */
export function createMockToolProvider(options?: MockToolProviderOptions): MockAiToolProvider {
	const calls: ToolContext[] = [];

	const defaultTool = tool({
		description: 'mock tool',
		inputSchema: z.object({}),
		execute: async () => ({ success: true }),
	});

	const result = options?.buildResult ?? defaultTool;

	return {
		calls,
		build(ctx: ToolContext): Tool {
			calls.push(ctx);
			return result;
		},
	};
}
