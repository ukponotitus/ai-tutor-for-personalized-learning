import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExternalLink, Search, FileText, Video, Download, BookOpen } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';

interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  type: string;
  category: string;
  is_featured: boolean;
  created_at: string;
}

const Resources = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResources(data || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch resources',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'video':
        return Video;
      case 'document':
      case 'pdf':
        return FileText;
      case 'download':
        return Download;
      case 'article':
      case 'blog':
        return BookOpen;
      default:
        return FileText;
    }
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || resource.type === typeFilter;
    const matchesCategory = categoryFilter === 'all' || resource.category === categoryFilter;
    
    return matchesSearch && matchesType && matchesCategory;
  });

  const featuredResources = filteredResources.filter(resource => resource.is_featured);
  const regularResources = filteredResources.filter(resource => !resource.is_featured);

  const types = [...new Set(resources.map(resource => resource.type).filter(Boolean))];
  const categories = [...new Set(resources.map(resource => resource.category).filter(Boolean))];

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <div className="text-center">Loading resources...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Learning Resources</h1>
          <p className="text-muted-foreground mb-6">
            Discover helpful resources to enhance your learning experience
          </p>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {types.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Featured Resources */}
        {featuredResources.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Featured Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredResources.map((resource) => {
                const Icon = getResourceIcon(resource.type);
                return (
                  <Card key={resource.id} className="border-primary/20 bg-primary/5">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <Icon className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                          <div>
                            <CardTitle className="text-lg">{resource.title}</CardTitle>
                            <CardDescription className="mt-2">
                              {resource.description}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge variant="default" className="ml-2">Featured</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {resource.type && (
                          <Badge variant="secondary">{resource.type}</Badge>
                        )}
                        {resource.category && (
                          <Badge variant="outline">{resource.category}</Badge>
                        )}
                      </div>
                      <Button
                        onClick={() => window.open(resource.url, '_blank')}
                        className="w-full"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Resource
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Regular Resources */}
        {regularResources.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">All Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularResources.map((resource) => {
                const Icon = getResourceIcon(resource.type);
                return (
                  <Card key={resource.id}>
                    <CardHeader>
                      <div className="flex items-start gap-3">
                        <Icon className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
                        <div>
                          <CardTitle className="text-lg">{resource.title}</CardTitle>
                          <CardDescription className="mt-2">
                            {resource.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {resource.type && (
                          <Badge variant="secondary">{resource.type}</Badge>
                        )}
                        {resource.category && (
                          <Badge variant="outline">{resource.category}</Badge>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => window.open(resource.url, '_blank')}
                        className="w-full"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Resource
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {filteredResources.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No resources found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria or check back later for new resources.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Resources;