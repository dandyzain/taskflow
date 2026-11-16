// Loaded asynchronously by <MotionProvider> so animation features stay out of
// every route's first-load bundle. `m.*` components render statically until
// these arrive (a few ms after hydration), then animate normally.
import { domMax } from 'motion/react';

export default domMax;
