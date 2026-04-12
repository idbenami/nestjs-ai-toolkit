/**
 * Base per-request context passed to AiToolProvider.build().
 * Extend this in your app with the fields your tools need:
 *
 * @example
 * ```ts
 * interface AppToolContext extends ToolContext {
 *   projectId: string;
 *   writer?: UIMessageStreamWriter;
 * }
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface, @typescript-eslint/no-empty-object-type
export interface ToolContext {}
