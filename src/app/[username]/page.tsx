'use client';

import { Heatmap } from '@/components/Heatmap';
import { PageLoader } from '@/components/PageLoader';
import { SocialLinks } from '@/components/SocialLinks';
import { getPublicGoals, getPublicLogs, getPublicProfile, Goal, LogEntry, User } from '@/lib/api';
import Link from 'next/link';
import { use, useEffect, useState } from 'react';

export default function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const resolvedParams = use(params);
  const usernameParam = resolvedParams.username;
  
  const [user, setUser] = useState<User | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const fetchedUser = await getPublicProfile(usernameParam);
        if (fetchedUser) {
          setUser(fetchedUser);
          const [fetchedGoals, fetchedLogs] = await Promise.all([
            getPublicGoals(usernameParam),
            getPublicLogs(usernameParam)
          ]);
          setGoals(fetchedGoals);
          setLogs(fetchedLogs);
        }
      } catch (error) {
        console.error("Failed to load profile data", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [usernameParam]);

  if (loading) {
    return <PageLoader />;
  }

  if (!user) {
    return <div className="p-8 text-center text-muted-foreground">This user does not exist.</div>;
  }

  const activityDates = logs.map((l) => {
    const d = new Date(l.createdAt);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });

  return (
    <div className="flex flex-col gap-10 pb-12">
      <header className="flex flex-col md:flex-row gap-8 items-start border-b border-border pb-8">
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt={user.username} className="w-24 h-24 rounded-full object-cover border-4 border-muted" />
        ) : (
          <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center text-3xl font-bold text-muted-foreground border-4 border-muted">
            {user.username.charAt(0).toUpperCase()}
          </div>
        )}
        
        <div className="flex flex-col gap-3 flex-1">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground">{user.name || user.username}</h1>
            <span className="text-sm font-semibold text-primary bg-primary/10 px-2 py-1 rounded-md mt-1 inline-block">
              @{user.username}
            </span>
          </div>
          
          {user.headline && (
            <p className="text-lg font-medium text-foreground">{user.headline}</p>
          )}
          
          {user.bio && (
            <p className="text-sm text-muted-foreground">{user.bio}</p>
          )}

          {user.socials && user.socials.length > 0 && (
            <div className="mt-2">
              <SocialLinks socials={user.socials} />
            </div>
          )}
        </div>
      </header>

      <div className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-foreground">Activity Overview</h2>
        <Heatmap activityDates={activityDates} />
      </div>

      <div className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-foreground">Learning Goals</h2>
        {goals.length === 0 ? (
          <p className="text-muted-foreground text-sm">No public learning goals yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {goals.map((goal) => (
              <Link 
                key={goal.id} 
                href={`/${user.username}/${goal.slug}`}
                className="flex flex-col bg-card border border-border p-5 rounded-xl hover:border-primary/50 hover:shadow-sm transition-all group"
              >
                <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{goal.title}</h3>
                <div className="flex gap-4 mt-auto pt-4 text-sm border-t border-border/50">
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Current</span>
                    <span className="font-bold text-foreground">🔥 {goal.currentStreak || 0}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Longest</span>
                    <span className="font-bold text-foreground">🏆 {goal.longestStreak || 0}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      
      {user.skills && (
        <div className="flex flex-col gap-3 pt-6 border-t border-border">
          <h4 className="text-xs uppercase text-muted-foreground tracking-wider font-semibold">Skills</h4>
          <p className="text-sm text-foreground">{user.skills}</p>
        </div>
      )}
      
      {user.description && (
        <div className="flex flex-col gap-3 pt-6 border-t border-border">
          <h4 className="text-xs uppercase text-muted-foreground tracking-wider font-semibold">About</h4>
          <p className="text-sm text-foreground whitespace-pre-wrap">{user.description}</p>
        </div>
      )}
    </div>
  );
}
