'use client';

import { useState } from 'react';

/**
 * Returns true once `value` has ever been true. Lets code-split overlays mount
 * on first open and then stay mounted so their close animations still play.
 */
export function useEverTrue(value: boolean): boolean {
  const [ever, setEver] = useState(value);
  if (value && !ever) setEver(true);
  return ever || value;
}
