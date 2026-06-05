// ===================================
// APC Odisha — Utility Functions
// ===================================

/**
 * Merges class names, filtering out falsy values.
 * Simple alternative to clsx/classnames with no dependencies.
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
