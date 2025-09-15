import React from 'react';
import { Button } from '@/components/ui/button';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="relative h-9 w-9 p-0 transition-all duration-500 ease-out hover:bg-accent/10 theme-toggle-button"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <Sun className={`h-4 w-4 transition-all duration-500 ease-out ${theme === 'light' ? 'rotate-0 scale-100 opacity-100' : 'rotate-180 scale-0 opacity-0'}`} />
      <Moon className={`absolute h-4 w-4 transition-all duration-500 ease-out ${theme === 'dark' ? 'rotate-0 scale-100 opacity-100' : '-rotate-180 scale-0 opacity-0'}`} />
    </Button>
  );
};

export default ThemeToggle;
