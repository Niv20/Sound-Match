import { useEffect } from 'react';
import { audioEngine } from '../audio/AudioEngine';
import { useSettingsStore } from '../store/useSettingsStore';

/** מסנכרן את הגדרות הווליום/הפעלה אל מנוע האודיו. */
export function useAudioSettingsSync() {
  const music = useSettingsStore((s) => s.music);
  const sfx = useSettingsStore((s) => s.sfx);

  useEffect(() => {
    audioEngine.setEnabled('music', music.on);
    audioEngine.setVolume('music', music.volume);
  }, [music.on, music.volume]);

  useEffect(() => {
    audioEngine.setEnabled('sfx', sfx.on);
    audioEngine.setVolume('sfx', sfx.volume);
  }, [sfx.on, sfx.volume]);
}
