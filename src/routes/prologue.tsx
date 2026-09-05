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

type Line =
  | { kind: "prose"; text: string }
  | { kind: "speech"; speaker: string; text: string; tone?: "blood" | "arcane" | "bone" };

type Option = {
  label: string;
  /** Short line of the player's own voice. */
  said: string;
  /** Narration that answers the choice. */
  outcome: string;
  /** One-word disposition recorded in the ledger. */
  echo: string;
};

type Chapter = {
  numeral: string;
  title: string;
  epigraph: string;
  lines: Line[];
  choice?: { prompt: string; options: Option[] };
};

const p = (text: string): Line => ({ kind: "prose", text });
const say = (speaker: string, text: string, tone?: "blood" | "arcane" | "bone"): Line => ({
  kind: "speech",
  speaker,
  text,
  tone,
});

const CHAPTERS: Chapter[] = [
  {
    numeral: "I",
    title: "The Seam In The Sky",
    epigraph: "\"We did not discover the gates. They finished arriving.\"",
    lines: [
      p("Ninety-one years ago the sky above AETHRYNDOR split along a seam no astronomer had charted, and out of that black suture fell the first gate — a doorway standing upright in an empty field, humming like a struck bell, opening onto a corridor of stone that existed nowhere on any map."),
      p("Your grandmother was a girl when the second one opened in the wheat. She told the story every winter, and she always told it the same way, which is how you knew it was true."),
      say("GRANDMOTHER", "The soldiers went in singing, child. Forty of them. What came back out was one boot and a sound.", "bone"),
      say("YOU, AGED SEVEN", "What sound?"),
      say("GRANDMOTHER", "The sound of a very large room being pleased with itself.", "bone"),
      p("By the time you were grown the gates were simply weather. They opened in naves and flooded harbours and under the floors of taverns, and when they opened, something always came out, and the criers read the names of the dead the way they read the price of grain."),
    ],
  },
  {
    numeral: "II",
    title: "The Sorting Of People",
    epigraph: "\"The gates fear some of us. Most of us, they merely digest.\"",
    lines: [
      p("It was discovered — cruelly, by trial — that the gates do not treat all mortals alike. Some walk in and the stone flinches. Others walk in and the stone leans close."),
      p("The guilds built a ladder out of that flinch and called it rank. SOVEREIGN at the crown. ASCENDANT beneath. BOUND, the reliable middle, the sword-arms who die at a respectable rate."),
      p("And at the bottom, DROSS. Porter grade. Torch grade. You were fourteen the day they measured you, in a hall that smelled of chalk and other people's sweat."),
      say("ASSESSOR", "Hand on the stone. Both hands. Don't press, it isn't a door.", "bone"),
      p("The measuring stone stayed cold. Cold the way a stone in a river is cold — indifferently, at length. The boy before you had made it glow the colour of a lit lamp and had wept, and everyone had clapped."),
      say("ASSESSOR", "Dross. Next."),
      say("YOU, AGED FOURTEEN", "That's it? Can I try the other hand—"),
      say("ASSESSOR", "Son, the stone doesn't get shy. Next.", "bone"),
    ],
    choice: {
      prompt: "The assessor's quill is already moving. What did you do with that moment?",
      options: [
        {
          label: "Say nothing. Take the paper.",
          said: "\"...Thank you, sir.\"",
          outcome:
            "You took the paper, folded it twice, and put it in your shirt against your skin, where it stayed warm all afternoon and told you nothing you had not already suspected. You have been quiet in rooms like that ever since. Quiet people get counted last, and being counted last is how you learned to still be standing when the counting stops.",
          echo: "PATIENT",
        },
        {
          label: "Ask him what Dross means for a life.",
          said: "\"What does it mean? For — for after. For work.\"",
          outcome:
            "He looked up for the first time, and there was no cruelty in his face, which was worse. \"It means you carry,\" he said. \"There's no shame in it. There's just no ceiling either.\" You have measured every ceiling you have walked under since.",
          echo: "SEARCHING",
        },
        {
          label: "Put your hand back on the stone.",
          said: "\"Once more. I wasn't ready.\"",
          outcome:
            "You held it until your knuckles went white and the queue behind you began to laugh, and the stone stayed exactly as cold as it had been, and you kept holding it anyway. Two guards had to lift you off it. You have never once, since that day, let go of a thing simply because it refused you.",
          echo: "STUBBORN",
        },
      ],
    },
  },
  {
    numeral: "III",
    title: "A Low-Tier Fee",
    epigraph: "\"Twelve silver, two days, minimal descent. Bring your own boots.\"",
    lines: [
      p("The contract said third-tier. Third-tier gates are shallow, dull things — moss, rats the size of dogs, a cavern that ends in a wall. The kind of raid a guild takes when it wants an easy ledger entry and cheap hands to carry the sacks."),
      say("GUILD-CAPTAIN HALVEN", "Porters at the back. You carry water, oil, rope, and your mouth shut. Twelve silver on return.", "bone"),
      say("YOU", "On return, or on completion?"),
      say("GUILD-CAPTAIN HALVEN", "Listen to this one. On return, porter. Nobody pays a corpse.", "bone"),
      p("The others laughed. A spear-woman named Ossa handed you half her bread on the second hour and told you her sister's name for no reason at all, and you have never been able to forget it."),
      say("OSSA", "Third-tier. My gran could clear a third-tier with a broom. Stay behind me anyway."),
      p("It was not a third-tier gate."),
      p("You remember the sound the ceiling made when it stopped being a ceiling. You remember the corridor turning to face you the way a head turns."),
      say("OSSA", "BACK — back, back, get to the door—"),
      say("GUILD-CAPTAIN HALVEN", "Seal it.", "blood"),
      p("You remember him reaching the door before anyone else, and the exact, unhurried care with which he closed it, with nineteen of you on the wrong side."),
    ],
    choice: {
      prompt: "The stone is closing. Ossa is down. There are three heartbeats left to spend.",
      options: [
        {
          label: "Throw yourself at the door.",
          said: "\"HALVEN! HALVEN, THERE ARE PEOPLE—\"",
          outcome:
            "You hit the seam of the door with your shoulder as the last finger of light closed, and you heard, very clearly, a bolt slide home on the other side. You screamed his name until the dark got tired of it. The dungeon learned your voice that night, and it has never forgotten the sound of a man being left.",
          echo: "BETRAYED",
        },
        {
          label: "Drag Ossa toward the alcove.",
          said: "\"Up. Up, come on, hold onto me—\"",
          outcome:
            "She was heavier than she looked and lighter than she should have been by the time you reached the alcove. She said her sister's name twice and then stopped saying anything. You held a stranger through the worst hour of both your lives and it changed nothing, and you would do it again, which is the part that frightens you.",
          echo: "LOYAL",
        },
        {
          label: "Take the captain's dropped lantern and run deeper.",
          said: "\"Not here. Not on my knees in a doorway.\"",
          outcome:
            "You went down instead of back, because back had a bolt on it. Three corridors, four turns, one long fall. The things behind you had to work for it, and something in the stone took note of exactly how far a Dross porter can run when the exit is a lie.",
          echo: "DEFIANT",
        },
      ],
    },
  },
  {
    numeral: "IV",
    title: "What The Floor Heard",
    epigraph: "\"Nineteen strangers. One porter. No survivors reported.\"",
    lines: [
      p("You did not die well. There is no good way to die on cold stone with your ribs opened and the torches guttering out one by one."),
      p("You were not brave. You were not calm. You lay in the heat leaving you and did arithmetic, because it was the only thing left that still worked."),
      say("YOU", "Twelve silver. I was worth twelve silver, and they didn't even collect me."),
      p("The floor heard that. Not the guild. Not the gods. The floor."),
      p("Something beneath the stone — older than the gates, older than the seam, older than the language you were cursing in — opened one eye and found you, for reasons it has never fully explained, interesting."),
      say("SOMETHING BENEATH", "Say the number again.", "blood"),
      say("YOU", "...twelve."),
      say("SOMETHING BENEATH", "Good. Hold onto it. Grievances keep better than blood does.", "blood"),
    ],
  },
  {
    numeral: "V",
    title: "The Voice Beneath",
    epigraph: "\"You have no talent. So I will lend you mine.\"",
    lines: [
      p("It did not roar. It spoke the way a debt collector speaks: patiently, and with paperwork."),
      say("VRAEKHAL", "You have no talent. None. I have looked — properly looked, not with a rock. There is nothing in you the gates would ever fear.", "blood"),
      say("VRAEKHAL", "But you have a thing the talented never learn. You were counted as nothing and you kept walking. That is a currency I accept.", "blood"),
      say("YOU", "You're offering me a bargain while I'm bleeding out. That's not an offer. That's a price."),
      say("VRAEKHAL", "Yes. You are the first in four hundred years to notice on the first night. Keep that.", "blood"),
      say("VRAEKHAL", "The terms. Every thing that falls before you is a debt owed to you. Their strength is not gone — it is owed. Collect it. Carry it. Become the ledger.", "blood"),
      say("VRAEKHAL", "And when the ledger is full, you will bring it down to me, and we will settle. Not today. Today you only have to say yes.", "blood"),
    ],
    choice: {
      prompt: "Your lungs have perhaps one sentence left in them. Spend it.",
      options: [
        {
          label: "\"Yes. Whatever it costs.\"",
          said: "\"Yes. Whatever it costs — yes.\"",
          outcome:
            "It laughed, once, like a door in a cellar. \"No haggling. How restful.\" Your blood answered before your mouth could finish, and the cold went out of your hands, and the ribs that had been open were merely scarred. Debts taken quickly are taken deepest. You will feel that eventually.",
          echo: "SWORN",
        },
        {
          label: "\"What happens when I can't pay?\"",
          said: "\"And if the ledger comes up short? What then?\"",
          outcome:
            "A long pause — long enough that you thought you had died mid-question. \"Then you become an entry in someone else's,\" it said. \"As you were an hour ago, for twelve silver.\" You said yes anyway, but you said it with your eyes open, and it respects you slightly less and trusts you slightly more.",
          echo: "CAREFUL",
        },
        {
          label: "\"I want Halven first.\"",
          said: "\"Before any of it. The captain. I want the captain.\"",
          outcome:
            "\"Ah,\" it said, delighted, the way a lender is delighted by a borrower with expensive tastes. \"A named creditor. Those are my favourite kind.\" It did not promise you Halven. It simply made certain you would live long enough to go looking.",
          echo: "VENGEFUL",
        },
      ],
    },
  },
  {
    numeral: "VI",
    title: "The Bloodbound",
    epigraph: "\"You do not level as others level. You inherit.\"",
    lines: [
      p("This is the ASCENDANT'S curse and gift, and no guild register has a word for it: the dead you leave behind do not stay behind."),
      p("A fraction of every kill settles into your marrow. Speed taken from something fast. Patience taken from something that waited a thousand years in the dark for a footstep. You do not train. You accumulate."),
      say("VRAEKHAL", "Your Bloodline is the vessel it pours into. Your Aspect is the shape it takes coming out. Your Resonances are the scars it left going in.", "blood"),
      say("YOU", "And the weaknesses?"),
      say("VRAEKHAL", "The places where the vessel is thin. Every ledger has them. Learn yours before something else does.", "blood"),
      p("With each inheritance the thing beneath the floor leans a little closer, watching, the way a lender watches a borrower who has begun to make suspiciously large payments."),
    ],
  },
  {
    numeral: "VII",
    title: "Solo Descent",
    epigraph: "\"Alone is the only way the debt pays out undivided.\"",
    lines: [
      p("No party will take you now. The guilds ran your papers, saw DROSS, and stopped reading. The few who saw what you did on the ninth floor of the Catacombs stopped speaking to you entirely."),
      say("A GUILD CLERK", "There's no line on the form for what you're describing. Come back when you're a category.", "bone"),
      say("YOU", "I'll bring the form back full."),
      p("It is acceptable. Split a kill four ways and the inheritance thins to nothing. Alone, it all comes to you. Alone, the ledger balances in your favour."),
      p("So you go down. Catacombs of bone-choked ossuaries. The Ember Foundry, where the forges never cooled and the smiths never stopped. The Veiled Halls, which rearrange themselves when you blink. The Blood Mire, which is patient, and warm, and glad you came."),
    ],
    choice: {
      prompt: "Before the first descent, one habit sets. Which one hardens?",
      options: [
        {
          label: "Read the room before the blade.",
          said: "\"Everything down here tells you what it's about to do. Once.\"",
          outcome:
            "You learned to watch shoulders, torchlight, the direction rot drifts. You notice a foe's wind-up before it commits, and a cornered thing before it knows it is cornered. Slow to swing, hard to surprise.",
          echo: "WATCHFUL",
        },
        {
          label: "Take everything not nailed down.",
          said: "\"They stopped paying me. So I collect.\"",
          outcome:
            "Loose stones, sealed jars, the seams in walls where the mortar is younger than the brick. You search where others walk, and the dungeon has begun leaving things where you will find them, which is not necessarily generosity.",
          echo: "SCAVENGER",
        },
        {
          label: "Never stop moving forward.",
          said: "\"Down. Always down. The stairs don't get closer behind me.\"",
          outcome:
            "You descend faster than is sensible and fight on the front foot, trading caution for tempo. The floors respect it. The floors also keep a very careful count of exactly how deep you have gotten away with it.",
          echo: "RELENTLESS",
        },
      ],
    },
  },
  {
    numeral: "VIII",
    title: "The Hunger Beneath",
    epigraph: "\"The only mortal it has ever bothered to name.\"",
    lines: [
      p("Somewhere below the last floor — below the depth where guild maps go blank and simply say HERE THE COUNTING STOPS — there is a throne."),
      p("On it sits VRAEKHAL, the Hunger Beneath. It has eaten kings and forgotten them. It has eaten Sovereigns and remembered them only as a taste."),
      say("VRAEKHAL", "I said your name once, over your body, when there was no one left to hear it. I have not said it since.", "blood"),
      say("YOU", "Why not?"),
      say("VRAEKHAL", "Because a name spent early is a name wasted. I am saving it for the room at the bottom.", "blood"),
      p("Every floor you take, you take toward it. Every debt you collect, you collect on its account. One of you is building the other, and neither of you has admitted which."),
    ],
  },
  {
    numeral: "IX",
    title: "Begin The Climb Downward",
    epigraph: "\"Forge your bloodline. Bind your aspect. Owe nothing.\"",
    lines: [
      p("You are alive. That was not supposed to happen, and somewhere a guild-captain is drinking well on your twelve silver."),
      p("There is a gate three streets from where you woke. It is humming — that patient, bell-struck note, the one your grandmother described as a very large room being pleased with itself."),
      say("VRAEKHAL", "The door is open. It has always been open. That was never the difficult part.", "blood"),
      p("Everything you become from here, you take from something that tried to stop you."),
      p("Descend."),
    ],
  },
];

const ECHO_KEY = "bba:prologue-echoes";

function Prologue() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [entering, setEntering] = useState(true);
  const [picked, setPicked] = useState<Record<number, Option>>({});
  const scroller = useRef<HTMLDivElement | null>(null);

  const chapter = CHAPTERS[page];
  const isLast = page === CHAPTERS.length - 1;
  const choice = chapter.choice;
  const chosen = picked[page];
  const blocked = !!choice && !chosen;

  useEffect(() => {
    unlockSfx();
  }, []);

  useEffect(() => {
    setEntering(true);
    const t = setTimeout(() => setEntering(false), 40);
    scroller.current?.scrollTo({ top: 0 });
    return () => clearTimeout(t);
  }, [page]);

  function persist(next: Record<number, Option>) {
    try {
      const echoes = Object.keys(next)
        .sort((a, b) => Number(a) - Number(b))
        .map((k) => next[Number(k)].echo);
      localStorage.setItem(ECHO_KEY, JSON.stringify(echoes));
    } catch {
      /* storage unavailable — echoes are flavour only */
    }
  }

  function pick(o: Option) {
    if (chosen) return;
    sfx("ui");
    const next = { ...picked, [page]: o };
    setPicked(next);
    persist(next);
  }

  function next() {
    if (blocked) return;
    sfx("ui");
    if (isLast) {
      navigate({ to: "/create" });
      return;
    }
    setPage((n) => n + 1);
  }

  function prev() {
    if (page === 0) return;
    sfx("ui");
    setPage((n) => n - 1);
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

  const toneClass = (tone?: string) =>
    tone === "blood" ? "text-blood" : tone === "bone" ? "text-bone" : "text-arcane";

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
            <div className="font-display text-[10px] tracking-[0.5em] text-arcane">CHAPTER {chapter.numeral}</div>
            <h1 className="mt-2 font-display text-xl tracking-[0.2em] text-foreground sm:text-3xl">
              {chapter.title.toUpperCase()}
            </h1>
            <p className="mt-4 border-l-2 border-blood/50 pl-4 font-serif text-sm italic text-muted-foreground">
              {chapter.epigraph}
            </p>

            <div className="mt-6 space-y-4">
              {chapter.lines.map((l, i) =>
                l.kind === "prose" ? (
                  <p
                    key={i}
                    className="font-serif text-[15px] leading-relaxed text-foreground/90 sm:text-base sm:leading-[1.85]"
                  >
                    {l.text}
                  </p>
                ) : (
                  <div key={i} className="rounded-sm border-l-2 border-border/70 bg-background/40 py-2 pl-4 pr-3">
                    <div className={`font-display text-[10px] tracking-[0.35em] ${toneClass(l.tone)}`}>{l.speaker}</div>
                    <p className="mt-1 font-serif text-[15px] italic leading-relaxed text-foreground/90 sm:text-base">
                      {l.text}
                    </p>
                  </div>
                ),
              )}
            </div>

            {choice && (
              <div className="mt-7 rounded-sm border border-bone/40 bg-bone/5 p-4 sm:p-5">
                <div className="font-display text-[10px] tracking-[0.4em] text-bone">A MOMENT THAT KEEPS</div>
                <p className="mt-2 font-serif text-sm italic text-foreground/85">{choice.prompt}</p>

                {!chosen ? (
                  <div className="mt-4 grid gap-2">
                    {choice.options.map((o, i) => (
                      <button
                        key={i}
                        onClick={() => pick(o)}
                        className="group rounded-sm border border-arcane/40 bg-background/40 px-3 py-2.5 text-left transition-colors hover:border-arcane/80 hover:bg-arcane/10"
                      >
                        <span className="font-serif text-sm text-foreground/90 group-hover:text-bone">{o.label}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    <div className="rounded-sm border-l-2 border-arcane/70 bg-background/40 py-2 pl-4">
                      <div className="font-display text-[10px] tracking-[0.35em] text-arcane">YOU</div>
                      <p className="mt-1 font-serif text-[15px] italic text-foreground/90">{chosen.said}</p>
                    </div>
                    <p className="font-serif text-[15px] leading-relaxed text-foreground/90 sm:leading-[1.85]">
                      {chosen.outcome}
                    </p>
                    <div className="font-mono text-[10px] tracking-[0.3em] text-ember">
                      ⚑ THE LEDGER RECORDS — {chosen.echo}
                    </div>
                  </div>
                )}
              </div>
            )}
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
              disabled={blocked}
              className={`rounded-sm px-5 py-2.5 font-display text-[11px] tracking-[0.3em] text-bone transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 sm:px-7 ${
                isLast
                  ? "border border-blood/60 bg-blood/25 hover:bg-blood/35"
                  : "border border-arcane/40 bg-gradient-arcane shadow-arcane"
              }`}
            >
              {blocked ? "CHOOSE — THEN GO ON" : isLast ? "ACCEPT THE PACT →" : "CONTINUE →"}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
