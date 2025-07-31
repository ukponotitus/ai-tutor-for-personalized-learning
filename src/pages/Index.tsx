import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Dashboard from '@/components/Dashboard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, BookOpen, MessageSquare, Users } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) {
    return <Dashboard />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center items-center mb-6">
            <Brain className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-5xl font-bold mb-6">AI Tutor Platform</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Learn anything with personalized AI tutoring. Get instant help, track your progress, 
            and master new skills at your own pace.
          </p>
          <div className="space-x-4">
            <Button size="lg" onClick={() => navigate('/auth')}>
              Get Started
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate('/auth')}>
              Sign In
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardHeader className="text-center">
              <BookOpen className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Diverse Courses</CardTitle>
              <CardDescription>
                Access a wide range of courses across different subjects and skill levels
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <MessageSquare className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>AI Tutor Chat</CardTitle>
              <CardDescription>
                Get instant help and explanations from our advanced AI tutor available 24/7
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Users className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Personalized Learning</CardTitle>
              <CardDescription>
                Enjoy a tailored learning experience that adapts to your pace and preferences
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
