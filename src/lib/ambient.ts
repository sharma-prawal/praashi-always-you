// An original quiet A-major pad. No recording, external media, or autoplay.
export class Ambient {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private oscillators: OscillatorNode[] = [];
  private revision = 0;

  async start() {
    const revision = ++this.revision;
    if (!this.context || this.context.state === 'closed') {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) throw new Error('Ambient sound is not supported in this browser.');
      this.context = new Ctor();
      this.master = this.context.createGain();
      this.master.gain.value = 0;
      this.master.connect(this.context.destination);
      [110, 164.81, 220, 277.18, 329.63].forEach((frequency, i) => {
        const osc = this.context!.createOscillator();
        const volume = this.context!.createGain();
        osc.type = 'sine'; osc.frequency.value = frequency; osc.detune.value = i % 2 ? 3 : -3;
        volume.gain.value = 0.055 / (1 + i * 0.3);
        osc.connect(volume); volume.connect(this.master!); osc.start(); this.oscillators.push(osc);
      });
    }
    const context = this.context;
    await context.resume();
    if (revision !== this.revision) return;
    if (context.state !== 'running') throw new Error('Audio is interrupted. Tap to try again.');
    this.master!.gain.cancelScheduledValues(context.currentTime);
    this.master!.gain.setTargetAtTime(0.5, context.currentTime, 0.4);
  }

  async pause(fade = true) {
    const revision = ++this.revision;
    const context = this.context;
    if (!context || context.state !== 'running') return;
    if (fade && this.master) {
      this.master.gain.cancelScheduledValues(context.currentTime);
      this.master.gain.setTargetAtTime(0, context.currentTime, 0.015);
      await new Promise(resolve => setTimeout(resolve, 80));
    }
    if (revision === this.revision && context.state === 'running') await context.suspend();
  }

  async dispose() {
    this.revision++;
    const context = this.context;
    this.context = null; this.master = null;
    this.oscillators.forEach(o => o.stop()); this.oscillators = [];
    if (context && context.state !== 'closed') await context.close();
  }
}
