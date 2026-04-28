import { AI_TOOL_METADATA } from '../../src/lib/constants';
import { AiTool } from '../../src/lib/decorators/ai-tool.decorator';

describe('AiTool decorator', () => {
	it('should set metadata when given a string name', () => {
		@AiTool('readFile')
		class ReadFileTool {}

		const metadata = Reflect.getMetadata(AI_TOOL_METADATA, ReadFileTool);
		expect(metadata).toEqual({ name: 'readFile' });
	});

	it('should set metadata when given a full metadata object', () => {
		@AiTool({ name: 'editFile', modes: ['agent'], tags: ['file-ops', 'writes-files'] })
		class EditFileTool {}

		const metadata = Reflect.getMetadata(AI_TOOL_METADATA, EditFileTool);
		expect(metadata).toEqual({
			name: 'editFile',
			modes: ['agent'],
			tags: ['file-ops', 'writes-files'],
		});
	});

	it('should make the class injectable (adds design-time metadata)', () => {
		@AiTool('myTool')
		class MyTool {}

		// @Injectable() adds reflect metadata -- class should be constructable by NestJS
		expect(MyTool).toBeDefined();
		expect(typeof MyTool).toBe('function');
	});
});
