import { GameSettings, SettingsListener } from './settingsTypes';

const STORAGE_KEY = 'dragon_chess_settings_v1';

const DEFAULT_SETTINGS: GameSettings = {
  animationEnabled: true,
  animationMode: 'normal',
  reducedMotion: false,
  mute: false,
  volume: 0.8,
};

export class SettingsStore {
  private static instance: SettingsStore;
  private settings: GameSettings;
  private listeners: Set<SettingsListener> = new Set();

  private constructor() {
    this.settings = this.loadFromStorage();
  }

  public static getInstance(): SettingsStore {
    if (!SettingsStore.instance) {
      SettingsStore.instance = new SettingsStore();
    }
    return SettingsStore.instance;
  }

  private loadFromStorage(): GameSettings {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          return { ...DEFAULT_SETTINGS, ...parsed };
        }
      }
    } catch (e) {
      console.warn('Failed to load settings from localStorage:', e);
    }
    return { ...DEFAULT_SETTINGS };
  }

  private saveToStorage(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
      }
    } catch (e) {
      console.warn('Failed to save settings to localStorage:', e);
    }
  }

  public get(): GameSettings {
    return { ...this.settings };
  }

  public update(partial: Partial<GameSettings>): void {
    this.settings = {
      ...this.settings,
      ...partial,
    };
    // Ensure volume stays in bounds
    if (typeof this.settings.volume === 'number') {
      this.settings.volume = Math.max(0, Math.min(1, this.settings.volume));
    }
    this.saveToStorage();
    this.notifyListeners();
  }

  public reset(): void {
    this.settings = { ...DEFAULT_SETTINGS };
    this.saveToStorage();
    this.notifyListeners();
  }

  public subscribe(listener: SettingsListener): () => void {
    this.listeners.add(listener);
    listener(this.get());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    const snapshot = this.get();
    this.listeners.forEach((listener) => listener(snapshot));
  }
}
