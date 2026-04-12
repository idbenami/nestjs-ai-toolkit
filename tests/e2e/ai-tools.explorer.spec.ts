import { DiscoveryService } from '@nestjs/core';
import { AiToolsMetadataAccessor } from '../../src/lib/ai-tools-metadata.accessor';
import { AiToolsExplorer } from '../../src/lib/ai-tools.explorer';
import type { AiToolProvider } from '../../src/lib/interfaces/ai-tool-provider.interface';

function createMockProvider(name: string, buildFn = jest.fn()): AiToolProvider {
	return { build: buildFn };
}

function createProviderWrapper(instance: unknown, metatype: (new (...args: unknown[]) => unknown) | null = null) {
	return {
		instance,
		metatype: metatype ?? (instance as Record<string, unknown>)?.constructor ?? null,
		inject: undefined,
	};
}

describe('AiToolsExplorer', () => {
	let explorer: AiToolsExplorer;
	let mockDiscoveryService: { getProviders: jest.Mock };
	let mockMetadataAccessor: { isAiTool: jest.Mock; getMetadata: jest.Mock };

	beforeEach(() => {
		mockDiscoveryService = { getProviders: jest.fn().mockReturnValue([]) };
		mockMetadataAccessor = {
			isAiTool: jest.fn().mockReturnValue(false),
			getMetadata: jest.fn().mockReturnValue(undefined),
		};

		explorer = new AiToolsExplorer(mockDiscoveryService as unknown as DiscoveryService, mockMetadataAccessor as unknown as AiToolsMetadataAccessor);
		// Inject via constructor reflection workaround
		(explorer as unknown as { discoveryService: unknown }).discoveryService = mockDiscoveryService;
	});

	it('should discover tools on module init', () => {
		const provider = createMockProvider('readFile');
		const wrapper = createProviderWrapper(provider);
		const metadata = { name: 'readFile' };

		mockDiscoveryService.getProviders.mockReturnValue([wrapper]);
		mockMetadataAccessor.isAiTool.mockReturnValue(true);
		mockMetadataAccessor.getMetadata.mockReturnValue(metadata);

		explorer.onModuleInit();

		expect(explorer.getAll().size).toBe(1);
		expect(explorer.get('readFile')).toEqual({ provider, metadata });
	});

	it('should skip providers without @AiTool metadata', () => {
		const wrapper = createProviderWrapper({ build: jest.fn() });
		mockDiscoveryService.getProviders.mockReturnValue([wrapper]);
		mockMetadataAccessor.isAiTool.mockReturnValue(false);

		explorer.onModuleInit();

		expect(explorer.getAll().size).toBe(0);
	});

	it('should throw on duplicate tool names', () => {
		const provider1 = createMockProvider('readFile');
		const provider2 = createMockProvider('readFile');

		class Tool1 {}
		class Tool2 {}
		Object.defineProperty(provider1.constructor, 'name', { value: 'Tool1' });
		Object.defineProperty(provider2.constructor, 'name', { value: 'Tool2' });

		const wrapper1 = createProviderWrapper(provider1, Tool1 as unknown as new (...args: unknown[]) => unknown);
		const wrapper2 = createProviderWrapper(provider2, Tool2 as unknown as new (...args: unknown[]) => unknown);

		mockDiscoveryService.getProviders.mockReturnValue([wrapper1, wrapper2]);
		mockMetadataAccessor.isAiTool.mockReturnValue(true);
		mockMetadataAccessor.getMetadata.mockReturnValue({ name: 'readFile' });

		expect(() => explorer.onModuleInit()).toThrow('Duplicate @AiTool name "readFile"');
	});

	it('should throw if provider does not implement build()', () => {
		const badProvider = {};
		const wrapper = createProviderWrapper(badProvider);
		const metadata = { name: 'broken' };

		mockDiscoveryService.getProviders.mockReturnValue([wrapper]);
		mockMetadataAccessor.isAiTool.mockReturnValue(true);
		mockMetadataAccessor.getMetadata.mockReturnValue(metadata);

		expect(() => explorer.onModuleInit()).toThrow('must implement AiToolProvider.build()');
	});

	it('should return undefined for unknown tool name', () => {
		explorer.onModuleInit();
		expect(explorer.get('nonexistent')).toBeUndefined();
	});

	it('should throw when @AiTool provider has no instance at module init', () => {
		class GhostTool {}
		const wrapper = {
			instance: undefined,
			metatype: GhostTool,
			inject: undefined,
		};

		mockDiscoveryService.getProviders.mockReturnValue([wrapper]);
		mockMetadataAccessor.isAiTool.mockReturnValue(true);
		mockMetadataAccessor.getMetadata.mockReturnValue({ name: 'ghost' });

		expect(() => explorer.onModuleInit()).toThrow(/could not be registered/);
		expect(() => explorer.onModuleInit()).toThrow(/singleton/);
	});

	it('should throw when tool name is invalid', () => {
		const provider = createMockProvider('bad');
		const wrapper = createProviderWrapper(provider);
		const metadata = { name: '__proto__' };

		mockDiscoveryService.getProviders.mockReturnValue([wrapper]);
		mockMetadataAccessor.isAiTool.mockReturnValue(true);
		mockMetadataAccessor.getMetadata.mockReturnValue(metadata);

		expect(() => explorer.onModuleInit()).toThrow('reserved');
	});
});
