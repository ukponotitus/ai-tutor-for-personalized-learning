import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  BookOpen, 
  MessageSquare, 
  Heart, 
  FileText, 
  TrendingUp,
  Clock,
  Star,
  Play,
  Award
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
  thumbnail_url?: string;
}

interface Enrollment {
  id: string;
  progress_percentage: number;
  course: Course;
}

interface Quiz {
  id: string;
  title: string;
  status: string;
  score: number | null;
  total_questions: number;
  created_at: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch user enrollments
        const { data: enrollmentData } = await supabase
          .from('course_enrollments')
          .select(`
            id,
            progress_percentage,
            course:courses (
              id,
              title,
              description,
              instructor_name,
              duration_hours,
              difficulty_level,
              category,
              price,
              is_free,
              thumbnail_url
            )
          `)
          .eq('user_id', user?.id)
          .limit(3);

        // Fetch featured courses
        const { data: coursesData } = await supabase
          .from('courses')
          .select('*')
          .limit(3);

        setEnrollments(enrollmentData || []);
        setFeaturedCourses(coursesData || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
  };

  const fetchQuizzes = async () => {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('id, title, status, score, total_questions, created_at')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setQuizzes(data || []);
    } catch (error) {
      console.error('Failed to fetch quizzes:', error);
    }
  };

    if (user) {
      fetchDashboardData();
      fetchQuizzes();
    }
  }, [user]);

  const stats = [
    {
      title: 'Courses Enrolled',
      value: enrollments.length,
      icon: BookOpen,
      description: 'Active learning paths',
    },
    {
      title: 'Average Progress',
      value: enrollments.length > 0 
        ? Math.round(enrollments.reduce((acc, e) => acc + e.progress_percentage, 0) / enrollments.length)
        : 0,
      icon: TrendingUp,
      description: 'Completion rate',
      suffix: '%',
    },
    {
      title: 'Study Streak',
      value: 7,
      icon: Clock,
      description: 'Days in a row',
    },
    {
      title: 'Skills Mastered',
      value: 12,
      icon: Star,
      description: 'Competencies earned',
    },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {user?.user_metadata?.full_name || 'Learner'}!
        </h1>
        <p className="text-muted-foreground">
          Continue your learning journey and achieve your goals.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold">
                      {stat.value}{stat.suffix}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {stat.description}
                    </p>
                  </div>
                  <Icon className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Content Grid */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Continue Learning */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Continue Learning
            </CardTitle>
            <CardDescription>
              Pick up where you left off
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {enrollments.length > 0 ? (
              enrollments.map((enrollment) => {
                const course = enrollment.course as Course;
                return (
                  <div key={enrollment.id} className="space-y-3 p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium">{course.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {course.instructor_name}
                        </p>
                      </div>
                      <Badge variant="secondary">
                        {course.difficulty_level}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{enrollment.progress_percentage}%</span>
                      </div>
                      <Progress value={enrollment.progress_percentage} />
                    </div>
                    <Button asChild size="sm" className="w-full">
                      <Link to={`/courses/${course.id}`}>Continue</Link>
                    </Button>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  No courses enrolled yet
                </p>
                <Button asChild>
                  <Link to="/courses">Browse Courses</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Jump into your learning activities
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Button asChild variant="outline" className="justify-start h-auto p-4">
              <Link to="/chat" className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Start AI Chat</div>
                  <div className="text-sm text-muted-foreground">
                    Get help with any topic
                  </div>
                </div>
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="justify-start h-auto p-4">
              <Link to="/courses" className="flex items-center gap-3">
                <BookOpen className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Browse Courses</div>
                  <div className="text-sm text-muted-foreground">
                    Discover new learning paths
                  </div>
                </div>
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="justify-start h-auto p-4">
              <Link to="/wishlist" className="flex items-center gap-3">
                <Heart className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">View Wishlist</div>
                  <div className="text-sm text-muted-foreground">
                    See saved courses
                  </div>
                </div>
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="justify-start h-auto p-4">
              <Link to="/resources" className="flex items-center gap-3">
                <FileText className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Learning Resources</div>
                  <div className="text-sm text-muted-foreground">
                    Access study materials
                  </div>
                </div>
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Featured Courses */}
      {featuredCourses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Featured Courses</CardTitle>
            <CardDescription>
              Popular courses you might enjoy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {featuredCourses.map((course) => (
                <div key={course.id} className="border rounded-lg p-4 space-y-3">
                  <div className="space-y-2">
                    <h4 className="font-medium">{course.title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {course.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {course.instructor_name}
                    </span>
                    <Badge variant="secondary">
                      {course.difficulty_level}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {course.is_free ? 'Free' : `$${course.price}`}
                    </span>
                    <Button asChild size="sm">
                      <Link to={`/courses/${course.id}`}>View</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
        
        {/* Available Quizzes */}
        {quizzes.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Your Quizzes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {quizzes.map((quiz) => (
                  <Card key={quiz.id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium text-sm">{quiz.title}</h4>
                        <Badge variant={quiz.status === 'completed' ? 'default' : 'secondary'}>
                          {quiz.status}
                        </Badge>
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        {quiz.total_questions} questions
                        {quiz.score !== null && (
                          <span className="ml-2">• Score: {quiz.score}%</span>
                        )}
                      </div>
                      
                      <Button 
                        asChild 
                        size="sm" 
                        className="w-full"
                        variant={quiz.status === 'completed' ? 'outline' : 'default'}
                      >
                        <Link to={`/quiz/${quiz.id}`}>
                          {quiz.status === 'completed' ? 'Review Results' : 'Take Quiz'}
                        </Link>
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;