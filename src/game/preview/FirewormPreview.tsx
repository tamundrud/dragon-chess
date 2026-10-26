import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { FirewormPresenter } from '../animation/FirewormPresenter';
import { frameFireworm, preloadFireworm } from '../animation/firewormAssets';
import { fitAttackArtwork } from '../animation/attackLayout';
import type { AttackLifecycleState } from '../animation/attackTypes';
import { AttackRegistry } from '../animation/AttackRegistry';
import './firewormPreview.css';

export default function FirewormPreview() {
  const host = useRef<HTMLDivElement>(null);
  const replay = useRef<(() => void) | null>(null);
  const skip = useRef<(() => void) | null>(null);
  const options = useRef({ mode: 'normal', reduced: false });
  const [ready, setReady] = useState(false);
  const [phase, setPhase] = useState<AttackLifecycleState>('idle');
  const [mode, setMode] = useState('normal');
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    let disposed = false;
    class ProofScene extends Phaser.Scene {
      constructor() { super('FirewormProof'); }
      preload() { preloadFireworm(this); }
      create() {
        if (disposed) return;
        frameFireworm(this);
        const parent = this.add.container(0, 0);
        parent.add(this.add.image(400, 300, 'fireworm-cove').setDisplaySize(800, 600));
        const status = this.add.text(400, 60, 'Fireworm’s spark of mischief', {
          fontFamily: 'Georgia', fontSize: '26px', color: '#fff6d7', stroke: '#243847', strokeThickness: 5,
        }).setOrigin(0.5).setDepth(5);
        const attacker = this.add.text(170, 535, 'FIREWORM · ROOK', { fontSize: '18px', color: '#fff6d7', backgroundColor: '#253b46' }).setOrigin(0.5).setDepth(5);
        const defender = this.add.text(620, 535, 'MEATHEAD RAIDER', { fontSize: '18px', color: '#fff6d7', backgroundColor: '#253b46' }).setOrigin(0.5).setDepth(5);
        const labels = this.add.container(0, 0, [status, attacker, defender]).setDepth(5);
        const fit = () => {
          const layout = fitAttackArtwork(this.scale.width, this.scale.height);
          parent.setPosition(layout.x, layout.y).setScale(layout.scale);
          labels.setPosition(0, 0).setScale(1);
          const compact = this.scale.width < 600;
          status.setPosition(this.scale.width / 2, layout.y + 28 * layout.scale)
            .setFontSize(compact ? 14 : 24);
          attacker.setPosition(layout.x + 170 * layout.scale, layout.y + 548 * layout.scale)
            .setFontSize(compact ? 12 : 18);
          defender.setPosition(layout.x + 620 * layout.scale, layout.y + 548 * layout.scale)
            .setFontSize(compact ? 12 : 18);
        };
        fit();
        this.scale.on('resize', fit);
        const presenter = new FirewormPresenter(this, parent, status, attacker, defender);
        const done = () => { if (!disposed) setPhase('idle'); status.setText('Back to the board · ready to replay'); };
        replay.current = () => {
          presenter.cleanup();
          const opts = options.current;
          if (opts.mode === 'instant') { done(); return; }
          presenter.playAttack({ moveFrom: 'b3', moveTo: 'b4', attackerCharacterId: 'fireworm', defenderCharacterId: 'rival_generic', attackDefinitionId: 'fireworm_fireworks' },
            AttackRegistry.getInstance().getById('fireworm_fireworks')!,
            { durationScale: opts.mode === 'fast' ? 0.35 : 1, reducedMotion: opts.reduced },
            state => { if (!disposed) setPhase(state); }, done);
        };
        skip.current = () => presenter.skip();
        this.events.once('shutdown', () => { presenter.cleanup(); this.scale.off('resize', fit); });
        if (!disposed) { setReady(true); replay.current(); }
      }
    }
    const game = new Phaser.Game({ type: Phaser.AUTO, parent: host.current!, width: 800, height: 600,
      backgroundColor: '#183c4c', scale: { mode: Phaser.Scale.RESIZE }, scene: [ProofScene] });
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) game.scale.resize(width, height);
    });
    observer.observe(host.current!);
    return () => { disposed = true; observer.disconnect(); replay.current = null; skip.current = null; game.destroy(true); };
  }, []);

  return <main className="fireworm-proof" data-phase={phase} data-ready={ready}>
    <header><a href="/">← Chess</a><p>AN ORIGINAL STORYBOOK CAPTURE</p><h1>A spark of mischief.</h1>
      <p>Fireworm plants his claws. One breath. A very colourful surprise.</p></header>
    <div ref={host} className="fireworm-canvas" aria-label="Animated Fireworm capture proof" />
    <div className="fireworm-controls">
      <button disabled={!ready} onClick={() => replay.current?.()}>Replay capture</button>
      <button disabled={!ready || phase === 'idle'} onClick={() => skip.current?.()}>Skip</button>
      <label>Speed <select value={mode} onChange={e => { setMode(e.target.value); options.current.mode = e.target.value; }}>
        <option value="normal">Normal</option><option value="fast">Fast</option><option value="instant">Instant</option>
      </select></label>
      <label><input type="checkbox" checked={reduced} onChange={e => { setReduced(e.target.checked); options.current.reduced = e.target.checked; }} /> Reduced motion</label>
    </div>
    <p className="fireworm-note" aria-live="polite">{phase === 'idle' ? 'Ready to replay' : phase} · Changes apply on Replay.</p>
    <footer>Animation prototype · original generated artwork · visual acceptance pending.<br />
      The defender is a temporary raider illustration. Other captured piece portraits are not yet illustrated.</footer>
  </main>;
}
