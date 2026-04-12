import type { AiToolMetadata } from '../interfaces/ai-tool-metadata.interface';
import type { ToolFilter } from '../interfaces/tool-filter.interface';

export function matchesFilter(metadata: AiToolMetadata, filter?: ToolFilter): boolean {
	if (!filter) return true;

	if (filter.include && !filter.include.includes(metadata.name)) return false;
	if (filter.exclude?.includes(metadata.name)) return false;
	if (filter.mode) {
		if (metadata.modes !== undefined) {
			if (metadata.modes.length === 0) return false;
			if (!metadata.modes.includes(filter.mode)) return false;
		}
	}
	if (filter.tags) {
		if (!metadata.tags) return false;
		const hasAll = filter.tags.every((t) => metadata.tags!.includes(t));
		if (!hasAll) return false;
	}

	return true;
}
