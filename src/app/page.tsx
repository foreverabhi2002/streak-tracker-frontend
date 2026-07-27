'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createGoal, getSession, User, getUserGoals, Goal } from '@/lib/api';
import Link from 'next/link';

export default function Home() {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userGoals, setUserGoals] = useState<Goal[]>([]);
  const router = useRouter();

  useEffect(() => {
    const session = getSession();
    setUser(session);
    if (session) {
      getUserGoals().then(setUserGoals);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !user) return;

    setLoading(true);
    try {
      const goal = await createGoal(title);
      router.push(`/track/${goal.slug}`);
    } catch (error) {
      console.error("Failed to create goal", error);
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-[80vh] p-8 max-w-3xl mx-auto text-center">
      <div className="mb-12">
        <h1 className="text-5xl font-extrabold tracking-tight mb-4 text-foreground">Learn In Public</h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Track your learning journey, build a streak, and share your progress with the world.
        </p>
      </div>

      {!user ? (
        <div className="flex flex-col gap-4 w-full max-w-md bg-background p-8 rounded-2xl border border-border shadow-sm">
          <p className="text-foreground font-medium mb-2">Join to start tracking your goals</p>
          <Link href="/login" className="w-full py-3 px-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity">
            Log In
          </Link>
          <Link href="/register" className="w-full py-3 px-4 bg-muted text-foreground font-semibold rounded-lg hover:bg-border transition-colors">
            Sign Up
          </Link>
        </div>
      ) : (
        <div className="w-full max-w-md flex flex-col gap-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-background p-8 rounded-2xl border border-border shadow-sm">
            <div className="flex flex-col gap-2 text-left">
              <label htmlFor="goalTitle" className="text-sm font-semibold text-foreground">
                What are you learning?
              </label>
              <input
                id="goalTitle"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. System Design, Rust, Next.js"
                className="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                autoFocus
                disabled={loading}
              />
            </div>
            <button type="submit" className="w-full py-3 px-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity mt-2 disabled:opacity-50 disabled:cursor-not-allowed" disabled={!title.trim() || loading}>
              {loading ? 'Starting...' : 'Start Tracking'}
            </button>
          </form>

          {userGoals.length > 0 && (
            <div className="text-left bg-muted p-6 rounded-2xl border border-border">
              <h3 className="font-semibold text-foreground mb-4">Your Goals</h3>
              <div className="flex flex-col gap-2">
                {userGoals.map(goal => (
                  <Link key={goal.id} href={`/track/${goal.slug}`} className="flex justify-between items-center p-3 bg-background rounded-lg hover:bg-border transition-colors border border-border">
                    <span className="font-medium text-foreground">{goal.title}</span>
                    <span className="text-sm text-muted-foreground">🔥 {goal.currentStreak}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
