import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Song, SongFeedback } from '@/types';
import { saveSongFeedback, getFeedbackForSong, createSongId } from '@/lib/storage';
import { cn } from '@/lib/utils';

interface SongCardProps {
  song: Song;
  mood: string;
  onFeedbackChange?: () => void;
}

export function SongCard({ song, mood, onFeedbackChange }: SongCardProps) {
  const [feedback, setFeedback] = useState<'like' | 'unlike' | null>(null);
  const songId = createSongId(song.title, song.artist);

  useEffect(() => {
    const existing = getFeedbackForSong(songId);
    if (existing) {
      setFeedback(existing.feedback);
    }
  }, [songId]);

  const handleFeedback = (type: 'like' | 'unlike') => {
    const newFeedback: SongFeedback = {
      songId,
      title: song.title,
      artist: song.artist,
      mood,
      spotifySearchUrl: song.spotifySearchUrl,
      feedback: type,
      timestamp: Date.now(),
    };

    saveSongFeedback(newFeedback);
    setFeedback(type);
    onFeedbackChange?.();
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
      <div className="flex-1 min-w-0 mr-3">
        <p className="font-medium text-sm text-foreground truncate">{song.title}</p>
        <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
      </div>
      
      <div className="flex items-center gap-1 flex-shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleFeedback('like')}
          className={cn(
            "h-8 w-8 p-0 rounded-full",
            feedback === 'like' && "bg-primary/20 text-primary"
          )}
        >
          <ThumbsUp className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleFeedback('unlike')}
          className={cn(
            "h-8 w-8 p-0 rounded-full",
            feedback === 'unlike' && "bg-destructive/20 text-destructive"
          )}
        >
          <ThumbsDown className="w-4 h-4" />
        </Button>
        <a
          href={song.spotifySearchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
