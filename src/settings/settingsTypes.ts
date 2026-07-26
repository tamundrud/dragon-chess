export type AnimationMode = 'normal' | 'fast' | 'instant';

export interface GameSettings {
  animationEnabled: boolean;
  animationMode: AnimationMode;
  reducedMotion: boolean;
  mute: boolean;
  volume: number; // 0.0 to 1.0
}

export type SettingsListener = (settings: GameSettings) => void;
