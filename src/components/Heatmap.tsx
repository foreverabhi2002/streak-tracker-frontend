import React, { useRef, useEffect } from 'react';

interface HeatmapProps {
  activityDates: string[]; // ISO date strings e.g. "2026-07-26"
}

export function Heatmap({ activityDates }: HeatmapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Generate days
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const currentDayOfWeek = today.getDay(); // 0 (Sun) to 6 (Sat)
  // To show 52 columns total: 51 full weeks + the current partial week.
  const numDays = 51 * 7 + (currentDayOfWeek + 1);

  const days: Date[] = [];
  for (let i = numDays - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(d);
  }

  // Group by weeks
  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const activityMap = activityDates.reduce((acc, dateStr) => {
    acc[dateStr] = (acc[dateStr] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Scroll to the end on mount so "today" is visible
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollLeft = containerRef.current.scrollWidth;
    }
  }, []);

  return (
    <div className="flex flex-col gap-2 p-6 bg-background border border-border rounded-xl">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-2">Activity Heatmap</h3>
      
      <div className="overflow-x-auto pb-2" ref={containerRef}>
        <div className="flex flex-col gap-2 min-w-max">
          
          {/* Months Row */}
          <div className="flex relative h-4 text-xs text-muted-foreground">
            {weeks.map((week, weekIdx) => {
              const firstDay = week[0];
              const prevWeek = weeks[weekIdx - 1];
              const isNewMonth = prevWeek && prevWeek[0].getMonth() !== firstDay.getMonth();
              const isFirstWeek = weekIdx === 0;
              
              if (isNewMonth || isFirstWeek) {
                const monthStr = firstDay.toLocaleString('default', { month: 'short' });
                const yearStr = (firstDay.getMonth() === 0 || isFirstWeek) ? ` ${firstDay.getFullYear()}` : '';
                return (
                  <span 
                    key={weekIdx} 
                    className="absolute font-medium" 
                    style={{ left: `${weekIdx * 15}px` }}
                  >
                    {monthStr}{yearStr}
                  </span>
                );
              }
              return null;
            })}
          </div>

          {/* Grid Container */}
          <div className="flex gap-[3px]">
            {weeks.map((week, weekIdx) => (
              <div key={weekIdx} className="flex flex-col gap-[3px]">
                {week.map((day, dayIdx) => {
                  const year = day.getFullYear();
                  const month = String(day.getMonth() + 1).padStart(2, '0');
                  const dateNum = String(day.getDate()).padStart(2, '0');
                  const key = `${year}-${month}-${dateNum}`;
                  const count = activityMap[key] || 0;
                  
                  let colorClass = "bg-heatmap-empty";
                  if (count === 1) colorClass = "bg-heatmap-1";
                  else if (count === 2) colorClass = "bg-heatmap-2";
                  else if (count === 3) colorClass = "bg-heatmap-3";
                  else if (count >= 4) colorClass = "bg-heatmap-4";

                  return (
                    <div 
                      key={dayIdx} 
                      className={`w-[12px] h-[12px] rounded-sm transition-transform hover:scale-125 hover:ring-1 hover:ring-border hover:z-10 relative ${colorClass}`}
                      title={`${count} log(s) on ${key}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>

        </div>
      </div>

      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2 justify-end">
        <span>Less</span>
        <div className="w-3 h-3 rounded-sm bg-heatmap-empty" />
        <div className="w-3 h-3 rounded-sm bg-heatmap-1" />
        <div className="w-3 h-3 rounded-sm bg-heatmap-2" />
        <div className="w-3 h-3 rounded-sm bg-heatmap-3" />
        <div className="w-3 h-3 rounded-sm bg-heatmap-4" />
        <span>More</span>
      </div>
    </div>
  );
}
