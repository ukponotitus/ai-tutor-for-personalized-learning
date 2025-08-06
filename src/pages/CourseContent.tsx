import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import DashboardLayout from '@/components/DashboardLayout';
import { useToast } from '@/hooks/use-toast';
import { 
  BookOpen, 
  Clock, 
  User, 
  ArrowLeft,
  CheckCircle,
  MessageCircle,
  Play,
  FileText,
  Award,
  ChevronDown,
  ChevronRight,
  Download,
  FileIcon,
  ExternalLink
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

interface Resource {
  id: number;
  title: string;
  type: 'PDF' | 'Link' | 'Document' | 'Video';
  url: string;
  size?: string;
  description?: string;
}

// Mock course content structure
const getCourseContent = (course: Course) => ({
  modules: [
    {
      id: 1,
      title: "Introduction to " + course.title,
      lessons: [
        {
          id: 1,
          title: "Course Overview",
          type: "text",
          content: `Welcome to ${course.title}! This comprehensive course will take you through all the essential concepts and practical applications in ${course.category}. 

**What you'll learn:**
- Core fundamentals and principles
- Practical applications and real-world examples
- Advanced techniques and best practices
- Industry standards and current trends

**Prerequisites:**
- Basic understanding of ${course.category}
- Willingness to learn and practice
- Access to a computer for hands-on exercises

**Course Structure:**
This course is designed to be completed over ${course.duration_hours} hours, with each module building upon the previous one. Take your time to absorb the material and don't hesitate to ask the AI tutor for clarification on any concepts.`,
          duration: 15
        },
        {
          id: 2,
          title: "Getting Started",
          type: "video",
          content: "https://www.example.com/video-placeholder",
          duration: 20
        }
      ]
    },
    {
      id: 2,
      title: "Core Concepts",
      lessons: [
        {
          id: 3,
          title: "Fundamental Principles",
          type: "text",
          content: `In this lesson, we'll explore the fundamental principles that form the foundation of ${course.category}.

**Key Concepts:**

1. **Basic Theory**
   Understanding the theoretical background is crucial for practical application. The core principles include:
   - Concept A: [Detailed explanation]
   - Concept B: [Detailed explanation]
   - Concept C: [Detailed explanation]

2. **Practical Applications**
   Now let's see how these concepts apply in real-world scenarios:
   - Application 1: [Example and explanation]
   - Application 2: [Example and explanation]
   - Application 3: [Example and explanation]

3. **Common Patterns**
   Industry professionals often use these patterns:
   - Pattern A: When and how to use it
   - Pattern B: Best practices and considerations
   - Pattern C: Advanced implementations

**Exercise:**
Try to identify these patterns in your daily work or studies. The AI tutor can help you with specific examples or clarifications.`,
          duration: 30
        },
        {
          id: 4,
          title: "Practical Examples",
          type: "text",
          content: `Let's dive into some practical examples that demonstrate the concepts we've learned.

**Example 1: Real-world Application**
Here's how professionals in ${course.category} apply these principles:

[Detailed step-by-step example with explanations]

**Example 2: Common Use Case**
This example shows a typical scenario you might encounter:

[Another detailed example with practical insights]

**Your Turn:**
Now it's time to practice! Try working through these examples yourself, and feel free to ask the AI tutor for guidance or explanations of any steps you find challenging.`,
          duration: 25
        }
      ]
    },
    {
      id: 3,
      title: "Advanced Topics",
      lessons: [
        {
          id: 5,
          title: "Advanced Techniques",
          type: "text",
          content: `Now that you've mastered the basics, let's explore some advanced techniques used by experts in ${course.category}.

**Advanced Technique 1:**
[Detailed explanation of an advanced concept]

**Advanced Technique 2:**
[Another advanced topic with examples]

**Industry Best Practices:**
- Best practice 1
- Best practice 2
- Best practice 3

**Common Pitfalls to Avoid:**
- Pitfall 1 and how to avoid it
- Pitfall 2 and its solutions
- Pitfall 3 and prevention strategies`,
          duration: 35
        }
      ]
    }
  ],
  resources: [
    {
      id: 1,
      title: `${course.title} - Complete Guide`,
      type: 'PDF' as const,
      url: '#',
      size: '2.3 MB',
      description: 'Comprehensive guide covering all course topics'
    },
    {
      id: 2,
      title: 'Practice Exercises',
      type: 'Document' as const,
      url: '#',
      size: '1.1 MB',
      description: 'Hands-on exercises for each module'
    },
    {
      id: 3,
      title: 'Official Documentation',
      type: 'Link' as const,
      url: '#',
      description: 'External resource for additional learning'
    },
    {
      id: 4,
      title: 'Video Tutorials Collection',
      type: 'Video' as const,
      url: '#',
      size: '125 MB',
      description: 'Supplementary video content'
    }
  ]
});

const CourseContent = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentLesson, setCurrentLesson] = useState(1);
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);
  const [expandedModules, setExpandedModules] = useState<number[]>([1]);

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

      // Check if user is enrolled, if not enroll them
      let { data: enrollmentData, error: enrollmentError } = await supabase
        .from('course_enrollments')
        .select('*')
        .eq('course_id', courseId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (enrollmentError) {
        console.error('Error fetching enrollment:', enrollmentError);
      }

      // If not enrolled, enroll them automatically
      if (!enrollmentData) {
        const { data: newEnrollment, error: enrollError } = await supabase
          .from('course_enrollments')
          .insert({
            user_id: user.id,
            course_id: courseId,
            progress_percentage: 0
          })
          .select()
          .single();

        if (enrollError) {
          console.error('Error enrolling user:', enrollError);
          toast({
            title: "Error",
            description: "Failed to enroll in course",
            variant: "destructive",
          });
          return;
        }

        enrollmentData = newEnrollment;
        toast({
          title: "Welcome!",
          description: "You've been enrolled in the course. Let's start learning!",
        });
      }

      setEnrollment(enrollmentData);
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

  const toggleModule = (moduleId: number) => {
    setExpandedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const markLessonComplete = (lessonId: number) => {
    if (!completedLessons.includes(lessonId)) {
      const newCompletedLessons = [...completedLessons, lessonId];
      setCompletedLessons(newCompletedLessons);
      updateProgress(newCompletedLessons);
      
      toast({
        title: "Lesson Completed!",
        description: "Great job! Keep up the excellent work.",
      });
    }
  };

  const updateProgress = async (updatedCompletedLessons?: number[]) => {
    if (!enrollment || !course) return;

    const lessonsToUse = updatedCompletedLessons || completedLessons;
    const courseContent = getCourseContent(course);
    const totalLessons = courseContent.modules.reduce((acc, module) => acc + module.lessons.length, 0);
    const newProgress = Math.round((lessonsToUse.length / totalLessons) * 100);

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
        return;
      }

      setEnrollment({
        ...enrollment,
        progress_percentage: newProgress,
        completed_at: newProgress === 100 ? new Date().toISOString() : null
      });

      if (newProgress === 100) {
        await generateQuiz();
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const generateQuiz = async () => {
    if (!course || !user) return;

    try {
      const { data, error } = await supabase.functions.invoke('generate-quiz', {
        body: {
          courseId: course.id,
          courseTitle: course.title,
          courseCategory: course.category,
          userId: user.id
        }
      });

      if (error) {
        console.error('Error generating quiz:', error);
        toast({
          title: "Quiz Generation",
          description: "There was an issue generating your quiz, but you can still access it from your dashboard.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Congratulations!",
        description: "Course completed! A quiz has been generated and added to your dashboard.",
      });
    } catch (error) {
      console.error('Error generating quiz:', error);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid gap-6 lg:grid-cols-4">
            <div className="lg:col-span-3">
              <Skeleton className="h-96 w-full" />
            </div>
            <div>
              <Skeleton className="h-64 w-full" />
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

  const courseContent = getCourseContent(course);
  const currentLessonData = courseContent.modules
    .flatMap(module => module.lessons)
    .find(lesson => lesson.id === currentLesson);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link to="/courses">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{course.title}</h1>
            <p className="text-muted-foreground mt-2">{course.description}</p>
          </div>
          <Button asChild variant="outline" className="gap-2">
            <Link to="/chat">
              <MessageCircle className="h-4 w-4" />
              Ask AI Tutor
            </Link>
          </Button>
        </div>

        {/* Progress Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Course Progress</span>
                <span>{enrollment?.progress_percentage || 0}%</span>
              </div>
              <Progress value={enrollment?.progress_percentage || 0} />
              {enrollment?.completed_at && (
                <div className="flex items-center gap-2 text-green-600 text-sm">
                  <Award className="h-4 w-4" />
                  <span>Course completed on {new Date(enrollment.completed_at).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Current Lesson */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {currentLessonData?.type === 'video' ? (
                    <Play className="h-5 w-5" />
                  ) : (
                    <FileText className="h-5 w-5" />
                  )}
                  {currentLessonData?.title}
                  {completedLessons.includes(currentLesson) && (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentLessonData?.type === 'video' ? (
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Play className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">Video Player Placeholder</p>
                      <p className="text-sm text-muted-foreground">Duration: {currentLessonData.duration} minutes</p>
                    </div>
                  </div>
                ) : (
                  <div className="prose max-w-none">
                    <div className="whitespace-pre-line text-foreground">
                      {currentLessonData?.content}
                    </div>
                  </div>
                )}
                
                <Separator />
                
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    Duration: {currentLessonData?.duration} minutes
                  </div>
                  <div className="flex gap-2">
                    {!completedLessons.includes(currentLesson) && (
                      <Button onClick={() => markLessonComplete(currentLesson)}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark Complete
                      </Button>
                    )}
                    <Button asChild variant="outline" className="gap-2">
                      <Link to="/chat">
                        <MessageCircle className="h-4 w-4" />
                        Ask About This Lesson
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Course Info */}
            <Card>
              <CardHeader>
                <CardTitle>Course Info</CardTitle>
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

                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{course.category}</Badge>
                  <Badge variant="outline">{course.difficulty_level}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Curriculum Navigation */}
            <Card>
              <CardHeader>
                <CardTitle>Curriculum</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {courseContent.modules.map((module) => (
                  <Collapsible 
                    key={module.id}
                    open={expandedModules.includes(module.id)}
                    onOpenChange={() => toggleModule(module.id)}
                  >
                    <CollapsibleTrigger className="w-full flex items-center justify-between p-3 hover:bg-muted rounded-lg text-left">
                      <span className="font-medium">{module.title}</span>
                      {expandedModules.includes(module.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-1 mt-2">
                      {module.lessons.map((lesson) => (
                        <button
                          key={lesson.id}
                          onClick={() => setCurrentLesson(lesson.id)}
                          className={`w-full text-left p-3 ml-4 rounded-lg text-sm flex items-center justify-between transition-colors ${
                            currentLesson === lesson.id
                              ? 'bg-primary text-primary-foreground'
                              : 'hover:bg-muted'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {lesson.type === 'video' ? (
                              <Play className="h-4 w-4" />
                            ) : (
                              <FileText className="h-4 w-4" />
                            )}
                            <div>
                              <div className="font-medium">{lesson.title}</div>
                              <div className="text-xs text-muted-foreground">
                                {lesson.type} • {lesson.duration} min
                              </div>
                            </div>
                          </div>
                          {completedLessons.includes(lesson.id) && (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          )}
                        </button>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </CardContent>
            </Card>

            {/* Resources */}
            <Card>
              <CardHeader>
                <CardTitle>Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {courseContent.resources.map((resource) => (
                  <div key={resource.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      {resource.type === 'PDF' && <FileIcon className="h-4 w-4 text-red-600" />}
                      {resource.type === 'Document' && <FileText className="h-4 w-4 text-blue-600" />}
                      {resource.type === 'Link' && <ExternalLink className="h-4 w-4 text-green-600" />}
                      {resource.type === 'Video' && <Play className="h-4 w-4 text-purple-600" />}
                      <div>
                        <div className="font-medium text-sm">{resource.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {resource.type} {resource.size && `• ${resource.size}`}
                        </div>
                        {resource.description && (
                          <div className="text-xs text-muted-foreground mt-1">{resource.description}</div>
                        )}
                      </div>
                    </div>
                     <Button 
                       size="sm" 
                       variant="ghost"
                       onClick={() => {
                         if (resource.url === '#') {
                           toast({
                             title: "Download",
                             description: "This is a demo resource. In a real app, this would download the file.",
                           });
                         } else {
                           window.open(resource.url, '_blank');
                         }
                       }}
                     >
                       <Download className="h-4 w-4" />
                     </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CourseContent;