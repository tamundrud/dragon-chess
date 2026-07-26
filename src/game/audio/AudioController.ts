import { SettingsStore } from '../../settings/SettingsStore';

export class AudioController {
  private static instance: AudioController;
  private audioUnlocked: boolean = false;
  private activeAudioElements: Set<HTMLAudioElement> = new Set();
  private unlockHandler: (() => void) | null = null;

  private constructor() {
    this.setupUnlockListener();
  }

  public static getInstance(): AudioController {
    if (!AudioController.instance) {
      AudioController.instance = new AudioController();
    }
    return AudioController.instance;
  }

  private setupUnlockListener(): void {
    if (typeof window === 'undefined') return;

    this.unlockHandler = () => {
      this.audioUnlocked = true;
      if (this.unlockHandler) {
        window.removeEventListener('click', this.unlockHandler);
        window.removeEventListener('keydown', this.unlockHandler);
        window.removeEventListener('touchstart', this.unlockHandler);
      }
    };

    window.addEventListener('click', this.unlockHandler, { once: true });
    window.addEventListener('keydown', this.unlockHandler, { once: true });
    window.addEventListener('touchstart', this.unlockHandler, { once: true });
  }

  public isUnlocked(): boolean {
    return this.audioUnlocked;
  }

  /**
   * Plays an audio cue by ID. Tolerates missing assets gracefully.
   */
  public playSound(soundCueId: string): void {
    const settings = SettingsStore.getInstance().get();
    if (settings.mute || settings.volume <= 0 || !this.audioUnlocked) {
      return;
    }

    try {
      const audio = new Audio(`/assets/audio/${soundCueId}.mp3`);
      audio.volume = settings.volume;
      this.activeAudioElements.add(audio);

      audio.addEventListener('ended', () => {
        this.activeAudioElements.delete(audio);
      }, { once: true });

      audio.addEventListener('error', () => {
        // Silently tolerate missing audio asset in vertical slice scaffold
        this.activeAudioElements.delete(audio);
      }, { once: true });

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Playback failed (e.g. autoplay restriction or missing file), ignore safely
          this.activeAudioElements.delete(audio);
        });
      }
    } catch {
      // Tolerate constructor or path errors
    }
  }

  public stopAll(): void {
    this.activeAudioElements.forEach((audio) => {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch {
        // ignore
      }
    });
    this.activeAudioElements.clear();
  }

  public destroy(): void {
    this.stopAll();
    if (this.unlockHandler && typeof window !== 'undefined') {
      window.removeEventListener('click', this.unlockHandler);
      window.removeEventListener('keydown', this.unlockHandler);
      window.removeEventListener('touchstart', this.unlockHandler);
    }
  }
}
