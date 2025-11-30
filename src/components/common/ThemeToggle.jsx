import { useTheme } from '../../context/ThemeContext';
import { Icons } from './Icons';

export const ThemeToggle = () => {
  const { dark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-xl bg-white/50 dark:bg-navy-800/50 hover:bg-white dark:hover:bg-navy-700
                 text-navy-600 dark:text-navy-200 transition-all duration-200 border border-navy-200/50 dark:border-navy-600/50"
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {dark ? <Icons.Sun /> : <Icons.Moon />}
    </button>
  );
};
