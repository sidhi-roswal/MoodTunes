import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { MOODS, type Mood } from '@/types';
import { saveUserProfile } from '@/lib/storage';
import { Music, Sparkles, Check } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface OnboardingProps {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [artists, setArtists] = useState('');
  const [selectedMoods, setSelectedMoods] = useState<Mood[]>([]);

  const handleMoodToggle = (mood: Mood) => {
    setSelectedMoods(prev =>
      prev.includes(mood)
        ? prev.filter(m => m !== mood)
        : [...prev, mood]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const artistList = artists
      .split(',')
      .map(a => a.trim())
      .filter(a => a.length > 0);

    if (artistList.length === 0) {
      toast.error('Please enter at least one favorite artist');
      return;
    }

    if (selectedMoods.length === 0) {
      toast.error('Please select at least one mood');
      return;
    }

    saveUserProfile({
      artists: artistList,
      moods: selectedMoods,
    });

    toast.success('Profile saved! Let\'s find some music.');
    onComplete();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-lg shadow-lg border-0 bg-card">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
            <Music className="w-8 h-8 text-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">Welcome to MoodTunes</CardTitle>
          <CardDescription className="text-muted-foreground mt-2">
            Let's personalize your music experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="artists" className="text-sm font-medium text-foreground">Favorite Artists</Label>
              <Input
                id="artists"
                placeholder="e.g., Harry Styles, The Weeknd, Ariana Grande"
                value={artists}
                onChange={e => setArtists(e.target.value)}
                className="h-12 bg-secondary/50 border-0 text-foreground placeholder:text-muted-foreground"
              />
              <p className="text-xs text-muted-foreground">
                Separate multiple artists with commas
              </p>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground">Favorite Moods / Genres</Label>
              <div className="grid grid-cols-2 gap-3">
                {MOODS.map(mood => {
                  const isSelected = selectedMoods.includes(mood);
                  return (
                    <button
                      type="button"
                      key={mood}
                      onClick={() => handleMoodToggle(mood)}
                      className={cn(
                        "flex items-center space-x-3 p-3 rounded-xl transition-colors text-left",
                        isSelected
                          ? "bg-primary/20 border-2 border-primary"
                          : "bg-secondary/50 border-2 border-transparent hover:bg-secondary"
                      )}
                    >
                      <div className={cn(
                        "w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0",
                        isSelected
                          ? "bg-primary border-primary"
                          : "border-muted-foreground/30"
                      )}>
                        {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                      </div>
                      <span className="font-medium text-sm text-foreground">
                        {mood}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                Select multiple to express your diverse music taste
              </p>
            </div>

            <Button type="submit" className="w-full h-12 text-base font-medium">
              <Sparkles className="w-4 h-4 mr-2" />
              Start Discovering Music
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
