import { useState, useEffect } from 'react';
import { Onboarding } from '@/components/Onboarding';
import { Dashboard } from '@/components/Dashboard';
import { getUserProfile } from '@/lib/storage';

const Index = () => {
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);

  useEffect(() => {
    setHasProfile(!!getUserProfile());
  }, []);

  // Loading state
  if (hasProfile === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Show onboarding if no profile
  if (!hasProfile) {
    return <Onboarding onComplete={() => setHasProfile(true)} />;
  }

  // Show main dashboard
  return <Dashboard />;
};

export default Index;
