
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Copy, ArrowRight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

const VerificationSuccess = () => {
  const [attendeeId] = useState('EVT2025-016');

  const copyAttendeeId = () => {
    navigator.clipboard.writeText(attendeeId);
    toast({
      title: "Copied!",
      description: "Attendee ID copied to clipboard",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-700">Email Verified!</CardTitle>
          <CardDescription>
            Your unique attendee ID has been generated
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 rounded-lg text-center">
            <p className="text-white text-sm mb-2">Your Attendee ID</p>
            <div className="flex items-center justify-center gap-2">
              <code className="text-white text-xl font-mono font-bold">{attendeeId}</code>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyAttendeeId}
                className="text-white hover:bg-white/20"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 text-sm font-bold">1</span>
              </div>
              <p className="text-sm">Save this ID - you'll need it to access the seminar system</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 text-sm font-bold">2</span>
              </div>
              <p className="text-sm">At the venue, scan the QR code with your phone</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 text-sm font-bold">3</span>
              </div>
              <p className="text-sm">Enter your attendee ID to join the speaking queue</p>
            </div>
          </div>

          <Button asChild className="w-full">
            <Link to="/qr-scanner">
              Continue to QR Scanner
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerificationSuccess;
