import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getAnalytics, getTopMood, getMostLikedArtist } from '@/lib/storage';
import { BarChart3, Mic, ListMusic, ThumbsUp } from 'lucide-react';

interface AnalyticsProps {
  refreshKey: number;
}

export function Analytics({ refreshKey }: AnalyticsProps) {
  const analytics = getAnalytics();
  const topMood = getTopMood();
  const topArtist = getMostLikedArtist();

  const stats = [
    {
      icon: Mic,
      label: 'Voice Commands',
      value: analytics.voiceCommands,
    },
    {
      icon: ListMusic,
      label: 'Playlists Generated',
      value: analytics.playlistsGenerated,
    },
    {
      icon: ThumbsUp,
      label: 'Songs Liked',
      value: analytics.totalLikes,
    },
  ];

  return (
    <Card className="shadow-sm border-0 bg-card">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <BarChart3 className="w-5 h-5" />
          Your Stats
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Your music discovery journey
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="p-5 rounded-xl bg-card border border-border text-center hover:shadow-sm transition-shadow"
            >
              <stat.icon className="w-5 h-5 mx-auto mb-3 text-muted-foreground" />
              <p className="text-3xl font-semibold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
