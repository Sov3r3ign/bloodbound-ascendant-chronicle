import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { sfx, unlockSfx } from "@/lib/sfx";

export const Route = createFileRoute("/prologue")({
  head: () => ({
    meta: [
      { title: "Prologue — The Chronicle of Aethryndor" },
      {
        name: "description",
        content:
          "The opening tale of The Bloodbound Ascendants: a rank-Dross porter, a sealed gate, and the hungry thing beneath the last floor.",
      },
      { property: "og:title", content: "Prologue — The Chronicle of Aethryndor" },
      {
        property: "og:description",
        content: "A rank-Dross porter dies on the wrong side of a sealed door — and something older than the gates answers.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Prologue,
});

type Chapter = {
  numeral: string;
  title: string;
  epigraph?: string;
  paragraphs: string[];
};

const CHAPTERS: Chapter[] = [
  {
    numeral: "I",
    title: "The Seam In The Sky",
    epigraph: "\"We did not discover the gates. They finished arriving.\"",
    paragraphs: [
      "Ninety-one years ago the sky above AETHRYNDOR split along a seam no astronomer had charted, and out of that black suture fell the first gate — a doorway standing upright in an empty field, humming like a struck bell, opening onto a corridor of stone that existed nowhere on any map.",
      "Kingdoms sent armies into it. The armies did not come back. Then the kingdoms sent scholars, and the scholars came back changed, babbling about floors beneath floors and a hunger that counted them as they walked.",
      "By the time the third generation was born, the gates were simply weather. They opened in wheat fields and cathedral naves and the flooded quarters of port cities, and when they opened, something always came out.",
    ],
  },
  {
    numeral: "II",
    title: "The Sorting Of People",
    epigraph: "\"The gates fear some of us. Most of us, they merely digest.\"",
    paragraphs: [
      "It was discovered — cruelly, by trial — that the gates did not treat all mortals the same. Some walked into a gate and the stone flinched from them. Others walked in and the stone leaned close.",
      "So the guilds built a ladder out of that flinch and called it rank. SOVEREIGN at the crown, the handful the deep floors will not touch. ASCENDANT beneath them, the ones who grow. BOUND, the reliable middle, the sword-arms and shield-carriers who die at a respectable rate.",
      "And at the bottom, DROSS. Porter grade. Torch grade. The rank they measure you at when the measuring stone stays cold in your hand and the assessor does not look up as he writes it.",
      "You were fourteen when they stamped it on your papers. You have carried that word longer than you have carried anything else.",
    ],
  },
  {
    numeral: "III",
    title: "A Low-Tier Fee",
    epigraph: "\"Twelve silver, two days, minimal descent. Bring your own boots.\"",
    paragraphs: [
      "The contract said third-tier. Third-tier gates are shallow, dull things — moss, rats the size of dogs, a cavern that ends in a wall. The kind of raid a guild sends when it wants an easy ledger entry and cheap hands to carry the sacks.",
      "You took it because you had taken forty like it. You strapped on borrowed leather, shouldered the water, and walked in behind nineteen strangers whose names you learned in the first hour and would not need in the third.",
      "It was not a third-tier gate.",
      "You remember the sound the ceiling made when it stopped being a ceiling. You remember the corridor turning to face you the way a head turns. You remember the guild-captain reaching the door before anyone else, and the exact, unhurried care with which he sealed it — with you on the wrong side of it.",
    ],
  },
  {
    numeral: "IV",
    title: "What The Floor Heard",
    epigraph: "\"Nineteen strangers. One porter. No survivors reported.\"",
    paragraphs: [
      "You did not die well. There is no good way to die on cold stone with your ribs opened and the torches guttering out one by one as the things in the dark finish with the others and start toward you.",
      "You were not brave. You were not calm. You lay there in your own heat leaving you and thought, with the last clear thought you had: I was worth twelve silver, and they did not even collect me.",
      "The floor heard that. Not the guild. Not the gods. The floor.",
      "Something beneath the stone — older than the gates, older than the seam, older than the language you were cursing in — opened one eye and found you, for reasons it has never fully explained, interesting.",
    ],
  },
  {
    numeral: "V",
    title: "The Voice Beneath",
    epigraph: "\"You have no talent. So I will lend you mine.\"",
    paragraphs: [
      "It did not roar. It spoke the way a debt collector speaks: patiently, and with paperwork.",
      "\"You have no talent,\" it said, almost kindly. \"None. I have looked. There is nothing in you the gates would ever fear.\"",
      "\"But you have something the talented never learn. You have been counted as nothing, and you kept walking anyway. That is a currency I accept.\"",
      "\"So: a loan. Every thing that falls before you is a debt owed to you. Their strength is not gone — it is owed. Collect it. Carry it. Become the ledger.\"",
      "Your blood answered before your mouth could. It has been answering ever since.",
    ],
  },
  {
    numeral: "VI",
    title: "The Bloodbound",
    epigraph: "\"You do not level as others level. You inherit.\"",
    paragraphs: [
      "This is the ASCENDANT'S curse and gift, and no guild register has a word for it: the dead you leave behind do not stay behind.",
      "A fraction of every kill settles into your marrow. A shard of every Sovereign. Speed taken from something fast, patience taken from something that waited a thousand years in the dark for a footstep. You do not train. You accumulate.",
      "Your Bloodline is the vessel it pours into. Your Aspect is the shape it takes when it comes out of you. Your Resonances are the scars it left going in.",
      "And with each inheritance the thing beneath the floor leans a little closer, watching, the way a lender watches a borrower who has begun to make suspiciously large payments.",
    ],
  },
  {
    numeral: "VII",
    title: "Solo Descent",
    epigraph: "\"Alone is the only way the debt pays out undivided.\"",
    paragraphs: [
      "No party will take you now. The guilds ran your papers, saw DROSS, and stopped reading. The few who saw what you did on the ninth floor of the Catacombs stopped speaking to you entirely.",
      "That is acceptable. Split a kill four ways and the inheritance thins to nothing. Alone, it all comes to you. Alone, the ledger balances in your favour.",
      "So you go down. Floor by floor. Catacombs of bone-choked ossuaries. The Ember Foundry where the forges never cooled and the smiths never stopped. The Veiled Halls, which rearrange themselves when you blink. The Blood Mire, which is patient, and warm, and glad you came.",
    ],
  },
  {
    numeral: "VIII",
    title: "The Hunger Beneath",
    epigraph: "\"The only mortal it has ever bothered to name.\"",
    paragraphs: [
      "Somewhere below the last floor — below the depth where guild maps go blank and simply say HERE THE COUNTING STOPS — there is a throne.",
      "On it sits VRAEKHAL, the Hunger Beneath. It has eaten kings and forgotten them. It has eaten Sovereigns and remembered them only as a taste.",
      "It knows your name. It said it once, in the dark, over your ruined body, and it has not said it again since. It is saving it.",
      "Every floor you take, you take toward it. Every debt you collect, you collect on its account. One of you is building the other, and neither of you has admitted which.",
    ],
  },
  {
    numeral: "IX",
    title: "Begin The Climb Downward",
    epigraph: "\"Forge your bloodline. Bind your aspect. Owe nothing.\"",
    paragraphs: [
      "You are alive. That was not supposed to happen, and somewhere a guild-captain is drinking well on your twelve silver.",
      "There is a gate three streets from where you woke. It is humming.",
      "Everything you become from here, you take from something that tried to stop you.",
      "Descend.",
    ],
  },
];

function Prologue() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [entering, setEntering] = useState(true);
  const scroller = useRef<HTMLDivElement | null>(null);

  const chapter = CHAPTERS[page];
  const isLast = page === CHAPTERS.length - 1;

  useEffect(() => {
    unlockSfx();
  }, []);

  useEffect(() => {
    setEntering(true);
    const t = setTimeout(() => setEntering(false), 40);
    scroller.current?.scrollTo({ top: 0 });
    return () => clearTimeout(t);
  }, [page]);

  function next() {
    sfx("ui");
    if (isLast) {
      navigate({ to: "/create" });
      return;
    }
    setPage((p) => p + 1);
  }

  function prev() {
    if (page === 0) return;
    sfx("ui");
    setPage((p) => p - 1);
  }

  function skip() {
    sfx("ui");
    navigate({ to: "/create" });
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        next();
      }
      if (e.key === "ArrowLeft") prev();
      if (e.key === "Escape") skip();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Ambient atmosphere */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/3 h-[80vmin] w-[80vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-arcane opacity-[0.18] blur-3xl animate-rune" />
        <div className="absolute right-[6%] bottom-[10%] h-56 w-56 rounded-full bg-blood/15 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 py-6 sm:px-6 sm:py-10">
        {/* Header */}
        <header className="text-center">
          <div className="font-display text-[9px] tracking-[0.5em] text-arcane sm:text-[10px]">THE CHRONICLE OF</div>
          <div className="mt-2 font-display text-2xl tracking-[0.3em] text-glow sm:text-4xl">AETHRYNDOR</div>
          <div className="mx-auto mt-4 flex items-center justify-center gap-3 text-arcane/60">
            <span className="h-px w-10 bg-arcane/40 sm:w-16" />
            <span className="animate-flicker">✦</span>
            <span className="h-px w-10 bg-arcane/40 sm:w-16" />
          </div>
        </header>

        {/* Chapter */}
        <main
          ref={scroller}
          className="mt-8 flex-1 overflow-y-auto rounded-sm border border-arcane/30 bg-card/70 px-5 py-6 shadow-arcane sm:px-10 sm:py-9"
        >
          <div className={`transition-all duration-700 ${entering ? "opacity-0 translate-y-3" : "opacity-100 translate-y-0"}`}>
            <div className="font-display text-[10px] tracking-[0.5em] text-arcane">
              CHAPTER {chapter.numeral}
            </div>
            <h1 className="mt-2 font-display text-xl tracking-[0.2em] text-foreground sm:text-3xl">
              {chapter.title.toUpperCase()}
            </h1>
            {chapter.epigraph && (
              <p className="mt-4 border-l-2 border-blood/50 pl-4 font-serif text-sm italic text-muted-foreground">
                {chapter.epigraph}
              </p>
            )}
            <div className="mt-6 space-y-4">
              {chapter.paragraphs.map((p, i) => (
                <p
                  key={i}
                  className="font-serif text-[15px] leading-relaxed text-foreground/90 sm:text-base sm:leading-[1.85]"
                  style={{ transitionDelay: `${i * 90}ms` }}
                >
                  {p}
                </p>
              ))}
            </div>
          </div>
        </main>

        {/* Controls */}
        <footer className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center justify-center gap-1.5 sm:justify-start">
            {CHAPTERS.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-sm transition-all ${
                  i === page
                    ? "w-6 bg-arcane shadow-[0_0_8px_oklch(0.7_0.18_280)]"
                    : i < page
                      ? "w-3 bg-arcane/40"
                      : "w-3 bg-border"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <button
              onClick={skip}
              className="font-display text-[10px] tracking-[0.3em] text-muted-foreground transition-colors hover:text-foreground"
            >
              SKIP TALE
            </button>
            {page > 0 && (
              <button
                onClick={prev}
                className="rounded-sm border border-border px-4 py-2 font-display text-[10px] tracking-[0.3em] text-muted-foreground transition-colors hover:text-foreground"
              >
                ← BACK
              </button>
            )}
            <button
              onClick={next}
              className={`rounded-sm px-5 py-2.5 font-display text-[11px] tracking-[0.3em] text-bone transition-transform hover:scale-[1.02] sm:px-7 ${
                isLast
                  ? "border border-blood/60 bg-blood/25 hover:bg-blood/35"
                  : "border border-arcane/40 bg-gradient-arcane shadow-arcane"
              }`}
            >
              {isLast ? "ACCEPT THE PACT →" : "CONTINUE →"}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
