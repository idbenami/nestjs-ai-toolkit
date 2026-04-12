import type { Tool } from 'ai';
import type { ToolContext } from './tool-context.interface';

/**
 * Contract for an injectable AI tool.
 * Each @AiTool() decorated class must implement this interface.
 */
export interface AiToolProvider<TContext extends ToolContext = ToolContext> {
	build(ctx: TContext): Tool;
}
