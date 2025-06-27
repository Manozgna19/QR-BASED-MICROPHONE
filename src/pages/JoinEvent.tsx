
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { QrCode, ArrowRight, Camera, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import QRScanner from '@/components/QRScanner';

const JoinEvent = () => {
  const [eventCode, setEventCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const navigate = useNavigate();

  const handleJoinEvent = async (code: string) => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('event_code', code.toUpperCase())
        .eq('is_active', true)
        .single();

      if (error || !data) {
        toast({
          title: "Event Not Found",
          description: "Please check the event code and try again",
          variant: "destructive"
        });
        return;
      }

      navigate(`/session/${data.event_code}`);
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

  const handleManualJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleJoinEvent(eventCode);
  };

  const handleQRScan = (result: string) => {
    // Extract event code from QR result (assuming it's just the event code)
    const scannedCode = result.trim().toUpperCase();
    setShowScanner(false);
    handleJoinEvent(scannedCode);
  };

  const handleScanError = (error: string) => {
    console.error('QR Scan Error:', error);
    toast({
      title: "Scan Error",
      description: "Unable to scan QR code. Please try again or enter the code manually.",
      variant: "destructive"
    });
  };

  if (showScanner) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Scan QR Code</h1>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowScanner(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <QRScanner
            onScan={handleQRScan}
            onError={handleScanError}
          />
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 mb-4">
              Position the QR code within the camera frame
            </p>
            <Button
              variant="outline"
              onClick={() => setShowScanner(false)}
              className="w-full"
            >
              Enter Code Manually Instead
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Join Event</h1>
          <p className="text-gray-600">Join a Q&A session to ask questions</p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Camera className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle>Scan QR Code</CardTitle>
            <CardDescription>Use your camera to scan the event QR code</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => setShowScanner(true)} 
              className="w-full" 
              size="lg"
            >
              <Camera className="w-5 h-5 mr-2" />
              Scan Event QR Code
            </Button>
          </CardContent>
        </Card>

        <div className="text-center text-gray-500">
          <span>or</span>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle>Enter Event Code</CardTitle>
            <CardDescription>Manually enter the event code</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleManualJoin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="eventCode">Event Code</Label>
                <Input
                  id="eventCode"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={eventCode}
                  onChange={(e) => setEventCode(e.target.value)}
                  className="text-center text-lg font-mono"
                  maxLength={6}
                  required
                />
              </div>
              <Button type="submit" disabled={isLoading || eventCode.length !== 6} className="w-full">
                {isLoading ? 'Joining...' : 'Join Event'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JoinEvent;
