import { useState, useEffect } from 'react';
import { TimeLeft } from '../types';

export const useTimezoneTimer = (timezone: string) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isNewYear: false,
    nextYear: new Date().getFullYear() + 1,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      try {
        // Current time in the selected timezone as a string
        const nowString = new Date().toLocaleString('en-US', { timeZone: timezone });
        const nowInTz = new Date(nowString);

        // Calculate target year based on the current time in that timezone
        const currentYear = nowInTz.getFullYear();
        // Target is Jan 1st of the next year
        const targetDate = new Date(`1/1/${currentYear + 1}, 12:00:00 AM`);
        const nextYear = currentYear + 1;
        
        // This diff works because we projected both "Now" and "Target" into the same local reference frame
        const difference = targetDate.getTime() - nowInTz.getTime();

        if (difference <= 0) {
          setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isNewYear: true, nextYear });
          return;
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        setTimeLeft({ days, hours, minutes, seconds, isNewYear: false, nextYear });
      } catch (e) {
        console.error("Time calculation error (invalid timezone?)", e);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [timezone]);

  return timeLeft;
};