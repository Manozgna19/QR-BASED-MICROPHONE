import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mic, MicOff, Users, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Event {
  id: string;
  title: string;
  accepting_requests: boolean;
  is_active: boolean;
}

interface SpeakingRequest {
  id: string;
  attendee_name: string;
  question: string;
  status: string;
  queue_position: number;
}

const AttendeeSession = () => {
  const { eventCode } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [attendeeName, setAttendeeName] = useState('');
  const [question, setQuestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentRequest, setCurrentRequest] = useState<SpeakingRequest | null>(null);
  const [sessionState, setSessionState] = useState<'default' | 'submitting' | 'queued' | 'speaking' | 'ended'>('default');
  const [isMuted, setIsMuted] = useState(true);
  const [queuePosition, setQueuePosition] = useState(0);

  useEffect(() => {
    if (!eventCode) return;

    const fetchEvent = async () => {
      const { data } = await supabase
        .from('events')
        .select('*')
        .eq('event_code', eventCode)
        .single();

      if (data) {
        setEvent(data);
        if (!data.is_active) {
          setSessionState('ended');
        }
      } else {
        navigate('/join-event');
      }
    };

    fetchEvent();

    // Set up real-time listeners
    const eventsChannel = supabase
      .channel('events-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'events',
          filter: `event_code=eq.${eventCode}`
        },
        (payload) => {
          const updatedEvent = payload.new as Event;
          setEvent(updatedEvent);
          if (!updatedEvent.is_active) {
            setSessionState('ended');
          }
        }
      )
      .subscribe();

    const requestsChannel = supabase
      .channel('requests-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'speaking_requests'
        },
        (payload) => {
          if (currentRequest && payload.new && typeof payload.new === 'object' && 'id' in payload.new && payload.new.id === currentRequest.id) {
            const updatedRequest = payload.new as SpeakingRequest;
            setCurrentRequest(updatedRequest);
            
            if (updatedRequest.status === 'approved') {
              setSessionState('speaking');
              toast({
                title: "It's Your Turn!",
                description: "You can now speak",
              });
            } else if (updatedRequest.status === 'dismissed') {
              setSessionState('default');
              setCurrentRequest(null);
              toast({
                title: "Request Dismissed",
                description: "Your request was not approved",
                variant: "destructive"
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(eventsChannel);
      supabase.removeChannel(requestsChannel);
    };
  }, [eventCode, navigate, currentRequest]);

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event || !attendeeName.trim() || !question.trim()) return;

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('speaking_requests')
        .insert([
          {
            event_id: event.id,
            attendee_name: attendeeName.trim(),
            question: question.trim()
          }
        ])
        .select()
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "Failed to submit request",
          variant: "destructive"
        });
        return;
      }

      setCurrentRequest(data);
      setSessionState('queued');
      toast({
        title: "Request Submitted",
        description: "You've been added to the queue"
      });

      // Get initial queue position
      const { data: queueData } = await supabase
        .from('speaking_requests')
        .select('id')
        .eq('event_id', event.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (queueData) {
        const position = queueData.findIndex(req => req.id === data.id) + 1;
        setQueuePosition(position);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMicrophone = () => {
    setIsMuted(!isMuted);
    toast({
      title: isMuted ? "Microphone Unmuted" : "Microphone Muted",
      description: isMuted ? "You can now speak" : "Your microphone is muted"
    });
  };

  if (!event) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center">Loading...</div>;
  }

  if (sessionState === 'ended') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold mb-4">Session Ended</h2>
            <p className="text-gray-600 mb-6">This Q&A session has ended. Thank you for participating.</p>
            <Button onClick={() => navigate('/')} className="w-full">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md mx-auto">
        {/* Event Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{event.title}</h1>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            <span>Live Session</span>
            {!event.accepting_requests && (
              <>
                <span>•</span>
                <span className="text-red-600">Queue Closed</span>
              </>
            )}
          </div>
        </div>

        {/* Default State - Request to Speak */}
        {sessionState === 'default' && (
          <Card>
            <CardHeader className="text-center">
              <CardTitle>Join the Discussion</CardTitle>
              <CardDescription>Submit your question to join the speaker queue</CardDescription>
            </CardHeader>
            <CardContent>
              {event.accepting_requests ? (
                <Button 
                  onClick={() => setSessionState('submitting')} 
                  className="w-full" 
                  size="lg"
                >
                  Request to Speak
                </Button>
              ) : (
                <div className="text-center text-gray-600">
                  <p>The queue is currently closed to new requests.</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Submitting State - Question Form */}
        {sessionState === 'submitting' && (
          <Card>
            <CardHeader>
              <CardTitle>Submit Your Question</CardTitle>
              <CardDescription>Provide your name and question</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitRequest} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your name"
                    value={attendeeName}
                    onChange={(e) => setAttendeeName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="question">Your Question</Label>
                  <Textarea
                    id="question"
                    placeholder="Type your question briefly here..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    rows={4}
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setSessionState('default')}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Request'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Queued State */}
        {sessionState === 'queued' && (
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="mb-4">
                <Clock className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                <h2 className="text-xl font-bold">You're in the Queue</h2>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <p className="text-2xl font-bold text-blue-600">Position #{queuePosition}</p>
                <p className="text-sm text-gray-600">We'll notify you when it's your turn</p>
              </div>
              <div className="text-left bg-gray-50 p-3 rounded">
                <p className="text-sm text-gray-600 mb-1">Your question:</p>
                <p className="text-sm">{question}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Speaking State */}
        {sessionState === 'speaking' && (
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-green-600 mb-2">
                  IT'S YOUR TURN TO SPEAK
                </h1>
                <p className="text-gray-600">Your microphone is ready</p>
              </div>
              
              <div className="mb-6">
                <Button
                  onClick={toggleMicrophone}
                  size="lg"
                  className={`w-32 h-32 rounded-full text-white font-bold text-lg ${
                    isMuted 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-green-600 hover:bg-green-700 animate-pulse'
                  }`}
                >
                  {isMuted ? (
                    <>
                      <MicOff className="w-8 h-8 mb-2" />
                      <span>UNMUTE</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-8 h-8 mb-2" />
                      <span>MUTE</span>
                    </>
                  )}
                </Button>
              </div>

              {!isMuted && (
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <div className="w-2 h-2 bg-green-600 rounded-full animate-ping"></div>
                  <span className="text-sm font-semibold">LIVE</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AttendeeSession;
