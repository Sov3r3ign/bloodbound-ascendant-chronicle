# The Bloodbound Ascendants

A browser-based, tabletop-inspired roguelike RPG set in the world of **Aethryndor**. Forge a Bloodbound Ascendant — a warrior bound by an ancient pact to the Pale Sovereign **Vraekhal** — and descend through ever-deeper, ever-deadlier dungeons, growing stronger with every kill.

---

## Table of Contents

- [The Premise](#the-premise)
- [Gameplay Overview](#gameplay-overview)
- [Character Creation — The Forge](#character-creation--the-forge)
- [The Dungeon](#the-dungeon)
- [Combat](#combat)
- [World & Story Systems](#world--story-systems)
- [Meta-Progression](#meta-progression)
- [Controls](#controls)
- [Screens & Routes](#screens--routes)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Scripts](#scripts)
- [Roadmap Ideas](#roadmap-ideas)

---

## The Premise

> *The sky split. The ranks were sorted. The weak were named Dross and given to the dark.*

You were a porter — a rank-Dross hauler, betrayed by your party and left to die in the dark of a dungeon. But death refused the bargain. A voice older than the split sky — **Vraekhal**, the Pale Sovereign — offered a pact instead:

**Every kill feeds you. Every fall teaches you. Ascend, or be forgotten.**

The full nine-chapter tale plays as an interactive prologue when you start a new game.

---

## Gameplay Overview

The Bloodbound Ascendants is a **single-session roguelike with persistent meta-progression**, presented in a dark "umbral" visual identity (deep shadow violet, ritual glyphs, candle-lit palettes):

- **Turn-based dungeon crawling** on procedurally generated floors with fog-of-war and line-of-sight
- **Bump-to-attack combat** with full tabletop math shown in the log (`d20 + mods vs AC`)
- **An isometric dungeon view** — angled walls, extruded floor depth, drop shadows, and a camera that follows your token (with a flat-view toggle)
- **Branching biomes, story events, and racial story branches** that make every run feel like a campaign
- **Shards & unlocks** that persist between runs, opening new character options

Everything runs locally in the browser — no account, no server required. Progress saves to your device.

---

## Character Creation — The Forge

Character creation ("the Forge") is a guided multi-step ritual:

| Step | What you choose | Notes |
| --- | --- | --- |
| **Identity** | Name + **Vessel** (male / female) | Vessel describes the body, not a role |
| **Bloodline (Race)** | 9 races, all unlocked from the start | Human, Dragonborn, Fae-Blooded, Umbralborn, Giant, Crocman, Beastkin, Dwarf, Elf |
| **Visage** | Custom appearance | Complexions, hairstyles, eye shapes, scars, builds, ritual markings, and auras — with bloodline presets and a live parallax-tilt portrait |
| **Aspect (Class)** | 10 aspects; some gated behind Shards | Ruin, Veils, Echoes, Oaths, Dominion, Chains, Embers, Primordial, Boundstar, Fury — each with a passive, active, and ultimate |
| **Resonances** | Boons with costs and attention ratings | e.g. *Blood Awakens When Wounded* (+3 damage below half HP, but bleeding triggers more often) |
| **Weaknesses & Vital Measures** | The flaws that make the build yours | Feeds into events and outcomes during the run |

Info tips (small "i" icons) appear throughout the Forge to explain Pillars, Bloodlines, Aspects, Resonances, and Ascension Tiers without leaving the page.

### Starter Kit

Every Ascendant begins with an **Adventurer's Bag**: a Wayfarer's Shortblade (d6+1), Travel Leathers (AC 1), a Wanderer's Token (+1 HP regen out of combat), and a few potions. Better gear is looted, bought at Sanctuary merchants, or won from story events.

---

## The Dungeon

### Biomes

Dungeons are geographically distinct, with their own monster pools, banner art, accent colors, and narrative voice. Difficulty scales aggressively as you descend:

| Biome | Flavor |
| --- | --- |
| **The Catacombs of Aethryn** | Ossuaries, bone-cur hounds, the first whispers of the pact |
| **The Ember Foundry** | Molten halls, cinder-etched blades, forge-wraiths |
| **The Veiled Halls** | Silence, mirrors, things that should not be seen |
| **The Blood Mire** | Black marshes, murk-lurkers, the heart of the rot |

Scaling per floor: monster HP +3, attack +1 every 2 floors, AC +1 every 4 floors, XP reward +15%.

### Floor Structure

- Every **3rd floor** is a **Boss Arena** — a dedicated, distinct area with a cinematic boss intro, "Read Its Tells" mechanic summary, unique HUD theming, and multi-phase bosses (stat surges and new behavior at 66% and 33% HP)
- **Sanctuary floors** offer a merchant shop where gold becomes gear and potions
- **Stairs offer a choice** — the Descent Path modal presents three routes down, each with its own boon and bane
- **Floor intros** display a description and banner image for each new floor

### Exploration

- **Fog of war & line of sight** — foes are described and illustrated the moment you meet them, not when they merely exist on the map
- **Search action** — a DC 11 check that reveals hidden traps within 2 tiles and can uncover secret gold, shards, or potions
- **Traps and shrines** resolved with visible d20 rolls (Reflex saves / Fate rolls)

---

## Combat

Combat is turn-based, grid-based, and readable — every roll is shown, never hidden.

- **Bump-to-attack**: move into a foe to strike. The log shows the full roll: `d20 + atk bonus + blessings vs AC`
- **Tactical edges**:
  - **Cornered (Flanking)** — a foe with ≤1 escape route takes +3 to be hit
  - **Exposed** — a foe mid-wind-up takes +2 to hit and +3 damage
- **Telegraphed heavy blows**: monsters may *Wind Up*, announcing a double-damage strike next turn — interrupt it, reposition, or brace
- **Status effects**: bleed, burn, and poison tick and decay over time
- **Foes in Sight panel**: portraits, lore descriptions, AC, and stats for nearby enemies; beasts show their level and appear with a full-illustration encounter card the first time you meet one
- **Skill bar**: hotkey-bound abilities (1, 2, Q, R) drawn from your Aspect's passive / active / ultimate kit
- **Game feel**: floating damage numbers, animated dice rolls, combo counter, level-up bursts, animated HP/Focus bars with low-health pulses, and sound effects for hits, kills, and level-ups

---

## World & Story Systems

### The Saga System

Choices persist for the whole run. The Saga tracks:

- **Flags** — story decisions made at crossroads
- **Reputation** per biome — factions remember
- **Blessings and Curses** — permanent (or temporary) boons and scars

A SAGA panel in the dungeon HUD shows your running tale at a glance.

### Branching Story Events

- Biome-specific **NPC encounters** trigger when you descend, with choices that trade stats, resources, or risk
- **Racial branching**: your Bloodline changes prompts, choices, and outcomes — e.g. *The First Ember* (Dragonborn only) and *The Exile's Welcome* (Fae only), plus racial variants on 8+ shared events
- Follow-up encounters reference earlier choices, so a run reads like a campaign chronicle rather than a dice loop

---

## Meta-Progression

Even a failed descent earns something. Persistent progress is stored between runs:

- **Shards** — earned from kills, shrines, and floors; the run currency
- **Unlocks** — Aspects are gated behind shard costs (all Bloodlines are free from the start)
- **Character roster** — saved characters can be loaded and re-entered

---

## Controls

| Input | Action |
| --- | --- |
| **W A S D / Arrow keys** | Move (into a foe = attack) |
| **1 / 2 / Q / R** | Aspect skills |
| **F** | Search the area |
| **Touch** | On-screen D-pad and tap controls on mobile |

The interface is fully responsive — on phones the HUD reflows to a single column, the map auto-scrolls to keep you centered, and a persistent **Main Menu** button returns you to the title screen without refreshing.

---

## Screens & Routes

| Route | Screen |
| --- | --- |
| `/` | Main menu — animated title splash, NEW GAME, LOAD GAME, OPTIONS, INFO |
| `/prologue` | The nine-chapter Chronicle of Aethryndor (typewriter narration, chapter art) |
| `/create` | The Forge — character creation |
| `/dungeon` | The descent — isometric dungeon, combat, HUD, story events |
| `/codex` | The Codex — beasts, biomes, bloodlines, and lore reference |
| `/chronicler` | The Chronicler — game-master style view of your run's history |

The game menu and in-game flows include a **How to Play** guide covering movement, combat math, searching, and the Saga.

---

## Tech Stack

- **Framework**: [TanStack Start v1](https://tanstack.com/start) (React 19, SSR, file-based routing via TanStack Router)
- **Build tool**: Vite 7
- **Styling**: Tailwind CSS v4 (CSS-first `@theme` configuration) + shadcn-style components built on Radix primitives
- **Language**: TypeScript (strict)
- **State & data**: React Query, local-storage-backed persistence (`src/lib/character-storage.ts`, `src/lib/meta-storage.ts`)
- **Icons**: lucide-react • **Toasts**: sonner

---

## Project Structure

```
src/
├── components/          # UI components
│   ├── IsoDungeon.tsx       # Isometric tile renderer (camera, depth, shadows)
│   ├── BeastEncounter*      # First-encounter beast cards
│   ├── BossIntroModal.tsx   # Cinematic boss intros + tells
│   ├── DescentPathModal.tsx # Branching stair choices
│   ├── FloorIntroModal.tsx  # Floor descriptions & banner art
│   ├── NpcDialogueModal.tsx # Story-event dialogue trees
│   ├── PrologueModal.tsx    # (superseded by /prologue route)
│   ├── HowToPlayModal.tsx   # In-game tutorial
│   ├── RacePortrait.tsx     # Visage portrait rendering w/ parallax tilt
│   ├── InfoTip.tsx          # Tooltip "i" icons for terminology
│   └── …
├── lib/                 # Game engine & data (pure TS, no UI)
│   ├── dungeon-engine.ts    # Floor gen, combat, monsters, biomes, loot, traps
│   ├── floor-events.ts      # Biome & race-gated story events
│   ├── saga.ts              # Run-long flags, reputation, blessings/curses
│   ├── game-data.ts         # Races, aspects, resonances, gear tables
│   ├── npcs.ts              # NPC dialogue templates (race-aware)
│   ├── boss-intros.ts       # Boss lore, tells, HUD themes
│   ├── appearance.ts        # Visage options
│   ├── meta-storage.ts      # Shards & unlocks (persisted)
│   ├── character-storage.ts # Saved characters (persisted)
│   ├── sfx.ts               # Web Audio sound effects
│   └── beast/biome/race-images.ts  # Asset maps
├── assets/              # AI-illustrated art (beasts, biomes, races)
└── routes/              # TanStack file-based routes (see table above)
```

The engine (`src/lib/dungeon-engine.ts`) is deliberately UI-agnostic: it owns procedural generation, line-of-sight, turn resolution, tactical bonuses, and scaling — the route and components only render state and dispatch intents.

---

## Getting Started

**Prerequisites**: [Bun](https://bun.sh) (or Node 20+) and npm.

```bash
# install
bun install        # or: npm install

# run in dev mode (http://localhost:8080)
bun run dev

# production build
bun run build

# preview the production build
bun run preview
```

No environment variables or external services are needed — the game is fully client-side and persists saves in the browser.

---

## Scripts

| Script | Purpose |
| --- | --- |
| `dev` | Vite dev server with HMR |
| `build` | Production build |
| `build:dev` | Development-mode build (prerender check) |
| `preview` | Serve the production build locally |
| `lint` | ESLint |
| `format` | Prettier |

---

## Roadmap Ideas

- **True multiplayer**: party lobbies, shared dungeons, real-time chat, and visible party dice rolls
- **Chronicler (GM) mode**: hand-authored floors and encounters
- **Ascension Tiers**: post-run prestige progression
- Deeper Saga payoffs and cross-run legacies

*The dark remembers every name. Make sure it remembers yours.*
