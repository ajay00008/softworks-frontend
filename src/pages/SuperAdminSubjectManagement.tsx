import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { ViewTabs } from '@/components/ui/view-tabs';
import { ViewButton } from '@/components/ui/view-button';
import { 
  GraduationCap, 
  BookOpen, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Users,
  Book,
  Calendar,
  Hash,
  Tag,
  AlertTriangle,
  CheckCircle,
  Clock,
  AlertCircle,
  Upload,
  Eye,
  School,
  UserCheck
} from 'lucide-react';
import { 
  adminsAPI,
  subjectManagementAPI,
  User,
  Subject
} from '@/services/api';
import QuestionPaperTemplateManager from '@/components/QuestionPaperTemplateManager';

interface AdminWithSubjects extends User {
  subjects: Subject[];
  subjectCount: number;
}

const SuperAdminSubjectManagement = () => {
  const [admins, setAdmins] = useState<AdminWithSubjects[]>([]);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminWithSubjects | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'admins' | 'subjects'>('admins');
  const [displayMode, setDisplayMode] = useState<'list' | 'grid' | 'detailed'>('list');
  
  const { toast } = useToast();

  const refreshAdminSubjects = async (adminId: string) => {
    try {
      const subjectsResponse = await subjectManagementAPI.getAllByAdmin(adminId);
      setAdmins(prevAdmins => 
        prevAdmins.map(admin => 
          admin._id === adminId 
            ? { 
                ...admin, 
                subjects: subjectsResponse.subjects || [],
                subjectCount: subjectsResponse.subjects?.length || 0
              }
            : admin
        ) 
      );
    } catch (error) {
      console.error(`Error refreshing subjects for admin ${adminId}:`, error);
    }
  };

  const loadAdminsWithSubjects = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get all admins
      const adminsResponse = await adminsAPI.getAll();
      const adminUsers = adminsResponse.admins.filter(admin => admin.role === 'ADMIN');
      
      // Get subjects for each admin
      const adminsWithSubjects = await Promise.all(
        adminUsers.map(async (admin) => {
          try {
            // For super admin, we need to get subjects by adminId
            const subjectsResponse = await subjectManagementAPI.getAllByAdmin(admin._id);
            return {
              ...admin,
              subjects: subjectsResponse.subjects || [],
              subjectCount: subjectsResponse.subjects?.length || 0
            };
          } catch (error) {
            console.error(`Error loading subjects for admin ${admin.name}:`, error);
            return {
              ...admin,
              subjects: [],
              subjectCount: 0
            };
          }
        })
      );
      
      setAdmins(adminsWithSubjects);
    } catch (error) {
      console.error('Error loading admins with subjects:', error);
      setError('Failed to load admins and subjects');
      toast({
        title: "Error",
        description: "Failed to load admins and subjects",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadAdminsWithSubjects();
  }, [loadAdminsWithSubjects]);

  const filteredAdmins = admins.filter(admin => 
    admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSubjects = selectedAdmin?.subjects.filter(subject => {
    const matchesSearch = subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subject.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || subject.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  const categories = ['all', ...new Set(admins.flatMap(admin => 
    admin.subjects.map(subject => subject.category)
  ))];

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Subject Management</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Loading admins and subjects...</p>
        </div>
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-3 sm:space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-muted rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-full"></div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                  <div className="flex gap-2">
                    <div className="h-5 bg-muted rounded w-16"></div>
                    <div className="h-5 bg-muted rounded w-12"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Subject Management</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Manage subjects across all admins</p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-8 sm:py-12">
            <div className="text-center max-w-md mx-auto px-4">
              <AlertTriangle className="w-10 h-10 sm:w-12 sm:h-12 text-destructive mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-semibold mb-2">Error Loading Data</h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-4">{error}</p>
              <Button onClick={loadAdminsWithSubjects} className="w-full sm:w-auto">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Subject Management</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Manage subjects and templates across all admins</p>
      </div>

      {/* View Tabs */}
      <ViewTabs
        viewMode={displayMode}
        onViewModeChange={setDisplayMode}
        className="w-full"
      >

      {/* Controls */}
      <div className="space-y-4">
        {/* Search and Filter Row */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search admins or subjects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
          
          {viewMode === 'subjects' && selectedAdmin && (
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* View Mode Toggle */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button
            variant={viewMode === 'admins' ? 'default' : 'outline'}
            onClick={() => setViewMode('admins')}
            className="flex items-center justify-center gap-2 flex-1 sm:flex-none"
          >
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Admins</span>
            <span className="sm:hidden">Admins</span>
            <Badge variant="secondary" className="ml-1">
              {admins.length}
            </Badge>
          </Button>
          <Button
            variant={viewMode === 'subjects' ? 'default' : 'outline'}
            onClick={() => setViewMode('subjects')}
            disabled={!selectedAdmin}
            className="flex items-center justify-center gap-2 flex-1 sm:flex-none"
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Subjects</span>
            <span className="sm:hidden">Subjects</span>
            <Badge variant="secondary" className="ml-1">
              {selectedAdmin?.subjectCount || 0}
            </Badge>
          </Button>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'admins' ? (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredAdmins.map((admin) => (
            <Card 
              key={admin._id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => {
                setSelectedAdmin(admin);
                setViewMode('subjects');
                setSearchTerm('');
                setSelectedCategory('all');
              }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <School className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base sm:text-lg truncate">{admin.name}</CardTitle>
                    <CardDescription className="truncate text-xs sm:text-sm">{admin.email}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      {admin.subjectCount} subjects
                    </span>
                  </div>
                  <ViewButton
                    onClick={(e) => {
                      e?.stopPropagation(); // Prevent card click
                      setSelectedAdmin(admin);
                      setViewMode('subjects');
                      setSearchTerm('');
                      setSelectedCategory('all');
                    }}
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2 sm:h-8 sm:px-3"
                    showText={true}
                    text="View"
                  />
                </div>
                
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  <Badge variant={admin.isActive ? 'default' : 'secondary'} className="text-xs">
                    {admin.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Admin
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {/* Admin Info */}
          {selectedAdmin && (
            <Card>
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <School className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-lg sm:text-xl truncate">{selectedAdmin.name}</CardTitle>
                      <CardDescription className="truncate text-xs sm:text-sm">{selectedAdmin.email}</CardDescription>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSelectedAdmin(null);
                      setViewMode('admins');
                    }}
                    className="w-full sm:w-auto"
                  >
                    Back to Admins
                  </Button>
                </div>
              </CardHeader>
            </Card>
          )}

          {/* Subjects Grid */}
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSubjects.map((subject) => (
              <Card key={subject._id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base sm:text-lg truncate">{subject.name}</CardTitle>
                      <CardDescription className="flex items-center space-x-2 mt-1">
                        <Hash className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate text-xs sm:text-sm">{subject.code}</span>
                      </CardDescription>
                    </div>
                    {subject.color && (
                      <div 
                        className="w-4 h-4 rounded border ml-2 flex-shrink-0"
                        style={{ backgroundColor: subject.color }}
                      />
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center space-x-2">
                      <Tag className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                      <Badge variant="outline" className="text-xs">
                        {subject.category}
                      </Badge>
                    </div>
                    
                    {subject.description && (
                      <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                        {subject.description}
                      </p>
                    )}
                    
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Users className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-xs sm:text-sm text-muted-foreground">
                          {subject.classIds?.length || 0} classes
                        </span>
                      </div>
                      {subject.classIds && subject.classIds.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {subject.classIds.map((classItem: any, index: number) => (
                            <Badge key={classItem._id || index} variant="secondary" className="text-xs">
                              {classItem.name || classItem.displayName || `Class ${classItem.level}`}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge variant={subject.isActive ? 'default' : 'secondary'} className="text-xs">
                        {subject.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Template Management Section */}
                  <div className="pt-3 sm:pt-4 border-t mt-3 sm:mt-4">
                    <QuestionPaperTemplateManager
                      subjectId={subject._id}
                      subjectName={subject.name}
                      onUpdate={() => {
                        // Refresh the subjects for the current admin
                        if (selectedAdmin) {
                          refreshAdminSubjects(selectedAdmin._id);
                        }
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredSubjects.length === 0 && (
            <Card>
              <CardContent className="flex items-center justify-center py-8 sm:py-12">
                <div className="text-center max-w-md mx-auto px-4">
                  <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-base sm:text-lg font-semibold mb-2">No Subjects Found</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    {searchTerm || selectedCategory !== 'all' 
                      ? 'No subjects match your current filters'
                      : 'This admin has no subjects yet'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
      </ViewTabs>
    </div>
  );
};

export default SuperAdminSubjectManagement;
