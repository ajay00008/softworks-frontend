import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { teachersAPI, Teacher, subjectsAPI, classesAPI, Subject, Class } from "@/services/api";
import { Pagination } from "@/components/ui/pagination";
import {
  Plus,
  GraduationCap,
  Search,
  Edit,
  Trash2,
  UserCheck,
  Users,
  BookOpen,
} from "lucide-react";

const Teachers = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editTeacher, setEditTeacher] = useState<Teacher | null>(null);
  const [showAssignment, setShowAssignment] = useState(false);
  const [assigningTeacher, setAssigningTeacher] = useState<Teacher | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
    address: "",
    qualification: "",
    experience: 0,
  });

  // Assignment form state for create teacher
  const [createFormAssignments, setCreateFormAssignments] = useState({
    selectedSubjects: [] as string[],
    selectedClasses: [] as string[],
  });

  useEffect(() => {
    loadTeachers();
    loadSubjects();
    loadClasses();
  }, []);

  const loadTeachers = async () => {
    try {
      const response = await teachersAPI.getAll();
      console.log('Teachers API response:', response);
      console.log('Teachers data:', response.teachers);
      
      // Log each teacher's assignments
      response.teachers.forEach((teacher, index) => {
        console.log(`Teacher ${index + 1} (${teacher.name}):`, {
          id: teacher.id,
          subjects: teacher.subjects,
          classes: teacher.classes,
          subjectIds: teacher.subjectIds,
          classIds: teacher.classIds
        });
      });
      
      setTeachers(response.teachers);
    } catch (error) {
      console.error('Error loading teachers:', error);
      toast({
        title: "Error",
        description: "Failed to load teachers",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadSubjects = async () => {
    try {
      const response = await subjectsAPI.getAll();
      setSubjects(response);
    } catch (error) {
      console.error('Error loading subjects:', error);
    }
  };

  const loadClasses = async () => {
    try {
      const response = await classesAPI.getAll();
      // Convert ClassMapping to Class format
      const classData = response.map((cls: any) => ({
        id: cls.classId,
        name: cls.className,
        displayName: cls.className,
        level: 1,
        section: '',
        academicYear: '2024-25',
        isActive: cls.isActive || true,
        createdAt: cls.createdAt || new Date().toISOString(),
        updatedAt: cls.updatedAt || new Date().toISOString()
      }));
      setClasses(classData);
    } catch (error) {
      console.error('Error loading classes:', error);
    }
  };

  const handleEditClick = (teacher: Teacher) => {
    setEditTeacher(teacher);
    const formDataToSet = {
      email: teacher.email || "",
      password: "",
      name: teacher.name || "",
      phone: teacher.phone || "",
      address: teacher.address || "",
      qualification: teacher.qualification || "",
      experience: teacher.experience || 0,
    };
    
    setFormData(formDataToSet);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editTeacher) {
        // Prepare update data - only include fields that have values
        const updateData: any = {
          email: formData.email,
          name: formData.name,
          isActive: editTeacher.isActive,
        };

        // Only include phone if it has a value
        if (formData.phone && formData.phone.trim()) {
          updateData.phone = formData.phone;
        }

        // Only include address if it has a value
        if (formData.address && formData.address.trim()) {
          updateData.address = formData.address;
        }

        // Only include qualification if it has a value
        if (formData.qualification && formData.qualification.trim()) {
          updateData.qualification = formData.qualification;
        }

        // Only include experience if it has a value
        if (formData.experience && formData.experience > 0) {
          updateData.experience = formData.experience;
        }


        // Update API
        const updatedTeacher = await teachersAPI.update(editTeacher.id, updateData);

        setTeachers(
          teachers.map((t) =>
            t.id === editTeacher.id ? { ...t, ...updatedTeacher.teacher } : t
          )
        );

        toast({
          title: "Success",
          description: "Teacher updated successfully",
        });
      } else {
        // Create API with assignments
        const createPayload = {
          ...formData,
          subjectIds: createFormAssignments.selectedSubjects,
          classIds: createFormAssignments.selectedClasses,
          isActive: true,
          _id: "" as any,
        };
        
        console.log('Creating teacher with payload:', createPayload);
        console.log('Selected subjects:', createFormAssignments.selectedSubjects);
        console.log('Selected classes:', createFormAssignments.selectedClasses);
        console.log('Available subjects:', subjects.map(s => ({ id: s._id, name: s.name })));
        console.log('Available classes:', classes.map(c => ({ id: c.id, name: c.name })));
        
        // Check if class IDs look like valid ObjectIds (24 hex characters)
        const isValidObjectId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);
        const validClassIds = createFormAssignments.selectedClasses.filter(id => isValidObjectId(id));
        console.log('Valid class IDs:', validClassIds);
        console.log('Invalid class IDs:', createFormAssignments.selectedClasses.filter(id => !isValidObjectId(id)));
        
        const newTeacher = await teachersAPI.create(createPayload as any);
        
        console.log('Backend response:', newTeacher.teacher);

        // Always reload teachers to get the complete data with assignments
        await loadTeachers();

        const assignmentCount = createFormAssignments.selectedSubjects.length + createFormAssignments.selectedClasses.length;
        const assignmentText = assignmentCount > 0 
          ? ` with ${assignmentCount} assignment${assignmentCount > 1 ? 's' : ''}`
          : '';

        toast({
          title: "Success",
          description: `Teacher created successfully${assignmentText}`,
        });
      }

      resetForm();
      setEditTeacher(null);
      setShowForm(false);
    } catch (error) {
      toast({
        title: "Error",
        description: editTeacher
          ? "Failed to update teacher"
          : "Failed to create teacher",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (teacher: Teacher) => {
    setTeacherToDelete(teacher);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!teacherToDelete) return;
    
    try {
      await teachersAPI.delete(teacherToDelete.id);
      setTeachers(teachers.filter((t) => t.id !== teacherToDelete.id));
      toast({
        title: "Success",
        description: "Teacher removed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove teacher",
        variant: "destructive",
      });
    } finally {
      setShowDeleteModal(false);
      setTeacherToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setTeacherToDelete(null);
  };

  const handleAssignmentClick = (teacher: Teacher) => {
    setAssigningTeacher(teacher);
    
    // Handle different possible data structures
    const subjectIds = teacher.subjectIds || teacher.subjects?.map(s => s.id) || [];
    
    // Try different class data structures
    let classIds = teacher.classIds || teacher.classes.map(c => c.id);
    if (!classIds.length && teacher.classes) {
      // Try different possible class ID fields
      classIds = teacher.classes.map(c => c.classId).filter(Boolean);
    }
    
    setSelectedSubjects(subjectIds);
    setSelectedClasses(classIds);
    setShowAssignment(true);
  };

  const handleSubjectToggle = (subjectId: string) => {
    setSelectedSubjects(prev => 
      prev.includes(subjectId) 
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const handleClassToggle = (classId: string) => {
    setSelectedClasses(prev => 
      prev.includes(classId) 
        ? prev.filter(id => id !== classId)
        : [...prev, classId]
    );
  };

  // Create form assignment handlers
  const handleCreateSubjectToggle = (subjectId: string) => {
    setCreateFormAssignments(prev => ({
      ...prev,
      selectedSubjects: prev.selectedSubjects.includes(subjectId)
        ? prev.selectedSubjects.filter(id => id !== subjectId)
        : [...prev.selectedSubjects, subjectId]
    }));
  };

  const handleCreateClassToggle = (classId: string) => {
    setCreateFormAssignments(prev => ({
      ...prev,
      selectedClasses: prev.selectedClasses.includes(classId)
        ? prev.selectedClasses.filter(id => id !== classId)
        : [...prev.selectedClasses, classId]
    }));
  };

  const handleAssignmentSubmit = async () => {
    if (!assigningTeacher) return;
    
    setIsSubmitting(true);
    try {
      // Use the updateTeacher API to assign both subjects and classes
      await teachersAPI.update(assigningTeacher.id, {
        subjectIds: selectedSubjects,
        classIds: selectedClasses,
      });
      
      // Reload teachers to get updated data
      await loadTeachers();
      
      toast({
        title: "Success",
        description: "Assignments updated successfully",
      });
      
      setShowAssignment(false);
      setAssigningTeacher(null);
      setSelectedSubjects([]);
      setSelectedClasses([]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update assignments",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
      name: "",
      phone: "",
      address: "",
      qualification: "",
      experience: 0,
    });
    setCreateFormAssignments({
      selectedSubjects: [],
      selectedClasses: [],
    });
  };

  const filteredTeachers = teachers.filter(
    (teacher) =>
      teacher?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTeachers = filteredTeachers.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return <p>Loading teachers...</p>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <GraduationCap className="w-8 h-8 text-accent" />
            <h1 className="text-3xl font-bold">Teacher Management</h1>
          </div>
          <p className="text-muted-foreground">Add and manage teaching staff</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setEditTeacher(null);
            setShowForm(true);
          }}
          className="bg-accent hover:bg-accent/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Teacher
        </Button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <Card className="border-accent/20 bg-accent/5">
          <CardHeader>
            <CardTitle className="flex items-center">
              <GraduationCap className="w-5 h-5 mr-2 text-accent" />
              {editTeacher ? "Edit Teacher" : "Create New Teacher"}
            </CardTitle>
            <CardDescription>
              {editTeacher
                ? "Update the teacher details"
                : "Enter teacher details"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* email + password */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>
                {!editTeacher && (
                  <div>
                    <Label>Password *</Label>
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      required
                    />
                  </div>
                )}
              </div>

              {/* name */}
              <div>
                <Label>Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>

              {/* phone + experience */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Experience (years)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.experience}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d*$/.test(value)) {
                        // allow only digits
                        setFormData({ ...formData, experience: Number(value) });
                      }
                    }}
                  />
                </div>
              </div>

              {/* qualification */}
              <div>
                <Label>Qualification</Label>
                <Input
                  value={formData.qualification}
                  onChange={(e) =>
                    setFormData({ ...formData, qualification: e.target.value })
                  }
                />
              </div>

              {/* address */}
              <div>
                <Label>Address</Label>
                <Input
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              </div>

              {/* Assignment Section - Only show for create, not edit */}
              {!editTeacher && (
                <>
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Users className="w-5 h-5 mr-2 text-blue-600" />
                      Assign Subjects & Classes (Optional)
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      You can assign subjects and classes now, or do it later from the teacher list.
                    </p>
                  </div>

                  {/* Subjects Assignment */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium flex items-center">
                      <BookOpen className="w-4 h-4 mr-2 text-green-600" />
                      Assign Subjects
                    </Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-y-auto border rounded-lg p-3 bg-gray-50 dark:bg-gray-800/50">
                      {subjects.length === 0 ? (
                        <p className="text-sm text-gray-500 col-span-full text-center py-4">No subjects available</p>
                      ) : (
                        subjects.map((subject) => (
                          <div key={subject._id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`create-subject-${subject._id}`}
                              checked={createFormAssignments.selectedSubjects.includes(subject._id)}
                              onCheckedChange={() => handleCreateSubjectToggle(subject._id)}
                            />
                            <Label
                              htmlFor={`create-subject-${subject._id}`}
                              className="text-sm font-normal cursor-pointer"
                            >
                              {subject.name}
                            </Label>
                          </div>
                        ))
                      )}
                    </div>
                    {createFormAssignments.selectedSubjects.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        <span className="text-xs text-muted-foreground">Selected:</span>
                        {createFormAssignments.selectedSubjects.map(id => {
                          const subject = subjects.find(s => s._id === id);
                          return (
                            <Badge key={id} variant="secondary" className="text-xs">
                              {subject?.name || id}
                            </Badge>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Classes Assignment */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium flex items-center">
                      <Users className="w-4 h-4 mr-2 text-purple-600" />
                      Assign Classes
                    </Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-y-auto border rounded-lg p-3 bg-gray-50 dark:bg-gray-800/50">
                      {classes.length === 0 ? (
                        <p className="text-sm text-gray-500 col-span-full text-center py-4">No classes available</p>
                      ) : (
                        classes.map((cls) => (
                          <div key={cls.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`create-class-${cls.id}`}
                              checked={createFormAssignments.selectedClasses.includes(cls.id)}
                              onCheckedChange={() => handleCreateClassToggle(cls.id)}
                            />
                            <Label
                              htmlFor={`create-class-${cls.id}`}
                              className="text-sm font-normal cursor-pointer"
                            >
                              {cls.name}
                            </Label>
                          </div>
                        ))
                      )}
                    </div>
                    {createFormAssignments.selectedClasses.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        <span className="text-xs text-muted-foreground">Selected:</span>
                        {createFormAssignments.selectedClasses.map(id => {
                          const cls = classes.find(c => c.id === id);
                          return (
                            <Badge key={id} variant="outline" className="text-xs">
                              {cls?.name || id}
                            </Badge>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Assignment Summary */}
                  {(createFormAssignments.selectedSubjects.length > 0 || createFormAssignments.selectedClasses.length > 0) && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-lg border">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                        <Users className="w-4 h-4 mr-2 text-blue-600" />
                        Assignment Summary
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Subjects:</span>
                          <span className="ml-2 font-medium text-green-600">
                            {createFormAssignments.selectedSubjects.length > 0 
                              ? createFormAssignments.selectedSubjects.map(id => subjects.find(s => s._id === id)?.name).join(', ')
                              : 'None selected'
                            }
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Classes:</span>
                          <span className="ml-2 font-medium text-purple-600">
                            {createFormAssignments.selectedClasses.length > 0 
                              ? createFormAssignments.selectedClasses.map(id => classes.find(c => c.id === id)?.name).join(', ')
                              : 'None selected'
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* actions */}
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setEditTeacher(null);
                    setShowForm(false);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      {editTeacher ? "Updating..." : "Creating Teacher..."}
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      {editTeacher ? "Update Teacher" : "Create Teacher"}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Assignment Form */}
      {showAssignment && assigningTeacher && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto border-2 border-blue-200 bg-white dark:bg-gray-900 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-gray-900 dark:text-white">
                      Assign Subjects & Classes
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-300">
                      Configure assignments for <span className="font-semibold text-blue-600">{assigningTeacher.name}</span>
                    </CardDescription>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowAssignment(false);
                    setAssigningTeacher(null);
                    setSelectedSubjects([]);
                    setSelectedClasses([]);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="p-6">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Subjects Assignment */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-md">
                      <BookOpen className="w-4 h-4 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Subjects</h3>
                    <Badge variant="secondary" className="ml-auto">
                      {selectedSubjects.length} selected
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-3 bg-gray-50 dark:bg-gray-800/50">
                    {subjects.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">No subjects available</p>
                    ) : (
                      subjects.map((subject) => (
                        <div 
                          key={subject._id} 
                          className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 hover:bg-white dark:hover:bg-gray-700 cursor-pointer ${
                            selectedSubjects.includes(subject._id) 
                              ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' 
                              : 'hover:shadow-sm'
                          }`}
                          onClick={() => handleSubjectToggle(subject._id)}
                        >
                          <Checkbox
                            id={`subject-${subject._id}`}
                            checked={selectedSubjects.includes(subject._id)}
                            onCheckedChange={() => handleSubjectToggle(subject._id)}
                            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                          />
                          <div className="flex-1">
                            <Label
                              htmlFor={`subject-${subject._id}`}
                              className="text-sm font-medium cursor-pointer text-gray-900 dark:text-white"
                            >
                              {subject.name}
                            </Label>
                            {subject.code && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">Code: {subject.code}</p>
                            )}
                          </div>
                          {selectedSubjects.includes(subject._id) && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Classes Assignment */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-md">
                      <Users className="w-4 h-4 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Classes</h3>
                    <Badge variant="secondary" className="ml-auto">
                      {selectedClasses.length} selected
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-3 bg-gray-50 dark:bg-gray-800/50">
                    {classes.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">No classes available</p>
                    ) : (
                      classes.map((cls) => (
                        <div 
                          key={cls.id} 
                          className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 hover:bg-white dark:hover:bg-gray-700 cursor-pointer ${
                            selectedClasses.includes(cls.id) 
                              ? 'bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800' 
                              : 'hover:shadow-sm'
                          }`}
                          onClick={() => handleClassToggle(cls.id)}
                        >
                          <Checkbox
                            id={`class-${cls.id}`}
                            checked={selectedClasses.includes(cls.id)}
                            onCheckedChange={() => handleClassToggle(cls.id)}
                            className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                          />
                          <div className="flex-1">
                            <Label
                              htmlFor={`class-${cls.id}`}
                              className="text-sm font-medium cursor-pointer text-gray-900 dark:text-white"
                            >
                              {cls.displayName || cls.name}
                            </Label>
                            {cls.section && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">Section: {cls.section}</p>
                            )}
                          </div>
                          {selectedClasses.includes(cls.id) && (
                            <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-lg border">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Assignment Summary</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Subjects:</span>
                    <span className="ml-2 font-medium text-green-600">
                      {selectedSubjects.length > 0 
                        ? selectedSubjects.map(id => subjects.find(s => s._id === id)?.name).join(', ')
                        : 'None selected'
                      }
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Classes:</span>
                    <span className="ml-2 font-medium text-purple-600">
                      {selectedClasses.length > 0 
                        ? selectedClasses.map(id => classes.find(c => c.id === id)?.displayName || classes.find(c => c.id === id)?.name).join(', ')
                        : 'None selected'
                      }
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAssignment(false);
                    setAssigningTeacher(null);
                    setSelectedSubjects([]);
                    setSelectedClasses([]);
                  }}
                  className="px-6"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleAssignmentSubmit}
                  disabled={isSubmitting}
                  className="px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Users className="w-4 h-4 mr-2" />
                      Update Assignments
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && teacherToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md border-2 border-red-200 bg-white dark:bg-gray-900 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 border-b">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <CardTitle className="text-xl text-gray-900 dark:text-white">
                    Delete Teacher
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300">
                    This action cannot be undone
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {teacherToDelete.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {teacherToDelete.email}
                    </p>
                  </div>
                </div>
                
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <div className="w-5 h-5 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-red-600 text-xs font-bold">!</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-red-800 dark:text-red-200 mb-1">
                        Warning
                      </h4>
                      <p className="text-sm text-red-700 dark:text-red-300">
                        Are you sure you want to delete this teacher? This will permanently remove 
                        the teacher and all their assignments. This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Show assignments if any */}
                {(teacherToDelete.subjects?.length > 0 || teacherToDelete.classes?.length > 0) && (
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                      Current Assignments
                    </h4>
                    <div className="space-y-2">
                      {teacherToDelete.subjects?.length > 0 && (
                        <div>
                          <span className="text-sm text-yellow-700 dark:text-yellow-300">
                            Subjects: {teacherToDelete.subjects.map(s => s.name).join(', ')}
                          </span>
                        </div>
                      )}
                      {teacherToDelete.classes?.length > 0 && (
                        <div>
                          <span className="text-sm text-yellow-700 dark:text-yellow-300">
                            Classes: {teacherToDelete.classes.map(c => c.name).join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDeleteCancel}
                  className="px-6"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleDeleteConfirm}
                  disabled={isSubmitting}
                  className="px-6 bg-red-600 hover:bg-red-700 text-white"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Teacher
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Teachers list */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Teaching Staff ({filteredTeachers.length})</h2>
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search teachers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
          </div>
        </div>

        {filteredTeachers.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <GraduationCap className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No teachers found</h3>
              <p className="text-muted-foreground">Try adjusting your search criteria</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {paginatedTeachers.map((teacher) => (
              <Card key={teacher.id} className="border-l-4 border-l-primary hover:shadow-lg transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-4 flex-1">
                      {/* Teacher Info */}
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <GraduationCap className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">{teacher.name}</h3>
                          <p className="text-sm text-muted-foreground">{teacher.email}</p>
                        </div>
                        <Badge variant={teacher.isActive ? "default" : "destructive"}>
                          {teacher.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>

                      {/* Assigned Classes */}
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Assigned Classes:</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {teacher.classes && teacher.classes.length > 0 ? (
                            teacher.classes.map((classItem, index) => (
                              <Badge key={index} className="bg-blue-100 text-blue-800 border-blue-200">
                                {classItem.name}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-sm text-muted-foreground italic">No classes assigned</span>
                          )}
                        </div>
                      </div>

                      {/* Assigned Subjects */}
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <BookOpen className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Assigned Subjects:</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {teacher.subjects && teacher.subjects.length > 0 ? (
                            teacher.subjects.map((subject, index) => (
                              <Badge key={index} className={` bg-${subject.color}-100 text-${subject.color}-800 border-${subject.color}-200 hover:text-white hover:bg-black`}>
                                {subject.name}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-sm text-muted-foreground italic">No subjects assigned</span>
                          )}
                        </div>
                      </div>

                      {/* Additional Info */}
                      {(teacher.phone || teacher.qualification || teacher.experience) && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t">
                          {teacher.phone && (
                            <div className="text-sm">
                              <span className="text-muted-foreground">Phone:</span>
                              <span className="ml-2 font-medium">{teacher.phone}</span>
                            </div>
                          )}
                          {teacher.qualification && (
                            <div className="text-sm">
                              <span className="text-muted-foreground">Qualification:</span>
                              <span className="ml-2 font-medium">{teacher.qualification}</span>
                            </div>
                          )}
                          {teacher.experience && teacher.experience > 0 && (
                            <div className="text-sm">
                              <span className="text-muted-foreground">Experience:</span>
                              <span className="ml-2 font-medium">{teacher.experience} years</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAssignmentClick(teacher)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Users className="w-4 h-4 mr-2" />
                        Assign
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditClick(teacher)}
                        className="hover:bg-gray-50"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteClick(teacher)}
                        className="text-destructive hover:text-destructive hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredTeachers.length >= 10 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            totalItems={filteredTeachers.length}
          />
        </div>
      )}
    </div>
  );
};

export default Teachers;
