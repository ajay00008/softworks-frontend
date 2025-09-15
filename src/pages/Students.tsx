import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { studentsAPI, classesAPI, Student, ClassMapping } from '@/services/api';
import { Plus, Users, Edit, Trash2, UserPlus } from 'lucide-react';

const Students = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
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
    setSelectedClassId(student.class?.classId || '');
    setShowCreateForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        classId: selectedClassId,
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

  const handleDelete = async (id: string) => {
    try {
      await studentsAPI.delete(id);
      setStudents(students.filter(s => s.id !== id));
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
    }
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
              {filteredStudents.map((student) => (
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
                          onClick={() => handleDelete(student.id)}
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
    </div>
  );
};

export default Students;
