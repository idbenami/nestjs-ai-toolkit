import type { Type } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AI_TOOL_METADATA } from './constants';
import type { AiToolMetadata } from './interfaces/ai-tool-metadata.interface';

/**
 * Reads @AiTool() decorator metadata from class targets via NestJS Reflector.
 */
@Injectable()
export class AiToolsMetadataAccessor {
	constructor(private readonly reflector: Reflector) {}

	// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
	isAiTool(target: Type | Function): boolean {
		return this.reflector.get(AI_TOOL_METADATA, target) !== undefined;
	}

	// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
	getMetadata(target: Type | Function): AiToolMetadata | undefined {
		return this.reflector.get<AiToolMetadata>(AI_TOOL_METADATA, target);
	}
}
