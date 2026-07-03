// Tiny WebAudio SFX synth — no assets, no deps. Lazy-inits on first use
// (browsers require a gesture; we also unlock on first pointerdown/keydown).

export type SfxTag =
  | "hit"
  | "crit"
  | "miss"
  | "kill"
  | "hurt"
  | "quaff"
  | "shield"
  | "power"
  | "shrine"
  | "chest"
  | "gold"
  | "level"
  | "death"
  | "ascend"
  | "step"
  | "ui";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let muted = false;

function readMuted(): boolean {
  try {
    return localStorage.getItem("bb.sfx.muted") === "1";
  } catch {
    return false;
  }
}
function writeMuted(v: boolean) {
  try {
    localStorage.setItem("bb.sfx.muted", v ? "1" : "0");
  } catch {}
}

if (typeof window !== "undefined") {
  muted = readMuted();
}

function ensure(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = (window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext);
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.35;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

export function unlockSfx() {
  ensure();
}

export function isMuted() {
  return muted;
}
export function setMuted(v: boolean) {
  muted = v;
  writeMuted(v);
  if (master) master.gain.value = v ? 0 : 0.35;
}
export function toggleMuted() {
  setMuted(!muted);
  return muted;
}

type ToneOpts = {
  freq: number;
  toFreq?: number;
  type?: OscillatorType;
  dur?: number;
  attack?: number;
  release?: number;
  gain?: number;
  delay?: number;
};

function tone(o: ToneOpts) {
  const ac = ensure();
  if (!ac || !master || muted) return;
  const t0 = ac.currentTime + (o.delay ?? 0);
  const dur = o.dur ?? 0.15;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = o.type ?? "sine";
  osc.frequency.setValueAtTime(o.freq, t0);
  if (o.toFreq && o.toFreq !== o.freq) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.toFreq), t0 + dur);
  }
  const peak = o.gain ?? 0.25;
  const atk = o.attack ?? 0.005;
  const rel = o.release ?? Math.max(0.02, dur - atk);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(peak, t0 + atk);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + atk + rel);
  osc.connect(g).connect(master);
  osc.start(t0);
  osc.stop(t0 + atk + rel + 0.02);
}

function noise(opts: { dur?: number; gain?: number; hp?: number; delay?: number } = {}) {
  const ac = ensure();
  if (!ac || !master || muted) return;
  const t0 = ac.currentTime + (opts.delay ?? 0);
  const dur = opts.dur ?? 0.18;
  const buf = ac.createBuffer(1, Math.floor(ac.sampleRate * dur), ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = ac.createBufferSource();
  src.buffer = buf;
  const hp = ac.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = opts.hp ?? 600;
  const g = ac.createGain();
  const peak = opts.gain ?? 0.2;
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(peak, t0 + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(hp).connect(g).connect(master);
  src.start(t0);
  src.stop(t0 + dur + 0.02);
}

export function sfx(tag: SfxTag) {
  if (muted) return;
  switch (tag) {
    case "hit":
      noise({ dur: 0.12, gain: 0.28, hp: 900 });
      tone({ freq: 220, toFreq: 90, type: "square", dur: 0.09, gain: 0.14 });
      break;
    case "crit":
      noise({ dur: 0.18, gain: 0.34, hp: 500 });
      tone({ freq: 340, toFreq: 90, type: "sawtooth", dur: 0.16, gain: 0.22 });
      tone({ freq: 880, toFreq: 220, type: "triangle", dur: 0.22, gain: 0.14, delay: 0.02 });
      break;
    case "miss":
      noise({ dur: 0.08, gain: 0.12, hp: 1600 });
      break;
    case "kill":
      tone({ freq: 180, toFreq: 60, type: "sawtooth", dur: 0.28, gain: 0.22 });
      noise({ dur: 0.22, gain: 0.18, hp: 400, delay: 0.02 });
      break;
    case "hurt":
      tone({ freq: 380, toFreq: 140, type: "triangle", dur: 0.18, gain: 0.22 });
      noise({ dur: 0.1, gain: 0.14, hp: 300 });
      break;
    case "quaff":
      tone({ freq: 440, toFreq: 880, type: "sine", dur: 0.22, gain: 0.2 });
      tone({ freq: 660, toFreq: 1320, type: "sine", dur: 0.22, gain: 0.14, delay: 0.05 });
      break;
    case "shield":
      tone({ freq: 220, toFreq: 660, type: "triangle", dur: 0.28, gain: 0.18 });
      tone({ freq: 330, toFreq: 990, type: "sine", dur: 0.28, gain: 0.12, delay: 0.04 });
      break;
    case "power":
      tone({ freq: 120, toFreq: 720, type: "sawtooth", dur: 0.28, gain: 0.22 });
      tone({ freq: 480, toFreq: 1200, type: "square", dur: 0.24, gain: 0.12, delay: 0.05 });
      break;
    case "shrine":
      tone({ freq: 523, type: "sine", dur: 0.5, gain: 0.16 });
      tone({ freq: 659, type: "sine", dur: 0.5, gain: 0.14, delay: 0.08 });
      tone({ freq: 784, type: "sine", dur: 0.5, gain: 0.12, delay: 0.16 });
      break;
    case "chest":
      tone({ freq: 220, toFreq: 440, type: "triangle", dur: 0.14, gain: 0.2 });
      tone({ freq: 660, type: "sine", dur: 0.22, gain: 0.16, delay: 0.1 });
      break;
    case "gold":
      tone({ freq: 1200, toFreq: 1600, type: "sine", dur: 0.08, gain: 0.14 });
      tone({ freq: 1000, toFreq: 1400, type: "sine", dur: 0.08, gain: 0.12, delay: 0.06 });
      break;
    case "level":
      tone({ freq: 523, type: "triangle", dur: 0.22, gain: 0.22 });
      tone({ freq: 659, type: "triangle", dur: 0.22, gain: 0.22, delay: 0.1 });
      tone({ freq: 988, type: "triangle", dur: 0.36, gain: 0.24, delay: 0.2 });
      break;
    case "ascend":
      tone({ freq: 392, type: "sine", dur: 0.3, gain: 0.18 });
      tone({ freq: 587, type: "sine", dur: 0.3, gain: 0.18, delay: 0.08 });
      tone({ freq: 784, type: "sine", dur: 0.5, gain: 0.2, delay: 0.16 });
      break;
    case "death":
      tone({ freq: 220, toFreq: 40, type: "sawtooth", dur: 0.9, gain: 0.28 });
      noise({ dur: 0.6, gain: 0.18, hp: 200, delay: 0.05 });
      break;
    case "step":
      noise({ dur: 0.04, gain: 0.06, hp: 1200 });
      break;
    case "ui":
      tone({ freq: 720, type: "square", dur: 0.05, gain: 0.08 });
      break;
  }
}

// One-time global unlock
if (typeof window !== "undefined") {
  const unlock = () => {
    unlockSfx();
    window.removeEventListener("pointerdown", unlock);
    window.removeEventListener("keydown", unlock);
  };
  window.addEventListener("pointerdown", unlock);
  window.addEventListener("keydown", unlock);
}
