let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

function beep(
  freq: number,
  duration: number,
  type: OscillatorType = 'sine',
  vol = 0.3
) {
  const ac = getCtx();
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ac.currentTime);
  gain.gain.setValueAtTime(vol, ac.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
  osc.start(ac.currentTime);
  osc.stop(ac.currentTime + duration);
}

export function playJoin() {
  beep(523, 0.1);
  setTimeout(() => beep(659, 0.1), 100);
  setTimeout(() => beep(784, 0.15), 200);
}

export function playCorrect() {
  beep(784, 0.1);
  setTimeout(() => beep(1046, 0.2), 100);
}

export function playWrong() {
  beep(300, 0.1, 'sawtooth');
  setTimeout(() => beep(200, 0.2, 'sawtooth'), 120);
}

export function playBingo() {
  const notes = [523, 659, 784, 1046, 1318];
  notes.forEach((n, i) => setTimeout(() => beep(n, 0.2, 'sine', 0.4), i * 120));
}

export function playReveal() {
  beep(440, 0.05);
  setTimeout(() => beep(550, 0.05), 60);
  setTimeout(() => beep(660, 0.15), 120);
}
