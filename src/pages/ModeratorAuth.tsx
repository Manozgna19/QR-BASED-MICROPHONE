
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const ModeratorAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        // Login logic
        const { data, error } = await supabase
          .from('moderators')
          .select('*')
          .eq('email', formData.email)
          .single();

        if (error || !data) {
          toast({
            title: "Login Failed",
            description: "Invalid email or password",
            variant: "destructive"
          });
          return;
        }

        // Simple password check (in production, use proper hashing)
        if (data.password_hash !== formData.password) {
          toast({
            title: "Login Failed",
            description: "Invalid email or password",
            variant: "destructive"
          });
          return;
        }

        localStorage.setItem('moderatorId', data.id);
        localStorage.setItem('moderatorName', data.name);
        
        toast({
          title: "Login Successful",
          description: "Welcome back!"
        });
        
        navigate('/moderator-dashboard');
      } else {
        // Register logic
        const { error } = await supabase
          .from('moderators')
          .insert([
            {
              name: formData.name,
              email: formData.email,
              password_hash: formData.password // In production, hash this
            }
          ]);

        if (error) {
          if (error.code === '23505') {
            toast({
              title: "Registration Failed",
              description: "Email already exists",
              variant: "destructive"
            });
          } else {
            toast({
              title: "Registration Failed",
              description: "Please try again",
              variant: "destructive"
            });
          }
          return;
        }

        toast({
          title: "Registration Successful",
          description: "Please login with your credentials"
        });
        
        setIsLogin(true);
        setFormData({ name: '', email: '', password: '' });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-bold text-gray-900">
            Digital Speaker Queue
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {isLogin ? 'Moderator Login' : 'Create Account'}
            </CardTitle>
            <CardDescription>
              {isLogin ? 'Access your moderator dashboard' : 'Register as a new moderator'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  required
                />
              </div>

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? 'Please wait...' : (isLogin ? 'Login' : 'Create Account')}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                {isLogin ? "Don't have an account? Register here." : "Already have an account? Login here."}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ModeratorAuth;
