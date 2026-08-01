/**
 * How many different connector categories a free-writing essay has to use to count as complete.
 *
 * Lives in its own module so AppShell can grade an essay without statically importing
 * LinkingEssayScreen — that screen is lazily loaded, and a value import would pull it (and the
 * writing-topic data behind it) straight back into the initial bundle.
 */
export const MIN_CATEGORIES = 3;
