// Do not render these at the base prefix
export const DO_NOT_RENDER_AT_ROOT = [
  "index.html",
  "index.json",
  "index.css",
  "index.js",
  "index.png",
];

/**
 * Ignore all of these anywhere. Leaving this empty since I'd like to know if
 * my dumbass uploaded any dotfiles (like .DS_Store) by mistake.
 */
export const DO_NOT_RENDER_AT_ALL = [];

export const DEBOUNCE_INTERVAL_IN_MS = 250;

/**
 * When we're unable to read a .env file for Parcel to build with...
 */
export const DEFAULT_BUCKET = "public.nikhil.io"
export const DEFAULT_PREFIX = ""
