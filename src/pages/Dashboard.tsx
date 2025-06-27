
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, Send, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface SpeakingRequest {
  id: string;
  attendee_id: string;
  question: string;
  status: string;
  created_at: string;
}

const Dashboard = () => {
  const [question, setQuestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requests, setRequests] = useState<SpeakingRequest[]>([]);
  const [attendeeName, setAttendeeName] = useState('');
  const [attendeeId, setAttendeeId] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const storedAttendeeId = localStorage.getItem('currentAttendeeId');
    const storedAttendeeName = localStorage.getItem('currentAttendeeName');
    
    if (!storedAttendeeId) {
      navigate('/verify-id');
      return;
    }
    
    setAttendeeId(storedAttendeeId);
    setAttendeeName(storedAttendeeName || '');
    loadRequests(storedAttendeeId);
  }, [navigate]);

  const loadRequests = async (attendeeId: string) => {
    try {
      const { data, error } = await (supabase as any)
        .from('speaking_requests')
        .select('*')
        .eq('attendee_id', attendeeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error loading requests:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) {
      toast({
        title: "Question Required",
        description: "Please enter your question",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await (supabase as any)
        .from('speaking_requests')
        .insert([
          {
            attendee_id: attendeeId,
            question: question.trim(),
            status: 'approved'
          }
        ]);

      if (error) throw error;

      setQuestion('');
      toast({
        title: "Request Submitted!",
        description: "Your speaking request has been approved",
      });
      
      loadRequests(attendeeId);
    } catch (error) {
      console.error('Submit error:', error);
      toast({
        title: "Submission Failed",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Welcome, {attendeeName}</CardTitle>
            <CardDescription>ID: {attendeeId}</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="w-5 h-5" />
              Submit Speaking Request
            </CardTitle>
            <CardDescription>Enter your question to request speaking time</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="text"
                placeholder="What would you like to ask?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
                <Send className="w-4 h-4 ml-2" />
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Speaking Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {requests.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No requests yet</p>
            ) : (
              <div className="space-y-3">
                {requests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-medium">{request.question}</p>
                      {getStatusBadge(request.status)}
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(request.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
