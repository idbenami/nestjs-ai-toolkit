import type { Type } from '@nestjs/common';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { AiToolsMetadataAccessor } from './ai-tools-metadata.accessor';
import { assertValidToolName } from './common/validate-tool-name';
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

	/** Same resolution as Nest discovery: metatype when static, else instance class (e.g. useClass / dynamic). */
	private resolveProviderClass(wrapper: InstanceWrapper): Type | undefined {
		return !wrapper.metatype || wrapper.inject
			? (wrapper.instance?.constructor as Type | undefined)
			: (wrapper.metatype as Type);
	}

	private filterAiTools(providers: InstanceWrapper[]): InstanceWrapper[] {
		return providers.filter((wrapper) => {
			const target = this.resolveProviderClass(wrapper);
			if (!target) return false;
			return this.metadataAccessor.isAiTool(target);
		});
	}

	private registerTool(wrapper: InstanceWrapper): void {
		const { instance, metatype } = wrapper;

		if (!instance) {
			const target = this.resolveProviderClass(wrapper);
			if (target && this.metadataAccessor.isAiTool(target)) {
				const metadata = this.metadataAccessor.getMetadata(target);
				const label = metadata?.name ?? target.name;
				throw new Error(
					`@AiTool('${label}') on ${target.name} could not be registered: provider instance is missing at module init. ` +
						'Use default (singleton) scope for @AiTool() classes, or register a factory that yields the tool provider when the module starts.',
				);
			}
			return;
		}

		const target = (instance.constructor as Type) || metatype;
		const metadata = this.metadataAccessor.getMetadata(target);
		if (!metadata) return;

		assertValidToolName(metadata.name);

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

	/** Returns a shallow copy so callers cannot mutate the internal registry map. */
	getAll(): Map<string, ToolEntry> {
		return new Map(this.tools);
	}

	get(name: string): ToolEntry | undefined {
		return this.tools.get(name);
	}
}
