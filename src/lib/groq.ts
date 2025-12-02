import { UserProfile, SongFeedback, Song } from '@/types';
import { createSpotifySearchUrl } from './storage';

const GROQ_API_URL = 'https://api.groq.com/openai/v1';
const GROQ_API_KEY = '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';

export function getGroqApiKey(): string {
  return GROQ_API_KEY;
}

// Speech to Text
export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  const key = getGroqApiKey();
  if (!key) throw new Error('Groq API key not configured');

  const formData = new FormData();
  formData.append('file', audioBlob, 'audio.webm');
  formData.append('model', 'whisper-large-v3-turbo');

  const response = await fetch(`${GROQ_API_URL}/audio/transcriptions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Transcription failed: ${error}`);
  }

  const data = await response.json();
  return data.text;
}

// Text LLM for recommendations
export async function getRecommendations(
  request: string,
  profile: UserProfile,
  relevantFeedback: SongFeedback[]
): Promise<Song[]> {
  const key = getGroqApiKey();
  if (!key) throw new Error('Groq API key not configured');

  const likedSongs = relevantFeedback
    .filter(f => f.feedback === 'like')
    .map(f => `${f.title} – ${f.artist}`)
    .slice(0, 5);

  const dislikedSongs = relevantFeedback
    .filter(f => f.feedback === 'unlike')
    .map(f => `${f.title} – ${f.artist}`)
    .slice(0, 3);

  const prompt = `You are a music recommendation assistant. Based on the user's request and preferences, recommend exactly 5 songs.

User Request: "${request}"

User's Favorite Artists: ${profile.artists.join(', ')}
User's Favorite Moods: ${profile.moods.join(', ')}
${likedSongs.length > 0 ? `Songs user liked: ${likedSongs.join(', ')}` : ''}
${dislikedSongs.length > 0 ? `Songs user disliked (avoid similar): ${dislikedSongs.join(', ')}` : ''}

Respond with ONLY a numbered list of 5 songs in this exact format:
1. Song Title – Artist Name
2. Song Title – Artist Name
3. Song Title – Artist Name
4. Song Title – Artist Name
5. Song Title – Artist Name

Do not include any other text, explanations, or formatting.`;

  const response = await fetch(`${GROQ_API_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'moonshotai/kimi-k2-instruct-0905',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Recommendation failed: ${error}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content || '';
  
  return parseSongList(content);
}

// Playlist generation
export async function generatePlaylist(
  musicType: string,
  mood: string,
  duration: number,
  profile: UserProfile,
  relevantFeedback: SongFeedback[],
  language: string = 'English'
): Promise<{ title: string; description: string; songs: Song[] }> {
  const key = getGroqApiKey();
  if (!key) throw new Error('Groq API key not configured');

  const songCount = Math.round(duration / 4); // ~4 min per song
  
  const likedSongs = relevantFeedback
    .filter(f => f.feedback === 'like')
    .map(f => `${f.title} – ${f.artist}`)
    .slice(0, 5);

  const languageInstruction = language === 'Hindi' 
    ? 'All songs MUST be Hindi/Bollywood songs or Hindi versions. Focus on Indian artists and Bollywood music.'
    : 'Songs should be in English.';

  const prompt = `You are a music playlist curator. Create a ${duration}-minute ${musicType} playlist with a ${mood} mood.

Language Requirement: ${languageInstruction}

User's Favorite Artists: ${profile.artists.join(', ')}
User's Favorite Moods: ${profile.moods.join(', ')}
${likedSongs.length > 0 ? `Songs user previously liked: ${likedSongs.join(', ')}` : ''}

Respond in this exact format:
TITLE: [Creative playlist title]
DESCRIPTION: [One-line description]
SONGS:
1. Song Title – Artist Name
2. Song Title – Artist Name
... (${songCount} songs total)

Do not include any other text or explanations.`;

  const response = await fetch(`${GROQ_API_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'moonshotai/kimi-k2-instruct-0905',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Playlist generation failed: ${error}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content || '';
  
  return parsePlaylistResponse(content);
}

// Parse song list from LLM response
function parseSongList(content: string): Song[] {
  const lines = content.split('\n').filter(line => line.trim());
  const songs: Song[] = [];

  for (const line of lines) {
    // Match patterns like "1. Song Title – Artist" or "Song Title – Artist"
    const match = line.match(/^\d*\.?\s*(.+?)\s*[–-]\s*(.+)$/);
    if (match) {
      const title = match[1].trim();
      const artist = match[2].trim();
      songs.push({
        title,
        artist,
        spotifySearchUrl: createSpotifySearchUrl(title, artist),
      });
    }
  }

  return songs;
}

// Parse playlist response
function parsePlaylistResponse(content: string): { title: string; description: string; songs: Song[] } {
  const titleMatch = content.match(/TITLE:\s*(.+)/i);
  const descMatch = content.match(/DESCRIPTION:\s*(.+)/i);
  
  const title = titleMatch ? titleMatch[1].trim() : 'Your Playlist';
  const description = descMatch ? descMatch[1].trim() : 'A curated playlist just for you';
  
  // Extract songs section
  const songsSection = content.split(/SONGS:/i)[1] || content;
  const songs = parseSongList(songsSection);

  return { title, description, songs };
}
