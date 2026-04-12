import { Injectable } from '@nestjs/common';
import type { Tool } from 'ai';
import { AiToolsExplorer } from './ai-tools.explorer';
import type { AiToolMetadata } from './interfaces/ai-tool-metadata.interface';
import type { AiToolProvider } from './interfaces/ai-tool-provider.interface';
import type { ToolContext } from './interfaces/tool-context.interface';
import type { ToolFilter } from './interfaces/tool-filter.interface';
import { matchesFilter } from './common/matches-filter';

/**
 * Public API for building AI SDK tool sets from registered @AiTool() providers.
 * Consumers inject this service to get tools for streamText/generateText calls.
 */
@Injectable()
export class ToolRegistryService {
	constructor(private readonly explorer: AiToolsExplorer) {}

	/**
	 * Build an AI SDK tool set from registered providers, optionally filtered.
	 * Each provider's `build(ctx)` is called to produce a fresh Tool per invocation.
	 */
	buildToolSet<TContext extends ToolContext>(ctx: TContext, filter?: ToolFilter): Record<string, Tool> {
		const result = Object.create(null) as Record<string, Tool>;
		for (const [name, { provider, metadata }] of this.explorer.getAll()) {
			if (matchesFilter(metadata, filter)) {
				result[name] = (provider as AiToolProvider<TContext>).build(ctx);
			}
		}
		return result;
	}

	/** Get registered tool metadata, optionally filtered. */
	getTools(filter?: ToolFilter): AiToolMetadata[] {
		return Array.from(this.explorer.getAll().values())
			.filter(({ metadata }) => matchesFilter(metadata, filter))
			.map(({ metadata }) => metadata);
	}

	/** Get a single tool provider by name. Throws if not found. */
	getToolProvider(name: string): AiToolProvider {
		const entry = this.explorer.get(name);
		if (!entry) throw new Error(`Tool "${name}" not registered`);
		return entry.provider;
	}
}
