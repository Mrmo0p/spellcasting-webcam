export class SpellAudio {
  context: AudioContext | null = null;
  enabled = true;
  private trail: { oscillator: OscillatorNode; gain: GainNode } | null = null;
  async unlock() {
    try {
      this.context ??= new AudioContext();
      await this.context.resume();
    } catch {}
  }
  play(success: boolean, index = 0) {
    if (!this.enabled || !this.context || this.context.state !== 'running')
      return;
    const c = this.context,
      o = c.createOscillator(),
      g = c.createGain();
    o.connect(g);
    g.connect(c.destination);
    o.type = success ? 'sine' : 'triangle';
    o.frequency.setValueAtTime(success ? 330 + index * 70 : 150, c.currentTime);
    o.frequency.exponentialRampToValueAtTime(
      success ? 660 + index * 70 : 70,
      c.currentTime + 0.18,
    );
    g.gain.setValueAtTime(0.06, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.3);
    o.start();
    o.stop(c.currentTime + 0.32);
  }
  trailHum(intensity: number) {
    if (!this.enabled || !this.context || this.context.state !== 'running')
      return;
    const c = this.context;
    if (!this.trail) {
      const oscillator = c.createOscillator(),
        gain = c.createGain(),
        panner =
          typeof c.createStereoPanner === 'function'
            ? c.createStereoPanner()
            : null;
      oscillator.type = 'sine';
      gain.gain.setValueAtTime(0.001, c.currentTime);
      if (panner) {
        panner.pan.value = -0.58;
        oscillator.connect(gain).connect(panner).connect(c.destination);
      } else oscillator.connect(gain).connect(c.destination);
      oscillator.start();
      this.trail = { oscillator, gain };
    }
    const amount = Math.max(0, Math.min(1, intensity));
    this.trail.oscillator.frequency.setTargetAtTime(
      470 + amount * 360,
      c.currentTime,
      0.05,
    );
    this.trail.gain.gain.setTargetAtTime(
      0.008 + amount * 0.018,
      c.currentTime,
      0.06,
    );
  }
  stopTrail(result?: boolean) {
    const trail = this.trail,
      c = this.context;
    if (!trail || !c) return;
    trail.gain.gain.setTargetAtTime(0.001, c.currentTime, 0.025);
    trail.oscillator.stop(c.currentTime + 0.12);
    this.trail = null;
    if (result !== undefined) this.play(result, result ? 7 : 0);
  }
}
