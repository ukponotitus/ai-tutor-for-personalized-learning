import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Clock, User, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout from '@/components/DashboardLayout';

interface WishlistItem {
  id: string;
  course_id: string;
  created_at: string;
  courses: {
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
  };
}

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchWishlist();
    }
  }, [user]);

  const fetchWishlist = async () => {
    try {
      const { data, error } = await supabase
        .from('wishlist_items')
        .select(`
          *,
          courses (*)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWishlistItems(data || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch wishlist',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (itemId: string, courseTitle: string) => {
    try {
      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      setWishlistItems(prev => prev.filter(item => item.id !== itemId));
      toast({
        title: 'Removed from wishlist',
        description: `"${courseTitle}" has been removed from your wishlist`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove course from wishlist',
        variant: 'destructive',
      });
    }
  };

  const startLearning = async (courseId: string, courseTitle: string) => {
    try {
      // Check if already enrolled
      const { data: existingEnrollment } = await supabase
        .from('course_enrollments')
        .select('id')
        .eq('user_id', user?.id)
        .eq('course_id', courseId)
        .maybeSingle();

      // If not enrolled, enroll them
      if (!existingEnrollment) {
        const { error } = await supabase
          .from('course_enrollments')
          .insert({
            user_id: user?.id,
            course_id: courseId,
          });

        if (error) throw error;
      }

      // Navigate to course content
      window.location.href = `/courses/${courseId}`;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to start learning',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
  return (
    <DashboardLayout>
        <div className="container mx-auto py-8">
          <div className="text-center">Loading wishlist...</div>
      </div>
    </DashboardLayout>
  );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4 flex items-center gap-2">
            <Heart className="h-8 w-8 text-red-500" />
            My Wishlist
          </h1>
          <p className="text-muted-foreground">
            Keep track of courses you're interested in and start learning when ready
          </p>
        </div>

        {wishlistItems.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Your wishlist is empty</h3>
              <p className="text-muted-foreground mb-4">
                Browse our course catalog and save courses you're interested in
              </p>
              <Button onClick={() => window.location.href = '/courses'}>
                Browse Courses
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((item) => (
              <Card key={item.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{item.courses.title}</CardTitle>
                      <CardDescription className="mt-2">
                        {item.courses.description}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFromWishlist(item.id, item.courses.title)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {item.courses.category && (
                      <Badge variant="secondary">{item.courses.category}</Badge>
                    )}
                    {item.courses.difficulty_level && (
                      <Badge variant="outline">{item.courses.difficulty_level}</Badge>
                    )}
                    {item.courses.is_free && (
                      <Badge variant="default">Free</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    {item.courses.instructor_name && (
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {item.courses.instructor_name}
                      </div>
                    )}
                    {item.courses.duration_hours && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {item.courses.duration_hours}h
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Added to wishlist on {new Date(item.created_at).toLocaleDateString()}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                  <div className="text-lg font-semibold">
                    {item.courses.is_free ? 'Free' : `$${item.courses.price}`}
                  </div>
                  <Button 
                    onClick={() => startLearning(item.courses.id, item.courses.title)}
                  >
                    Start Learning
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Wishlist;