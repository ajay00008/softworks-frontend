import { useState, useMemo, useCallback, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GraduationCap, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Class {
  _id: string;
  id?: string;
  name: string;
  displayName: string;
  level: number;
  section: string;
  isActive?: boolean;
}

interface ClassSectionSelectorProps {
  classes: Class[];
  selectedClassIds: string[];
  onSelectionChange: (classIds: string[]) => void;
  mode?: 'single' | 'multiple';
  showLevelFirst?: boolean;
  required?: boolean;
  label?: string;
  description?: string;
}

export default function ClassSectionSelector({
  classes,
  selectedClassIds,
  onSelectionChange,
  mode = 'multiple',
  showLevelFirst = true,
  required = false,
  label = 'Select Classes',
  description
}: ClassSectionSelectorProps) {
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [expandedLevels, setExpandedLevels] = useState<Set<number>>(new Set());

  // Group classes by level
  const classesByLevel = useMemo(() => {
    try {
      const grouped: Record<number, Class[]> = {};
      if (!classes || !Array.isArray(classes)) {
        return grouped;
      }
      
      classes.forEach(cls => {
        if (!cls || typeof cls.level !== 'number') {
          console.warn('Invalid class data:', cls);
          return;
        }
        if (!grouped[cls.level]) {
          grouped[cls.level] = [];
        }
        grouped[cls.level].push(cls);
      });
      
      // Sort sections within each level
      Object.keys(grouped).forEach(level => {
        grouped[Number(level)].sort((a, b) => {
          const sectionA = a.section || '';
          const sectionB = b.section || '';
          return sectionA.localeCompare(sectionB);
        });
      });
      
      return grouped;
    } catch (error) {
      console.error('Error grouping classes by level:', error);
      return {};
    }
  }, [classes]);

  const levels = useMemo(() => {
    return Object.keys(classesByLevel)
      .map(Number)
      .sort((a, b) => a - b);
  }, [classesByLevel]);

  // Filter classes by selected level
  const filteredClasses = useMemo(() => {
    if (selectedLevel === 'all') {
      return classes;
    }
    return classes.filter(cls => cls.level === Number(selectedLevel));
  }, [classes, selectedLevel]);

  const toggleLevel = (level: number) => {
    setExpandedLevels(prev => {
      const newSet = new Set(prev);
      if (newSet.has(level)) {
        newSet.delete(level);
      } else {
        newSet.add(level);
      }
      return newSet;
    });
  };

  // Memoize the level filter handler to prevent re-renders
  const handleLevelChange = useCallback((value: string) => {
    setSelectedLevel(prev => {
      // Only update if value actually changed
      if (prev !== value) {
        return value;
      }
      return prev;
    });
  }, []);

  const handleClassToggle = (classId: string) => {
    if (!classId) return;
    try {
      if (mode === 'single') {
        onSelectionChange([classId]);
      } else {
        const newSelection = selectedClassIds.includes(classId)
          ? selectedClassIds.filter(id => id !== classId)
          : [...selectedClassIds, classId];
        onSelectionChange(newSelection);
      }
    } catch (error) {
      console.error('Error toggling class selection:', error);
    }
  };

  const selectAllInLevel = (level: number) => {
    try {
      const levelClasses = classesByLevel[level];
      if (!levelClasses || levelClasses.length === 0) return;
      
      const levelClassIds = levelClasses
        .map(cls => cls._id || cls.id)
        .filter((id): id is string => !!id);
      
      if (levelClassIds.length === 0) return;
      
      const allSelected = levelClassIds.every(id => selectedClassIds.includes(id));
      
      if (allSelected) {
        // Deselect all in this level
        onSelectionChange(selectedClassIds.filter(id => !levelClassIds.includes(id)));
      } else {
        // Select all in this level
        const newSelection = [...selectedClassIds];
        levelClassIds.forEach(id => {
          if (!newSelection.includes(id)) {
            newSelection.push(id);
          }
        });
        onSelectionChange(newSelection);
      }
    } catch (error) {
      console.error('Error selecting all in level:', error);
    }
  };

  // Safety check
  if (!classes || classes.length === 0) {
    return (
      <div className="space-y-4">
        <div>
          <Label className="text-base font-medium flex items-center gap-2">
            <GraduationCap className="w-4 h-4" />
            {label}
            {required && <span className="text-red-500">*</span>}
          </Label>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        <div className="p-4 border rounded-lg bg-muted/50">
          <p className="text-sm text-muted-foreground">No classes available</p>
        </div>
      </div>
    );
  }

  if (showLevelFirst) {
    return (
      <div className="space-y-4">
        <div>
          <Label className="text-base font-medium flex items-center gap-2">
            <GraduationCap className="w-4 h-4" />
            {label}
            {required && <span className="text-red-500">*</span>}
          </Label>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>

        {/* Level Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Filter by Level</Label>
          <Select 
            value={selectedLevel} 
            onValueChange={handleLevelChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              {levels.map(level => (
                <SelectItem key={level} value={String(level)}>
                  Level {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Classes grouped by level */}
        <ScrollArea className="h-[300px] border rounded-lg p-4">
          <div className="space-y-4">
            {levels
              .filter(level => selectedLevel === 'all' || level === Number(selectedLevel))
              .map(level => {
                const levelClasses = classesByLevel[level];
                const isExpanded = expandedLevels.has(level);
                const levelClassIds = levelClasses.map(cls => cls._id || cls.id);
                const allSelected = levelClassIds.every(id => selectedClassIds.includes(id));
                const someSelected = levelClassIds.some(id => selectedClassIds.includes(id));

                return (
                  <Card 
                    key={level} 
                    className="border-2"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleLevel(level);
                            }}
                            className="h-6 w-6 p-0"
                            type="button"
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                          <CardTitle className="text-lg">Level {level}</CardTitle>
                          <Badge variant="secondary">{levelClasses.length} section{levelClasses.length !== 1 ? 's' : ''}</Badge>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            selectAllInLevel(level);
                          }}
                          className="text-xs"
                          type="button"
                        >
                          {allSelected ? 'Deselect All' : 'Select All'}
                        </Button>
                      </div>
                    </CardHeader>
                    {isExpanded && (
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {levelClasses.map(cls => {
                            const classId = cls._id || cls.id;
                            if (!classId) {
                              console.warn('Class missing ID:', cls);
                              return null;
                            }
                            const isSelected = selectedClassIds.includes(classId);
                            return (
                              <div
                                key={classId}
                                className={`flex items-center space-x-2 p-2 border rounded-lg cursor-pointer transition-colors ${
                                  isSelected
                                    ? 'bg-primary/10 border-primary'
                                    : 'hover:bg-muted'
                                }`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleClassToggle(classId);
                                }}
                              >
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={(checked) => {
                                    if (checked !== undefined) {
                                      handleClassToggle(classId);
                                    }
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <Label
                                  htmlFor={`class-${classId}`}
                                  className="text-sm font-normal cursor-pointer flex-1"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleClassToggle(classId);
                                  }}
                                >
                                  <div className="flex flex-col">
                                    <span className="font-medium">{cls.displayName || cls.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                      Section {cls.section || ''}
                                    </span>
                                  </div>
                                </Label>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
          </div>
        </ScrollArea>

        {selectedClassIds.length > 0 && (
          <div className="text-sm text-muted-foreground">
            {mode === 'single' ? (
              <span>Selected: {classes.find(c => (c._id || c.id) === selectedClassIds[0])?.displayName}</span>
            ) : (
              <span>{selectedClassIds.length} class{selectedClassIds.length !== 1 ? 'es' : ''} selected</span>
            )}
          </div>
        )}
      </div>
    );
  }

  // Fallback: Simple list view (original behavior)
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-medium flex items-center gap-2">
          <GraduationCap className="w-4 h-4" />
          {label}
          {required && <span className="text-red-500">*</span>}
        </Label>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>

      <ScrollArea className="h-[300px] border rounded-lg p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {filteredClasses.map(cls => {
            const classId = cls._id || cls.id;
            const isSelected = selectedClassIds.includes(classId);
            return (
              <div
                key={classId}
                className={`flex items-center space-x-2 p-2 border rounded-lg cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-primary/10 border-primary'
                    : 'hover:bg-muted'
                }`}
                onClick={() => handleClassToggle(classId)}
              >
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => handleClassToggle(classId)}
                />
                <Label
                  htmlFor={`class-${classId}`}
                  className="text-sm font-normal cursor-pointer flex-1"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{cls.displayName}</span>
                    <span className="text-xs text-muted-foreground">
                      Level {cls.level} - Section {cls.section}
                    </span>
                  </div>
                </Label>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {selectedClassIds.length > 0 && (
        <div className="text-sm text-muted-foreground">
          {mode === 'single' ? (
            <span>Selected: {classes.find(c => (c._id || c.id) === selectedClassIds[0])?.displayName}</span>
          ) : (
            <span>{selectedClassIds.length} class{selectedClassIds.length !== 1 ? 'es' : ''} selected</span>
          )}
        </div>
      )}
    </div>
  );
}

