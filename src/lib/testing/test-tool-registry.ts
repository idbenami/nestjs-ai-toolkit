import type { Tool } from 'ai';
import type { AiToolMetadata } from '../interfaces/ai-tool-metadata.interface';
import type { AiToolProvider } from '../interfaces/ai-tool-provider.interface';
import type { ToolContext } from '../interfaces/tool-context.interface';
import type { ToolFilter } from '../interfaces/tool-filter.interface';
import { matchesFilter } from '../common/matches-filter';

interface TestToolEntry {
	provider: AiToolProvider;
	metadata: AiToolMetadata;
}

/**
 * Standalone tool registry for testing, without NestJS DiscoveryService.
 * Mirrors ToolRegistryService API for easy swapping.
 */
export class TestToolRegistry {
	private tools = new Map<string, TestToolEntry>();

	register(provider: AiToolProvider, metadata: AiToolMetadata): this {
		if (this.tools.has(metadata.name)) {
			throw new Error(`Duplicate tool name "${metadata.name}" in TestToolRegistry`);
		}
		this.tools.set(metadata.name, { provider, metadata });
		return this;
	}

	buildToolSet<TContext extends ToolContext>(ctx: TContext, filter?: ToolFilter): Record<string, Tool> {
		const result: Record<string, Tool> = {};
		for (const [name, { provider, metadata }] of this.tools) {
			if (matchesFilter(metadata, filter)) {
				result[name] = (provider as AiToolProvider<TContext>).build(ctx);
			}
		}
		return result;
	}

	getTools(filter?: ToolFilter): AiToolMetadata[] {
		return Array.from(this.tools.values())
			.filter(({ metadata }) => matchesFilter(metadata, filter))
			.map(({ metadata }) => metadata);
	}

	getToolProvider(name: string): AiToolProvider {
		const entry = this.tools.get(name);
		if (!entry) throw new Error(`Tool "${name}" not registered in TestToolRegistry`);
		return entry.provider;
	}

	clear(): void {
		this.tools.clear();
	}
}
