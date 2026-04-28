import type { ToolContext } from '../interfaces/tool-context.interface';

/**
 * Creates a typed ToolContext for testing.
 *
 * @example
 * ```ts
 * interface AppToolContext extends ToolContext {
 *   projectId: string;
 * }
 * const ctx = createMockToolContext<AppToolContext>({ projectId: 'test-123' });
 * ```
 */
export function createMockToolContext<T extends ToolContext = ToolContext>(overrides?: T): T {
	return { ...(overrides ?? {}) } as T;
}
