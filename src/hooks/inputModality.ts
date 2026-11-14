/**
 * Was the most recent input from a keyboard? Tracked once, globally, so a
 * component that mounts *after* the key press (the landing, after Escape)
 * still knows.
 */
let keyboard = false;

if (typeof window !== 'undefined') {
  window.addEventListener('keydown', () => (keyboard = true), true);
  window.addEventListener('pointerdown', () => (keyboard = false), true);
}

export const lastInputWasKeyboard = () => keyboard;
