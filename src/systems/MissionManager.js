/**
 * MissionManager - Central narrative quest progression system
 * Decoupled state tracker managing objectives, progress, and callbacks.
 */

export class MissionManager {
  constructor() {
    this.missions = new Map();
    this.currentMissionId = null;
    this.onMissionChangeCallbacks = [];
    this.onMissionCompleteCallbacks = [];
    this.initMissions();
  }

  registerMission(mission) {
    this.missions.set(mission.id, {
      ...mission,
      completed: false,
      progress: 0,
      maxProgress: mission.maxProgress || 1
    });
  }

  initMissions() {
    this.registerMission({
      id: 'BUILD_MANDAPAM',
      title: 'Build the Mandapam',
      objective: 'Assemble the bamboo frame for the festival pandal.',
      nextMission: 'FLOWER_PUZZLE',
      maxProgress: 5
    });

    this.registerMission({
      id: 'FLOWER_PUZZLE',
      title: 'Flower Arrangement',
      objective: 'Arrange fresh flowers into the sacred garland pattern.',
      nextMission: 'DECORATE_MANDAPAM',
      maxProgress: 5
    });

    this.registerMission({
      id: 'DECORATE_MANDAPAM',
      title: 'Festival Decorations',
      objective: 'Gather festive materials: Flowers, Lights, Banners, Cloth, Toran.',
      nextMission: 'ELECTRICAL_WIRING',
      maxProgress: 5
    });

    this.registerMission({
      id: 'ELECTRICAL_WIRING',
      title: 'Electrical Wiring',
      objective: 'Connect matching electrical terminals to power the lights.',
      nextMission: 'COOK_MODAKS',
      maxProgress: 4
    });

    this.registerMission({
      id: 'COOK_MODAKS',
      title: 'Prepare Sacred Modaks',
      objective: 'Cook sweet steamed modaks for Lord Ganesha with Ananya.',
      nextMission: 'GANESHA_REVEAL',
      maxProgress: 1
    });

    this.registerMission({
      id: 'GANESHA_REVEAL',
      title: 'The Sacred Reveal',
      objective: 'Witness the enshrinement and blessing of Lord Ganesha.',
      nextMission: 'STORM_PROTECT',
      maxProgress: 1
    });

    this.registerMission({
      id: 'STORM_PROTECT',
      title: 'Protect the Mandapam!',
      objective: 'Tie down canopy tarps and secure lights from the sudden storm!',
      nextMission: 'GENERATOR_REPAIR',
      maxProgress: 4
    });

    this.registerMission({
      id: 'GENERATOR_REPAIR',
      title: 'Generator Failure',
      objective: 'Restore power: Reconnect cable, flip breaker switch, pull starter cord.',
      nextMission: 'AARTI_RITUAL',
      maxProgress: 3
    });

    this.registerMission({
      id: 'AARTI_RITUAL',
      title: 'Maha Aarti Ritual',
      objective: 'Step up to the illuminated mandapam and perform the sacred Maha Aarti.',
      nextMission: 'SYNCHRONIZED_LIFT',
      maxProgress: 1
    });

    this.registerMission({
      id: 'SYNCHRONIZED_LIFT',
      title: 'Synchronized Lift',
      objective: 'Ready for the festival day! Lift the idol together on 1!',
      nextMission: 'PROCESSION',
      maxProgress: 1
    });

    this.registerMission({
      id: 'PROCESSION',
      title: 'The Grand Procession',
      objective: 'Celebrate through the streets with dhol drums, dancing, and gulal!',
      nextMission: 'VISARJAN',
      maxProgress: 1
    });

    this.registerMission({
      id: 'VISARJAN',
      title: 'Visarjan Ceremony',
      objective: 'Walk to the peaceful riverbank for the sacred farewell immersion.',
      nextMission: 'FINALE',
      maxProgress: 1
    });

    this.registerMission({
      id: 'FINALE',
      title: 'Homecoming',
      objective: 'Every goodbye carries the promise of another beginning.',
      nextMission: null,
      maxProgress: 1
    });
  }

  start(missionId = 'BUILD_MANDAPAM') {
    this.currentMissionId = missionId;
    this.notifyChange();
  }

  getCurrentMission() {
    return this.missions.get(this.currentMissionId);
  }

  setProgress(amount) {
    const mission = this.getCurrentMission();
    if (!mission) return;
    mission.progress = Math.min(mission.maxProgress, amount);
    this.notifyChange();

    if (mission.progress >= mission.maxProgress) {
      this.completeCurrentMission();
    }
  }

  incrementProgress(amount = 1) {
    const mission = this.getCurrentMission();
    if (mission) {
      this.setProgress(mission.progress + amount);
    }
  }

  completeCurrentMission() {
    const mission = this.getCurrentMission();
    if (!mission || mission.completed) return;

    mission.completed = true;
    this.onMissionCompleteCallbacks.forEach(cb => cb(mission));

    if (mission.nextMission) {
      this.currentMissionId = mission.nextMission;
      this.notifyChange();
    }
  }

  onMissionChange(callback) {
    this.onMissionChangeCallbacks.push(callback);
  }

  onMissionComplete(callback) {
    this.onMissionCompleteCallbacks.push(callback);
  }

  notifyChange() {
    const mission = this.getCurrentMission();
    this.onMissionChangeCallbacks.forEach(cb => cb(mission));
  }
}
