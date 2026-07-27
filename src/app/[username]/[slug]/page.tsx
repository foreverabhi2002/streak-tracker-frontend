'use client';

import { useState, useEffect, use } from 'react';
import { getGoalBySlug, getLogsForGoal, Goal, LogEntry } from '@/lib/api';
import { Heatmap } from '@/components/Heatmap';
import { LogList } from '@/components/LogList';

export default function PublicGoalPage({ params }: { params: Promise<{ username: string, slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const usernameParam = resolvedParams.username;
  const [goal, setGoal] = useState<Goal | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const fetchedGoal = await getGoalBySlug(slug, usernameParam);
      if (fetchedGoal && fetchedGoal.username === usernameParam) {
        setGoal(fetchedGoal);
        const fetchedLogs = await getLogsForGoal(fetchedGoal.id);
        setLogs(fetchedLogs);
      }
      setLoading(false);
    }
    loadData();
  }, [slug]);

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading...</div>;
  }

  if (!goal) {
    return <div className="p-8 text-center text-muted-foreground">This learning goal does not exist.</div>;
  }

  const activityDates = logs.map((l) => {
    const d = new Date(l.createdAt);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });

  return (
    <div className="flex flex-col gap-8 pb-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-8 border-b border-border">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-extrabold text-foreground leading-tight">{goal.title}</h1>
          <div className="flex items-center gap-3">
            {goal.avatarUrl && (
              <img src={goal.avatarUrl} alt={goal.username} className="w-8 h-8 rounded-full object-cover border border-border" />
            )}
            {goal.username && (
              <span className="text-sm font-semibold text-primary bg-primary/10 px-2 py-1 rounded-md">
                @{goal.username}
              </span>
            )}
            <p className="text-base text-muted-foreground">Public Learning Log</p>
          </div>
          {goal.socials && goal.socials.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {goal.socials.map((link, idx) => (
                <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-muted-foreground hover:text-primary hover:underline transition-colors">
                  {link.platform}
                </a>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-4">
          <div className="flex flex-col items-center bg-muted px-6 py-3 rounded-xl min-w-[120px]">
            <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1 font-semibold">Current Streak</span>
            <span className="text-2xl font-bold text-foreground">🔥 {goal.currentStreak}</span>
          </div>
          <div className="flex flex-col items-center bg-muted px-6 py-3 rounded-xl min-w-[120px]">
            <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1 font-semibold">Longest Streak</span>
            <span className="text-2xl font-bold text-foreground">🏆 {goal.longestStreak}</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="flex flex-col gap-8">
          <Heatmap activityDates={activityDates} />
        </div>

        <div className="flex flex-col">
          <LogList logs={logs} />
        </div>
      </div>
      
      <footer className="mt-16 pt-8 border-t border-dashed border-border text-center text-sm text-muted-foreground">
        <p>Built with ❤️ using Learn In Public Streak Tracker.</p>
      </footer>
    </div>
  );
}
