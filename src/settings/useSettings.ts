import { useEffect, useState } from 'react';
import { GameSettings } from './settingsTypes';
import { SettingsStore } from './SettingsStore';

export function useSettings(): [GameSettings, (partial: Partial<GameSettings>) => void, () => void] {
  const store = SettingsStore.getInstance();
  const [settings, setSettings] = useState<GameSettings>(store.get());

  useEffect(() => {
    return store.subscribe((newSettings) => {
      setSettings(newSettings);
    });
  }, [store]);

  const updateSettings = (partial: Partial<GameSettings>) => {
    store.update(partial);
  };

  const resetSettings = () => {
    store.reset();
  };

  return [settings, updateSettings, resetSettings];
}
