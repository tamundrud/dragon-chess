import Phaser from 'phaser';
import { AttackContext, AttackDefinition, AttackLifecycleState, AttackPresenter } from '../animation/attackTypes';
import { AttackDirector } from '../animation/AttackDirector';
import { CharacterRegistry } from '../characters/CharacterRegistry';
import { AudioController } from '../audio/AudioController';
import { FireDragonPresenter } from '../animation/FireDragonPresenter';

export class AttackScene extends Phaser.Scene implements AttackPresenter {
  private overlayGraphics!: Phaser.GameObjects.Graphics;
  private stageContainer!: Phaser.GameObjects.Container;
  private statusText!: Phaser.GameObjects.Text;
  private attackerText!: Phaser.GameObjects.Text;
  private defenderText!: Phaser.GameObjects.Text;
  private skipButtonText!: Phaser.GameObjects.Text;
  private attackerContainer!: Phaser.GameObjects.Container;
  private defenderContainer!: Phaser.GameObjects.Container;
  private impactEffectContainer!: Phaser.GameObjects.Container;
  private fireDragonPresenter!: FireDragonPresenter;
  private onCompleteCallback: (() => void) | null = null;
  private cleanedUp = false;

  constructor() {
    super({ key: 'AttackScene' });
  }

  create(): void {
    this.cleanedUp = false;
    this.overlayGraphics = this.add.graphics();
    this.stageContainer = this.add.container(0, 0);
    this.stageContainer.setVisible(false);

    this.attackerContainer = this.add.container(0, 0);
    this.defenderContainer = this.add.container(0, 0);
    this.impactEffectContainer = this.add.container(0, 0);

    this.setupStageUI();
    this.scale.on('resize', this.handleResize, this);

    // Register this scene as the presenter for AttackDirector
    AttackDirector.getInstance().registerPresenter(this);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.handleSceneCleanup, this);
    this.events.once(Phaser.Scenes.Events.DESTROY, this.handleSceneCleanup, this);

    // Allow keyboard skipping via ESCAPE or SPACE when attack is active
    this.input.keyboard?.on('keydown-ESCAPE', this.handleSkipKey, this);
    this.input.keyboard?.on('keydown-SPACE', this.handleSkipKey, this);

    // Allow click anywhere on overlay to skip
    this.input.on('pointerdown', this.handlePointerDown, this);
  }

  private handleSkipKey(): void {
      if (this.stageContainer.visible) {
        AttackDirector.getInstance().skip();
      }
  }

  private handlePointerDown(): void {
      if (this.stageContainer.visible) {
        AttackDirector.getInstance().skip();
      }
  }

  private setupStageUI(): void {
    const width = this.scale.width;
    const height = this.scale.height;

    this.statusText = this.add.text(width / 2, height * 0.22, '', {
      fontSize: '24px',
      fontFamily: 'sans-serif',
      fontStyle: 'bold',
      color: '#e0e0e0',
      align: 'center',
    }).setOrigin(0.5);

    this.attackerText = this.add.text(width * 0.25, height * 0.72, '', {
      fontSize: '18px',
      fontFamily: 'sans-serif',
      fontStyle: 'bold',
      color: '#d4af37',
      align: 'center',
    }).setOrigin(0.5);

    this.defenderText = this.add.text(width * 0.75, height * 0.72, '', {
      fontSize: '18px',
      fontFamily: 'sans-serif',
      fontStyle: 'bold',
      color: '#ef4444',
      align: 'center',
    }).setOrigin(0.5);

    // Interactive Skip Button
    const skipBg = this.add.graphics();
    skipBg.fillStyle(0x151515, 0.95);
    skipBg.fillRoundedRect(-60, -20, 120, 40, 8);
    skipBg.lineStyle(2, 0x444444, 1);
    skipBg.strokeRoundedRect(-60, -20, 120, 40, 8);

    this.skipButtonText = this.add.text(0, 0, 'SKIP >>', {
      fontSize: '14px',
      fontFamily: 'sans-serif',
      fontStyle: 'bold',
      color: '#888888',
    }).setOrigin(0.5);

    const skipContainer = this.add.container(width / 2, height * 0.85, [skipBg, this.skipButtonText]);
    skipContainer.setSize(120, 40);
    skipContainer.setInteractive(new Phaser.Geom.Rectangle(-60, -20, 120, 40), Phaser.Geom.Rectangle.Contains);
    
    skipContainer.on('pointerdown', (pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData) => {
      event.stopPropagation();
      AttackDirector.getInstance().skip();
    });

    this.stageContainer.add([
      this.attackerContainer,
      this.defenderContainer,
      this.impactEffectContainer,
      this.statusText,
      this.attackerText,
      this.defenderText,
      skipContainer,
    ]);

    this.fireDragonPresenter = new FireDragonPresenter(
      this,
      this.stageContainer,
      this.statusText,
      this.attackerText,
      this.defenderText
    );
  }

  public playAttack(
    context: AttackContext,
    definition: AttackDefinition,
    settings: { durationScale: number; reducedMotion: boolean },
    onPhaseChange: (phase: AttackLifecycleState) => void,
    onComplete: () => void
  ): void {
    this.cleanUpAttackPresentation();
    this.onCompleteCallback = onComplete;
    this.stageContainer.setVisible(true);
    this.drawOverlay();

    if (definition.id === 'fire_stream_attack' || context.attackerCharacterId === 'fire_dragon') {
      this.attackerContainer.setVisible(false);
      this.defenderContainer.setVisible(false);
      this.impactEffectContainer.setVisible(false);
      this.fireDragonPresenter.playAttack(context, definition, settings, onPhaseChange, () => {
        this.cleanUpAttackPresentation();
        if (this.onCompleteCallback) {
          const cb = this.onCompleteCallback;
          this.onCompleteCallback = null;
          cb();
        }
      });
      return;
    }

    this.attackerContainer.setVisible(true);
    this.defenderContainer.setVisible(true);
    this.impactEffectContainer.setVisible(true);

    const charReg = CharacterRegistry.getInstance();
    const attacker = charReg.getById(context.attackerCharacterId);
    const defender = charReg.getById(context.defenderCharacterId);

    const attackerName = attacker ? attacker.displayName : 'Attacker';
    const defenderName = defender ? defender.displayName : 'Defender';

    const width = this.scale.width;
    const height = this.scale.height;

    this.attackerText.setText(`Attacker: ${attackerName}\n[ TEMPORARY ATTACKER ART ]`);
    this.defenderText.setText(`Defender: ${defenderName}\n[ TEMPORARY DEFENDER ART ]`);

    // Create Temporary Attacker Graphic
    this.attackerContainer.setPosition(width * 0.25, height * 0.48);
    this.attackerContainer.setScale(1);
    this.attackerContainer.setAlpha(1);
    this.attackerContainer.setAngle(0);
    this.attackerContainer.removeAll(true);

    const attBg = this.add.graphics();
    attBg.fillStyle(attacker?.faction === 'light' ? 0xd4af37 : 0x4a5568, 0.95);
    attBg.fillRoundedRect(-55, -55, 110, 110, 16);
    attBg.lineStyle(3, 0xffffff, 0.8);
    attBg.strokeRoundedRect(-55, -55, 110, 110, 16);
    const attText = this.add.text(0, 0, `[ ${attacker?.pieceType?.toUpperCase() || 'P'} ]`, {
      fontSize: '28px',
      fontFamily: 'sans-serif',
      fontStyle: 'bold',
      color: '#ffffff',
      align: 'center',
    }).setOrigin(0.5);
    this.attackerContainer.add([attBg, attText]);

    // Create Temporary Defender Graphic
    this.defenderContainer.setPosition(width * 0.75, height * 0.48);
    this.defenderContainer.setScale(1);
    this.defenderContainer.setAlpha(1);
    this.defenderContainer.setAngle(0);
    this.defenderContainer.removeAll(true);

    const defBg = this.add.graphics();
    defBg.fillStyle(0xef4444, 0.95);
    defBg.fillRoundedRect(-55, -55, 110, 110, 16);
    defBg.lineStyle(3, 0xffffff, 0.8);
    defBg.strokeRoundedRect(-55, -55, 110, 110, 16);
    const defText = this.add.text(0, 0, `[ ${defender?.pieceType?.toUpperCase() || 'P'} ]`, {
      fontSize: '28px',
      fontFamily: 'sans-serif',
      fontStyle: 'bold',
      color: '#ffffff',
      align: 'center',
    }).setOrigin(0.5);
    this.defenderContainer.add([defBg, defText]);

    // Play initial audio
    if (definition.soundCueIds && definition.soundCueIds[0]) {
      AudioController.getInstance().playSound(definition.soundCueIds[0]);
    }

    const prepMs = Math.max(100, Math.floor(definition.anticipationDuration * settings.durationScale));
    const strikeMs = Math.max(100, Math.floor(definition.strikeDuration * settings.durationScale));
    const impactMs = Math.max(150, Math.floor(definition.impactTime * settings.durationScale * 0.5));
    const recoveryMs = Math.max(150, Math.floor(definition.recoveryDuration * (settings.reducedMotion ? 0.5 : settings.durationScale)));

    // Phase 1: Preparing
    onPhaseChange('preparing');
    this.statusText.setText(`⚡ PREPARING: ${definition.displayName.toUpperCase()} (ANTICIPATION)`);
    if (!settings.reducedMotion) {
      this.tweens.add({
        targets: this.attackerContainer,
        x: width * 0.22,
        scaleX: 1.15,
        scaleY: 1.15,
        duration: prepMs,
        ease: 'Quad.easeOut',
      });
      this.tweens.add({
        targets: this.defenderContainer,
        scaleX: 0.95,
        scaleY: 0.95,
        duration: prepMs,
        yoyo: true,
      });
    }

    // Schedule Phase 2: Attacking
    this.time.delayedCall(prepMs, () => {
      onPhaseChange('attacking');
      this.statusText.setText(`🔥 LAUNCHING STRIKE (MOVEMENT)!`);
      if (definition.soundCueIds && definition.soundCueIds[1]) {
        AudioController.getInstance().playSound(definition.soundCueIds[1]);
      }
      if (!settings.reducedMotion) {
        this.tweens.add({
          targets: this.attackerContainer,
          x: width * 0.62,
          duration: strikeMs,
          ease: 'Power2.easeIn',
        });
      }
    });

    // Schedule Phase 3: Impact
    this.time.delayedCall(prepMs + strikeMs, () => {
      onPhaseChange('impact');
      this.statusText.setText(`💥 DIRECT IMPACT!`);
      if (definition.soundCueIds && definition.soundCueIds[2]) {
        AudioController.getInstance().playSound(definition.soundCueIds[2]);
      }
      if (definition.screenShake && !settings.reducedMotion) {
        this.cameras.main.shake(250, 0.02);
      }
      this.spawnImpactEffect(width * 0.68, height * 0.48);

      if (!settings.reducedMotion) {
        this.tweens.add({
          targets: this.defenderContainer,
          x: width * 0.88,
          angle: 180,
          scaleX: 0.2,
          scaleY: 0.2,
          alpha: 0,
          duration: impactMs,
          ease: 'Power2.easeOut',
        });
      } else {
        this.tweens.add({
          targets: this.defenderContainer,
          alpha: 0,
          duration: impactMs,
        });
      }
    });

    // Schedule Phase 4: Recovering
    this.time.delayedCall(prepMs + strikeMs + impactMs, () => {
      onPhaseChange('recovering');
      this.statusText.setText(`✨ RECOVERING...`);
      if (!settings.reducedMotion) {
        this.tweens.add({
          targets: this.attackerContainer,
          x: width * 0.35,
          scaleX: 1,
          scaleY: 1,
          duration: recoveryMs,
          ease: 'Back.easeOut',
        });
      }
    });

    // Schedule Phase 5: Completing
    this.time.delayedCall(prepMs + strikeMs + impactMs + recoveryMs, () => {
      this.cleanUpAttackPresentation();
      if (this.onCompleteCallback) {
        const cb = this.onCompleteCallback;
        this.onCompleteCallback = null;
        cb();
      }
    });
  }

  public skip(): void {
    if (this.fireDragonPresenter) {
      this.fireDragonPresenter.cleanup();
    }
    this.time.removeAllEvents();
    this.tweens.killAll();
    this.cleanUpAttackPresentation();
    if (this.onCompleteCallback) {
      const cb = this.onCompleteCallback;
      this.onCompleteCallback = null;
      cb();
    }
  }

  public cleanup(): void {
    // Presenter cleanup is cancellation-only: it must never invoke completion.
    this.onCompleteCallback = null;
    if (this.fireDragonPresenter) {
      this.fireDragonPresenter.cleanup();
    }
    this.time.removeAllEvents();
    this.tweens.killAll();
    this.cleanUpAttackPresentation();
  }

  private cleanUpAttackPresentation(): void {
    if (this.fireDragonPresenter) {
      this.fireDragonPresenter.cleanup();
    }
    this.stageContainer.setVisible(false);
    this.overlayGraphics.clear();
    if (this.attackerContainer) this.attackerContainer.removeAll(true);
    if (this.defenderContainer) this.defenderContainer.removeAll(true);
    if (this.impactEffectContainer) this.impactEffectContainer.removeAll(true);
    this.cameras.main.resetFX();
    this.cameras.main.setZoom(1);
    this.cameras.main.setAngle(0);
  }

  private handleSceneCleanup(): void {
    if (this.cleanedUp) return;
    this.cleanedUp = true;
    AttackDirector.getInstance().unregisterPresenter(this);
    this.scale.off('resize', this.handleResize, this);
    this.input.keyboard?.off('keydown-ESCAPE', this.handleSkipKey, this);
    this.input.keyboard?.off('keydown-SPACE', this.handleSkipKey, this);
    this.input.off('pointerdown', this.handlePointerDown, this);
    this.cleanup();
  }

  private spawnImpactEffect(x: number, y: number): void {
    this.impactEffectContainer.setPosition(x, y);
    this.impactEffectContainer.removeAll(true);
    this.impactEffectContainer.setAlpha(1);
    this.impactEffectContainer.setScale(1);

    const burst = this.add.graphics();
    burst.fillStyle(0xffaa00, 0.9);
    burst.fillCircle(0, 0, 40);
    burst.lineStyle(4, 0xffffff, 1);
    burst.strokeCircle(0, 0, 60);

    const label = this.add.text(0, 0, '💥 IMPACT !', {
      fontSize: '14px',
      fontFamily: 'sans-serif',
      fontStyle: 'bold',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.impactEffectContainer.add([burst, label]);

    this.tweens.add({
      targets: this.impactEffectContainer,
      scaleX: 2.5,
      scaleY: 2.5,
      alpha: 0,
      duration: 350,
      ease: 'Quad.easeOut',
    });
  }

  private drawOverlay(): void {
    this.overlayGraphics.clear();
    this.overlayGraphics.fillStyle(0x080808, 0.9);
    this.overlayGraphics.fillRect(0, 0, this.scale.width, this.scale.height);
  }

  private handleResize(gameSize: Phaser.Structs.Size): void {
    this.cameras.main.setViewport(0, 0, gameSize.width, gameSize.height);
    this.stageContainer.setPosition(0, 0);
    this.statusText.setPosition(gameSize.width / 2, gameSize.height * 0.22);
    this.attackerText.setPosition(gameSize.width * 0.25, gameSize.height * 0.72);
    this.defenderText.setPosition(gameSize.width * 0.75, gameSize.height * 0.72);
    if (this.stageContainer.visible) {
      this.drawOverlay();
    }
  }

  destroy(): void {
    this.handleSceneCleanup();
  }
}
