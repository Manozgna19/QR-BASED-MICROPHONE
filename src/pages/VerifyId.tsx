
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, ArrowRight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const VerifyId = () => {
  const [attendeeId, setAttendeeId] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const navigate = useNavigate();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attendeeId.trim()) {
      toast({
        title: "ID Required",
        description: "Please enter your attendee ID",
        variant: "destructive"
      });
      return;
    }

    setIsVerifying(true);
    
    try {
      const { data, error } = await (supabase as any)
        .from('attendees')
        .select('*')
        .eq('attendee_id', attendeeId.trim())
        .eq('is_verified', true)
        .single();

      if (error || !data) {
        toast({
          title: "Invalid ID",
          description: "Please check your attendee ID and try again",
          variant: "destructive"
        });
      } else {
        localStorage.setItem('currentAttendeeId', attendeeId.trim());
        localStorage.setItem('currentAttendeeName', data.name);
        toast({
          title: "ID Verified Successfully!",
          description: `Welcome ${data.name}`,
        });
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast({
        title: "Verification Failed",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Verify Your ID</CardTitle>
          <CardDescription>Enter your attendee ID to access the system</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Attendee ID</label>
              <Input
                type="text"
                placeholder="e.g., EVT2025-016"
                value={attendeeId}
                onChange={(e) => setAttendeeId(e.target.value)}
                className="font-mono"
              />
            </div>
            
            <Button type="submit" disabled={isVerifying} className="w-full">
              {isVerifying ? 'Verifying...' : 'Verify & Continue'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyId;
