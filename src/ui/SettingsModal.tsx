import React from 'react';
import { X, Volume2, VolumeX, Eye, Sliders } from 'lucide-react';
import { useSettings } from '../settings/useSettings';
import { AnimationMode } from '../settings/settingsTypes';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [settings, updateSettings, resetSettings] = useSettings();

  if (!isOpen) return null;

  const handleModeChange = (mode: AnimationMode) => {
    updateSettings({ animationMode: mode });
  };

  return (
    <div id="settings-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div id="settings-modal" className="surface w-full max-w-md rounded-sm border border-[#222] bg-[#121212] p-6 text-[#e0e0e0] shadow-2xl">
        <div className="flex items-center justify-between border-b gold-border pb-4">
          <div className="flex items-center gap-2">
            <Sliders className="h-6 w-6 text-[#b8860b]" />
            <h2 className="serif text-2xl font-bold gold-text uppercase tracking-wider">Game Settings</h2>
          </div>
          <button
            id="close-settings-btn"
            onClick={onClose}
            className="rounded-sm p-1.5 text-gray-400 hover:text-[#e0e0e0] hover:bg-white/5 transition-colors"
            aria-label="Close settings"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="mt-6 space-y-6">
          {/* Animation Enabled */}
          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="anim-enabled-toggle" className="font-bold text-xs uppercase tracking-widest text-gray-300">Battle Animations</label>
              <p className="text-[11px] text-gray-500 font-mono">Play animated capture scenes</p>
            </div>
            <input
              id="anim-enabled-toggle"
              type="checkbox"
              checked={settings.animationEnabled}
              onChange={(e) => updateSettings({ animationEnabled: e.target.checked })}
              className="h-6 w-6 rounded-sm border-[#333] bg-[#1a1a1a] text-[#b8860b] focus:ring-[#b8860b]"
            />
          </div>

          {/* Animation Speed Mode */}
          <div className={!settings.animationEnabled ? 'opacity-50 pointer-events-none transition-opacity' : 'transition-opacity'}>
            <label className="block font-bold text-xs uppercase tracking-widest text-gray-300 mb-2">Animation Speed</label>
            <div className="grid grid-cols-3 gap-2">
              {(['normal', 'fast', 'instant'] as AnimationMode[]).map((mode) => (
                <button
                  key={mode}
                  id={`mode-btn-${mode}`}
                  type="button"
                  onClick={() => handleModeChange(mode)}
                  className={`py-2 px-3 rounded-sm font-bold text-[10px] tracking-widest uppercase transition-all ${
                    settings.animationMode === mode
                      ? 'btn-active shadow-md'
                      : 'btn-ghost'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Reduced Motion */}
          <div className="flex items-center justify-between border-t border-[#222] pt-4">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-[#b8860b]" />
              <div>
                <label htmlFor="reduced-motion-toggle" className="font-bold text-xs uppercase tracking-widest text-gray-300">Reduced Motion</label>
                <p className="text-[11px] text-gray-500 font-mono">Gentle fades instead of camera shake</p>
              </div>
            </div>
            <input
              id="reduced-motion-toggle"
              type="checkbox"
              checked={settings.reducedMotion}
              onChange={(e) => updateSettings({ reducedMotion: e.target.checked })}
              className="h-6 w-6 rounded-sm border-[#333] bg-[#1a1a1a] text-[#b8860b] focus:ring-[#b8860b]"
            />
          </div>

          {/* Mute Audio */}
          <div className="flex items-center justify-between border-t border-[#222] pt-4">
            <div className="flex items-center gap-2">
              {settings.mute ? <VolumeX className="h-5 w-5 text-red-500" /> : <Volume2 className="h-5 w-5 text-[#b8860b]" />}
              <div>
                <label htmlFor="mute-toggle" className="font-bold text-xs uppercase tracking-widest text-gray-300">Mute Sound</label>
              </div>
            </div>
            <input
              id="mute-toggle"
              type="checkbox"
              checked={settings.mute}
              onChange={(e) => updateSettings({ mute: e.target.checked })}
              className="h-6 w-6 rounded-sm border-[#333] bg-[#1a1a1a] text-[#b8860b] focus:ring-[#b8860b]"
            />
          </div>

          {/* Volume Slider */}
          <div className={settings.mute ? 'opacity-50 pointer-events-none transition-opacity' : 'transition-opacity'}>
            <div className="flex justify-between font-bold text-xs uppercase tracking-widest text-gray-300 mb-1">
              <label htmlFor="volume-slider">Volume</label>
              <span className="font-mono text-[11px] text-[#b8860b]">{Math.round(settings.volume * 100)}%</span>
            </div>
            <input
              id="volume-slider"
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.volume}
              onChange={(e) => updateSettings({ volume: parseFloat(e.target.value) })}
              className="w-full accent-[#b8860b] h-2 bg-[#222] rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex items-center justify-between border-t gold-border pt-4">
          <button
            id="reset-settings-btn"
            type="button"
            onClick={resetSettings}
            className="px-4 py-2 text-[11px] font-mono uppercase tracking-wider text-gray-500 hover:text-[#b8860b] transition-colors"
          >
            Reset Defaults
          </button>
          <button
            id="save-settings-btn"
            type="button"
            onClick={onClose}
            className="btn-active rounded-sm px-8 py-2.5 text-xs font-bold uppercase tracking-[0.2em] shadow-lg transition-transform active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
