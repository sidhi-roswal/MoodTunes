import { UserProfile, SongFeedback, Analytics, Playlist } from '@/types';

const KEYS = {
  USER_PROFILE: 'moodtunes_userProfile',
  SONG_FEEDBACK: 'moodtunes_songFeedback',
  ANALYTICS: 'moodtunes_analytics',
  LAST_PLAYLIST: 'moodtunes_lastPlaylist',
} as const;

// User Profile
export function getUserProfile(): UserProfile | null {
  const data = localStorage.getItem(KEYS.USER_PROFILE);
  return data ? JSON.parse(data) : null;
}

export function saveUserProfile(profile: UserProfile): void {
  localStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(profile));
}

// Song Feedback
export function getSongFeedback(): SongFeedback[] {
  const data = localStorage.getItem(KEYS.SONG_FEEDBACK);
  return data ? JSON.parse(data) : [];
}

export function saveSongFeedback(feedback: SongFeedback): void {
  const existing = getSongFeedback();
  const index = existing.findIndex(f => f.songId === feedback.songId);
  
  if (index >= 0) {
    existing[index] = feedback;
  } else {
    existing.push(feedback);
  }
  
  localStorage.setItem(KEYS.SONG_FEEDBACK, JSON.stringify(existing));
  updateAnalyticsFromFeedback(feedback);
}

export function getFeedbackForSong(songId: string): SongFeedback | null {
  const feedback = getSongFeedback();
  return feedback.find(f => f.songId === songId) || null;
}

export function getFeedbackByMood(mood: string): SongFeedback[] {
  return getSongFeedback().filter(f => f.mood.toLowerCase() === mood.toLowerCase());
}

// Analytics
export function getAnalytics(): Analytics {
  const data = localStorage.getItem(KEYS.ANALYTICS);
  return data ? JSON.parse(data) : {
    voiceCommands: 0,
    playlistsGenerated: 0,
    totalLikes: 0,
    totalUnlikes: 0,
    moodCounts: {},
  };
}

export function incrementVoiceCommands(): void {
  const analytics = getAnalytics();
  analytics.voiceCommands += 1;
  localStorage.setItem(KEYS.ANALYTICS, JSON.stringify(analytics));
}

export function incrementPlaylistsGenerated(): void {
  const analytics = getAnalytics();
  analytics.playlistsGenerated += 1;
  localStorage.setItem(KEYS.ANALYTICS, JSON.stringify(analytics));
}

function updateAnalyticsFromFeedback(feedback: SongFeedback): void {
  const analytics = getAnalytics();
  
  if (feedback.feedback === 'like') {
    analytics.totalLikes += 1;
  } else {
    analytics.totalUnlikes += 1;
  }
  
  analytics.moodCounts[feedback.mood] = (analytics.moodCounts[feedback.mood] || 0) + 1;
  
  localStorage.setItem(KEYS.ANALYTICS, JSON.stringify(analytics));
}

// Last Playlist
export function getLastPlaylist(): Playlist | null {
  const data = localStorage.getItem(KEYS.LAST_PLAYLIST);
  return data ? JSON.parse(data) : null;
}

export function saveLastPlaylist(playlist: Playlist): void {
  localStorage.setItem(KEYS.LAST_PLAYLIST, JSON.stringify(playlist));
}

// Computed Analytics
export function getTopMood(): string | null {
  const analytics = getAnalytics();
  const entries = Object.entries(analytics.moodCounts);
  if (entries.length === 0) return null;
  
  return entries.reduce((a, b) => a[1] > b[1] ? a : b)[0];
}

export function getMostLikedArtist(): string | null {
  const feedback = getSongFeedback().filter(f => f.feedback === 'like');
  if (feedback.length === 0) return null;
  
  const artistCounts: Record<string, number> = {};
  feedback.forEach(f => {
    artistCounts[f.artist] = (artistCounts[f.artist] || 0) + 1;
  });
  
  const entries = Object.entries(artistCounts);
  return entries.reduce((a, b) => a[1] > b[1] ? a : b)[0];
}

// Helper to create Spotify search URL
export function createSpotifySearchUrl(title: string, artist: string): string {
  const query = encodeURIComponent(`${title} ${artist}`);
  return `https://open.spotify.com/search/${query}`;
}

// Helper to create song ID
export function createSongId(title: string, artist: string): string {
  return `${title.toLowerCase().replace(/\s+/g, '-')}-${artist.toLowerCase().replace(/\s+/g, '-')}`;
}
