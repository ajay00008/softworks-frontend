import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { studentsAPI, classesAPI, Student, ClassMapping } from '@/services/api';
import { Pagination } from '@/components/ui/pagination';
import { Plus, Users, Edit, Trash2, UserPlus } from 'lucide-react';

const Students = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const { toast } = useToast();

  const [classes, setClasses] = useState<ClassMapping[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    rollNumber: '',
    fatherName: '',
    motherName: '',
    dateOfBirth: '',
    parentsPhone: '',
    parentsEmail: '',
    address: '',
    whatsappNumber: ''
  });

  useEffect(() => {
    loadStudents();
    loadClasses();
  }, []);

  const loadStudents = async () => {
    try {
      const response = await studentsAPI.getAll();
      setStudents(response.students);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load students",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadClasses = async () => {
    try {
      const data = await classesAPI.getAll();
      setClasses(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load classes",
        variant: "destructive",
      });
    }
  };

  const handleEditClick = (student: Student) => {
    setEditStudent(student);
    setFormData({
      email: student.email,
      password: '',
      name: student.name,
      rollNumber: student.rollNumber || '',
      fatherName: student.fatherName || '',
      motherName: student.motherName || '',
      dateOfBirth: student.dateOfBirth || '',
      parentsPhone: student.parentsPhone || '',
      parentsEmail: student.parentsEmail || '',
      address: student.address || '',
      whatsappNumber: student.whatsappNumber || ''
    });
    setSelectedClassId(student.class?.id || '');
    setShowCreateForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        classId: selectedClassId,
        userId: '',
        student: {},
        class: [],
      };

      if (editStudent) {
        const updatedStudent = await studentsAPI.update(editStudent.id, {
          ...payload,
          isActive: editStudent.isActive,
        });

        setStudents(students.map(s =>
          s.id === editStudent.id ? { ...s, ...updatedStudent } : s
        ));

        toast({
          title: "Success",
          description: "Student updated successfully",
        });
      } else {
        const newStudent = await studentsAPI.create({
          ...payload,
          isActive: true,
        });

        setStudents([...students, newStudent]);

        toast({
          title: "Success",
          description: "Student created successfully",
        });
      }

      resetForm();
      setEditStudent(null);
      setShowCreateForm(false);

    } catch (error) {
      toast({
        title: "Error",
        description: editStudent ? "Failed to update student" : "Failed to create student",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (student: Student) => {
    setStudentToDelete(student);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!studentToDelete) return;
    
    try {
      await studentsAPI.delete(studentToDelete.id);
      setStudents(students.filter(s => s.id !== studentToDelete.id));
      toast({
        title: "Success",
        description: "Student deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete student",
        variant: "destructive",
      });
    } finally {
      setShowDeleteModal(false);
      setStudentToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setStudentToDelete(null);
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      name: '',
      rollNumber: '',
      fatherName: '',
      motherName: '',
      dateOfBirth: '',
      parentsPhone: '',
      parentsEmail: '',
      address: '',
      whatsappNumber: ''
    });
    setSelectedClassId('');
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedStudents = filteredStudents.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Student Management</h1>
        <p className="text-muted-foreground">Loading students...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Users className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Student Management</h1>
          </div>
          <p className="text-muted-foreground">
            Manage student information and enrollment
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setEditStudent(null);
            setShowCreateForm(true);
          }}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Student
        </Button>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserPlus className="w-5 h-5 mr-2 text-primary" />
              {editStudent ? "Edit Student" : "Create New Student"}
            </CardTitle>
            <CardDescription>
              {editStudent
                ? "Update the student details below"
                : "Enter the student details below to create a new enrollment"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* email + password */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
                {!editStudent && (
                  <div className="space-y-2">
                    <Label>Password *</Label>
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      required
                    />
                  </div>
                )}
              </div>

              {/* name + roll + class */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Roll Number</Label>
                  <Input
                    value={formData.rollNumber}
                    onChange={(e) => setFormData({...formData, rollNumber: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Class *</Label>
                  <select
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="">Select a class</option>
                    {classes.map((cls) => (
                      <option key={cls.classId} value={cls.classId}>
                        {cls.className}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* father + mother + DOB */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Father's Name</Label>
                  <Input
                    value={formData.fatherName}
                    onChange={(e) => setFormData({...formData, fatherName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Mother's Name</Label>
                  <Input
                    value={formData.motherName}
                    onChange={(e) => setFormData({...formData, motherName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <Input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                  />
                </div>
              </div>

              {/* parents contact */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Parents Phone</Label>
                  <Input
                    value={formData.parentsPhone}
                    onChange={(e) => setFormData({...formData, parentsPhone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Parents Email</Label>
                  <Input
                    type="email"
                    value={formData.parentsEmail}
                    onChange={(e) => setFormData({...formData, parentsEmail: e.target.value})}
                  />
                </div>
              </div>

              {/* whatsapp + address */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>WhatsApp Number</Label>
                  <Input
                    value={formData.whatsappNumber}
                    onChange={(e) => setFormData({...formData, whatsappNumber: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Textarea
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                </div>
              </div>

              {/* actions */}
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setEditStudent(null);
                    setShowCreateForm(false);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? (editStudent ? "Updating..." : "Creating...")
                    : (editStudent ? "Update Student" : "Create Student")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Students list */}
      <Card>
        <CardHeader>
          <CardTitle>Enrolled Students ({filteredStudents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredStudents.length === 0 ? (
            <p>No students found</p>
          ) : (
            <div className="grid gap-4">
              {paginatedStudents.map((student) => (
                <Card key={student.id} className="border-l-4 border-l-primary bg-card/50 dark:bg-card/80 dark:border-primary/50 hover:shadow-md transition-all duration-200">
                  <CardContent className="p-4">
                    <div className="flex justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center space-x-4">
                          <h3 className="font-semibold text-lg">{student.name}</h3>
                          <Badge className="bg-primary/10 text-primary border-primary/20 dark:bg-primary/20 dark:text-primary dark:border-primary/30">
                            Roll No: {student.rollNumber}
                          </Badge>
                          <Badge className="bg-secondary/10 text-secondary-foreground border-secondary/20 dark:bg-secondary/20 dark:text-secondary-foreground dark:border-secondary/30">
                            Class: {student.class?.name}
                          </Badge>
                          <Badge variant={student.isActive ? "default" : "destructive"}>
                            {student.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <div className="grid gap-2 md:grid-cols-2 text-sm text-muted-foreground">
                          <p><strong>Email:</strong> {student.email}</p>
                          {student.fatherName && <p><strong>Father:</strong> {student.fatherName}</p>}
                          {student.motherName && <p><strong>Mother:</strong> {student.motherName}</p>}
                          {student.whatsappNumber && <p><strong>Phone:</strong> {student.whatsappNumber}</p>}
                          <p><strong>Enrolled:</strong> {new Date(student.createdAt).toLocaleDateString()}</p>
                        </div>
                        {student.address && (
                          <p className="text-sm text-muted-foreground">
                            <strong>Address:</strong> {student.address}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditClick(student)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClick(student)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && studentToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md border-2 border-red-200 bg-white dark:bg-gray-900 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 border-b">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <CardTitle className="text-xl text-gray-900 dark:text-white">
                    Delete Student
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
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {studentToDelete.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {studentToDelete.email}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Roll No: {studentToDelete.rollNumber} | Class: {studentToDelete.class?.name}
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
                        Are you sure you want to delete this student? This will permanently remove 
                        the student and all their enrollment data. This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
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
                      Delete Student
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Pagination */}
      {filteredStudents.length >= 10 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            totalItems={filteredStudents.length}
          />
        </div>
      )}
    </div>
  );
};

export default Students;
