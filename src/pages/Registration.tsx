
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, ArrowRight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const Registration = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const generateAttendeeId = () => {
    const timestamp = Date.now().toString().slice(-4);
    const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    return `EVT2025-${timestamp}${random}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const newAttendeeId = generateAttendeeId();
      const verificationToken = Math.random().toString(36).substring(2, 15);
      
      // Insert attendee with verification token
      const { error: insertError } = await (supabase as any)
        .from('attendees')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            attendee_id: newAttendeeId,
            is_verified: false,
            verification_token: verificationToken
          }
        ]);

      if (insertError) {
        console.error('Registration error:', insertError);
        if (insertError.code === '23505') {
          toast({
            title: "Email Already Registered",
            description: "This email is already registered for the event",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Registration Failed",
            description: "Please try again later",
            variant: "destructive"
          });
        }
        return;
      }

      // Create verification link
      const verificationLink = `${window.location.origin}/verify-email?token=${verificationToken}&id=${newAttendeeId}`;

      // Send verification email
      const { error: emailError } = await supabase.functions.invoke('send-verification-email', {
        body: {
          name: formData.name,
          email: formData.email,
          attendeeId: newAttendeeId,
          verificationLink: verificationLink
        }
      });

      if (emailError) {
        console.error('Email sending error:', emailError);
        toast({
          title: "Registration Successful",
          description: "However, we couldn't send the verification email. Please contact support.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Registration Successful!",
          description: "Please check your email for verification instructions",
        });
      }

      setIsSubmitted(true);
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Check Your Email</CardTitle>
            <CardDescription>
              We've sent verification instructions to <strong>{formData.email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center text-sm text-gray-600">
              <p>Click the verification link in your email to complete registration.</p>
              <p className="mt-2">Don't see the email? Check your spam folder.</p>
            </div>
            <Button asChild className="w-full" variant="outline">
              <Link to="/">Back to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Event Registration</CardTitle>
          <CardDescription>Enter your details to register for the event</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </label>
              <Input
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </label>
              <Input
                type="email"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Registering...' : 'Register for Event'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Registration;
