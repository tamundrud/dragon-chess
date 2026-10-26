export type AnimationMode = 'normal' | 'fast' | 'instant';

export type AttackPresentation = 'board' | 'arena';

export interface GameSettings {
  attackPresentation: AttackPresentation;
  animationEnabled: boolean;
  animationMode: AnimationMode;
  reducedMotion: boolean;
  mute: boolean;
  volume: number; // 0.0 to 1.0
}

export type SettingsListener = (settings: GameSettings) => void;
