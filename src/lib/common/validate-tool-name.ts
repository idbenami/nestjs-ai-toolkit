/** Keys that must not be used as plain-object property names for tool sets. */
const FORBIDDEN_TOOL_NAMES = new Set(['__proto__', 'constructor', 'prototype']);

const TOOL_NAME_PATTERN = /^[a-zA-Z][a-zA-Z0-9_-]*$/;

/**
 * Ensures a tool name is safe as an object key and readable for LLM tool calling.
 * @throws Error if the name is invalid
 */
export function assertValidToolName(name: string): void {
	if (name.length === 0) {
		throw new Error('Tool name must be a non-empty string');
	}
	if (FORBIDDEN_TOOL_NAMES.has(name)) {
		throw new Error(`Tool name "${name}" is reserved and cannot be used`);
	}
	if (!TOOL_NAME_PATTERN.test(name)) {
		throw new Error(
			`Tool name "${name}" is invalid: use a non-empty identifier starting with a letter (allowed: letters, digits, underscore, hyphen)`,
		);
	}
}
