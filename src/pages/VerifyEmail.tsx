
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [attendeeData, setAttendeeData] = useState<{name: string, attendeeId: string} | null>(null);

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      const attendeeId = searchParams.get('id');

      if (!token || !attendeeId) {
        setVerificationStatus('error');
        return;
      }

      try {
        // Find and verify the attendee
        const { data, error } = await (supabase as any)
          .from('attendees')
          .update({ is_verified: true })
          .eq('verification_token', token)
          .eq('attendee_id', attendeeId)
          .select()
          .single();

        if (error || !data) {
          console.error('Verification error:', error);
          setVerificationStatus('error');
          return;
        }

        setAttendeeData({ name: data.name, attendeeId: data.attendee_id });
        setVerificationStatus('success');
        
        toast({
          title: "Email Verified Successfully!",
          description: "Your registration is now complete",
        });
      } catch (error) {
        console.error('Verification error:', error);
        setVerificationStatus('error');
      }
    };

    verifyEmail();
  }, [searchParams]);

  if (verificationStatus === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <CardTitle className="text-2xl">Verifying Email</CardTitle>
            <CardDescription>Please wait while we verify your registration...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (verificationStatus === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl">Verification Failed</CardTitle>
            <CardDescription>
              The verification link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/register')} className="w-full">
              Register Again
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
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Email Verified!</CardTitle>
          <CardDescription>
            Welcome {attendeeData?.name}! Your registration is complete.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-600 mb-2">Your Attendee ID:</p>
            <p className="font-mono text-lg font-bold">{attendeeData?.attendeeId}</p>
          </div>
          <Button onClick={() => navigate('/qr-scanner')} className="w-full">
            Continue to Event
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyEmail;
