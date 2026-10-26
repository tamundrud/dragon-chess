import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { BoardScene } from '../scenes/BoardScene';
import { FirewormPresenter } from '../animation/FirewormPresenter';
import { frameFireworm, preloadFireworm } from '../animation/firewormAssets';
import { fitAttackArtwork } from '../animation/attackLayout';
import type { AttackLifecycleState } from '../animation/attackTypes';
import type { AttackPresentation } from '../../settings/settingsTypes';
import { AttackRegistry } from '../animation/AttackRegistry';
import { resolveFirewormDefender } from '../animation/firewormDefender';
import { createFirewormProofFixture, type ProofDefender } from './firewormProofFixture';
import './firewormPreview.css';

export default function FirewormPreview() {
  const host = useRef<HTMLDivElement>(null);
  const replay = useRef<(() => void) | null>(null);
  const skip = useRef<(() => void) | null>(null);
  const options = useRef({mode:'normal',reduced:false,presentation:'board' as AttackPresentation,target:'rook' as ProofDefender});
  const [ready, setReady] = useState(false);
  const [phase, setPhase] = useState<AttackLifecycleState>('idle');
  const [mode, setMode] = useState('normal');
  const [reduced, setReduced] = useState(false);
  const [presentation, setPresentation] = useState<AttackPresentation>('board');
  const [target, setTarget] = useState<ProofDefender>('rook');
  const [caption, setCaption] = useState('Fireworm · rook → Flamehuffer · rook');

  useEffect(() => {
    let disposed = false;
    let fixture = createFirewormProofFixture('rook');
    class ProofBoard extends BoardScene {
      create() {
        if (disposed) return;
        super.create(); this.getInputController().setLocked(true);
        this.updateBoardState(fixture.controller.getBoard(), [], fixture.controller.getLastMove(), fixture.controller.getStatus());
        this.scene.launch('FirewormProof');
      }
    }
    class ProofScene extends Phaser.Scene {
      constructor() { super('FirewormProof'); }
      preload() { preloadFireworm(this); }
      create() {
        if (disposed) return;
        frameFireworm(this);
        const board = this.scene.get('BoardScene') as BoardScene;
        const dimmer = this.add.graphics();
        const parent = this.add.container(0,0);
        const status = this.add.text(400,28,'', {fontFamily:'Georgia',fontSize:'26px',color:'#fff6d7',stroke:'#13212e',strokeThickness:5}).setOrigin(0.5);
        const attacker = this.add.text(170,548,'FIREWORM · ROOK',{fontSize:'18px',color:'#fff6d7',backgroundColor:'#253b46'}).setOrigin(0.5);
        const defender = this.add.text(620,548,'',{fontSize:'18px',color:'#fff6d7',backgroundColor:'#253b46'}).setOrigin(0.5);
        this.add.container(0,0,[status,attacker,defender]);
        let activePresentation: AttackPresentation = 'board';
        let active = false;
        const fit = () => {
          const layout = fitAttackArtwork(this.scale.width,this.scale.height);
          parent.setPosition(layout.x,layout.y).setScale(layout.scale);
          const compact = this.scale.width < 600;
          status.setPosition(this.scale.width/2,layout.y+28*layout.scale).setFontSize(compact?14:24);
          for(const [label,x] of [[attacker,170],[defender,620]] as const) {
            label.setPosition(layout.x+x*layout.scale,layout.y+548*layout.scale).setFontSize(compact?12:18);
          }
          dimmer.clear();
          if(active) dimmer.fillStyle(0x080808,activePresentation === 'board'?0.28:0.9).fillRect(0,0,this.scale.width,this.scale.height);
        };
        fit(); this.scale.on('resize',fit);
        const presenter = new FirewormPresenter(this,parent,status,attacker,defender);
        const showBoard = () => board.updateBoardState(fixture.controller.getBoard(),[],fixture.controller.getLastMove(),fixture.controller.getStatus());
        const point = (square: string) => {
          const p = board.getSquareCenter(square); const layout = fitAttackArtwork(this.scale.width,this.scale.height);
          return {x:(p.x-layout.x)/layout.scale,y:(p.y-layout.y)/layout.scale};
        };
        replay.current = () => {
          presenter.cleanup();
          fixture = createFirewormProofFixture(options.current.target);
          const current = fixture; const opts = {...options.current};
          showBoard(); active = true; activePresentation = opts.presentation; fit();
          const appearance = resolveFirewormDefender(current.context);
          setCaption(`Fireworm · rook → ${appearance.label.toLowerCase()} · ${opts.presentation === 'board'?'foreground over board':'painted arena'}`);
          const done = () => {
            if(disposed || fixture !== current) return;
            current.controller.commitMove(current.request); showBoard(); active = false; fit();
            setPhase('idle'); status.setText('Back to the board · ready to replay');
          };
          if(opts.mode === 'instant') {done();return;}
          presenter.playAttack(current.context,AttackRegistry.getInstance().getById('fireworm_fireworks')!,
            {durationScale:opts.mode === 'fast'?0.35:1,reducedMotion:opts.reduced,presentation:opts.presentation,
              origins:()=>({attacker:point(current.request.from),defender:point(current.request.to),destination:point(current.request.to)})},
            state=>{if(!disposed)setPhase(state);},done);
        };
        skip.current = () => presenter.skip();
        this.events.once('shutdown',()=>{presenter.cleanup();this.scale.off('resize',fit);});
        if(!disposed){setReady(true);replay.current();}
      }
    }
    const game = new Phaser.Game({type:Phaser.AUTO,parent:host.current!,width:800,height:600,
      backgroundColor:'#080808',scale:{mode:Phaser.Scale.RESIZE},scene:[ProofBoard,ProofScene]});
    const observer = new ResizeObserver(([entry])=>{
      const {width,height}=entry.contentRect;if(width>0&&height>0)game.scale.resize(width,height);
    });
    observer.observe(host.current!);
    return ()=>{disposed=true;observer.disconnect();replay.current=null;skip.current=null;game.destroy(true);};
  },[]);

  return <main className="fireworm-proof" data-phase={phase} data-ready={ready}>
    <header><a href="/">← Chess</a><p>AN ORIGINAL STORYBOOK CAPTURE</p><h1>A spark of mischief.</h1>
      <p>Fireworm takes the foreground. One breath. A spectacular surprise.</p></header>
    <div ref={host} className="fireworm-canvas" aria-label="Animated Fireworm capture proof" />
    <div className="fireworm-controls">
      <button disabled={!ready} onClick={()=>replay.current?.()}>Replay capture</button>
      <button disabled={!ready||phase==='idle'} onClick={()=>skip.current?.()}>Skip</button>
      <label>Presentation <select value={presentation} onChange={e=>{const value=e.target.value as AttackPresentation;setPresentation(value);options.current.presentation=value;}}>
        <option value="board">Foreground over board</option><option value="arena">Painted arena</option>
      </select></label>
      <label>Defender <select value={target} onChange={e=>{const value=e.target.value as ProofDefender;setTarget(value);options.current.target=value;}}>
        <option value="rook">Flamehuffer · rook</option><option value="pawn">Meathead raider · pawn</option>
      </select></label>
      <label>Speed <select value={mode} onChange={e=>{setMode(e.target.value);options.current.mode=e.target.value;}}>
        <option value="normal">Normal</option><option value="fast">Fast</option><option value="instant">Instant</option>
      </select></label>
      <label><input type="checkbox" checked={reduced} onChange={e=>{setReduced(e.target.checked);options.current.reduced=e.target.checked;}}/> Reduced motion</label>
    </div>
    <p className="fireworm-note" aria-live="polite">{caption}<br/>{phase==='idle'?'Ready to replay':phase} · Changes apply on Replay.</p>
    <footer>Visual prototype · original artwork · owner approval pending.<br/>Other character portraits remain temporary.</footer>
  </main>;
}
