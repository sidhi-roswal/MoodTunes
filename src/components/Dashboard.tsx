import { useState, useCallback } from 'react';
import { VoiceSearch } from './VoiceSearch';
import { PlaylistGenerator } from './PlaylistGenerator';
import { Analytics } from './Analytics';
import { getUserProfile } from '@/lib/storage';
import { Music, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Dashboard() {
  const [analyticsKey, setAnalyticsKey] = useState(0);
  const profile = getUserProfile();

  const refreshAnalytics = useCallback(() => {
    setAnalyticsKey(prev => prev + 1);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Music className="w-4 h-4 text-primary" />
            </div>
            <h1 className="text-xl font-semibold">MoodTunes</h1>
          </div>
          
          {profile && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="hidden sm:inline">
                {profile.artists.slice(0, 2).join(', ')}
                {profile.artists.length > 2 && '...'}
              </span>
            </div>
          )}
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-8 space-y-6">
        <VoiceSearch onAnalyticsUpdate={refreshAnalytics} />
        <PlaylistGenerator onAnalyticsUpdate={refreshAnalytics} />
        <Analytics refreshKey={analyticsKey} />
      </main>

      <footer className="border-t mt-auto">
        <div className="container max-w-4xl mx-auto px-4 py-4 text-center text-sm text-muted-foreground">
          MoodTunes — AI-powered music recommendations
        </div>
      </footer>
    </div>
  );
}
