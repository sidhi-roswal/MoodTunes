import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SongCard } from './SongCard';
import { transcribeAudio, getRecommendations } from '@/lib/groq';
import { getUserProfile, getFeedbackByMood, incrementVoiceCommands } from '@/lib/storage';
import { Song } from '@/types';
import { Mic, MicOff, Loader2, Music2 } from 'lucide-react';
import { toast } from 'sonner';

interface VoiceSearchProps {
  onAnalyticsUpdate: () => void;
}

export function VoiceSearch({ onAnalyticsUpdate }: VoiceSearchProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isGettingRecs, setIsGettingRecs] = useState(false);
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentMood, setCurrentMood] = useState('General');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());
        
        setIsTranscribing(true);
        try {
          const text = await transcribeAudio(audioBlob);
          setTranscription(text);
        } catch (error) {
          console.error('Transcription error:', error);
          toast.error('Failed to transcribe audio. Please try again.');
        } finally {
          setIsTranscribing(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Recording error:', error);
      toast.error('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const getRecommendationsHandler = async () => {
    if (!transcription.trim()) {
      toast.error('Please record your request first');
      return;
    }

    const profile = getUserProfile();
    if (!profile) {
      toast.error('User profile not found');
      return;
    }

    const detectedMood = profile.moods.find(m => 
      transcription.toLowerCase().includes(m.toLowerCase())
    ) || 'General';
    setCurrentMood(detectedMood);

    const relevantFeedback = getFeedbackByMood(detectedMood);

    setIsGettingRecs(true);
    try {
      const recommendations = await getRecommendations(transcription, profile, relevantFeedback);
      setSongs(recommendations);
      incrementVoiceCommands();
      onAnalyticsUpdate();
    } catch (error) {
      console.error('Recommendation error:', error);
      toast.error('Could not get recommendations. Please try again.');
    } finally {
      setIsGettingRecs(false);
    }
  };

  return (
    <Card className="shadow-sm border-0 bg-card">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <Music2 className="w-5 h-5" />
          Voice Search
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Tell us what you're in the mood for
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant={isRecording ? "destructive" : "default"}
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isTranscribing}
            className="flex-1 h-11 font-medium"
          >
            {isRecording ? (
              <>
                <MicOff className="w-4 h-4 mr-2" />
                Stop Recording
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 mr-2" />
                Record
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            onClick={getRecommendationsHandler}
            disabled={!transcription || isGettingRecs}
            className="flex-1 h-11 font-medium border-border hover:bg-secondary"
          >
            {isGettingRecs ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Getting Songs...
              </>
            ) : (
              'Get Recommendations'
            )}
          </Button>
        </div>

        {isTranscribing && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            Transcribing...
          </div>
        )}

        {transcription && (
          <div className="p-4 rounded-xl bg-secondary/50">
            <p className="text-sm font-medium mb-1 text-foreground">Your request:</p>
            <p className="text-sm text-muted-foreground">{transcription}</p>
          </div>
        )}

        {songs.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground">Recommended Songs</h4>
            <div className="space-y-2">
              {songs.map((song, index) => (
                <SongCard
                  key={`${song.title}-${song.artist}-${index}`}
                  song={song}
                  mood={currentMood}
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
