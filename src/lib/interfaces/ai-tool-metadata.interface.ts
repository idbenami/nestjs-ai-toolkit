export interface AiToolMetadata {
	/** Tool name as it appears in the AI SDK tool set (e.g. 'readFile'). Must be unique. */
	name: string;

	/** Which modes/agents this tool is available in. If omitted, available in all modes. */
	modes?: string[];
	/** Arbitrary tags for filtering and grouping (e.g. ['file-ops', 'reads-files', 'database:write']). */
	tags?: string[];
}
