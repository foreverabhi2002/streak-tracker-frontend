import React from 'react';
import { LogEntry } from '@/lib/api';

interface LogListProps {
  logs: LogEntry[];
}

export function LogList({ logs }: LogListProps) {
  if (logs.length === 0) {
    return (
      <div className="p-12 text-center text-muted-foreground bg-muted rounded-xl border border-dashed border-border">
        <p>No logs yet. Start learning!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold text-foreground">Learning Logs</h3>
      <div className="flex flex-col gap-4">
        {logs.map((log) => (
          <div key={log.id} className="p-5 bg-background border border-border rounded-xl flex flex-col gap-2 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">
                {new Date(log.createdAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>
            <p className="text-base text-foreground leading-relaxed whitespace-pre-wrap">{log.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
