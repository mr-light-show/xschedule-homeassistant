/**
 * Mode Presets for xSchedule Card
 * 
 * Shared configuration presets for different card display modes
 */

export const MODE_PRESETS = {
  simple: {
    playlistDisplay: 'collapsed',
    songsDisplay: 'hidden',
    queueDisplay: 'hidden',
    showVolumeControl: false,
    showProgressBar: true,
    showPlaybackControls: true,
    enableSeek: false,
    showEntityName: false,
    showPlaylistName: false,
    showSongActions: false,
    showPlayButton: true,
    showAddToQueueButton: true,
  },
  dj: {
    playlistDisplay: 'expanded',
    songsDisplay: 'expanded',
    queueDisplay: 'expanded',
    showVolumeControl: false,
    showProgressBar: true,
    showPlaybackControls: true,
    showSongActions: true,
    enableSeek: false,
    showEntityName: false,
    showPlaylistName: false,
    showPlayButton: true,
    showAddToQueueButton: true,
  },
  jukebox: {
    playlistDisplay: 'collapsed',
    songsDisplay: 'expanded',
    queueDisplay: 'expanded',
    showVolumeControl: false,
    showProgressBar: true,
    showPlaybackControls: true,
    showSongActions: true,
    enableSeek: false,
    showEntityName: false,
    showPlaylistName: false,
    showPlayButton: true,
    showAddToQueueButton: true,
  },
  minimal: {
    playlistDisplay: 'hidden',
    songsDisplay: 'hidden',
    queueDisplay: 'hidden',
    showVolumeControl: false,
    showProgressBar: true,
    showPlaybackControls: true,
    enableSeek: false,
    showEntityName: false,
    showPlaylistName: false,
    showSongActions: false,
    showPlayButton: true,
    showAddToQueueButton: true,
  },
  custom: {
    // Custom mode uses user-provided settings
  },
};

