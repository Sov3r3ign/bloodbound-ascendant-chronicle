import { Link } from "@tanstack/react-router";
import { HowToPlayButton } from "@/components/HowToPlayModal";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
        <Link to="/" aria-label="Main menu" className="group flex shrink-0 items-center gap-2 font-display text-[10px] tracking-[0.4em] text-muted-foreground transition-colors hover:text-arcane">
          <span className="text-lg text-arcane animate-flicker">✦</span>
          <span className="hidden sm:inline">MAIN MENU</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-display tracking-widest text-muted-foreground md:flex">
          <Link to="/" className="transition-colors hover:text-arcane [&.active]:text-arcane">MENU</Link>
          <Link to="/codex" className="transition-colors hover:text-arcane [&.active]:text-arcane">CODEX</Link>
          <Link to="/create" className="transition-colors hover:text-arcane [&.active]:text-arcane">FORGE</Link>
          <Link to="/dungeon" className="transition-colors hover:text-arcane [&.active]:text-arcane">DUNGEON</Link>
          <Link to="/chronicler" className="transition-colors hover:text-arcane [&.active]:text-arcane">CHRONICLER</Link>
        </nav>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div className="hidden md:block">
            <HowToPlayButton />
          </div>
          <Link
            to="/create"
            className="shrink-0 whitespace-nowrap rounded-sm border border-arcane/40 bg-gradient-arcane px-3 py-1.5 font-display text-[11px] tracking-widest text-bone shadow-rune transition-all hover:shadow-arcane sm:px-4 sm:py-2 sm:text-xs"
          >
            AWAKEN
          </Link>
        </div>
      </div>
    </header>
  );
}

