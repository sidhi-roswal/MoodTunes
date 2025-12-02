import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { SongCard } from './SongCard';
import { generatePlaylist } from '@/lib/groq';
import { getUserProfile, getFeedbackByMood, incrementPlaylistsGenerated, saveLastPlaylist } from '@/lib/storage';
import { MOODS, MUSIC_TYPES, DURATIONS, LANGUAGES, Song, Playlist } from '@/types';
import { ListMusic, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface PlaylistGeneratorProps {
  onAnalyticsUpdate: () => void;
}

export function PlaylistGenerator({ onAnalyticsUpdate }: PlaylistGeneratorProps) {
  const [musicType, setMusicType] = useState<string>('');
  const [mood, setMood] = useState<string>('');
  const [duration, setDuration] = useState<string>('');
  const [language, setLanguage] = useState<string>('English');
  const [isGenerating, setIsGenerating] = useState(false);
  const [playlist, setPlaylist] = useState<Playlist | null>(null);

  const handleGenerate = async () => {
    if (!musicType || !mood || !duration) {
      toast.error('Please select all options');
      return;
    }

    const profile = getUserProfile();
    if (!profile) {
      toast.error('User profile not found');
      return;
    }

    const relevantFeedback = getFeedbackByMood(mood);

    setIsGenerating(true);
    try {
      const result = await generatePlaylist(
        musicType,
        mood,
        parseInt(duration),
        profile,
        relevantFeedback,
        language
      );

      const newPlaylist: Playlist = {
        ...result,
        mood,
        musicType,
        createdAt: Date.now(),
      };

      setPlaylist(newPlaylist);
      saveLastPlaylist(newPlaylist);
      incrementPlaylistsGenerated();
      onAnalyticsUpdate();
    } catch (error) {
      console.error('Playlist generation error:', error);
      toast.error('Could not generate playlist. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="shadow-sm border-0 bg-card h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <ListMusic className="w-5 h-5" />
              Playlist Generator
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-1">
              Create a custom playlist for any occasion
            </CardDescription>
          </div>
          {duration && (
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-full border-2 border-primary flex items-center justify-center text-sm font-medium text-foreground">
                {duration === '' ? '0:00' : `${duration}`}
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">Music Type</Label>
            <Select value={musicType} onValueChange={setMusicType}>
              <SelectTrigger className="bg-secondary/50 border-0 h-11">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {MUSIC_TYPES.map(type => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">Mood</Label>
            <Select value={mood} onValueChange={setMood}>
              <SelectTrigger className="bg-secondary/50 border-0 h-11">
                <SelectValue placeholder="Select mood" />
              </SelectTrigger>
              <SelectContent>
                {MOODS.map(m => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="bg-secondary/50 border-0 h-11">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map(lang => (
                  <SelectItem key={lang} value={lang}>
                    {lang}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">Duration</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger className="bg-secondary/50 border-0 h-11">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                {DURATIONS.map(d => (
                  <SelectItem key={d} value={d.toString()}>
                    {d} minutes
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !musicType || !mood || !duration}
          className="w-full h-12 font-medium text-base"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating Playlist...
            </>
          ) : (
            'Generate Playlist'
          )}
        </Button>

        {playlist && (
          <div className="space-y-3 pt-4 border-t border-border">
            <div>
              <h3 className="font-semibold text-lg text-foreground">{playlist.title}</h3>
              <p className="text-sm text-muted-foreground">{playlist.description}</p>
            </div>
            
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {playlist.songs.map((song, index) => (
                <SongCard
                  key={`${song.title}-${song.artist}-${index}`}
                  song={song}
                  mood={playlist.mood}
                  onFeedbackChange={onAnalyticsUpdate}
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
