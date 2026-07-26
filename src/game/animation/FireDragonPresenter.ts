import Phaser from 'phaser';
import { AttackContext, AttackDefinition, AttackLifecycleState, AttackPresenter } from './attackTypes';
import { AudioController } from '../audio/AudioController';
import { CharacterRegistry } from '../characters/CharacterRegistry';

export class FireDragonPresenter implements AttackPresenter {
  private scene: Phaser.Scene;
  private stageContainer: Phaser.GameObjects.Container;
  private statusText: Phaser.GameObjects.Text;
  private attackerText: Phaser.GameObjects.Text;
  private defenderText: Phaser.GameObjects.Text;

  private activeTweens: Phaser.Tweens.Tween[] = [];
  private activeTimers: Phaser.Time.TimerEvent[] = [];
  private tempObjects: Phaser.GameObjects.GameObject[] = [];
  private onCompleteCallback: (() => void) | null = null;

  constructor(
    scene: Phaser.Scene,
    stageContainer: Phaser.GameObjects.Container,
    statusText: Phaser.GameObjects.Text,
    attackerText: Phaser.GameObjects.Text,
    defenderText: Phaser.GameObjects.Text
  ) {
    this.scene = scene;
    this.stageContainer = stageContainer;
    this.statusText = statusText;
    this.attackerText = attackerText;
    this.defenderText = defenderText;
  }

  public playAttack(
    context: AttackContext,
    definition: AttackDefinition,
    settings: { durationScale: number; reducedMotion: boolean },
    onPhaseChange: (phase: AttackLifecycleState) => void,
    onComplete: () => void
  ): void {
    this.cleanup();
    this.onCompleteCallback = onComplete;

    const charReg = CharacterRegistry.getInstance();
    const attacker = charReg.getById(context.attackerCharacterId);
    const defender = charReg.getById(context.defenderCharacterId);

    const attackerName = attacker ? attacker.displayName : 'Fire Dragon';
    const defenderName = defender ? defender.displayName : 'Defender';

    const width = this.scene.scale.width;
    const height = this.scene.scale.height;

    this.attackerText.setText(`Attacker: ${attackerName}\n[ FIRE DRAGON STORYBOOK ART ]`);
    this.defenderText.setText(`Defender: ${defenderName}\n[ DEFENDER SILHOUETTE REACT ]`);

    const dragonX = width * 0.25;
    const dragonY = height * 0.48;
    const defenderX = width * 0.75;
    const defenderY = height * 0.48;

    // Build layered storybook Fire Dragon
    const dragonContainer = this.scene.add.container(dragonX, dragonY);
    this.stageContainer.add(dragonContainer);
    this.tempObjects.push(dragonContainer);

    // Wings layer (back)
    const wings = this.scene.add.graphics();
    wings.fillStyle(0xb45309, 1);
    wings.fillTriangle(-20, -10, -70, -70, -10, -40);
    wings.fillStyle(0xf59e0b, 0.9);
    wings.fillTriangle(-20, -15, -60, -60, -15, -35);
    wings.lineStyle(3, 0x451a03, 1);
    wings.strokeTriangle(-20, -10, -70, -70, -10, -40);
    dragonContainer.add(wings);

    // Body layer
    const body = this.scene.add.graphics();
    body.fillStyle(0xd97706, 1);
    body.fillRoundedRect(-40, -30, 80, 70, 20);
    body.fillStyle(0xfef08a, 1); // Soft yellow belly
    body.fillRoundedRect(-25, -20, 60, 50, 16);
    body.lineStyle(3, 0x451a03, 1);
    body.strokeRoundedRect(-40, -30, 80, 70, 20);
    dragonContainer.add(body);

    // Glow layer inside chest/throat
    const glow = this.scene.add.graphics();
    glow.fillStyle(0xff8c00, 1);
    glow.fillCircle(5, -5, 22);
    glow.fillStyle(0xffff00, 0.8);
    glow.fillCircle(5, -5, 12);
    glow.setAlpha(0);
    dragonContainer.add(glow);

    // Head layer
    const head = this.scene.add.container(20, -35);
    dragonContainer.add(head);

    const headBase = this.scene.add.graphics();
    headBase.fillStyle(0xd97706, 1);
    headBase.fillRoundedRect(-25, -25, 55, 40, 12);
    headBase.lineStyle(3, 0x451a03, 1);
    headBase.strokeRoundedRect(-25, -25, 55, 40, 12);
    // Horns
    headBase.fillStyle(0x78350f, 1);
    headBase.fillTriangle(-15, -25, -25, -45, -5, -25);
    headBase.fillTriangle(0, -25, -10, -42, 10, -25);
    // Eye
    headBase.fillStyle(0xffffff, 1);
    headBase.fillCircle(10, -10, 7);
    headBase.fillStyle(0x1c1917, 1);
    headBase.fillCircle(12, -10, 3);
    headBase.fillStyle(0xffffff, 1);
    headBase.fillCircle(13, -12, 1.5);
    head.add(headBase);

    // Jaw layer (attached to head)
    const jaw = this.scene.add.graphics();
    jaw.fillStyle(0xb45309, 1);
    jaw.fillRoundedRect(-10, 8, 45, 16, 6);
    jaw.lineStyle(2, 0x451a03, 1);
    jaw.strokeRoundedRect(-10, 8, 45, 16, 6);
    // Sharp storybook teeth
    jaw.fillStyle(0xffffff, 1);
    jaw.fillTriangle(15, 8, 20, 3, 25, 8);
    jaw.fillTriangle(25, 8, 30, 3, 35, 8);
    head.add(jaw);

    // Build layered Defender
    const defenderContainer = this.scene.add.container(defenderX, defenderY);
    this.stageContainer.add(defenderContainer);
    this.tempObjects.push(defenderContainer);

    const defNormal = this.scene.add.graphics();
    defNormal.fillStyle(0xef4444, 1);
    defNormal.fillRoundedRect(-35, -45, 70, 90, 16);
    defNormal.fillStyle(0xe2e8f0, 1); // Shield or emblem
    defNormal.fillCircle(0, 0, 22);
    defNormal.lineStyle(3, 0xffffff, 0.9);
    defNormal.strokeRoundedRect(-35, -45, 70, 90, 16);
    const defLabel = this.scene.add.text(0, 0, defender?.pieceType?.toUpperCase() || 'P', {
      fontSize: '24px',
      fontFamily: 'sans-serif',
      fontStyle: 'bold',
      color: '#1e293b',
    }).setOrigin(0.5);
    const defNormalGroup = this.scene.add.container(0, 0, [defNormal, defLabel]);
    defenderContainer.add(defNormalGroup);

    // Defender Silhouette (for impact beat 8)
    const defSilhouette = this.scene.add.graphics();
    defSilhouette.fillStyle(0x0f172a, 1);
    defSilhouette.fillRoundedRect(-35, -45, 70, 90, 16);
    defSilhouette.lineStyle(3, 0xf97316, 1); // Orange backlit outline
    defSilhouette.strokeRoundedRect(-35, -45, 70, 90, 16);
    defSilhouette.setVisible(false);
    defenderContainer.add(defSilhouette);

    // Calculate timings
    const scale = settings.durationScale;
    const prepMs = Math.max(100, Math.floor(definition.anticipationDuration * scale));
    const strikeMs = Math.max(100, Math.floor(definition.strikeDuration * scale));
    const impactMs = Math.max(150, Math.floor(400 * scale));
    const recoveryMs = Math.max(150, Math.floor((definition.recoveryDuration - 400) * (settings.reducedMotion ? 0.5 : scale)));

    // --- PHASE 1: PREPARING (0ms to prepMs) ---
    onPhaseChange('preparing');
    this.statusText.setText(`⚡ PREPARING: ${definition.displayName.toUpperCase()} (INHALE)`);
    AudioController.getInstance().playSound('dragon_inhale');

    if (!settings.reducedMotion) {
      // Beat 1: Brace / crouch
      const t1 = this.scene.tweens.add({
        targets: dragonContainer,
        y: dragonY + 12,
        scaleX: 1.05,
        scaleY: 0.94,
        duration: Math.floor(prepMs * 0.3),
        ease: 'Quad.easeOut',
        onComplete: () => {
          // Beat 2 & 3: Inhale & gradually increasing glow
          const t2 = this.scene.tweens.add({
            targets: dragonContainer,
            y: dragonY - 8,
            scaleX: 1.12,
            scaleY: 1.12,
            duration: Math.floor(prepMs * 0.7),
            ease: 'Sine.easeInOut',
          });
          const t3 = this.scene.tweens.add({
            targets: head,
            angle: -16,
            x: 15,
            y: -40,
            duration: Math.floor(prepMs * 0.7),
            ease: 'Sine.easeInOut',
          });
          const t4 = this.scene.tweens.add({
            targets: jaw,
            angle: 26,
            duration: Math.floor(prepMs * 0.7),
            ease: 'Sine.easeInOut',
          });
          const t5 = this.scene.tweens.add({
            targets: glow,
            alpha: 0.95,
            scaleX: 1.3,
            scaleY: 1.3,
            duration: Math.floor(prepMs * 0.7),
            ease: 'Sine.easeIn',
          });
          this.activeTweens.push(t2, t3, t4, t5);
        },
      });
      this.activeTweens.push(t1);

      // Beat 4: Smoke and embers before ignition
      const emberTimer = this.scene.time.delayedCall(Math.floor(prepMs * 0.45), () => {
        for (let i = 0; i < 6; i++) {
          const ember = this.scene.add.graphics();
          const isSmoke = i % 2 === 0;
          if (isSmoke) {
            ember.fillStyle(0x4b5563, 0.7);
            ember.fillCircle(0, 0, Phaser.Math.Between(6, 12));
          } else {
            ember.fillStyle(0xf97316, 0.9);
            ember.fillRoundedRect(-4, -4, 8, 8, 2);
          }
          ember.setPosition(dragonX + 45, dragonY - 35);
          this.stageContainer.add(ember);
          this.tempObjects.push(ember);

          const tEmber = this.scene.tweens.add({
            targets: ember,
            x: dragonX + 45 + Phaser.Math.Between(20, 60),
            y: dragonY - 35 - Phaser.Math.Between(30, 70),
            alpha: 0,
            scaleX: isSmoke ? 1.8 : 0.5,
            scaleY: isSmoke ? 1.8 : 0.5,
            duration: Math.floor(prepMs * 0.5),
            ease: 'Quad.easeOut',
          });
          this.activeTweens.push(tEmber);
        }
      });
      this.activeTimers.push(emberTimer);
    }

    // --- PHASE 2: ATTACKING / FLAME TRAVEL (prepMs to prepMs + strikeMs) ---
    const attackTimer = this.scene.time.delayedCall(prepMs, () => {
      onPhaseChange('attacking');
      this.statusText.setText(`🔥 IGNITION & DIRECTED FLAME STREAM!`);
      AudioController.getInstance().playSound('fire_ignite');
      AudioController.getInstance().playSound('fire_stream');

      if (!settings.reducedMotion) {
        // Beat 5: Head recoil as fire launches
        const tRecoil = this.scene.tweens.add({
          targets: head,
          angle: -28,
          x: 10,
          duration: Math.floor(strikeMs * 0.2),
          yoyo: true,
          ease: 'Quad.easeOut',
        });
        const tJawSnap = this.scene.tweens.add({
          targets: jaw,
          angle: 42,
          duration: Math.floor(strikeMs * 0.2),
          ease: 'Back.easeOut',
        });
        const tWings = this.scene.tweens.add({
          targets: wings,
          scaleX: 1.35,
          angle: 15,
          duration: Math.floor(strikeMs * 0.3),
        });
        this.activeTweens.push(tRecoil, tJawSnap, tWings);
      }

      // Beat 6 & 7: Directed flame travel (Bright core, softer outer flame, embers, trailing smoke)
      const flameContainer = this.scene.add.container(dragonX + 50, dragonY - 35);
      this.stageContainer.add(flameContainer);
      this.tempObjects.push(flameContainer);

      const targetDist = defenderX - (dragonX + 50);

      // Layer 1: Softer outer flame cone
      const outerFlame = this.scene.add.graphics();
      outerFlame.fillStyle(0xf97316, 0.85);
      outerFlame.fillTriangle(0, -22, targetDist, -40, targetDist, 40);
      outerFlame.fillTriangle(0, 22, targetDist, -40, targetDist, 40);
      flameContainer.add(outerFlame);

      // Layer 2: Bright core
      const innerFlame = this.scene.add.graphics();
      innerFlame.fillStyle(0xfef08a, 1);
      innerFlame.fillTriangle(0, -10, targetDist, -18, targetDist, 18);
      innerFlame.fillStyle(0xffffff, 0.9);
      innerFlame.fillTriangle(0, -5, targetDist, -8, targetDist, 8);
      flameContainer.add(innerFlame);

      flameContainer.setScale(0, 1);

      const tFlame = this.scene.tweens.add({
        targets: flameContainer,
        scaleX: 1,
        duration: strikeMs,
        ease: 'Power2.easeIn',
      });
      this.activeTweens.push(tFlame);

      // Rumble audio hook during travel
      const rumbleTimer = this.scene.time.delayedCall(Math.floor(strikeMs * 0.4), () => {
        AudioController.getInstance().playSound('dragon_rumble');
      });
      this.activeTimers.push(rumbleTimer);

      // Spawn travelling ember and smoke particles
      if (!settings.reducedMotion) {
        const intervalMs = Math.max(50, Math.floor(strikeMs / 8));
        for (let step = 1; step <= 7; step++) {
          const stepTimer = this.scene.time.delayedCall(step * intervalMs, () => {
            const progress = step / 8;
            const currentX = dragonX + 50 + targetDist * progress;
            for (let p = 0; p < 3; p++) {
              const part = this.scene.add.graphics();
              const isSmoke = p === 0;
              if (isSmoke) {
                part.fillStyle(0x374151, 0.6);
                part.fillCircle(0, 0, Phaser.Math.Between(10, 18));
              } else {
                part.fillStyle(0xfacc15, 0.9);
                part.fillCircle(0, 0, Phaser.Math.Between(3, 6));
              }
              part.setPosition(currentX, dragonY - 35 + Phaser.Math.Between(-20, 20));
              this.stageContainer.add(part);
              this.tempObjects.push(part);

              const tPart = this.scene.tweens.add({
                targets: part,
                y: part.y - Phaser.Math.Between(20, 50),
                alpha: 0,
                scaleX: isSmoke ? 1.6 : 0.4,
                scaleY: isSmoke ? 1.6 : 0.4,
                duration: Math.floor(strikeMs * 0.6),
              });
              this.activeTweens.push(tPart);
            }
          });
          this.activeTimers.push(stepTimer);
        }
      }
    });
    this.activeTimers.push(attackTimer);

    // --- PHASE 3: IMPACT (prepMs + strikeMs) ---
    const impactTimer = this.scene.time.delayedCall(prepMs + strikeMs, () => {
      onPhaseChange('impact');
      this.statusText.setText(`💥 IMPACT & DEFENDER SILHOUETTE!`);
      AudioController.getInstance().playSound('fire_impact');

      if (definition.screenShake && !settings.reducedMotion) {
        this.scene.cameras.main.shake(280, 0.025);
      }

      // Beat 8: Defender silhouette at impact against intense orange flash
      defNormalGroup.setVisible(false);
      defSilhouette.setVisible(true);

      const impactFlash = this.scene.add.graphics();
      impactFlash.fillStyle(0xff8c00, 0.95);
      impactFlash.fillCircle(defenderX, defenderY, 65);
      impactFlash.fillStyle(0xffff00, 0.8);
      impactFlash.fillCircle(defenderX, defenderY, 40);
      this.stageContainer.add(impactFlash);
      this.tempObjects.push(impactFlash);

      const tFlash = this.scene.tweens.add({
        targets: impactFlash,
        scaleX: 2.2,
        scaleY: 2.2,
        alpha: 0,
        duration: impactMs,
        ease: 'Quad.easeOut',
      });
      this.activeTweens.push(tFlash);

      // Beat 9: Child-friendly smoke, soot, or sparks reaction
      if (!settings.reducedMotion) {
        // Golden sparks burst
        for (let s = 0; s < 12; s++) {
          const spark = this.scene.add.graphics();
          spark.fillStyle(0xfde047, 1);
          spark.fillCircle(0, 0, Phaser.Math.Between(4, 8));
          spark.setPosition(defenderX, defenderY);
          this.stageContainer.add(spark);
          this.tempObjects.push(spark);

          const angleRad = Phaser.Math.DegToRad(s * 30 + Phaser.Math.Between(-15, 15));
          const dist = Phaser.Math.Between(50, 110);
          const tSpark = this.scene.tweens.add({
            targets: spark,
            x: defenderX + Math.cos(angleRad) * dist,
            y: defenderY + Math.sin(angleRad) * dist,
            alpha: 0,
            scaleX: 0.2,
            scaleY: 0.2,
            duration: Math.floor(impactMs * 1.2),
            ease: 'Quad.easeOut',
          });
          this.activeTweens.push(tSpark);
        }

        // Soot cloud
        for (let c = 0; c < 6; c++) {
          const cloud = this.scene.add.graphics();
          cloud.fillStyle(0x4b5563, 0.85);
          cloud.fillCircle(0, 0, Phaser.Math.Between(25, 45));
          cloud.setPosition(defenderX + Phaser.Math.Between(-20, 20), defenderY + Phaser.Math.Between(-20, 20));
          this.stageContainer.add(cloud);
          this.tempObjects.push(cloud);

          const tCloud = this.scene.tweens.add({
            targets: cloud,
            y: cloud.y - Phaser.Math.Between(30, 60),
            scaleX: 1.6,
            scaleY: 1.6,
            alpha: 0,
            duration: Math.floor(impactMs + recoveryMs * 0.8),
            ease: 'Sine.easeOut',
          });
          this.activeTweens.push(tCloud);
        }

        // Defender wobble and shrink comically into soot cloud
        const tDefReact = this.scene.tweens.add({
          targets: defenderContainer,
          angle: 35,
          scaleX: 0.15,
          scaleY: 0.15,
          alpha: 0,
          duration: impactMs,
          ease: 'Back.easeIn',
        });
        this.activeTweens.push(tDefReact);
      } else {
        const tDefReact = this.scene.tweens.add({
          targets: defenderContainer,
          alpha: 0,
          duration: impactMs,
        });
        this.activeTweens.push(tDefReact);
      }
    });
    this.activeTimers.push(impactTimer);

    // --- PHASE 4: RECOVERING (prepMs + strikeMs + impactMs) ---
    const recoverTimer = this.scene.time.delayedCall(prepMs + strikeMs + impactMs, () => {
      onPhaseChange('recovering');
      this.statusText.setText(`✨ SATISFIED DRAGON RECOVERY`);

      if (!settings.reducedMotion) {
        // Beat 10: Satisfied dragon recovery
        const tGlowFade = this.scene.tweens.add({
          targets: glow,
          alpha: 0,
          duration: Math.floor(recoveryMs * 0.5),
        });
        const tDragonReset = this.scene.tweens.add({
          targets: dragonContainer,
          x: dragonX,
          y: dragonY,
          scaleX: 1,
          scaleY: 1,
          duration: Math.floor(recoveryMs * 0.6),
          ease: 'Back.easeOut',
        });
        const tHeadReset = this.scene.tweens.add({
          targets: head,
          angle: 0,
          x: 20,
          y: -35,
          duration: Math.floor(recoveryMs * 0.6),
          ease: 'Back.easeOut',
        });
        const tJawReset = this.scene.tweens.add({
          targets: jaw,
          angle: 0,
          duration: Math.floor(recoveryMs * 0.4),
        });
        const tWingsReset = this.scene.tweens.add({
          targets: wings,
          scaleX: 1,
          angle: 0,
          duration: Math.floor(recoveryMs * 0.6),
        });
        this.activeTweens.push(tGlowFade, tDragonReset, tHeadReset, tJawReset, tWingsReset);

        // Proud little chest puff / nod with nostril smoke ring
        const nodTimer = this.scene.time.delayedCall(Math.floor(recoveryMs * 0.4), () => {
          const tNod = this.scene.tweens.add({
            targets: head,
            y: -42,
            duration: Math.floor(recoveryMs * 0.2),
            yoyo: true,
            ease: 'Quad.easeInOut',
          });
          this.activeTweens.push(tNod);

          // Playful smoke puff from nostrils
          for (let n = 0; n < 2; n++) {
            const puff = this.scene.add.graphics();
            puff.fillStyle(0x9ca3af, 0.7);
            puff.fillCircle(0, 0, 8);
            puff.setPosition(dragonX + 55, dragonY - 45);
            this.stageContainer.add(puff);
            this.tempObjects.push(puff);

            const tPuff = this.scene.tweens.add({
              targets: puff,
              x: dragonX + 70 + n * 15,
              y: dragonY - 55 - n * 10,
              scaleX: 1.8,
              scaleY: 1.8,
              alpha: 0,
              duration: Math.floor(recoveryMs * 0.5),
              ease: 'Quad.easeOut',
            });
            this.activeTweens.push(tPuff);
          }
        });
        this.activeTimers.push(nodTimer);
      }
    });
    this.activeTimers.push(recoverTimer);

    // --- PHASE 5: COMPLETING (prepMs + strikeMs + impactMs + recoveryMs) ---
    const completeTimer = this.scene.time.delayedCall(prepMs + strikeMs + impactMs + recoveryMs, () => {
      // Beat 11: Clean return to board
      this.cleanup();
      if (this.onCompleteCallback) {
        const cb = this.onCompleteCallback;
        this.onCompleteCallback = null;
        cb();
      }
    });
    this.activeTimers.push(completeTimer);
  }

  public skip(): void {
    this.cleanup();
    if (this.onCompleteCallback) {
      const cb = this.onCompleteCallback;
      this.onCompleteCallback = null;
      cb();
    }
  }

  public cleanup(): void {
    this.activeTimers.forEach((timer) => timer.remove());
    this.activeTimers = [];

    this.activeTweens.forEach((tween) => {
      if (tween && tween.isPlaying()) {
        tween.stop();
      }
    });
    this.activeTweens = [];

    this.tempObjects.forEach((obj) => {
      if (obj && obj.destroy) {
        obj.destroy();
      }
    });
    this.tempObjects = [];

    if (this.scene && this.scene.cameras && this.scene.cameras.main) {
      this.scene.cameras.main.resetFX();
      this.scene.cameras.main.setZoom(1);
      this.scene.cameras.main.setAngle(0);
    }
  }
}
