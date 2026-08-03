import { Link } from "@tanstack/react-router";

/**
 * Persistent floating "Main Menu" button for in-game screens.
 * Fixed to the viewport so it's always reachable without refreshing.
 */
export function MainMenuButton() {
  return (
    <>
      <Link
        to="/"
        aria-label="Return to main menu"
        className="fixed left-2 top-2 z-[60] inline-flex max-w-[calc(100vw-1rem)] items-center gap-1.5 rounded-md border border-arcane/40 bg-background/85 px-2.5 py-1.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-arcane shadow-lg backdrop-blur-sm transition-colors hover:border-arcane hover:bg-arcane/10 sm:left-4 sm:top-4 sm:gap-2 sm:px-3 sm:text-xs"
      >
        <span aria-hidden>✦</span>
        <span>Main Menu</span>
      </Link>
      {/* Reserves vertical space so page content never sits under the fixed button */}
      <div aria-hidden className="h-10 sm:h-8" />
    </>
  );
}


export default MainMenuButton;
