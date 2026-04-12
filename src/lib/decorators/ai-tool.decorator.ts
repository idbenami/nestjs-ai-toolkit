import { Injectable, SetMetadata } from '@nestjs/common';
import { AI_TOOL_METADATA } from '../constants';
import type { AiToolMetadata } from '../interfaces/ai-tool-metadata.interface';

/**
 * Marks a class as an AI tool provider and registers it with the tool registry.
 *
 * @example Shorthand -- just the tool name:
 * ```ts
 * @AiTool('readFile')
 * export class ReadFileTool implements AiToolProvider { ... }
 * ```
 *
 * @example Full metadata:
 * ```ts
 * @AiTool({ name: 'readFile', modes: ['plan', 'agent'], tags: ['file-ops'] })
 * export class ReadFileTool implements AiToolProvider { ... }
 * ```
 */
export function AiTool(nameOrMetadata: string | AiToolMetadata): ClassDecorator {
	const metadata: AiToolMetadata = typeof nameOrMetadata === 'string' ? { name: nameOrMetadata } : nameOrMetadata;

	// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
	return (target: Function) => {
		Injectable()(target);
		SetMetadata(AI_TOOL_METADATA, metadata)(target);
	};
}
