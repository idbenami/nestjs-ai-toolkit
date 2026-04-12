export interface AiToolMetadata {
	/** Tool name as it appears in the AI SDK tool set (e.g. 'readFile'). Must be unique. */
	name: string;

	/**
	 * Which modes/agents this tool is available in.
	 * If omitted, the tool is available in all modes.
	 * If set to an empty array, the tool is not available in any mode when a mode filter is applied.
	 */
	modes?: string[];
	/** Arbitrary tags for filtering and grouping (e.g. ['file-ops', 'reads-files', 'database:write']). */
	tags?: string[];
}
