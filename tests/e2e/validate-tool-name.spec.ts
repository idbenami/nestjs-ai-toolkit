import { assertValidToolName } from '../../src/lib/common/validate-tool-name';

describe('assertValidToolName', () => {
	it('accepts typical tool names', () => {
		expect(() => assertValidToolName('readFile')).not.toThrow();
		expect(() => assertValidToolName('tool_2')).not.toThrow();
		expect(() => assertValidToolName('a-b')).not.toThrow();
	});

	it('rejects empty names', () => {
		expect(() => assertValidToolName('')).toThrow('non-empty');
	});

	it('rejects prototype pollution keys', () => {
		expect(() => assertValidToolName('__proto__')).toThrow('reserved');
		expect(() => assertValidToolName('constructor')).toThrow('reserved');
		expect(() => assertValidToolName('prototype')).toThrow('reserved');
	});

	it('rejects names that do not match the allowed pattern', () => {
		expect(() => assertValidToolName('123tool')).toThrow('invalid');
		expect(() => assertValidToolName('tool name')).toThrow('invalid');
		expect(() => assertValidToolName('tool.name')).toThrow('invalid');
	});
});
