/**
 * Fractional Indexing Utility
 *
 * Calculates positions for ordered items using floating-point midpoints.
 * Only the moved item's position is updated — surrounding items are never modified.
 *
 * Position space conventions:
 *   - BASE_POSITION (1000): Starting position for the first item in an empty list
 *   - POSITION_GAP (1000): Gap used when appending to the end of a list
 *   - MIN_POSITION_GAP (0.001): Minimum gap threshold before triggering rebalance
 */

const BASE_POSITION = 1000;
const POSITION_GAP = 1000;
const MIN_POSITION_GAP = 0.001;

export interface PositionContext {
  before: number | null;
  after: number | null;
}

/**
 * Calculates the fractional position for an item being placed between two others.
 *
 * Edge cases handled:
 *   - Empty list (before=null, after=null): returns BASE_POSITION
 *   - Top of list (before=null): returns half of `after`
 *   - Bottom of list (after=null): returns `before` + POSITION_GAP
 *   - Between two items: returns the arithmetic midpoint
 *
 * @throws Error if the computed gap is below MIN_POSITION_GAP,
 *         signaling that the position space is exhausted and a rebalance is needed.
 */
export function calculatePosition(context: PositionContext): number {
  const { before, after } = context;

  if (before === null && after === null) {
    return BASE_POSITION;
  }

  if (before === null && after !== null) {
    const position = after / 2;
    assertSufficientGap(position, after);
    return position;
  }

  if (before !== null && after === null) {
    return before + POSITION_GAP;
  }

  const beforeVal = before!;
  const afterVal = after!;
  const position = (beforeVal + afterVal) / 2;
  assertSufficientGap(beforeVal, position);
  return position;
}

/**
 * Validates that two positions have enough distance between them.
 * Prevents positions from collapsing due to floating-point precision limits.
 *
 * @throws Error when positions are too close, requiring a full rebalance.
 */
function assertSufficientGap(lower: number, upper: number): void {
  if (Math.abs(upper - lower) < MIN_POSITION_GAP) {
    throw new PositionExhaustedError(
      "Position space exhausted between adjacent items. Rebalance required."
    );
  }
}

/**
 * Rebalances all positions in a list by distributing them evenly.
 * This is a recovery mechanism called only when fractional gaps are exhausted.
 *
 * Returns a map of item IDs to their new positions.
 */
export function rebalancePositions(
  itemIds: string[]
): Map<string, number> {
  const result = new Map<string, number>();

  for (let i = 0; i < itemIds.length; i++) {
    result.set(itemIds[i], BASE_POSITION + i * POSITION_GAP);
  }

  return result;
}

/**
 * Derives the before/after context for a card being moved to a specific index
 * within an ordered list of positions.
 *
 * @param sortedPositions - Positions of items in the target list, sorted ascending.
 *                          Must exclude the card being moved.
 * @param targetIndex     - The 0-based index where the card should be inserted.
 */
export function getPositionContext(
  sortedPositions: number[],
  targetIndex: number
): PositionContext {
  if (sortedPositions.length === 0) {
    return { before: null, after: null };
  }

  if (targetIndex <= 0) {
    return { before: null, after: sortedPositions[0] };
  }

  if (targetIndex >= sortedPositions.length) {
    return { before: sortedPositions[sortedPositions.length - 1], after: null };
  }

  return {
    before: sortedPositions[targetIndex - 1],
    after: sortedPositions[targetIndex],
  };
}

export class PositionExhaustedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PositionExhaustedError";
  }
}
