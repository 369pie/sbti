/**
 * WTFTI · Audio Probes
 *
 * 用 Web Audio API 程序化合成 4 段 ~6s 短探针 — 无需音频素材文件。
 * 每段对应 SoulProbeQuiz music 题的一个选项：
 *   A 古典室内乐 → 木质大提琴 G/D 双音 + 衰减
 *   B 清晨民谣  → 木吉他和弦琶音 (Cmaj9)
 *   C 深夜电子  → 低 BPM 合成器 + filter sweep
 *   D 环境氛围  → 长 pad + 海浪噪声
 */

export type AudioProbeKey = 'A' | 'B' | 'C' | 'D';

interface PlayingHandle {
  stop: () => void;
}

let activeHandle: PlayingHandle | null = null;
let ctxSingleton: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctxSingleton) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctxSingleton = new AC();
  }
  if (ctxSingleton.state === 'suspended') {
    ctxSingleton.resume().catch(() => {});
  }
  return ctxSingleton;
}

export function stopAudioProbe() {
  if (activeHandle) {
    activeHandle.stop();
    activeHandle = null;
  }
}

/** Returns total duration in seconds (caller may show a progress ring). */
export function playAudioProbe(key: AudioProbeKey): number {
  stopAudioProbe();
  const ctx = getCtx();
  if (!ctx) return 0;
  const t0 = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.setValueAtTime(0.0001, t0);
  master.gain.exponentialRampToValueAtTime(0.6, t0 + 0.08);
  master.connect(ctx.destination);

  const stoppers: Array<() => void> = [];
  let duration = 6;

  const note = (
    freq: number,
    type: OscillatorType,
    start: number,
    dur: number,
    gain: number,
    detune = 0,
  ) => {
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;
    osc.detune.value = detune;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0 + start);
    g.gain.exponentialRampToValueAtTime(gain, t0 + start + 0.04);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + start + dur);
    osc.connect(g);
    g.connect(master);
    osc.start(t0 + start);
    osc.stop(t0 + start + dur + 0.05);
    stoppers.push(() => {
      try { osc.stop(); } catch { /* ignore */ }
    });
  };

  if (key === 'A') {
    // Cello-ish: sawtooth + low-pass + slow vibrato
    duration = 6.5;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 1200;
    lp.Q.value = 0.7;
    const cello = ctx.createGain();
    cello.gain.value = 0.45;
    cello.connect(lp);
    lp.connect(master);
    const cellNote = (freq: number, start: number, dur: number) => {
      const o = ctx.createOscillator();
      o.type = 'sawtooth';
      o.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t0 + start);
      g.gain.exponentialRampToValueAtTime(0.5, t0 + start + 0.25);
      g.gain.setValueAtTime(0.5, t0 + start + dur - 0.6);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + start + dur);
      // vibrato
      const vib = ctx.createOscillator();
      vib.frequency.value = 5.5;
      const vibGain = ctx.createGain();
      vibGain.gain.value = 4;
      vib.connect(vibGain);
      vibGain.connect(o.frequency);
      o.connect(g);
      g.connect(cello);
      o.start(t0 + start);
      vib.start(t0 + start);
      o.stop(t0 + start + dur + 0.05);
      vib.stop(t0 + start + dur + 0.05);
      stoppers.push(() => { try { o.stop(); vib.stop(); } catch { /* ignore */ } });
    };
    cellNote(98, 0.0, 3.0);   // G2
    cellNote(146.83, 0.5, 2.5); // D3 above
    cellNote(196, 3.0, 3.2);   // G3
    cellNote(220, 3.5, 2.7);   // A3
  } else if (key === 'B') {
    // Folk guitar: plucked sine+triangle arpeggio Cmaj9
    duration = 6;
    const freqs = [261.63, 329.63, 392, 493.88, 587.33, 392, 329.63, 261.63];
    freqs.forEach((f, i) => {
      const start = i * 0.42;
      // pluck = quick sine + triangle harmonic
      note(f, 'triangle', start, 1.4, 0.35);
      note(f * 2, 'sine', start, 0.8, 0.15);
    });
    // sustain pad chord
    note(130.81, 'sine', 0, 5.5, 0.18); // C3 root
  } else if (key === 'C') {
    // Late-night electronic: low BPM bassline + filter sweep
    duration = 6;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(400, t0);
    lp.frequency.linearRampToValueAtTime(2400, t0 + 4);
    lp.frequency.linearRampToValueAtTime(800, t0 + 6);
    lp.Q.value = 6;
    const synth = ctx.createGain();
    synth.gain.value = 0.4;
    synth.connect(lp);
    lp.connect(master);
    const bassPattern = [82.41, 82.41, 110, 92.5, 82.41, 82.41, 73.42, 110];
    bassPattern.forEach((f, i) => {
      const start = i * 0.68;
      const o = ctx.createOscillator();
      o.type = 'sawtooth';
      o.frequency.value = f;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t0 + start);
      g.gain.exponentialRampToValueAtTime(0.4, t0 + start + 0.04);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + start + 0.6);
      o.connect(g);
      g.connect(synth);
      o.start(t0 + start);
      o.stop(t0 + start + 0.65);
      stoppers.push(() => { try { o.stop(); } catch { /* ignore */ } });
    });
    // soft kick on every beat
    for (let i = 0; i < 8; i++) {
      const start = i * 0.68;
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.setValueAtTime(120, t0 + start);
      o.frequency.exponentialRampToValueAtTime(40, t0 + start + 0.18);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.6, t0 + start);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + start + 0.22);
      o.connect(g);
      g.connect(master);
      o.start(t0 + start);
      o.stop(t0 + start + 0.25);
      stoppers.push(() => { try { o.stop(); } catch { /* ignore */ } });
    }
  } else {
    // D · Ambient pad + ocean noise
    duration = 7;
    // Long pad chord (Am9: A C E G B)
    const padFreqs = [110, 130.81, 164.81, 196, 246.94];
    padFreqs.forEach((f) => {
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.value = f;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.16, t0 + 1.2);
      g.gain.setValueAtTime(0.16, t0 + 5);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 7);
      o.connect(g);
      g.connect(master);
      o.start(t0);
      o.stop(t0 + 7.1);
      stoppers.push(() => { try { o.stop(); } catch { /* ignore */ } });
    });
    // Ocean-noise via bandpass-filtered white noise
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuf = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuf.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuf;
    noise.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 600;
    bp.Q.value = 0.6;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.0001, t0);
    ng.gain.exponentialRampToValueAtTime(0.12, t0 + 1);
    // breath swells
    for (let i = 0; i < 4; i++) {
      const s = 1 + i * 1.5;
      ng.gain.exponentialRampToValueAtTime(0.22, t0 + s);
      ng.gain.exponentialRampToValueAtTime(0.06, t0 + s + 0.9);
    }
    ng.gain.exponentialRampToValueAtTime(0.0001, t0 + 7);
    noise.connect(bp);
    bp.connect(ng);
    ng.connect(master);
    noise.start(t0);
    noise.stop(t0 + 7.1);
    stoppers.push(() => { try { noise.stop(); } catch { /* ignore */ } });
  }

  // Master fade-out tail
  master.gain.setValueAtTime(0.6, t0 + duration - 0.4);
  master.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

  const stop = () => {
    stoppers.forEach((s) => s());
    try { master.disconnect(); } catch { /* ignore */ }
    if (activeHandle?.stop === stop) activeHandle = null;
  };
  activeHandle = { stop };
  // auto-clear handle when finished
  window.setTimeout(() => {
    if (activeHandle?.stop === stop) activeHandle = null;
  }, (duration + 0.3) * 1000);

  return duration;
}

export const AUDIO_PROBE_LABELS: Record<AudioProbeKey, string> = {
  A: '古典室内乐',
  B: '清晨民谣',
  C: '深夜电子',
  D: '环境氛围',
};
