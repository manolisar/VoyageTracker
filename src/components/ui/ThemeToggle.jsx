import { useState, useEffect } from 'react';
import { Icons } from '../Icons';

const ThemeToggle = () => {
  const [dark, setDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('voyageTrackerTheme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('voyageTrackerTheme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <button
      onClick={() => setDark(!dark)}
      className="p-2 rounded-xl bg-white/50 dark:bg-navy-800/50 hover:bg-white dark:hover:bg-navy-700
                 text-navy-600 dark:text-navy-200 transition-all duration-200 border border-navy-200/50 dark:border-navy-600/50"
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {dark ? <Icons.Sun /> : <Icons.Moon />}
    </button>
  );
};

export default ThemeToggle;
