/**
 * Binder paginator (W3) — chunks an item list into fixed N-slot pages.
 * Pure & framework-agnostic.
 */

export interface BinderPage<T> {
  pageIndex: number;      // 0-based
  items: (T | null)[];    // padded to slotsPerPage with `null`
}

export function paginate<T>(items: T[], slotsPerPage = 9): BinderPage<T>[] {
  if (items.length === 0) return [{ pageIndex: 0, items: Array<T | null>(slotsPerPage).fill(null) }];
  const pages: BinderPage<T>[] = [];
  for (let i = 0; i < items.length; i += slotsPerPage) {
    const slice = items.slice(i, i + slotsPerPage);
    while (slice.length < slotsPerPage) slice.push(null as unknown as T);
    pages.push({ pageIndex: i / slotsPerPage, items: slice as (T | null)[] });
  }
  return pages;
}

export function totalPages<T>(items: T[], slotsPerPage = 9): number {
  if (items.length === 0) return 1;
  return Math.ceil(items.length / slotsPerPage);
}
