import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

const CountdownTimer = ({ examDate, onExamStarted }) => {
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(examDate));

  function calculateTimeLeft(target) {
    const diff = new Date(target).getTime() - new Date().getTime();
    if (diff <= 0) {
      return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0, started: true };
    }
    return {
      total: diff,
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / 1000 / 60) % 60),
      seconds: Math.floor((diff / 1000) % 60),
      started: false,
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = calculateTimeLeft(examDate);
      setTimeLeft(remaining);
      if (remaining.started && onExamStarted) {
        onExamStarted();
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [examDate, onExamStarted]);

  if (timeLeft.started) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs font-semibold">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        <span>Exam Started • Accessible</span>
      </div>
    );
  }

  const isUrgent = timeLeft.total < 3600000; // Less than 1 hour

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono text-xs ${
      isUrgent
        ? 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
        : 'bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
    }`}>
      <Clock className="w-3.5 h-3.5 animate-pulse" />
      <span className="font-semibold">Time to Start:</span>
      <div className="flex items-center gap-1">
        {timeLeft.days > 0 && <span>{timeLeft.days}d</span>}
        <span>{String(timeLeft.hours).padStart(2, '0')}h</span>
        <span>:</span>
        <span>{String(timeLeft.minutes).padStart(2, '0')}m</span>
        <span>:</span>
        <span>{String(timeLeft.seconds).padStart(2, '0')}s</span>
      </div>
    </div>
  );
};

export default CountdownTimer;
