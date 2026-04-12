import type { Type } from '@nestjs/common';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { AiToolsMetadataAccessor } from './ai-tools-metadata.accessor';
import type { AiToolMetadata } from './interfaces/ai-tool-metadata.interface';
import type { AiToolProvider } from './interfaces/ai-tool-provider.interface';

export interface ToolEntry {
	provider: AiToolProvider;
	metadata: AiToolMetadata;
}
/**
 * Discovers all @AiTool() decorated providers on module bootstrap.
 */
@Injectable()
export class AiToolsExplorer implements OnModuleInit {
	private readonly logger = new Logger(AiToolsExplorer.name);
	private readonly tools = new Map<string, ToolEntry>();

	constructor(
		private readonly discoveryService: DiscoveryService,
		private readonly metadataAccessor: AiToolsMetadataAccessor,
	) {}

	onModuleInit(): void {
		this.explore();
	}

	private explore(): void {
		const providers = this.discoveryService.getProviders();
		const toolProviders = this.filterAiTools(providers);

		for (const wrapper of toolProviders) {
			this.registerTool(wrapper);
		}

		this.logDiscoveredTools();
	}

	private filterAiTools(providers: InstanceWrapper[]): InstanceWrapper[] {
		return providers.filter((wrapper) => {
			const target = !wrapper.metatype || wrapper.inject ? (wrapper.instance?.constructor as Type | undefined) : wrapper.metatype;
			if (!target) return false;
			return this.metadataAccessor.isAiTool(target);
		});
	}

	private registerTool(wrapper: InstanceWrapper): void {
		const { instance, metatype } = wrapper;
		if (!instance) return;

		const target = (instance.constructor as Type) || metatype;
		const metadata = this.metadataAccessor.getMetadata(target);
		if (!metadata) return;

		if (typeof (instance as unknown as AiToolProvider).build !== 'function') {
			throw new Error(`@AiTool('${metadata.name}') on ${target.name} must implement AiToolProvider.build()`);
		}

		if (this.tools.has(metadata.name)) {
			throw new Error(`Duplicate @AiTool name "${metadata.name}" registered by ${target.name}. Tool names must be unique.`);
		}

		this.tools.set(metadata.name, {
			provider: instance as unknown as AiToolProvider,
			metadata,
		});
	}

	private logDiscoveredTools(): void {
		if (this.tools.size === 0) {
			this.logger.log('No @AiTool() providers discovered');
			return;
		}

		const names = Array.from(this.tools.keys()).join(', ');
		this.logger.log(`Discovered ${this.tools.size} AI tool(s): [${names}]`);
	}

	getAll(): Map<string, ToolEntry> {
		return this.tools;
	}

	get(name: string): ToolEntry | undefined {
		return this.tools.get(name);
	}
}
