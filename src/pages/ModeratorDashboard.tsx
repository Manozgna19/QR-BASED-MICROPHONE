
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { QrCode, Users, Mic, MicOff, UserCheck, UserX, GripVertical } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import QRCodeGenerator from '@/components/QRCodeGenerator';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

interface Event {
  id: string;
  title: string;
  event_code: string;
  accepting_requests: boolean;
  is_active: boolean;
}

interface SpeakingRequest {
  id: string;
  attendee_name: string;
  question: string;
  status: string;
  queue_position: number;
  created_at: string;
}

const ModeratorDashboard = () => {
  const [event, setEvent] = useState<Event | null>(null);
  const [speakingRequests, setSpeakingRequests] = useState<SpeakingRequest[]>([]);
  const [currentSpeaker, setCurrentSpeaker] = useState<SpeakingRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const moderatorId = localStorage.getItem('moderatorId');
    if (!moderatorId) {
      navigate('/moderator-auth');
      return;
    }

    const fetchData = async () => {
      // Check if there's a current event
      let currentEventId = localStorage.getItem('currentEventId');
      
      if (!currentEventId) {
        // Fetch the latest active event for this moderator
        const { data } = await supabase
          .from('events')
          .select('*')
          .eq('moderator_id', moderatorId)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (data) {
          currentEventId = data.id;
          localStorage.setItem('currentEventId', data.id);
          localStorage.setItem('currentEventCode', data.event_code);
        } else {
          navigate('/create-event');
          return;
        }
      }

      // Fetch event details
      const { data: eventData } = await supabase
        .from('events')
        .select('*')
        .eq('id', currentEventId)
        .single();

      if (eventData) {
        setEvent(eventData);
      }

      // Fetch speaking requests
      const { data: requestsData } = await supabase
        .from('speaking_requests')
        .select('*')
        .eq('event_id', currentEventId)
        .order('created_at', { ascending: true });

      if (requestsData) {
        const pending = requestsData.filter(r => r.status === 'pending');
        const approved = requestsData.find(r => r.status === 'approved');
        
        setSpeakingRequests(pending);
        if (approved) setCurrentSpeaker(approved);
      }

      setIsLoading(false);
    };

    fetchData();

    // Set up real-time listeners
    const requestsChannel = supabase
      .channel('moderator-requests')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'speaking_requests'
        },
        () => {
          fetchData(); // Refresh data on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(requestsChannel);
    };
  }, [navigate]);

  const handleApprove = async (request: SpeakingRequest) => {
    try {
      // First, end current speaker's turn if any
      if (currentSpeaker) {
        await supabase
          .from('speaking_requests')
          .update({ status: 'completed' })
          .eq('id', currentSpeaker.id);
      }

      // Approve the new speaker
      await supabase
        .from('speaking_requests')
        .update({ status: 'approved' })
        .eq('id', request.id);

      setCurrentSpeaker(request);
      setSpeakingRequests(prev => prev.filter(r => r.id !== request.id));
      
      toast({
        title: "Speaker Approved",
        description: `${request.attendee_name} can now speak`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve speaker",
        variant: "destructive"
      });
    }
  };

  const handleDismiss = async (request: SpeakingRequest) => {
    try {
      await supabase
        .from('speaking_requests')
        .update({ status: 'dismissed' })
        .eq('id', request.id);

      setSpeakingRequests(prev => prev.filter(r => r.id !== request.id));
      
      toast({
        title: "Request Dismissed",
        description: `${request.attendee_name}'s request was dismissed`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to dismiss request",
        variant: "destructive"
      });
    }
  };

  const handleEndTurn = async () => {
    if (!currentSpeaker) return;

    try {
      await supabase
        .from('speaking_requests')
        .update({ status: 'completed' })
        .eq('id', currentSpeaker.id);

      setCurrentSpeaker(null);
      
      toast({
        title: "Turn Ended",
        description: `${currentSpeaker.attendee_name}'s turn has ended`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to end turn",
        variant: "destructive"
      });
    }
  };

  const handleToggleRequests = async (accepting: boolean) => {
    if (!event) return;

    try {
      await supabase
        .from('events')
        .update({ accepting_requests: accepting })
        .eq('id', event.id);

      setEvent(prev => prev ? { ...prev, accepting_requests: accepting } : null);
      
      toast({
        title: accepting ? "Queue Opened" : "Queue Closed",
        description: accepting ? "Now accepting new requests" : "No longer accepting new requests"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update queue status",
        variant: "destructive"
      });
    }
  };

  const handleEndSession = async () => {
    if (!event) return;

    try {
      await supabase
        .from('events')
        .update({ is_active: false })
        .eq('id', event.id);

      localStorage.removeItem('currentEventId');
      localStorage.removeItem('currentEventCode');
      
      toast({
        title: "Session Ended",
        description: "The Q&A session has been ended"
      });
      
      navigate('/create-event');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to end session",
        variant: "destructive"
      });
    }
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(speakingRequests);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setSpeakingRequests(items);
  };

  if (isLoading) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center">Loading...</div>;
  }

  if (!event) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center">No active event</div>;
  }

  const joinUrl = `${window.location.origin}/session/${event.event_code}`;

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
            <Button 
              onClick={handleEndSession} 
              variant="destructive" 
              size="lg"
              className="bg-red-600 hover:bg-red-700"
            >
              END SESSION
            </Button>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>Event Code: {event.event_code}</span>
            </div>
            <Badge variant={event.is_active ? "default" : "secondary"}>
              {event.is_active ? "Live" : "Ended"}
            </Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column - Live Queue */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Speaker Requests ({speakingRequests.length})
                </CardTitle>
                <CardDescription>Manage the queue of speakers</CardDescription>
              </CardHeader>
              <CardContent>
                {speakingRequests.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No pending requests</p>
                  </div>
                ) : (
                  <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="requests">
                      {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                          {speakingRequests.map((request, index) => (
                            <Draggable key={request.id} draggableId={request.id} index={index}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className="bg-white border rounded-lg p-4 shadow-sm"
                                >
                                  <div className="flex items-start gap-3">
                                    <div {...provided.dragHandleProps} className="mt-1">
                                      <GripVertical className="w-4 h-4 text-gray-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-semibold text-gray-900">{request.attendee_name}</h4>
                                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{request.question}</p>
                                    </div>
                                    <div className="flex gap-2">
                                      <Button
                                        onClick={() => handleApprove(request)}
                                        size="sm"
                                        className="bg-green-600 hover:bg-green-700"
                                      >
                                        <UserCheck className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        onClick={() => handleDismiss(request)}
                                        size="sm"
                                        variant="outline"
                                      >
                                        <UserX className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Session Control */}
          <div className="space-y-6">
            {/* Currently Speaking */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic className="w-5 h-5" />
                  Currently Speaking
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentSpeaker ? (
                  <div className="space-y-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-green-900">{currentSpeaker.attendee_name}</h3>
                      <p className="text-sm text-green-700 mt-1">{currentSpeaker.question}</p>
                    </div>
                    <Button 
                      onClick={handleEndTurn}
                      variant="destructive"
                      className="w-full"
                    >
                      <MicOff className="w-4 h-4 mr-2" />
                      Mute / End Turn
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <MicOff className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No one is currently speaking</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Event QR Code */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="w-5 h-5" />
                  Event QR Code
                </CardTitle>
                <CardDescription>Share this QR code for attendees to join</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="bg-white p-4 rounded-lg border mb-4">
                  <QRCodeGenerator value={joinUrl} size={200} />
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  <p>Event Code: <span className="font-mono font-bold">{event.event_code}</span></p>
                  <p className="break-all">{joinUrl}</p>
                </div>
              </CardContent>
            </Card>

            {/* Queue Status Control */}
            <Card>
              <CardHeader>
                <CardTitle>Queue Status Control</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Accepting New Requests</p>
                    <p className="text-sm text-gray-600">
                      {event.accepting_requests ? 'Queue is open' : 'Queue is closed'}
                    </p>
                  </div>
                  <Switch
                    checked={event.accepting_requests}
                    onCheckedChange={handleToggleRequests}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModeratorDashboard;
