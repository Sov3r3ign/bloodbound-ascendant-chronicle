// This file exists ONLY so Tailwind's source scanner picks up dynamically-
// constructed class names (e.g. `text-${tone}`, `bg-${color}`). Do not import.
// Keeping every utility we generate dynamically as a literal string here
// ensures it gets emitted in the final CSS.

export const _safelist = [
  // text-* color utilities
  "text-arcane", "text-blood", "text-ember", "text-bone",
  // bg-* color utilities
  "bg-arcane", "bg-blood", "bg-ember", "bg-bone",
  // border-* utilities (if ever needed)
  "border-arcane", "border-blood", "border-ember", "border-bone",
];
