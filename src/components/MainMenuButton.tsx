import { Link } from "@tanstack/react-router";

/**
 * Persistent floating "Main Menu" button for in-game screens.
 * Fixed to the viewport so it's always reachable without refreshing.
 */
export function MainMenuButton() {
  return (
    <Link
      to="/"
      aria-label="Return to main menu"
      className="fixed left-3 top-3 z-[60] inline-flex items-center gap-2 rounded-md border border-arcane/40 bg-background/85 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-arcane shadow-lg backdrop-blur-sm transition-colors hover:border-arcane hover:bg-arcane/10 sm:left-4 sm:top-4 sm:text-xs"
    >
      <span aria-hidden>✦</span>
      <span>Main Menu</span>
    </Link>
  );
}

export default MainMenuButton;
