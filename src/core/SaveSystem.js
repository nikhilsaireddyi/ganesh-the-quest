/**
 * SaveSystem - LocalStorage Persistence
 * Stores player progress, completed missions, and user audio settings.
 */

const SAVE_KEY = 'ganesh_the_quest_save_v1';

export class SaveSystem {
  static load() {
    try {
      const data = localStorage.getItem(SAVE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Failed to load save from localStorage', e);
    }
    return {
      currentMission: 'BUILD_MANDAPAM',
      completedMissions: [],
      musicVolume: 0.6,
      sfxVolume: 0.8,
      isMuted: false,
      backgroundBells: true
    };
  }

  static save(state) {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Failed to save to localStorage', e);
    }
  }

  static reset() {
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch (e) {
      console.warn('Failed to clear save', e);
    }
  }
}
