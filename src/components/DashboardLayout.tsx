import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  GraduationCap, 
  Home, 
  BookOpen, 
  MessageSquare, 
  Heart, 
  FileText, 
  LogOut, 
  Menu,
  User
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Signed out',
        description: 'You have been successfully signed out.',
      });
      navigate('/');
    }
  };

  const navigationItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/courses', label: 'Courses', icon: BookOpen },
    { href: '/chat', label: 'AI Tutor', icon: MessageSquare },
    { href: '/wishlist', label: 'Wishlist', icon: Heart },
    { href: '/resources', label: 'Resources', icon: FileText },
  ];

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-14 items-center border-b px-4">
        <Link to="/dashboard" className="flex items-center space-x-2">
          <GraduationCap className="h-6 w-6 text-primary" />
          <span className="font-bold">AI Tutor</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 p-4">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="border-t p-4 space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => {
            navigate('/profile');
            setIsMobileMenuOpen(false);
          }}
        >
          <User className="mr-3 h-4 w-4" />
          Profile
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => {
            handleSignOut();
            setIsMobileMenuOpen(false);
          }}
        >
          <LogOut className="mr-3 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
          <div className="flex flex-col flex-grow border-r bg-background">
            <SidebarContent />
          </div>
        </div>

        {/* Mobile Sidebar */}
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetContent side="left" className="p-0 w-64">
            <SidebarContent />
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <div className="flex flex-col flex-1 md:pl-64">
          {/* Top Navigation Bar */}
          <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background px-4 lg:px-6">
            <Button
              variant="outline"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-4 w-4" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>

            <div className="flex-1">
              <h1 className="text-lg font-semibold">
                {navigationItems.find(item => item.href === location.pathname)?.label || 'Dashboard'}
              </h1>
            </div>

            {/* User info and actions */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {user?.email}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/profile')}
                className="hidden md:flex"
              >
                <User className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                className="hidden md:flex"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;