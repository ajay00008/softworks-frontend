import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, List, Grid } from 'lucide-react';

interface ViewTabsProps {
  viewMode: 'list' | 'grid' | 'detailed';
  onViewModeChange: (mode: 'list' | 'grid' | 'detailed') => void;
  children: React.ReactNode;
  className?: string;
}

export const ViewTabs: React.FC<ViewTabsProps> = ({
  viewMode,
  onViewModeChange,
  children,
  className = ''
}) => {
  return (
    <Tabs value={viewMode} onValueChange={onViewModeChange} className={className}>
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="list" className="flex items-center gap-2">
          <List className="h-4 w-4" />
          <span className="hidden sm:inline">List</span>
        </TabsTrigger>
        <TabsTrigger value="grid" className="flex items-center gap-2">
          <Grid className="h-4 w-4" />
          <span className="hidden sm:inline">Grid</span>
        </TabsTrigger>
        <TabsTrigger value="detailed" className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          <span className="hidden sm:inline">Detailed</span>
        </TabsTrigger>
      </TabsList>
      <TabsContent value={viewMode} className="mt-4">
        {children}
      </TabsContent>
    </Tabs>
  );
};

export default ViewTabs;
