import { Reflector } from '@nestjs/core';
import { AiToolsMetadataAccessor } from '../../src/lib/ai-tools-metadata.accessor';
import { AI_TOOL_METADATA } from '../../src/lib/constants';

describe('AiToolsMetadataAccessor', () => {
	let accessor: AiToolsMetadataAccessor;
	let reflector: Reflector;

	beforeEach(() => {
		reflector = new Reflector();
		accessor = new AiToolsMetadataAccessor(reflector);
	});

	describe('isAiTool', () => {
		it('should return true for a decorated class', () => {
			class MyTool {}
			Reflect.defineMetadata(AI_TOOL_METADATA, { name: 'myTool' }, MyTool);

			expect(accessor.isAiTool(MyTool)).toBe(true);
		});

		it('should return false for a non-decorated class', () => {
			class NotATool {}

			expect(accessor.isAiTool(NotATool)).toBe(false);
		});
	});

	describe('getMetadata', () => {
		it('should return metadata for a decorated class', () => {
			class MyTool {}
			const metadata = { name: 'myTool', tags: ['test'] };
			Reflect.defineMetadata(AI_TOOL_METADATA, metadata, MyTool);

			expect(accessor.getMetadata(MyTool)).toEqual(metadata);
		});

		it('should return undefined for a non-decorated class', () => {
			class NotATool {}

			expect(accessor.getMetadata(NotATool)).toBeUndefined();
		});
	});
});
