import { Link } from "@tanstack/react-router";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="group flex items-center gap-3">
          <span className="text-2xl text-arcane animate-flicker">✦</span>
          <div className="leading-tight">
            <div className="font-display text-sm tracking-[0.3em] text-arcane">BLOODBOUND</div>
            <div className="font-display text-xs tracking-[0.25em] text-muted-foreground">ASCENDANTS</div>
          </div>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-display tracking-widest text-muted-foreground md:flex">
          <Link to="/" className="transition-colors hover:text-arcane [&.active]:text-arcane">CODEX</Link>
          <Link to="/create" className="transition-colors hover:text-arcane [&.active]:text-arcane">FORGE</Link>
          <Link to="/dungeon" className="transition-colors hover:text-arcane [&.active]:text-arcane">DUNGEON</Link>
          <Link to="/chronicler" className="transition-colors hover:text-arcane [&.active]:text-arcane">CHRONICLER</Link>
        </nav>
        <Link
          to="/create"
          className="rounded-sm border border-arcane/40 bg-gradient-arcane px-4 py-2 font-display text-xs tracking-widest text-bone shadow-rune transition-all hover:shadow-arcane"
        >
          AWAKEN
        </Link>
      </div>
    </header>
  );
}
