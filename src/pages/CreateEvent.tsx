
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const CreateEvent = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    eventDate: ''
  });
  const navigate = useNavigate();

  const generateEventCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const moderatorId = localStorage.getItem('moderatorId');
    if (!moderatorId) {
      navigate('/moderator-auth');
      return;
    }

    try {
      const eventCode = generateEventCode();
      
      const { data, error } = await supabase
        .from('events')
        .insert([
          {
            title: formData.title,
            event_date: formData.eventDate,
            event_code: eventCode,
            moderator_id: moderatorId
          }
        ])
        .select()
        .single();

      if (error) {
        toast({
          title: "Error Creating Event",
          description: "Please try again",
          variant: "destructive"
        });
        return;
      }

      localStorage.setItem('currentEventId', data.id);
      localStorage.setItem('currentEventCode', eventCode);
      
      toast({
        title: "Event Created Successfully!",
        description: `Event code: ${eventCode}`
      });
      
      navigate('/moderator-dashboard');
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
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create New Event</CardTitle>
          <CardDescription>Set up your Q&A session</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title</Label>
              <Input
                id="title"
                type="text"
                placeholder="e.g., Town Hall Q&A"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="eventDate">Event Date</Label>
              <Input
                id="eventDate"
                type="date"
                value={formData.eventDate}
                onChange={(e) => setFormData(prev => ({ ...prev, eventDate: e.target.value }))}
                required
              />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? 'Creating...' : 'Create Event and Start Session'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateEvent;
