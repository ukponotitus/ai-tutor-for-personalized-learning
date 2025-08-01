import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Mail, Calendar, BookOpen, Award, Target, Edit } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  bio: string;
  learning_goals: string;
  avatar_url: string;
  created_at: string;
  updated_at: string;
}

interface Enrollment {
  id: string;
  course_id: string;
  progress_percentage: number;
  enrolled_at: string;
  completed_at: string;
  courses: {
    title: string;
    category: string;
    difficulty_level: string;
  };
}

const Profile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    learning_goals: '',
  });
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchEnrollments();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setProfile(data);
        setFormData({
          full_name: data.full_name || '',
          bio: data.bio || '',
          learning_goals: data.learning_goals || '',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch profile',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrollments = async () => {
    try {
      const { data, error } = await supabase
        .from('course_enrollments')
        .select(`
          *,
          courses (title, category, difficulty_level)
        `)
        .eq('user_id', user?.id)
        .order('enrolled_at', { ascending: false });

      if (error) throw error;
      setEnrollments(data || []);
    } catch (error) {
      console.error('Failed to fetch enrollments:', error);
    }
  };

  const updateProfile = async () => {
    if (!user) return;

    try {
      const updateData = {
        user_id: user.id,
        full_name: formData.full_name,
        bio: formData.bio,
        learning_goals: formData.learning_goals,
      };

      let result;
      if (profile) {
        result = await supabase
          .from('profiles')
          .update(updateData)
          .eq('user_id', user.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('profiles')
          .insert(updateData)
          .select()
          .single();
      }

      if (result.error) throw result.error;
      
      setProfile(result.data);
      setEditing(false);
      toast({
        title: 'Profile updated',
        description: 'Your profile has been successfully updated',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const completedCourses = enrollments.filter(e => e.completed_at);
  const inProgressCourses = enrollments.filter(e => !e.completed_at);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <div className="text-center">Loading profile...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Profile</h1>
          <p className="text-muted-foreground">
            Manage your profile information and track your learning progress
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback className="text-2xl">
                    {profile?.full_name ? getInitials(profile.full_name) : 'U'}
                  </AvatarFallback>
                </Avatar>
                <CardTitle>{profile?.full_name || 'Your Name'}</CardTitle>
                <CardDescription className="flex items-center justify-center gap-1">
                  <Mail className="h-4 w-4" />
                  {user?.email}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4" />
                    Joined {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Recently'}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <BookOpen className="h-4 w-4" />
                    {enrollments.length} Course{enrollments.length !== 1 ? 's' : ''} Enrolled
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Award className="h-4 w-4" />
                    {completedCourses.length} Course{completedCourses.length !== 1 ? 's' : ''} Completed
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="courses">My Courses</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      About Me
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      {profile?.bio || 'No bio available. Edit your profile to add a bio.'}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Learning Goals
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      {profile?.learning_goals || 'No learning goals set. Edit your profile to add learning goals.'}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{enrollments.length}</div>
                        <div className="text-sm text-muted-foreground">Total Courses</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{inProgressCourses.length}</div>
                        <div className="text-sm text-muted-foreground">In Progress</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{completedCourses.length}</div>
                        <div className="text-sm text-muted-foreground">Completed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          {enrollments.length > 0 
                            ? Math.round(enrollments.reduce((sum, e) => sum + (e.progress_percentage || 0), 0) / enrollments.length)
                            : 0}%
                        </div>
                        <div className="text-sm text-muted-foreground">Avg Progress</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="courses" className="space-y-6">
                {inProgressCourses.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Courses in Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {inProgressCourses.map((enrollment) => (
                          <div key={enrollment.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <h4 className="font-medium">{enrollment.courses.title}</h4>
                              <div className="flex gap-2 mt-1">
                                <Badge variant="secondary">{enrollment.courses.category}</Badge>
                                <Badge variant="outline">{enrollment.courses.difficulty_level}</Badge>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium">{enrollment.progress_percentage || 0}%</div>
                              <div className="text-xs text-muted-foreground">Progress</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {completedCourses.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Completed Courses</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {completedCourses.map((enrollment) => (
                          <div key={enrollment.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <h4 className="font-medium">{enrollment.courses.title}</h4>
                              <div className="flex gap-2 mt-1">
                                <Badge variant="secondary">{enrollment.courses.category}</Badge>
                                <Badge variant="outline">{enrollment.courses.difficulty_level}</Badge>
                                <Badge variant="default">Completed</Badge>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-muted-foreground">
                                Completed {new Date(enrollment.completed_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {enrollments.length === 0 && (
                  <Card>
                    <CardContent className="text-center py-12">
                      <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">No courses yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Start your learning journey by enrolling in your first course
                      </p>
                      <Button onClick={() => window.location.href = '/courses'}>
                        Browse Courses
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Profile Information</CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditing(!editing)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        {editing ? 'Cancel' : 'Edit'}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                        disabled={!editing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                        disabled={!editing}
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="learning_goals">Learning Goals</Label>
                      <Textarea
                        id="learning_goals"
                        value={formData.learning_goals}
                        onChange={(e) => setFormData(prev => ({ ...prev, learning_goals: e.target.value }))}
                        disabled={!editing}
                        placeholder="What do you want to achieve with your learning?"
                      />
                    </div>
                    {editing && (
                      <Button onClick={updateProfile} className="w-full">
                        Save Changes
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;