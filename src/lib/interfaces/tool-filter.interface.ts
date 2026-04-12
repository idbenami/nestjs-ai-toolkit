export interface ToolFilter {
	/** Only include tools available in this mode. */
	mode?: string;
	/** Only include tools that have ALL of these tags. */
	tags?: string[];
	/** Exclude tools by name. */
	exclude?: string[];
	/** Include ONLY these tools by name (allowlist). */
	include?: string[];
}
