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
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Shield, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Save, 
  X, 
  CheckCircle, 
  AlertTriangle,
  GraduationCap,
  BookOpen,
  BarChart3,
  Printer,
  Send,
  Clock,
  UserCheck,
  Search,
  Filter,
  RefreshCw,
  Download
} from 'lucide-react';
import { teachersAPI, classManagementAPI, subjectManagementAPI } from '@/services/api';
import { accessPrivilegesAPI } from '@/services/accessPrivilegesAPI';

interface StaffAccess {
  _id: string;
  staffId: {
    _id: string;
    email: string;
    name: string;
    role: string;
  };
  assignedBy: {
    _id: string;
    email: string;
    name: string;
  };
  classAccess: Array<{
    classId: {
      _id: string;
      name: string;
    };
    className: string;
    accessLevel: 'READ_ONLY' | 'READ_WRITE' | 'FULL_ACCESS';
    canUploadSheets: boolean;
    canMarkAbsent: boolean;
    canMarkMissing: boolean;
    canOverrideAI: boolean;
  }>;
  subjectAccess: Array<{
    subjectId: {
      _id: string;
      code: string;
      name: string;
    };
    subjectName: string;
    accessLevel: 'READ_ONLY' | 'READ_WRITE' | 'FULL_ACCESS';
    canCreateQuestions: boolean;
    canUploadSyllabus: boolean;
  }>;
  globalPermissions: {
    canViewAllClasses: boolean;
    canViewAllSubjects: boolean;
    canAccessAnalytics: boolean;
    canPrintReports: boolean;
    canSendNotifications: boolean;
    canAccessQuestionPapers: boolean;
  };
  isActive: boolean;
  expiresAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface Teacher {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
}

interface Class {
  _id: string;
  name: string;
  displayName: string;
  level: number;
  section: string;
}

interface Subject {
  _id: string;
  name: string;
  code: string;
  category: string;
}

const AccessPrivileges = () => {
  
  const [staffAccessList, setStaffAccessList] = useState<StaffAccess[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingAccess, setEditingAccess] = useState<StaffAccess | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const { toast } = useToast();

  // Form state for creating/editing access
  const [accessForm, setAccessForm] = useState({
    staffId: '',
    classAccess: [] as Array<{
      classId: string;
      className: string;
      accessLevel: 'READ_ONLY' | 'READ_WRITE' | 'FULL_ACCESS';
      canUploadSheets: boolean;
      canMarkAbsent: boolean;
      canMarkMissing: boolean;
      canOverrideAI: boolean;
    }>,
    subjectAccess: [] as Array<{
      subjectId: string;
      subjectName: string;
      accessLevel: 'READ_ONLY' | 'READ_WRITE' | 'FULL_ACCESS';
      canCreateQuestions: boolean;
      canUploadSyllabus: boolean;
    }>,
    globalPermissions: {
      canViewAllClasses: false,
      canViewAllSubjects: false,
      canAccessAnalytics: false,
      canPrintReports: true,
      canSendNotifications: false,
      canAccessQuestionPapers: false,
    },
    expiresAt: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load teachers, classes, subjects, and existing access
      const [teachersResponse, classesResponse, subjectsResponse, staffAccessResponse] = await Promise.all([
        teachersAPI.getAll().catch(() => ({ teachers: [] })),
        classManagementAPI.getAll().catch(() => ({ classes: [] })),
        subjectManagementAPI.getAll().catch(() => ({ subjects: [] })),
        accessPrivilegesAPI.getAll().catch(() => ({ data: [] }))
      ]);

      setTeachers(teachersResponse.teachers || []);
      setClasses(classesResponse.classes || []);
      setSubjects(subjectsResponse.subjects || []);
      setStaffAccessList(staffAccessResponse.data || []);
    } catch (error) {
      // Set empty arrays as fallback to prevent blank screen
      setTeachers([]);
      setClasses([]);
      setSubjects([]);
      setStaffAccessList([]);
      toast({
        title: "Error",
        description: "Failed to load access privileges data. Using fallback data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAccess = async () => {
    if (!accessForm.staffId) {
      toast({
        title: "Error",
        description: "Please select a teacher",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await accessPrivilegesAPI.create({
        staffId: accessForm.staffId,
        classAccess: accessForm.classAccess,
        subjectAccess: accessForm.subjectAccess,
        globalPermissions: accessForm.globalPermissions,
        expiresAt: accessForm.expiresAt,
        notes: accessForm.notes
      });

      if (response.success) {
        setStaffAccessList(prev => [...prev, response.data]);
        setShowCreateDialog(false);
        resetForm();
        
        toast({
          title: "Success",
          description: "Access privileges created successfully",
        });
      } else {
        throw new Error('Failed to create access');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create access privileges",
        variant: "destructive",
      });
    }
  };

  const handleEditAccess = (access: StaffAccess) => {
    setEditingAccess(access);
    
    // Ensure classAccess and subjectAccess have proper structure
    const classAccess = access.classAccess.map(ca => ({
      classId: typeof ca.classId === 'string' ? ca.classId : ca.classId._id,
      className: ca.className || (typeof ca.classId === 'object' ? ca.classId.name : ''),
      accessLevel: ca.accessLevel,
      canUploadSheets: ca.canUploadSheets,
      canMarkAbsent: ca.canMarkAbsent,
      canMarkMissing: ca.canMarkMissing,
      canOverrideAI: ca.canOverrideAI
    }));
    
    const subjectAccess = access.subjectAccess.map(sa => ({
      subjectId: typeof sa.subjectId === 'string' ? sa.subjectId : sa.subjectId._id,
      subjectName: sa.subjectName || (typeof sa.subjectId === 'object' ? sa.subjectId.name : ''),
      accessLevel: sa.accessLevel,
      canCreateQuestions: sa.canCreateQuestions,
      canUploadSyllabus: sa.canUploadSyllabus
    }));
    
    setAccessForm({
      staffId: access.staffId._id,
      classAccess: classAccess,
      subjectAccess: subjectAccess,
      globalPermissions: {
        canViewAllClasses: access.globalPermissions?.canViewAllClasses ?? false,
        canViewAllSubjects: access.globalPermissions?.canViewAllSubjects ?? false,
        canAccessAnalytics: access.globalPermissions?.canAccessAnalytics ?? false,
        canPrintReports: access.globalPermissions?.canPrintReports ?? true,
        canSendNotifications: access.globalPermissions?.canSendNotifications ?? false,
        canAccessQuestionPapers: access.globalPermissions?.canAccessQuestionPapers ?? false,
      },
      expiresAt: access.expiresAt || '',
      notes: access.notes || ''
    });
    setShowEditDialog(true);
  };

  const handleUpdateAccess = async () => {
    if (!editingAccess) return;

    try {
      const response = await accessPrivilegesAPI.update(editingAccess._id, {
        classAccess: accessForm.classAccess,
        subjectAccess: accessForm.subjectAccess,
        globalPermissions: accessForm.globalPermissions,
        expiresAt: accessForm.expiresAt,
        notes: accessForm.notes
      });

      if (response.success) {
        setStaffAccessList(prev => 
          prev.map(access => access._id === editingAccess._id ? response.data : access)
        );
        setShowEditDialog(false);
        setEditingAccess(null);
        resetForm();
        
        toast({
          title: "Success",
          description: "Access privileges updated successfully",
        });
      } else {
        throw new Error('Failed to update access');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update access privileges",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccess = async (accessId: string) => {
    try {
      const response = await accessPrivilegesAPI.delete(accessId);
      
      if (response.success) {
        setStaffAccessList(prev => prev.filter(access => access._id !== accessId));
        toast({
          title: "Success",
          description: "Access privileges deleted successfully",
        });
      } else {
        throw new Error('Failed to delete access');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete access privileges",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setAccessForm({
      staffId: '',
      classAccess: [],
      subjectAccess: [],
      globalPermissions: {
        canViewAllClasses: false,
        canViewAllSubjects: false,
        canAccessAnalytics: false,
        canPrintReports: true,
        canSendNotifications: false,
        canAccessQuestionPapers: false,
      },
      expiresAt: '',
      notes: ''
    });
  };

  const addClassAccess = () => {
    setAccessForm(prev => ({
      ...prev,
      classAccess: [...prev.classAccess, {
        classId: '',
        className: '',
        accessLevel: 'READ_ONLY',
        canUploadSheets: false,
        canMarkAbsent: false,
        canMarkMissing: false,
        canOverrideAI: false
      }]
    }));
  };

  const addSubjectAccess = () => {
    setAccessForm(prev => ({
      ...prev,
      subjectAccess: [...prev.subjectAccess, {
        subjectId: '',
        subjectName: '',
        accessLevel: 'READ_ONLY',
        canCreateQuestions: false,
        canUploadSyllabus: false
      }]
    }));
  };

  const removeClassAccess = (index: number) => {
    setAccessForm(prev => ({
      ...prev,
      classAccess: prev.classAccess.filter((_, i) => i !== index)
    }));
  };

  const removeSubjectAccess = (index: number) => {
    setAccessForm(prev => ({
      ...prev,
      subjectAccess: prev.subjectAccess.filter((_, i) => i !== index)
    }));
  };

  const updateClassAccess = (index: number, field: string, value: any) => {
    setAccessForm(prev => ({
      ...prev,
      classAccess: prev.classAccess.map((access, i) => {
        if (i === index) {
          const updatedAccess = { ...access, [field]: value };
          // If classId is being updated, also update className
          if (field === 'classId') {
            const selectedClass = classes.find(cls => cls._id === value);
            if (selectedClass) {
              updatedAccess.className = selectedClass.displayName || selectedClass.name;
            }
          }
          return updatedAccess;
        }
        return access;
      })
    }));
  };

  const updateSubjectAccess = (index: number, field: string, value: any) => {
    setAccessForm(prev => ({
      ...prev,
      subjectAccess: prev.subjectAccess.map((access, i) => {
        if (i === index) {
          const updatedAccess = { ...access, [field]: value };
          // If subjectId is being updated, also update subjectName
          if (field === 'subjectId') {
            const selectedSubject = subjects.find(subject => subject._id === value);
            if (selectedSubject) {
              updatedAccess.subjectName = selectedSubject.name;
            }
          }
          return updatedAccess;
        }
        return access;
      })
    }));
  };

  const filteredAccess = staffAccessList.filter(access => {
    const matchesSearch = access.staffId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         access.staffId.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && access.isActive) ||
                         (filterStatus === 'inactive' && !access.isActive);
    return matchesSearch && matchesStatus;
  });

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case 'FULL_ACCESS': return 'text-green-600 bg-green-100';
      case 'READ_WRITE': return 'text-blue-600 bg-blue-100';
      case 'READ_ONLY': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading access privileges...</p>
        </div>
      </div>
    );
  }

  return (
      <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-accent" />
            <h1 className="text-2xl sm:text-3xl font-bold">Access Privileges</h1>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage teacher permissions and access control
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={loadData} className="w-full sm:w-auto">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowCreateDialog(true)} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Create Access
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search teachers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Access List */}
      <div className="space-y-4">
        {filteredAccess.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Access Privileges Found</h3>
              <p className="text-muted-foreground mb-4">
                {staffAccessList.length === 0 
                  ? "No access privileges have been created yet. Click 'Create Access' to get started."
                  : "No access privileges match your current filters."
                }
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Access
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredAccess.map((access) => (
          <Card key={access._id}>
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <CardTitle className="flex flex-wrap items-center gap-2">
                    <span className="truncate">{access.staffId.name}</span>
                    <Badge variant={access.isActive ? "default" : "secondary"} className="flex-shrink-0">
                      {access.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="truncate">{access.staffId.email}</CardDescription>
                </div>
                <div className="flex space-x-2 flex-shrink-0">
                  <Button variant="outline" size="sm" onClick={() => handleEditAccess(access)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDeleteAccess(access._id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="classes" className="w-full">
                <TabsList className="grid w-full grid-cols-3 h-auto">
                  <TabsTrigger value="classes" className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 min-w-0">
                    <span className="truncate">Class</span>
                    <span className="hidden sm:inline"> Access</span>
                  </TabsTrigger>
                  <TabsTrigger value="subjects" className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 min-w-0">
                    <span className="truncate">Subject</span>
                    <span className="hidden sm:inline"> Access</span>
                  </TabsTrigger>
                  <TabsTrigger value="permissions" className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 min-w-0">
                    Global
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="classes" className="space-y-4">
                  <div className="grid gap-4">
                    {access.classAccess.map((classAccess, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium">{classAccess.className}</h4>
                            <Badge className={getAccessLevelColor(classAccess.accessLevel)}>
                              {classAccess.accessLevel}
                            </Badge>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Checkbox checked={classAccess.canUploadSheets} disabled />
                              <Label className="text-sm">Can Upload Sheets</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox checked={classAccess.canMarkAbsent} disabled />
                              <Label className="text-sm">Can Mark Absent</Label>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Checkbox checked={classAccess.canMarkMissing} disabled />
                              <Label className="text-sm">Can Mark Missing</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox checked={classAccess.canOverrideAI} disabled />
                              <Label className="text-sm">Can Override AI</Label>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="subjects" className="space-y-4">
                  <div className="grid gap-4">
                    {access.subjectAccess.map((subjectAccess, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium">{subjectAccess.subjectName}</h4>
                            <Badge className={getAccessLevelColor(subjectAccess.accessLevel)}>
                              {subjectAccess.accessLevel}
                            </Badge>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox checked={subjectAccess.canCreateQuestions} disabled />
                            <Label className="text-sm">Can Create Questions</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox checked={subjectAccess.canUploadSyllabus} disabled />
                            <Label className="text-sm">Can Upload Syllabus</Label>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="permissions" className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox checked={access.globalPermissions.canViewAllClasses} disabled />
                      <Label className="text-sm">Can View All Classes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox checked={access.globalPermissions.canViewAllSubjects} disabled />
                      <Label className="text-sm">Can View All Subjects</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox checked={access.globalPermissions.canAccessAnalytics} disabled />
                      <Label className="text-sm">Can Access Analytics</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox checked={access.globalPermissions.canPrintReports} disabled />
                      <Label className="text-sm">Can Print Reports</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox checked={access.globalPermissions.canSendNotifications} disabled />
                      <Label className="text-sm">Can Send Notifications</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox checked={access.globalPermissions.canAccessQuestionPapers} disabled />
                      <Label className="text-sm">Can Access Question Papers</Label>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ))
        )}
      </div>

      {/* Create Access Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl md:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Access Privileges</DialogTitle>
            <DialogDescription>
              Set up access permissions for a teacher
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Select Teacher *</Label>
              <Select value={accessForm.staffId} onValueChange={(value) => setAccessForm(prev => ({ ...prev, staffId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a teacher" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.name} ({teacher.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <Label className="text-base sm:text-lg font-medium">Class Access</Label>
                <Button type="button" variant="outline" size="sm" onClick={addClassAccess} className="w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Class
                </Button>
              </div>
              {accessForm.classAccess.map((classAccess, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-4">
                  <div className="flex justify-between items-center gap-2">
                    <h4 className="font-medium text-sm sm:text-base">Class Access {index + 1}</h4>
                    <Button type="button" variant="outline" size="sm" onClick={() => removeClassAccess(index)} className="flex-shrink-0">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Class</Label>
                      <Select 
                        value={classAccess.classId} 
                        onValueChange={(value) => {
                          const selectedClass = classes.find(c => c._id === value);
                          updateClassAccess(index, 'classId', value);
                          updateClassAccess(index, 'className', selectedClass?.name || '');
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent>
                          {classes.map((cls) => (
                            <SelectItem key={cls._id} value={cls._id}>
                              {cls.displayName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Access Level</Label>
                      <Select 
                        value={classAccess.accessLevel} 
                        onValueChange={(value) => updateClassAccess(index, 'accessLevel', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="READ_ONLY">Read Only</SelectItem>
                          <SelectItem value="READ_WRITE">Read Write</SelectItem>
                          <SelectItem value="FULL_ACCESS">Full Access</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          checked={classAccess.canUploadSheets} 
                          onCheckedChange={(checked) => updateClassAccess(index, 'canUploadSheets', checked)}
                        />
                        <Label className="text-sm">Can Upload Sheets</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          checked={classAccess.canMarkAbsent} 
                          onCheckedChange={(checked) => updateClassAccess(index, 'canMarkAbsent', checked)}
                        />
                        <Label className="text-sm">Can Mark Absent</Label>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          checked={classAccess.canMarkMissing} 
                          onCheckedChange={(checked) => updateClassAccess(index, 'canMarkMissing', checked)}
                        />
                        <Label className="text-sm">Can Mark Missing</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          checked={classAccess.canOverrideAI} 
                          onCheckedChange={(checked) => updateClassAccess(index, 'canOverrideAI', checked)}
                        />
                        <Label className="text-sm">Can Override AI</Label>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <Label className="text-base sm:text-lg font-medium">Subject Access</Label>
                <Button type="button" variant="outline" size="sm" onClick={addSubjectAccess} className="w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Subject
                </Button>
              </div>
              {accessForm.subjectAccess.map((subjectAccess, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-4">
                  <div className="flex justify-between items-center gap-2">
                    <h4 className="font-medium text-sm sm:text-base">Subject Access {index + 1}</h4>
                    <Button type="button" variant="outline" size="sm" onClick={() => removeSubjectAccess(index)} className="flex-shrink-0">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Subject</Label>
                      <Select 
                        value={subjectAccess.subjectId} 
                        onValueChange={(value) => {
                          const selectedSubject = subjects.find(s => s._id === value);
                          updateSubjectAccess(index, 'subjectId', value);
                          updateSubjectAccess(index, 'subjectName', selectedSubject?.name || '');
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map((subject) => (
                            <SelectItem key={subject._id} value={subject._id}>
                              {subject.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Access Level</Label>
                      <Select 
                        value={subjectAccess.accessLevel} 
                        onValueChange={(value) => updateSubjectAccess(index, 'accessLevel', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="READ_ONLY">Read Only</SelectItem>
                          <SelectItem value="READ_WRITE">Read Write</SelectItem>
                          <SelectItem value="FULL_ACCESS">Full Access</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        checked={subjectAccess.canCreateQuestions} 
                        onCheckedChange={(checked) => updateSubjectAccess(index, 'canCreateQuestions', checked)}
                      />
                      <Label className="text-sm">Can Create Questions</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        checked={subjectAccess.canUploadSyllabus} 
                        onCheckedChange={(checked) => updateSubjectAccess(index, 'canUploadSyllabus', checked)}
                      />
                      <Label className="text-sm">Can Upload Syllabus</Label>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <Label className="text-base sm:text-lg font-medium">Global Permissions</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    checked={accessForm.globalPermissions.canViewAllClasses} 
                    onCheckedChange={(checked) => setAccessForm(prev => ({
                      ...prev,
                      globalPermissions: { ...prev.globalPermissions, canViewAllClasses: !!checked }
                    }))}
                  />
                  <Label className="text-sm">Can View All Classes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    checked={accessForm.globalPermissions.canViewAllSubjects} 
                    onCheckedChange={(checked) => setAccessForm(prev => ({
                      ...prev,
                      globalPermissions: { ...prev.globalPermissions, canViewAllSubjects: !!checked }
                    }))}
                  />
                  <Label className="text-sm">Can View All Subjects</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    checked={accessForm.globalPermissions.canAccessAnalytics} 
                    onCheckedChange={(checked) => setAccessForm(prev => ({
                      ...prev,
                      globalPermissions: { ...prev.globalPermissions, canAccessAnalytics: !!checked }
                    }))}
                  />
                  <Label className="text-sm">Can Access Analytics</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    checked={accessForm.globalPermissions.canPrintReports} 
                    onCheckedChange={(checked) => setAccessForm(prev => ({
                      ...prev,
                      globalPermissions: { ...prev.globalPermissions, canPrintReports: !!checked }
                    }))}
                  />
                  <Label className="text-sm">Can Print Reports</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={accessForm.globalPermissions.canSendNotifications}
                    onCheckedChange={(checked) => setAccessForm(prev => ({
                      ...prev,
                      globalPermissions: { ...prev.globalPermissions, canSendNotifications: !!checked }
                    }))}
                  />
                  <Label className="text-sm">Can Send Notifications</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={accessForm.globalPermissions?.canAccessQuestionPapers ?? false}
                    onCheckedChange={(checked) => setAccessForm(prev => ({
                      ...prev,
                      globalPermissions: { ...prev.globalPermissions, canAccessQuestionPapers: !!checked }
                    }))}
                  />
                  <Label className="text-sm">Can Access Question Papers</Label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Expiration Date (Optional)</Label>
                <Input
                  type="datetime-local"
                  value={accessForm.expiresAt}
                  onChange={(e) => setAccessForm(prev => ({ ...prev, expiresAt: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <Textarea
                placeholder="Add any notes about this access..."
                value={accessForm.notes}
                onChange={(e) => setAccessForm(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateAccess}>
                <Save className="w-4 h-4 mr-2" />
                Create Access
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Access Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl md:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Access Privileges</DialogTitle>
            <DialogDescription>
              Modify access permissions for {editingAccess?.staffId.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Teacher Selection (Read-only) */}
            <div className="space-y-2">
              <Label>Teacher</Label>
              <div className="p-3 bg-muted rounded-md">
                <div className="flex items-center space-x-2">
                  <UserCheck className="w-4 h-4" />
                  <span className="font-medium">{editingAccess?.staffId.name}</span>
                  <span className="text-muted-foreground">({editingAccess?.staffId.email})</span>
                </div>
              </div>
            </div>

            {/* Class Access */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <Label className="text-base sm:text-lg font-medium">Class Access</Label>
                <Button type="button" variant="outline" size="sm" onClick={addClassAccess} className="w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Class
                </Button>
              </div>
              {accessForm.classAccess.map((classAccess, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-4">
                  <div className="flex justify-between items-center gap-2">
                    <h4 className="font-medium text-sm sm:text-base">Class Access {index + 1}</h4>
                    <Button type="button" variant="outline" size="sm" onClick={() => removeClassAccess(index)} className="flex-shrink-0">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Class</Label>
                      <Select 
                        value={classAccess.classId} 
                        onValueChange={(value) => {
                          const selectedClass = classes.find(c => c._id === value);
                          updateClassAccess(index, 'classId', value);
                          updateClassAccess(index, 'className', selectedClass?.displayName || selectedClass?.name || '');
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a class" />
                        </SelectTrigger>
                        <SelectContent>
                          {classes.map((cls) => (
                            <SelectItem key={cls._id} value={cls._id}>
                              {cls.displayName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Access Level</Label>
                      <Select 
                        value={classAccess.accessLevel} 
                        onValueChange={(value) => updateClassAccess(index, 'accessLevel', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="READ_ONLY">Read Only</SelectItem>
                          <SelectItem value="READ_WRITE">Read & Write</SelectItem>
                          <SelectItem value="FULL_ACCESS">Full Access</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id={`upload-sheets-${index}`}
                          checked={classAccess.canUploadSheets}
                          onCheckedChange={(checked) => updateClassAccess(index, 'canUploadSheets', checked)}
                        />
                        <Label htmlFor={`upload-sheets-${index}`} className="text-sm">Can Upload Sheets</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id={`mark-absent-${index}`}
                          checked={classAccess.canMarkAbsent}
                          onCheckedChange={(checked) => updateClassAccess(index, 'canMarkAbsent', checked)}
                        />
                        <Label htmlFor={`mark-absent-${index}`} className="text-sm">Can Mark Absent</Label>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id={`mark-missing-${index}`}
                          checked={classAccess.canMarkMissing}
                          onCheckedChange={(checked) => updateClassAccess(index, 'canMarkMissing', checked)}
                        />
                        <Label htmlFor={`mark-missing-${index}`} className="text-sm">Can Mark Missing</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id={`override-ai-${index}`}
                          checked={classAccess.canOverrideAI}
                          onCheckedChange={(checked) => updateClassAccess(index, 'canOverrideAI', checked)}
                        />
                        <Label htmlFor={`override-ai-${index}`} className="text-sm">Can Override AI</Label>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Subject Access */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <Label className="text-base sm:text-lg font-medium">Subject Access</Label>
                <Button type="button" variant="outline" size="sm" onClick={addSubjectAccess} className="w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Subject
                </Button>
              </div>
              {accessForm.subjectAccess.map((subjectAccess, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-4">
                  <div className="flex justify-between items-center gap-2">
                    <h4 className="font-medium text-sm sm:text-base">Subject Access {index + 1}</h4>
                    <Button type="button" variant="outline" size="sm" onClick={() => removeSubjectAccess(index)} className="flex-shrink-0">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Subject</Label>
                      <Select 
                        value={subjectAccess.subjectId} 
                        onValueChange={(value) => {
                          const selectedSubject = subjects.find(s => s._id === value);
                          updateSubjectAccess(index, 'subjectId', value);
                          updateSubjectAccess(index, 'subjectName', selectedSubject?.name || '');
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a subject" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map((subject) => (
                            <SelectItem key={subject._id} value={subject._id}>
                              {subject.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Access Level</Label>
                      <Select 
                        value={subjectAccess.accessLevel} 
                        onValueChange={(value) => updateSubjectAccess(index, 'accessLevel', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="READ_ONLY">Read Only</SelectItem>
                          <SelectItem value="READ_WRITE">Read & Write</SelectItem>
                          <SelectItem value="FULL_ACCESS">Full Access</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id={`create-questions-${index}`}
                        checked={subjectAccess.canCreateQuestions}
                        onCheckedChange={(checked) => updateSubjectAccess(index, 'canCreateQuestions', checked)}
                      />
                      <Label htmlFor={`create-questions-${index}`} className="text-sm">Can Create Questions</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id={`upload-syllabus-${index}`}
                        checked={subjectAccess.canUploadSyllabus}
                        onCheckedChange={(checked) => updateSubjectAccess(index, 'canUploadSyllabus', checked)}
                      />
                      <Label htmlFor={`upload-syllabus-${index}`} className="text-sm">Can Upload Syllabus</Label>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Global Permissions */}
            <div className="space-y-4">
              <Label className="text-base sm:text-lg font-medium">Global Permissions</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="view-all-classes"
                      checked={accessForm.globalPermissions.canViewAllClasses}
                      onCheckedChange={(checked) => setAccessForm(prev => ({
                        ...prev,
                        globalPermissions: { ...prev.globalPermissions, canViewAllClasses: !!checked }
                      }))}
                    />
                    <Label htmlFor="view-all-classes">View All Classes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="view-all-subjects"
                      checked={accessForm.globalPermissions.canViewAllSubjects}
                      onCheckedChange={(checked) => setAccessForm(prev => ({
                        ...prev,
                        globalPermissions: { ...prev.globalPermissions, canViewAllSubjects: !!checked }
                      }))}
                    />
                    <Label htmlFor="view-all-subjects">View All Subjects</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="access-analytics"
                      checked={accessForm.globalPermissions.canAccessAnalytics}
                      onCheckedChange={(checked) => setAccessForm(prev => ({
                        ...prev,
                        globalPermissions: { ...prev.globalPermissions, canAccessAnalytics: !!checked }
                      }))}
                    />
                    <Label htmlFor="access-analytics">Access Analytics</Label>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="print-reports"
                      checked={accessForm.globalPermissions.canPrintReports}
                      onCheckedChange={(checked) => setAccessForm(prev => ({
                        ...prev,
                        globalPermissions: { ...prev.globalPermissions, canPrintReports: !!checked }
                      }))}
                    />
                    <Label htmlFor="print-reports">Print Reports</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="send-notifications"
                      checked={accessForm.globalPermissions.canSendNotifications}
                      onCheckedChange={(checked) => setAccessForm(prev => ({
                        ...prev,
                        globalPermissions: { ...prev.globalPermissions, canSendNotifications: !!checked }
                      }))}
                    />
                    <Label htmlFor="send-notifications">Send Notifications</Label>
                  </div>
                </div>
              </div>
            </div>

            {/* Expiration and Notes */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiresAt">Expiration Date (Optional)</Label>
                <Input
                  id="expiresAt"
                  type="date"
                  value={accessForm.expiresAt}
                  onChange={(e) => setAccessForm(prev => ({ ...prev, expiresAt: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional notes..."
                  value={accessForm.notes}
                  onChange={(e) => setAccessForm(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateAccess}>
                <Save className="w-4 h-4 mr-2" />
                Update Access
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
    );
};

export default AccessPrivileges;
