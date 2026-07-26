import { AttackDefinition } from './attackTypes';

export class AttackRegistry {
  private static instance: AttackRegistry;
  private attacks: Map<string, AttackDefinition> = new Map();

  private constructor() {
    this.registerDefaults();
  }

  public static getInstance(): AttackRegistry {
    if (!AttackRegistry.instance) {
      AttackRegistry.instance = new AttackRegistry();
    }
    return AttackRegistry.instance;
  }

  private registerDefaults(): void {
    // Fire Dragon Vertical Slice Attack
    this.register({
      id: 'fire_stream_attack',
      displayName: 'Fire Stream',
      description: 'Braces, inhales, glows, emits smoke embers, launches fire stream towards defender, impact soot cloud, satisfied recovery.',
      totalDuration: 2600,
      anticipationDuration: 800,
      strikeDuration: 800,
      impactTime: 1600,
      recoveryDuration: 1000,
      screenShake: true,
      hitPause: true,
      soundCueIds: ['fire_ignite', 'fire_stream', 'fire_impact', 'camera_rumble'],
      effectIds: ['glow_throat', 'smoke_embers', 'flame_core', 'soot_cloud'],
    });

    // Stoick Axe Smash
    this.register({
      id: 'axe_smash',
      displayName: 'Royal Axe Smash',
      description: 'Confident windup, heavy overhead smash with wood splinter particles and camera shake.',
      totalDuration: 2000,
      anticipationDuration: 600,
      strikeDuration: 600,
      impactTime: 1200,
      recoveryDuration: 800,
      screenShake: true,
      hitPause: true,
      soundCueIds: ['weapon_whoosh', 'heavy_impact'],
      effectIds: ['wood_splinters', 'dust_cloud'],
    });

    // Valhallarama Decisive Arc
    this.register({
      id: 'decisive_arc',
      displayName: 'Decisive Weapon Arc',
      description: 'Short ready pose, fast advance, clean weapon arc, precise impact, firm landing.',
      totalDuration: 1800,
      anticipationDuration: 500,
      strikeDuration: 500,
      impactTime: 1000,
      recoveryDuration: 800,
      screenShake: false,
      hitPause: true,
      soundCueIds: ['weapon_whoosh', 'shield_impact'],
      effectIds: ['spark_impact'],
    });

    // Viking Pawn Shield Bash
    this.register({
      id: 'shield_bash',
      displayName: 'Shield Bash',
      description: 'Determined charge and sturdy shield collision with knockback recoil.',
      totalDuration: 1500,
      anticipationDuration: 400,
      strikeDuration: 500,
      impactTime: 900,
      recoveryDuration: 600,
      screenShake: false,
      hitPause: false,
      soundCueIds: ['shield_impact'],
      effectIds: ['dust_cloud'],
    });

    // Generic Strikes
    this.register({
      id: 'generic_strike',
      displayName: 'Heroic Strike',
      description: 'Standard temporary strike animation.',
      totalDuration: 1400,
      anticipationDuration: 400,
      strikeDuration: 400,
      impactTime: 800,
      recoveryDuration: 600,
      screenShake: false,
      hitPause: false,
      soundCueIds: ['weapon_whoosh'],
      effectIds: ['dust_cloud'],
    });

    this.register({
      id: 'rival_strike',
      displayName: 'Rival Raid',
      description: 'Standard temporary rival clan capture attack.',
      totalDuration: 1400,
      anticipationDuration: 400,
      strikeDuration: 400,
      impactTime: 800,
      recoveryDuration: 600,
      screenShake: false,
      hitPause: false,
      soundCueIds: ['weapon_whoosh'],
      effectIds: ['dust_cloud'],
    });

    this.register({
      id: 'test_attack',
      displayName: 'Vertical Slice Test Attack',
      description: 'Simple 5-phase test attack: anticipation, movement, impact, defender reaction, recovery.',
      totalDuration: 1500,
      anticipationDuration: 300,
      strikeDuration: 300,
      impactTime: 400,
      recoveryDuration: 500,
      screenShake: true,
      hitPause: false,
      soundCueIds: ['weapon_whoosh', 'heavy_impact'],
      effectIds: ['spark_impact', 'dust_cloud'],
    });
  }

  public register(definition: AttackDefinition): void {
    this.attacks.set(definition.id, definition);
  }

  public getById(id: string): AttackDefinition | undefined {
    return this.attacks.get(id);
  }

  public getAll(): AttackDefinition[] {
    return Array.from(this.attacks.values());
  }
}
