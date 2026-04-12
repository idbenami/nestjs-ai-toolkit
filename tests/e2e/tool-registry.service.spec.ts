import type { AiToolsExplorer, ToolEntry } from '../../src/lib/ai-tools.explorer';
import type { AiToolProvider } from '../../src/lib/interfaces/ai-tool-provider.interface';
import { ToolRegistryService } from '../../src/lib/tool-registry.service';

function mockToolEntry(name: string, overrides?: Partial<ToolEntry['metadata']>): [string, ToolEntry] {
	const provider: AiToolProvider = {
		build: jest.fn().mockReturnValue({ description: `${name} tool` }),
	};
	return [name, { provider, metadata: { name, ...overrides } }];
}

describe('ToolRegistryService', () => {
	let registry: ToolRegistryService;
	let mockExplorer: { getAll: jest.Mock; get: jest.Mock };

	beforeEach(() => {
		mockExplorer = {
			getAll: jest.fn().mockReturnValue(new Map()),
			get: jest.fn().mockReturnValue(undefined),
		};
		registry = new ToolRegistryService(mockExplorer as unknown as AiToolsExplorer);
	});

	describe('buildToolSet', () => {
		it('should build tools from all registered providers', () => {
			const entries = new Map([mockToolEntry('readFile'), mockToolEntry('editFile')]);
			mockExplorer.getAll.mockReturnValue(entries);

			const ctx = { projectId: 'test-123' };
			const toolSet = registry.buildToolSet(ctx);

			expect(Object.keys(toolSet)).toEqual(['readFile', 'editFile']);
			const readEntry = entries.get('readFile')!;
			expect(readEntry.provider.build).toHaveBeenCalledWith(ctx);
		});

		it('should filter by mode', () => {
			const entries = new Map([mockToolEntry('readFile', { modes: ['plan', 'agent'] }), mockToolEntry('editFile', { modes: ['agent'] })]);
			mockExplorer.getAll.mockReturnValue(entries);

			const toolSet = registry.buildToolSet({}, { mode: 'plan' });
			expect(Object.keys(toolSet)).toEqual(['readFile']);
		});

		it('should include tools with no modes restriction when filtering by mode', () => {
			const entries = new Map([mockToolEntry('readFile'), mockToolEntry('editFile', { modes: ['agent'] })]);
			mockExplorer.getAll.mockReturnValue(entries);

			const toolSet = registry.buildToolSet({}, { mode: 'plan' });
			expect(Object.keys(toolSet)).toEqual(['readFile']);
		});

		it('should filter by exclude', () => {
			const entries = new Map([mockToolEntry('readFile'), mockToolEntry('editFile')]);
			mockExplorer.getAll.mockReturnValue(entries);

			const toolSet = registry.buildToolSet({}, { exclude: ['editFile'] });
			expect(Object.keys(toolSet)).toEqual(['readFile']);
		});

		it('should filter by include (allowlist)', () => {
			const entries = new Map([mockToolEntry('readFile'), mockToolEntry('editFile'), mockToolEntry('deleteFile')]);
			mockExplorer.getAll.mockReturnValue(entries);

			const toolSet = registry.buildToolSet({}, { include: ['readFile', 'deleteFile'] });
			expect(Object.keys(toolSet)).toEqual(['readFile', 'deleteFile']);
		});

		it('should filter by tags (all must match)', () => {
			const entries = new Map([mockToolEntry('readFile', { tags: ['reads-files', 'safe'] }), mockToolEntry('editFile', { tags: ['writes-files'] })]);
			mockExplorer.getAll.mockReturnValue(entries);

			const toolSet = registry.buildToolSet({}, { tags: ['reads-files', 'safe'] });
			expect(Object.keys(toolSet)).toEqual(['readFile']);
		});

		it('should exclude tools without tags when filtering by tags', () => {
			const entries = new Map([mockToolEntry('askQuestion', { tags: ['user-input'] }), mockToolEntry('editFile', { modes: ['agent'] }), mockToolEntry('readFile')]);
			mockExplorer.getAll.mockReturnValue(entries);

			const toolSet = registry.buildToolSet({}, { tags: ['user-input'] });
			expect(Object.keys(toolSet)).toEqual(['askQuestion']);
		});

		it('should return empty object when no tools match', () => {
			mockExplorer.getAll.mockReturnValue(new Map());

			const toolSet = registry.buildToolSet({});
			expect(toolSet).toEqual({});
		});
	});

	describe('getTools', () => {
		it('should return metadata for all tools', () => {
			const entries = new Map([mockToolEntry('readFile', { tags: ['file-ops'] }), mockToolEntry('editFile', { tags: ['file-ops'] })]);
			mockExplorer.getAll.mockReturnValue(entries);

			const tools = registry.getTools();
			expect(tools).toEqual([
				{ name: 'readFile', tags: ['file-ops'] },
				{ name: 'editFile', tags: ['file-ops'] },
			]);
		});

		it('should apply filter to metadata', () => {
			const entries = new Map([mockToolEntry('readFile', { modes: ['plan'] }), mockToolEntry('editFile', { modes: ['agent'] })]);
			mockExplorer.getAll.mockReturnValue(entries);

			const tools = registry.getTools({ mode: 'agent' });
			expect(tools).toEqual([{ name: 'editFile', modes: ['agent'] }]);
		});
	});

	describe('getToolProvider', () => {
		it('should return the provider for a given name', () => {
			const provider: AiToolProvider = { build: jest.fn() };
			mockExplorer.get.mockReturnValue({ provider, metadata: { name: 'readFile' } });

			expect(registry.getToolProvider('readFile')).toBe(provider);
		});

		it('should throw if tool not found', () => {
			mockExplorer.get.mockReturnValue(undefined);

			expect(() => registry.getToolProvider('nonexistent')).toThrow('Tool "nonexistent" not registered');
		});
	});
});
