export interface NavigationDestination<TId extends string = string> {
  readonly id: TId;
  readonly label: string;
}

/**
 * Projects one ordered destination source into any shell presentation without
 * changing identity, visible labels, or relative order.
 */
export function projectNavigation<TItem extends NavigationDestination>(
  destinations: readonly TItem[],
  currentId: TItem["id"],
  hrefFor: (id: TItem["id"]) => string,
): Array<TItem & { href: string; current: boolean }> {
  return destinations.map((destination) => ({
    ...destination,
    href: hrefFor(destination.id),
    current: destination.id === currentId,
  }));
}
