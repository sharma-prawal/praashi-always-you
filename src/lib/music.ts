// One shared soundtrack for the whole story. Nothing plays until an explicit tap.
const SOURCE = `${import.meta.env.BASE_URL}audio/always-you-soft-piano.mp3`;

export class Music {
  private audio: HTMLAudioElement | null = null;
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private revision = 0;
  private intendedPause = true;
  private readonly interrupted = () => { if (!this.intendedPause) this.onInterrupted(); };

  constructor(private readonly onInterrupted: () => void) {}

  /** Call directly from a tap: iOS only allows the play() and resume() made in that gesture. */
  async start(level: number) {
    const revision = ++this.revision;
    const audio = this.element();
    this.connect(audio);
    this.intendedPause = false;
    const started = [audio.play(), this.context?.resume()];
    try {
      await Promise.all(started);
    } catch (error) {
      this.intendedPause = true; audio.pause();
      throw error;
    }
    if (revision !== this.revision) return;
    if (this.context && this.context.state !== 'running') {
      this.intendedPause = true; audio.pause();
      throw new Error('Audio is interrupted. Tap to try again.');
    }
    this.ramp(level, 1.1);
  }

  setLevel(level: number) {
    if (this.audio && !this.audio.paused) this.ramp(level, 1.6);
  }

  async pause(fade = true) {
    const revision = ++this.revision;
    this.intendedPause = true;
    if (fade && this.audio && !this.audio.paused) {
      this.ramp(0, 0.12);
      await new Promise(resolve => setTimeout(resolve, 420));
      if (revision !== this.revision) return;
    }
    this.audio?.pause();
    if (this.context?.state === 'running') await this.context.suspend();
  }

  async dispose() {
    this.revision++;
    this.intendedPause = true;
    const { audio, context } = this;
    this.audio = null; this.context = null; this.master = null;
    if (audio) {
      audio.removeEventListener('pause', this.interrupted);
      audio.pause(); audio.removeAttribute('src'); audio.load();
    }
    if (context && context.state !== 'closed') await context.close();
  }

  private element() {
    if (this.audio) return this.audio;
    const audio = new Audio(SOURCE);
    audio.loop = true;
    audio.preload = 'auto';
    audio.setAttribute('playsinline', '');
    audio.addEventListener('pause', this.interrupted);
    this.audio = audio;
    return audio;
  }

  private connect(audio: HTMLAudioElement) {
    // audio.volume is read-only on iOS, so chapter levels go through Web Audio where available.
    if (this.context && this.context.state !== 'closed') return;
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    const session = (navigator as unknown as { audioSession?: { type: string } }).audioSession;
    if (session) session.type = 'playback';
    this.context = new Ctor();
    this.master = this.context.createGain();
    this.master.gain.value = 0;
    this.context.createMediaElementSource(audio).connect(this.master);
    this.master.connect(this.context.destination);
  }

  private ramp(level: number, seconds: number) {
    if (this.context && this.master) {
      const now = this.context.currentTime;
      this.master.gain.cancelScheduledValues(now);
      this.master.gain.setTargetAtTime(level, now, seconds);
    } else if (this.audio) {
      this.audio.volume = level;
    }
  }
}
