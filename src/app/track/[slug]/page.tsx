'use client';

import { Heatmap } from '@/components/Heatmap';
import { LogList } from '@/components/LogList';
import { PageLoader } from '@/components/PageLoader';
import { addLog, deleteGoal, getGoalBySlug, getLogsForGoal, getSession, Goal, LogEntry, updateGoal } from '@/lib/api';
import { Check, Copy, Edit2, Share2, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function TrackPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const [goal, setGoal] = useState<Goal | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [logContent, setLogContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Edit Goal State
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Delete Goal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const router = useRouter();

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  useEffect(() => {
    const user = getSession();
    if (!user) {
      router.push('/login');
      return;
    }

    async function loadData() {
      const fetchedGoal = await getGoalBySlug(slug);
      if (fetchedGoal) {
        if (fetchedGoal.userId !== user?.id) {
          router.push(`/${fetchedGoal.username}/${slug}`);
          return;
        }
        setGoal(fetchedGoal);
        setEditTitle(fetchedGoal.title);
        const fetchedLogs = await getLogsForGoal(fetchedGoal.id);
        setLogs(fetchedLogs);
        
        const todayLog = fetchedLogs.find((l) => {
          const d = new Date(l.createdAt);
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` === todayStr;
        });
        if (todayLog) {
          setLogContent(todayLog.content);
        }
      }
      setLoading(false);
    }
    loadData();
  }, [slug, router, todayStr]);

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal || !logContent.trim()) return;

    setIsSubmitting(true);
    try {
      await addLog(goal.id, logContent);
      
      const fetchedGoal = await getGoalBySlug(slug);
      if (fetchedGoal) setGoal(fetchedGoal);
      const fetchedLogs = await getLogsForGoal(goal.id);
      setLogs(fetchedLogs);
    } catch (error) {
      console.error("Failed to add/update log", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateGoal = async () => {
    if (!goal || !editTitle.trim() || editTitle === goal.title) {
      setIsEditing(false);
      return;
    }
    setIsUpdating(true);
    try {
      const updated = await updateGoal(slug, editTitle);
      setGoal({ ...goal, title: updated.title });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update goal", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteGoal = () => {
    setIsDeleteModalOpen(true);
    setDeleteConfirmationText('');
  };

  const confirmDeleteGoal = async () => {
    if (!goal || deleteConfirmationText !== goal.title) return;
    
    setIsDeleting(true);
    try {
      await deleteGoal(slug);
      router.push('/');
    } catch (error) {
      console.error("Failed to delete goal", error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return <PageLoader />;
  }

  if (!goal) {
    return <div className="p-8 text-center text-muted-foreground">Goal not found.</div>;
  }

  const activityDates = logs.map((l) => {
    const d = new Date(l.createdAt);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const publicLink = typeof window !== 'undefined' ? `${window.location.origin}/${goal.username}/${slug}` : '';
  const hasLoggedToday = logs.some((l) => {
    const d = new Date(l.createdAt);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` === todayStr;
  });

  return (
    <div className="flex flex-col gap-8 pb-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-border">
        <div className="flex-1 w-full md:w-auto">
          {isEditing ? (
            <div className="flex items-center gap-2 mb-1 w-full max-w-md">
              <input 
                type="text" 
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="flex-1 p-2 border border-border rounded-md bg-background text-foreground text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-accent"
                autoFocus
                disabled={isUpdating}
              />
              <button onClick={handleUpdateGoal} disabled={isUpdating || !editTitle.trim()} className="p-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors">
                <Check className="w-5 h-5" />
              </button>
              <button onClick={() => { setIsEditing(false); setEditTitle(goal.title); }} disabled={isUpdating} className="p-2 bg-muted text-foreground border border-border rounded-md hover:bg-border disabled:opacity-50 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="group flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold text-foreground">{goal.title}</h1>
              <button onClick={() => setIsEditing(true)} className="p-1.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-foreground hover:bg-muted rounded-md" aria-label="Edit title">
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          )}
          <p className="text-sm text-muted-foreground">Owner Dashboard</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
          <div className="bg-accent text-white px-4 py-2 rounded-full font-bold shadow-sm flex items-center gap-2">
            <span>🔥</span> {goal.currentStreak} Day Streak
          </div>
          <button onClick={handleDeleteGoal} className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-colors" aria-label="Delete Goal">
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="bg-muted p-6 rounded-xl border border-dashed border-border">
        <p className="text-sm font-medium text-foreground mb-3">Your public link to share:</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input 
            type="text" 
            readOnly 
            value={publicLink} 
            className="flex-1 min-w-0 w-full p-2 bg-background border border-border rounded-md text-sm text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <div className="flex gap-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(publicLink);
                toast.success('URL Copied');
              }}
              className="p-2 border border-border bg-background hover:bg-muted text-foreground rounded-md transition-colors"
              aria-label="Copy public link"
              title="Copy URL"
            >
              <Copy className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                const message = `Check out my progress on "${goal.title}"! I'm on a 🔥 ${goal.currentStreak} day streak!`;
                if (navigator.share) {
                  navigator.share({
                    title: goal.title,
                    text: message,
                    url: publicLink,
                  }).catch(console.error);
                } else {
                  navigator.clipboard.writeText(`${message} ${publicLink}`);
                  toast.success('Share text & URL copied');
                }
              }}
              className="p-2 border border-border bg-background hover:bg-muted text-foreground rounded-md transition-colors"
              aria-label="Share public link"
              title="Share Goal"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <Link href={`/${goal.username}/${slug}`} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity whitespace-nowrap text-center sm:text-left flex-1 sm:flex-none" target="_blank">
              View Public
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex flex-col gap-8">
          <form onSubmit={handleAddLog} className="bg-background border border-border p-6 rounded-xl flex flex-col gap-4 shadow-sm">
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-semibold text-foreground">
                {hasLoggedToday ? "Edit Today's Progress" : "Log Today's Progress"}
              </h3>
              {hasLoggedToday && (
                <p className="text-sm text-green-600 dark:text-green-500 font-medium">
                  ✅ You've already posted a log for today. You can edit it below.
                </p>
              )}
            </div>
            
            <textarea
              className="w-full p-3 border border-border rounded-md bg-background text-foreground resize-y focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="What did you learn today?"
              value={logContent}
              onChange={(e) => setLogContent(e.target.value)}
              rows={4}
              disabled={isSubmitting}
            />
            <button type="submit" className="self-start py-2 px-6 bg-foreground text-background font-semibold rounded-md hover:opacity-90 transition-opacity disabled:opacity-50" disabled={!logContent.trim() || isSubmitting}>
              {isSubmitting ? 'Saving...' : (hasLoggedToday ? 'Update Log' : 'Save Log')}
            </button>
          </form>

          <Heatmap activityDates={activityDates} />
        </div>

        <div className="flex flex-col">
          <LogList logs={logs} />
        </div>
      </div>

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background border border-border p-6 rounded-xl shadow-lg max-w-md w-full flex flex-col gap-4">
            <h3 className="text-xl font-bold text-red-600">Delete Goal?</h3>
            <p className="text-sm text-foreground">
              This action is permanent and cannot be undone. This will permanently delete the goal and remove all of its associated log entries.
            </p>
            <p className="text-sm text-muted-foreground">
              To proceed, enter the goal name <span className="font-semibold text-foreground">"{goal.title}"</span> below to confirm.
            </p>
            <input
              type="text"
              value={deleteConfirmationText}
              onChange={(e) => setDeleteConfirmationText(e.target.value)}
              placeholder={goal.title}
              className="w-full p-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <div className="flex justify-end gap-3 mt-2">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-muted text-foreground font-medium rounded-md hover:bg-border transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteGoal}
                disabled={deleteConfirmationText !== goal.title || isDeleting}
                className="px-4 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors text-sm"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
