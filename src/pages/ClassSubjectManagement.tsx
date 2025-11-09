import { useState, useEffect } from 'react';
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
  AlertCircle
} from 'lucide-react';
import { 
  classManagementAPI, 
  subjectManagementAPI,
  Class, 
  Subject,
  CreateClassRequest,
  CreateSubjectRequest,
  UpdateClassRequest,
  UpdateSubjectRequest
} from '@/services/api';
import ReferenceBookManager from '@/components/ReferenceBookManager';
import ClassSectionSelector from '@/components/ClassSectionSelector';

const ClassSubjectManagement = () => {
  const [activeTab, setActiveTab] = useState('classes');
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('all');
  
  // Dialog states
  const [showClassDialog, setShowClassDialog] = useState(false);
  const [showSubjectDialog, setShowSubjectDialog] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  
  // Form states
  const [classForm, setClassForm] = useState<CreateClassRequest>({
    name: '',
    displayName: '',
    level: 1,
    section: '',
    academicYear: '2024-25',
    description: ''
  });
  
  const [subjectForm, setSubjectForm] = useState<CreateSubjectRequest>({
    code: '',
    name: '',
    shortName: '',
    category: 'SCIENCE',
    classIds: [],
    description: '',
    color: '#3B82F6'
  });

  // Validation states
  const [subjectCodeError, setSubjectCodeError] = useState<string | null>(null);
  
  const { toast } = useToast();

  // Validation functions
  const validateSubjectCode = (code: string) => {
    if (!code.trim()) {
      setSubjectCodeError('Subject code is required');
      return false;
    }
    if (code !== code.toUpperCase()) {
      setSubjectCodeError('Subject code must be in uppercase letters');
      return false;
    }
    if (!/^[A-Z0-9_]+$/.test(code)) {
      setSubjectCodeError('Subject code can only contain uppercase letters, numbers, and underscores');
      return false;
    }
    setSubjectCodeError(null);
    return true;
  };

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Reload data when filters change
  useEffect(() => {
    loadData();
  }, [searchTerm, selectedLevel, selectedCategory, selectedAcademicYear]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await Promise.all([
        loadClasses(),
        loadSubjects()
      ]);
      
      } catch (error) {
      setError('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadClasses = async () => {
    try {
      const response = await classManagementAPI.getAll({
        search: searchTerm,
        level: selectedLevel !== 'all' ? parseInt(selectedLevel) : undefined,
        // academicYear filter is not supported by backend, so we'll filter on frontend
      });
      // Apply academicYear filter on frontend since backend doesn't support it
      let filteredClasses = response.classes || [];
      if (selectedAcademicYear !== 'all') {
        // Check if classes have academicYear field, if not, show all classes
        const hasAcademicYear = filteredClasses.some(cls => cls.academicYear !== undefined);
        if (hasAcademicYear) {
          filteredClasses = filteredClasses.filter(cls => cls.academicYear === selectedAcademicYear);
          } else {
          }
      }
      
      setClasses(filteredClasses);
      } catch (error) {
      setClasses([]);
    }
  };

  const loadSubjects = async () => {
    try {
      const response = await subjectManagementAPI.getAll({
        search: searchTerm,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        level: selectedLevel !== 'all' ? parseInt(selectedLevel) : undefined,
      });
      const subjectsData = response.subjects || [];
      setSubjects(subjectsData);
    } catch (error) {
      setSubjects([]);
    }
  };

  // Class management functions
  const handleCreateClass = async () => {
    try {
      setIsLoading(true);
      const newClass = await classManagementAPI.create(classForm);
      setClasses(prev => [newClass, ...prev]);
      setShowClassDialog(false);
      resetClassForm();
      toast({
        title: "Class Created",
        description: "Class has been successfully created",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create class",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateClass = async () => {
    if (!editingClass) return;
    
    try {
      setIsLoading(true);
      const updatedClass = await classManagementAPI.update(editingClass._id, classForm);
      setClasses(prev => prev.map(c => c._id === editingClass._id ? updatedClass : c));
      setShowClassDialog(false);
      setEditingClass(null);
      resetClassForm();
      toast({
        title: "Class Updated",
        description: "Class has been successfully updated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update class",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClass = async (id: string) => {
    try {
      await classManagementAPI.delete(id);
        setClasses(prev => prev.filter(c => c._id !== id));
      toast({
        title: "Class Deleted",
        description: "Class has been successfully deleted",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete class",
        variant: "destructive",
      });
    }
  };

  const handleEditClass = (cls: Class) => {
    setEditingClass(cls);
    setClassForm({
      name: cls.name,
      displayName: cls.displayName,
      level: cls.level,
      section: cls.section,
      academicYear: cls.academicYear,
      description: cls.description || ''
    });
    setShowClassDialog(true);
  };

  const resetClassForm = () => {
    setClassForm({
      name: '',
      displayName: '',
      level: 0,
      section: '',
      academicYear: '2024-25',
      description: ''
    });
    setEditingClass(null);
  };

  // Subject management functions
  const handleCreateSubject = async () => {
    if (classes.length === 0) {
      toast({
        title: "Setup Required",
        description: "Please create classes first before creating subjects.",
        variant: "destructive",
      });
      return;
    }

    if (subjectForm.classIds.length === 0) {
      toast({
        title: "Class Selection Required",
        description: "Please select at least one class for this subject.",
        variant: "destructive",
      });
      return;
    }

    // Validate subject code
    if (!validateSubjectCode(subjectForm.code)) {
      toast({
        title: "Validation Error",
        description: subjectCodeError || "Please fix the subject code format.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const newSubject = await subjectManagementAPI.create(subjectForm);
      setSubjects(prev => [newSubject, ...prev]);
      setShowSubjectDialog(false);
      resetSubjectForm();
      toast({
        title: "Subject Created",
        description: "Subject has been successfully created",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create subject",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSubject = async () => {
    if (!editingSubject) return;
    
    try {
      setIsLoading(true);
      const updatedSubject = await subjectManagementAPI.update(editingSubject._id, subjectForm);
      setSubjects(prev => prev.map(s => s._id === editingSubject._id ? updatedSubject : s));
      setShowSubjectDialog(false);
      setEditingSubject(null);
      resetSubjectForm();
      toast({
        title: "Subject Updated",
        description: "Subject has been successfully updated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update subject",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSubject = async (id: string) => {
    try {
      await subjectManagementAPI.delete(id);
      setSubjects(prev => prev.filter(s => s._id !== id));
      toast({
        title: "Subject Deleted",
        description: "Subject has been successfully deleted",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete subject",
        variant: "destructive",
      });
    }
  };

  const handleEditSubject = (subject: Subject) => {
    setEditingSubject(subject);
    
    setSubjectForm({
      code: subject.code,
      name: subject.name,
      shortName: subject.shortName,
      category: subject.category as 'SCIENCE' | 'MATHEMATICS' | 'ENGLISH' | 'HINDI' | 'LANGUAGES' | 'SOCIAL_SCIENCES' | 'HISTORY' | 'GEOGRAPHY' | 'CIVICS' | 'ECONOMICS' | 'COMMERCE' | 'ACCOUNTANCY' | 'BUSINESS_STUDIES' | 'ARTS' | 'PHYSICAL_EDUCATION' | 'COMPUTER_SCIENCE' | 'INFORMATION_TECHNOLOGY' | 'OTHER',
      classIds: subject.classIds, // Now classIds is always an array of strings
      description: subject.description || '',
      color: subject.color || '#3B82F6'
    });
    setShowSubjectDialog(true);
  };

  const handleSubjectDialogOpen = () => {
    if (classes.length === 0) {
      toast({
        title: "Setup Required",
        description: "Please create classes first before creating subjects.",
        variant: "destructive",
      });
      return;
    }
    setShowSubjectDialog(true);
  };

  const resetSubjectForm = () => {
    setSubjectForm({
      code: '',
      name: '',
      shortName: '',
      category: 'SCIENCE',
      classIds: [],
      description: '',
      color: '#3B82F6'
    });
    setEditingSubject(null);
    setSubjectCodeError(null);
  };
// Backend filtering is now handled in loadClasses function
  // No need for frontend filtering since we're using backend filters

  // Backend filtering is now handled in loadSubjects function
  // No need for frontend filtering since we're using backend filters

  const getCategoryBadge = (category: string) => {
    const colors = {
      SCIENCE: 'bg-blue-100 text-blue-800',
      MATHEMATICS: 'bg-green-100 text-green-800',
      ENGLISH: 'bg-purple-100 text-purple-800',
      HINDI: 'bg-orange-100 text-orange-800',
      LANGUAGES: 'bg-purple-100 text-purple-800',
      SOCIAL_SCIENCES: 'bg-yellow-100 text-yellow-800',
      HISTORY: 'bg-amber-100 text-amber-800',
      GEOGRAPHY: 'bg-emerald-100 text-emerald-800',
      CIVICS: 'bg-teal-100 text-teal-800',
      ECONOMICS: 'bg-cyan-100 text-cyan-800',
      COMMERCE: 'bg-indigo-100 text-indigo-800',
      ACCOUNTANCY: 'bg-violet-100 text-violet-800',
      BUSINESS_STUDIES: 'bg-fuchsia-100 text-fuchsia-800',
      ARTS: 'bg-pink-100 text-pink-800',
      PHYSICAL_EDUCATION: 'bg-red-100 text-red-800',
      COMPUTER_SCIENCE: 'bg-slate-100 text-slate-800',
      INFORMATION_TECHNOLOGY: 'bg-gray-100 text-gray-800',
      OTHER: 'bg-gray-100 text-gray-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-100 text-green-800 border-green-200">
        <CheckCircle className="w-3 h-3 mr-1" />
        Active
      </Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-800 border-gray-200">
        <AlertCircle className="w-3 h-3 mr-1" />
        Inactive
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <GraduationCap className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Class & Subject Management</h1>
          </div>
          <p className="text-muted-foreground">
            Manage classes and subjects for your educational institution
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search classes or subjects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Level</Label>
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(level => (
                    <SelectItem key={level} value={level.toString()}>
                      Level {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="SCIENCE">Science</SelectItem>
                  <SelectItem value="MATHEMATICS">Mathematics</SelectItem>
                  <SelectItem value="ENGLISH">English</SelectItem>
                  <SelectItem value="HINDI">Hindi</SelectItem>
                  <SelectItem value="LANGUAGES">Languages</SelectItem>
                  <SelectItem value="SOCIAL_SCIENCES">Social Sciences</SelectItem>
                  <SelectItem value="HISTORY">History</SelectItem>
                  <SelectItem value="GEOGRAPHY">Geography</SelectItem>
                  <SelectItem value="CIVICS">Civics</SelectItem>
                  <SelectItem value="ECONOMICS">Economics</SelectItem>
                  <SelectItem value="COMMERCE">Commerce</SelectItem>
                  <SelectItem value="ACCOUNTANCY">Accountancy</SelectItem>
                  <SelectItem value="BUSINESS_STUDIES">Business Studies</SelectItem>
                  <SelectItem value="ARTS">Arts</SelectItem>
                  <SelectItem value="PHYSICAL_EDUCATION">Physical Education</SelectItem>
                  <SelectItem value="COMPUTER_SCIENCE">Computer Science</SelectItem>
                  <SelectItem value="INFORMATION_TECHNOLOGY">Information Technology</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span>Loading data...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-4 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              <span>{error}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={loadData}
                disabled={isLoading}
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      {!isLoading && !error && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="classes" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Classes ({classes?.length})</span>
            </TabsTrigger>
            <TabsTrigger value="subjects" className="flex items-center space-x-2">
              <Book className="w-4 h-4" />
              <span>Subjects ({subjects?.length})</span>
            </TabsTrigger>
          </TabsList>

          {/* Classes Tab */}
          <TabsContent value="classes" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Classes</h2>
              <Button onClick={() => setShowClassDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Class
              </Button>
            </div>

            {classes?.length === 0 ? (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-center space-x-4 text-muted-foreground">
                    <Users className="w-5 h-5" />
                    <span>No classes found. Create your first class!</span>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                {classes?.map((cls) => (
                  <Card key={cls.id} className="border-l-4 border-l-primary w-full">
                    <CardContent className="p-4 sm:p-6">
                      <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                          <div className="space-y-2 flex-1">
                            <h3 className="text-lg font-semibold truncate">{cls.displayName}</h3>
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="outline" className="text-xs">Name: {cls.name}</Badge>
                              <Badge variant="outline" className="text-xs">Level: {cls.level}</Badge>
                              <Badge variant="outline" className="text-xs">Section: {cls.section}</Badge>
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            {getStatusBadge(cls.isActive)}
                          </div>
                        </div>
                        
                        {cls.description && (
                          <p className="text-sm text-muted-foreground break-words">Description: {cls.description}</p>
                        )}
                        
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 pt-4 border-t">
                          <div className="text-sm text-muted-foreground">
                            CreatedAt: {new Date(cls.createdAt).toLocaleDateString()}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditClass(cls)}
                              className="flex-1 sm:flex-none"
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              <span className="sm:hidden">Edit</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteClass(cls._id)}
                              className="text-destructive hover:text-destructive flex-1 sm:flex-none"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              <span className="sm:hidden">Delete</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Subjects Tab */}
          <TabsContent value="subjects" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Subjects</h2>
              <Button 
                onClick={handleSubjectDialogOpen}
                className={classes.length === 0 ? "opacity-60" : ""}
                title={classes.length === 0 ? "Create classes first" : ""}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Subject
                {classes.length === 0 && (
                  <AlertTriangle className="w-4 h-4 ml-2 text-amber-500" />
                )}
              </Button>
            </div>

            {subjects?.length === 0 ? (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-center space-x-4 text-muted-foreground">
                    <Book className="w-5 h-5" />
                    <span>No subjects found. Create your first subject!</span>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                {subjects?.map((subject) => (
                  <Card key={subject.id} className="border-l-4 border-l-primary w-full">
                    <CardContent className="p-4 sm:p-6">
                      <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                          <div className="space-y-2 flex-1">
                            <h3 className="text-lg font-semibold truncate">Name: {subject.name}</h3>
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="outline" className="text-xs">Code: {subject.code}</Badge>
                              <Badge className={`${getCategoryBadge(subject.category)} text-xs`}>
                                Category: {subject.category}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            {getStatusBadge(subject.isActive)}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Tag className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Short Name: {subject.shortName}</span>
                          </div>
                          <div className="flex items-start space-x-2">
                            <Hash className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <span className="text-sm text-muted-foreground block">
                                Classes: {subject.classes && subject.classes.length > 0 ? 
                                  subject.classes.map((classData: any) => classData.displayName).join(', ') : 
                                  subject.classIds && subject.classIds.length > 0 ? 
                                    subject.classIds.map((classData: any) => {
                                      // Handle both populated class objects and class IDs
                                      if (typeof classData === 'object' && classData.displayName) {
                                        return classData.displayName;
                                      } else {
                                        const cls = classes.find(c => c._id === classData);
                                        return cls ? cls.displayName : 'Unknown';
                                      }
                                    }).join(', ') : 'No classes assigned'
                                }
                              </span>
                            </div>
                          </div>
                          {subject.color && (
                            <div className="flex items-center space-x-2">
                              <div 
                                className="w-4 h-4 rounded border"
                                style={{ backgroundColor: subject.color }}
                              />
                              <span className="text-sm text-muted-foreground">{subject.color}</span>
                            </div>
                          )}
                        </div>
                        
                        {subject.description && (
                          <p className="text-sm text-muted-foreground break-words">Description: {subject.description}</p>
                        )}
                        
                        {/* Reference Book Section */}
                        <div className="pt-3 border-t">
                          <ReferenceBookManager
                            subjectId={subject._id}
                            referenceBook={subject.referenceBook}
                            onUpdate={loadSubjects}
                          />
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 pt-4 border-t">
                          <div className="text-sm text-muted-foreground">
                            CreatedAt: {new Date(subject.createdAt).toLocaleDateString()}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditSubject(subject)}
                              className="flex-1 sm:flex-none"
                            > 
                              <Edit className="w-4 h-4 mr-1" />
                              <span className="sm:hidden">Edit</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteSubject(subject._id)}
                              className="text-destructive hover:text-destructive flex-1 sm:flex-none"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              <span className="sm:hidden">Delete</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Class Dialog */}
      <Dialog open={showClassDialog} onOpenChange={(open) => {
        setShowClassDialog(open);
        if (!open) resetClassForm();
      }}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              {editingClass ? 'Edit Class' : 'Create New Class'}
            </DialogTitle>
            <DialogDescription>
              {editingClass ? 'Update class information' : 'Add a new class to your institution'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Class Name *</Label>
                <Input
                  placeholder="e.g., 10A"
                  value={classForm.name}
                  onChange={(e) => setClassForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Display Name *</Label>
                <Input
                  placeholder="e.g., Class 10A"
                  value={classForm.displayName}
                  onChange={(e) => setClassForm(prev => ({ ...prev, displayName: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label>Level *</Label>
                <Select 
                  value={classForm.level.toString()} 
                  onValueChange={(value) => setClassForm(prev => ({ ...prev, level: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(level => (
                      <SelectItem key={level} value={level.toString()}>
                        Level {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Section *</Label>
                <Input
                  placeholder="e.g., A"
                  value={classForm.section}
                  onChange={(e) => setClassForm(prev => ({ ...prev, section: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Optional description for the class..."
                value={classForm.description}
                onChange={(e) => setClassForm(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowClassDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={editingClass ? handleUpdateClass : handleCreateClass}
                disabled={isLoading || !classForm.name || !classForm.displayName || !classForm.section}
              >
                {isLoading ? "Saving..." : editingClass ? "Update Class" : "Create Class"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Subject Dialog */}
      <Dialog open={showSubjectDialog} onOpenChange={(open) => {
        setShowSubjectDialog(open);
        if (!open) resetSubjectForm();
      }}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Book className="w-5 h-5 mr-2" />
              {editingSubject ? 'Edit Subject' : 'Create New Subject'}
            </DialogTitle>
            <DialogDescription>
              {editingSubject ? 'Update subject information' : 'Add a new subject to your institution'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 overflow-y-auto flex-1 pr-2">
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Subject Code *</Label>
                <Input
                  placeholder="e.g., MATH_10"
                  value={subjectForm.code}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase();
                    setSubjectForm(prev => ({ ...prev, code: value }));
                    validateSubjectCode(value);
                  }}
                  className={subjectCodeError ? "border-red-500" : ""}
                />
                {subjectCodeError && (
                  <p className="text-sm text-red-500">{subjectCodeError}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Subject Name *</Label>
                <Input
                  placeholder="e.g., Mathematics"
                  value={subjectForm.name}
                  onChange={(e) => setSubjectForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Short Name *</Label>
                <Input
                  placeholder="e.g., Math"
                  value={subjectForm.shortName}
                  onChange={(e) => setSubjectForm(prev => ({ ...prev, shortName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select 
                  value={subjectForm.category} 
                  onValueChange={(value) => setSubjectForm(prev => ({ ...prev, category: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SCIENCE">Science</SelectItem>
                    <SelectItem value="MATHEMATICS">Mathematics</SelectItem>
                    <SelectItem value="ENGLISH">English</SelectItem>
                    <SelectItem value="HINDI">Hindi</SelectItem>
                    <SelectItem value="LANGUAGES">Languages</SelectItem>
                    <SelectItem value="SOCIAL_SCIENCES">Social Sciences</SelectItem>
                    <SelectItem value="HISTORY">History</SelectItem>
                    <SelectItem value="GEOGRAPHY">Geography</SelectItem>
                    <SelectItem value="CIVICS">Civics</SelectItem>
                    <SelectItem value="ECONOMICS">Economics</SelectItem>
                    <SelectItem value="COMMERCE">Commerce</SelectItem>
                    <SelectItem value="ACCOUNTANCY">Accountancy</SelectItem>
                    <SelectItem value="BUSINESS_STUDIES">Business Studies</SelectItem>
                    <SelectItem value="ARTS">Arts</SelectItem>
                    <SelectItem value="PHYSICAL_EDUCATION">Physical Education</SelectItem>
                    <SelectItem value="COMPUTER_SCIENCE">Computer Science</SelectItem>
                    <SelectItem value="INFORMATION_TECHNOLOGY">Information Technology</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {classes.length === 0 ? (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-amber-800">
                  <AlertTriangle className="w-5 h-5" />
                  <div>
                    <p className="font-medium">No Classes Available</p>
                    <p className="text-sm">Please create classes first before creating subjects.</p>
                  </div>
                </div>
              </div>
            ) : (
              <ClassSectionSelector
                classes={classes}
                selectedClassIds={subjectForm.classIds}
                onSelectionChange={(classIds) => setSubjectForm(prev => ({ ...prev, classIds }))}
                mode="multiple"
                showLevelFirst={true}
                required={true}
                label="Select Classes for this Subject"
                description="Select one or more classes (sections) where this subject will be taught. You can filter by level and select specific sections."
              />
            )}

            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={subjectForm.color}
                    onChange={(e) => setSubjectForm(prev => ({ ...prev, color: e.target.value }))}
                    className="w-12 h-10 rounded border"
                  />
                  <Input
                    value={subjectForm.color}
                    onChange={(e) => setSubjectForm(prev => ({ ...prev, color: e.target.value }))}
                    placeholder="#3B82F6"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Optional description for the subject..."
                value={subjectForm.description}
                onChange={(e) => setSubjectForm(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t mt-4 flex-shrink-0">
            <Button
              variant="outline"
              onClick={() => setShowSubjectDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={editingSubject ? handleUpdateSubject : handleCreateSubject}
              disabled={isLoading || !subjectForm.code || !subjectForm.name || !subjectForm.shortName || subjectForm.classIds.length === 0 || classes.length === 0 || !!subjectCodeError}
            >
              {isLoading ? "Saving..." : editingSubject ? "Update Subject" : "Create Subject"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClassSubjectManagement;
