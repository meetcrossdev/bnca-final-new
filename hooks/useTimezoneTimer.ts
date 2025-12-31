import { useState, useEffect } from 'react';
import { TimeLeft } from '../types';

export const useTimezoneTimer = (timezone: string) => {
  const TARGET_YEAR = 2026;
  
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isNewYear: false,
    nextYear: TARGET_YEAR,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      try {
        // Get current time in the selected timezone
        // We use toLocaleString to get a date string representing the time in that zone
        const nowString = new Date().toLocaleString('en-US', { timeZone: timezone });
        const nowInTz = new Date(nowString);
        const currentYear = nowInTz.getFullYear();

        // If we've reached or passed the target year (2026), stick to the "Happy New Year" state
        if (currentYear >= TARGET_YEAR) {
          setTimeLeft({
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
            isNewYear: true,
            nextYear: TARGET_YEAR,
          });
          return;
        }

        // Calculate target date (Jan 1st of the target year at midnight)
        // Since nowInTz is projected into a local date reference for calculation, targetDate should be too
        const targetDate = new Date(TARGET_YEAR, 0, 1, 0, 0, 0);
        const difference = targetDate.getTime() - nowInTz.getTime();

        if (difference <= 0) {
          setTimeLeft({
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
            isNewYear: true,
            nextYear: TARGET_YEAR
          });
          return;
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        setTimeLeft({
          days,
          hours,
          minutes,
          seconds,
          isNewYear: false,
          nextYear: TARGET_YEAR
        });
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