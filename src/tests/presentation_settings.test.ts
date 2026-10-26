import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('capture presentation preference', () => {
  beforeEach(() => { localStorage.clear(); vi.resetModules(); });
  it('defaults to foreground over the board', async () => {
    const { SettingsStore } = await import('../settings/SettingsStore');
    expect(SettingsStore.getInstance().get().attackPresentation).toBe('board');
  });
  it('adds the board default when loading old preferences', async () => {
    localStorage.setItem('dragon_chess_settings_v1', JSON.stringify({ animationMode: 'fast', mute: true }));
    const { SettingsStore } = await import('../settings/SettingsStore');
    expect(SettingsStore.getInstance().get()).toMatchObject({ attackPresentation: 'board', animationMode: 'fast', mute: true });
  });
  it('persists the arena comparison and resets to board', async () => {
    let { SettingsStore } = await import('../settings/SettingsStore');
    SettingsStore.getInstance().update({ attackPresentation: 'arena' });
    vi.resetModules();
    ({ SettingsStore } = await import('../settings/SettingsStore'));
    expect(SettingsStore.getInstance().get().attackPresentation).toBe('arena');
    SettingsStore.getInstance().reset();
    expect(SettingsStore.getInstance().get().attackPresentation).toBe('board');
  });
});
