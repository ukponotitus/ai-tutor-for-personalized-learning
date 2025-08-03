import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import DashboardLayout from '@/components/DashboardLayout';
import { useToast } from '@/hooks/use-toast';
import { 
  BookOpen, 
  Clock, 
  User, 
  Star,
  Play,
  ArrowLeft,
  CheckCircle
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  instructor_name: string;
  duration_hours: number;
  difficulty_level: string;
  category: string;
  price: number;
  is_free: boolean;
  thumbnail_url: string;
}

interface Enrollment {
  id: string;
  progress_percentage: number;
  enrolled_at: string;
  completed_at: string | null;
}

const CourseDetail = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!courseId || !user) return;

    fetchCourseAndEnrollment();
  }, [courseId, user]);

  const fetchCourseAndEnrollment = async () => {
    if (!courseId || !user) return;

    try {
      // Fetch course details
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (courseError) {
        console.error('Error fetching course:', courseError);
        toast({
          title: "Error",
          description: "Failed to load course details",
          variant: "destructive",
        });
        return;
      }

      setCourse(courseData);

      // Fetch enrollment details
      const { data: enrollmentData, error: enrollmentError } = await supabase
        .from('course_enrollments')
        .select('*')
        .eq('course_id', courseId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (enrollmentError) {
        console.error('Error fetching enrollment:', enrollmentError);
      } else {
        setEnrollment(enrollmentData);
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to load course information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (newProgress: number) => {
    if (!enrollment || !user || !courseId) return;

    try {
      const { error } = await supabase
        .from('course_enrollments')
        .update({ 
          progress_percentage: newProgress,
          completed_at: newProgress === 100 ? new Date().toISOString() : null
        })
        .eq('id', enrollment.id);

      if (error) {
        console.error('Error updating progress:', error);
        toast({
          title: "Error",
          description: "Failed to update progress",
          variant: "destructive",
        });
        return;
      }

      setEnrollment({
        ...enrollment,
        progress_percentage: newProgress,
        completed_at: newProgress === 100 ? new Date().toISOString() : null
      });

      toast({
        title: "Progress Updated",
        description: `Course progress updated to ${newProgress}%`,
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-8 w-48" />
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!course) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Course Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The course you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link to="/courses">Browse Courses</Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link to="/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{course.title}</h1>
            <p className="text-muted-foreground">
              Course Details & Progress
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Course Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Course Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {course.thumbnail_url && (
                  <img 
                    src={course.thumbnail_url} 
                    alt={course.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                )}
                <p className="text-muted-foreground">
                  {course.description || "No description available for this course."}
                </p>
                
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{course.category}</Badge>
                  <Badge variant="outline">{course.difficulty_level}</Badge>
                  {course.is_free ? (
                    <Badge className="bg-green-100 text-green-800">Free</Badge>
                  ) : (
                    <Badge variant="secondary">${course.price}</Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Learning Progress */}
            {enrollment && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Play className="h-5 w-5" />
                    Learning Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Overall Progress</span>
                      <span>{enrollment.progress_percentage}%</span>
                    </div>
                    <Progress value={enrollment.progress_percentage} />
                  </div>
                  
                  {enrollment.completed_at ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">Completed on {new Date(enrollment.completed_at).toLocaleDateString()}</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Keep going! You're doing great.
                      </p>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => updateProgress(Math.min(100, enrollment.progress_percentage + 10))}
                        >
                          Mark Progress +10%
                        </Button>
                        {enrollment.progress_percentage < 100 && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => updateProgress(100)}
                          >
                            Mark Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Course Info */}
            <Card>
              <CardHeader>
                <CardTitle>Course Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Instructor</p>
                    <p className="text-sm text-muted-foreground">
                      {course.instructor_name || "Not specified"}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Duration</p>
                    <p className="text-sm text-muted-foreground">
                      {course.duration_hours ? `${course.duration_hours} hours` : "Not specified"}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Star className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Difficulty</p>
                    <p className="text-sm text-muted-foreground">
                      {course.difficulty_level}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enrollment Status */}
            <Card>
              <CardHeader>
                <CardTitle>Enrollment Status</CardTitle>
              </CardHeader>
              <CardContent>
                {enrollment ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Enrolled</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Enrolled on {new Date(enrollment.enrolled_at).toLocaleDateString()}
                    </p>
                    <Button asChild className="w-full">
                      <Link to="/chat">Continue with AI Tutor</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      You are not enrolled in this course yet.
                    </p>
                    <Button asChild className="w-full">
                      <Link to="/courses">Back to Courses</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CourseDetail;