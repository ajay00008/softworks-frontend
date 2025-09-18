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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { teachersAPI, Teacher } from "@/services/api";
import {
  Plus,
  GraduationCap,
  Search,
  Edit,
  Trash2,
  UserCheck,
} from "lucide-react";

const Teachers = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editTeacher, setEditTeacher] = useState<Teacher | null>(null);
  const [deleteTeacher, setDeleteTeacher] = useState<Teacher | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    subjectIds: [] as string[],
    phone: "",
    address: "",
    qualification: "",
    experience: "",
  });

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      const response = await teachersAPI.getAll();
      setTeachers(response.teachers);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load teachers",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (teacher: Teacher) => {
    setEditTeacher(teacher);
    setFormData({
      email: teacher.email,
      password: "",
      name: teacher.name,
      subjectIds: teacher.subjectIds || [],
      phone: teacher.phone || "",
      address: teacher.address || "",
      qualification: teacher.qualification || "",
      experience: teacher.experience || "",
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Teacher form submitted!', { formData, editTeacher });
    setIsSubmitting(true);

    try {
      if (editTeacher) {
        // Update API
        console.log('Updating teacher:', editTeacher.id);
        const updatedTeacher = await teachersAPI.update(editTeacher.id, {
          ...formData,
          isActive: editTeacher.isActive,
        });

        setTeachers(
          teachers.map((t) =>
            t.id === editTeacher.id ? { ...t, ...updatedTeacher } : t
          )
        );

        toast({
          title: "Success",
          description: "Teacher updated successfully",
        });
      } else {
        // Create API
        console.log('Creating new teacher with formData:', formData);
        const newTeacher = await teachersAPI.create({
          ...formData,
          isActive: true,
          _id: "" as any,
          userId: null as any,
        } as any);

        console.log('Created teacher:', newTeacher);
        setTeachers([...teachers, newTeacher]);

        toast({
          title: "Success",
          description: "Teacher created successfully",
        });
        
        // Reload teachers to ensure fresh data
        setTimeout(() => {
          loadTeachers();
        }, 1000);
      }

      resetForm();
      setEditTeacher(null);
      setShowForm(false);
    } catch (error) {
      console.error('Error in handleSubmit:', error);
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

  const handleDelete = async () => {
    if (!deleteTeacher) return;
    
    try {
      await teachersAPI.delete(deleteTeacher.id);
      setTeachers(teachers.filter((t) => t.id !== deleteTeacher.id));
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
      setDeleteTeacher(null);
    }
  };

  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
      name: "",
      subjectIds: [],
      phone: "",
      address: "",
      qualification: "",
      experience: "",
    });
  };

  const filteredTeachers = teachers.filter(
    (teacher) =>
      teacher?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              {/* name field */}
              <div>
                <Label>Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  placeholder="Enter teacher's full name"
                />
              </div>

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
                  {isSubmitting
                    ? editTeacher
                      ? "Updating..."
                      : "Creating..."
                    : editTeacher
                    ? "Update Teacher"
                    : "Create Teacher"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Teachers list */}
      <Card>
        <CardHeader>
          <CardTitle>Teaching Staff ({filteredTeachers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTeachers.length === 0 ? (
            <p>No teachers found</p>
          ) : (
            <div className="grid gap-4">
              {filteredTeachers.map((teacher) => (
                <Card
                  key={teacher.id}
                  className="border-l-4 border-l-accent bg-card/50 dark:bg-card/80 dark:border-accent/50 hover:shadow-md transition-all duration-200"
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center space-x-4">
                          <h3 className="font-semibold">{teacher.name}</h3>
                          {teacher.subjectIds?.length > 0 && (
                            <Badge className="bg-accent/10 text-accent border-accent/20 dark:bg-accent/20 dark:text-accent dark:border-accent/30">
                              {teacher.subjectIds.join(", ")}
                            </Badge>
                          )}
                          <Badge
                            variant={
                              teacher.isActive ? "default" : "destructive"
                            }
                          >
                            {teacher.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          <strong>Email:</strong> {teacher.email}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClick(teacher)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDeleteTeacher(teacher)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the teacher "{teacher.name}" and remove all their data.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={() => setDeleteTeacher(null)}>
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleDelete}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete Teacher
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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

export default Teachers;
