export interface UserProfile {
  artists: string[];
  moods: string[];
}

export interface SongFeedback {
  songId: string;
  title: string;
  artist: string;
  mood: string;
  spotifySearchUrl: string;
  feedback: 'like' | 'unlike';
  timestamp: number;
}

export interface Analytics {
  voiceCommands: number;
  playlistsGenerated: number;
  totalLikes: number;
  totalUnlikes: number;
  moodCounts: Record<string, number>;
}

export interface Song {
  title: string;
  artist: string;
  spotifySearchUrl: string;
}

export interface Playlist {
  title: string;
  description: string;
  songs: Song[];
  mood: string;
  musicType: string;
  createdAt: number;
}

export const MOODS = ['Chill', 'Energetic', 'Motivational', 'Travel', 'Dark', 'Focus/Study', 'Devotional', 'Workout', 'Sad', 'Sleepy'] as const;
export type Mood = typeof MOODS[number];

export const MUSIC_TYPES = ['Indie Pop', 'Hip-Hop', 'R&B', 'Electronic', 'Rock', 'Jazz', 'Classical', 'Country', 'Bollywood', 'Lo-Fi'] as const;
export type MusicType = typeof MUSIC_TYPES[number];

export const DURATIONS = [30, 60, 90] as const;
export type Duration = typeof DURATIONS[number];

export const LANGUAGES = ['English', 'Hindi'] as const;
export type Language = typeof LANGUAGES[number];
