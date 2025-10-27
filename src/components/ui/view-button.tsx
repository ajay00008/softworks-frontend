import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';

interface ViewButtonProps {
  onClick: (e?: React.MouseEvent) => void;
  disabled?: boolean;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  className?: string;
  showText?: boolean;
  text?: string;
}

export const ViewButton: React.FC<ViewButtonProps> = ({
  onClick,
  disabled = false,
  size = 'sm',
  variant = 'outline',
  className = '',
  showText = true,
  text = 'View'
}) => {
  return (
    <Button
      size={size}
      variant={variant}
      onClick={onClick}
      disabled={disabled}
      className={`h-5 px-1.5 flex-1 sm:flex-none ${className}`}
    >
      <Eye className="h-2.5 w-2.5 mr-1" />
      {showText && <span className="text-xs">{text}</span>}
    </Button>
  );
};

export default ViewButton;
