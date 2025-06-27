
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SpeakingRequest {
  id: string;
  attendee_id: string;
  question: string;
  status: string;
  created_at: string;
  attendees?: {
    name: string;
    email: string;
  };
}

const Moderator = () => {
  const [requests, setRequests] = useState<SpeakingRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('speaking_requests')
        .select(`
          *,
          attendees (
            name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error loading requests:', error);
      toast({
        title: "Error",
        description: "Failed to load requests",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (id: string, status: string) => {
    try {
      const { error } = await (supabase as any)
        .from('speaking_requests')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: `Request ${status}`,
        description: `Speaking request has been ${status}`,
      });

      loadRequests();
    } catch (error) {
      console.error('Error updating request:', error);
      toast({
        title: "Error",
        description: "Failed to update request",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const pendingRequests = requests.filter(req => req.status === 'pending');
  const approvedRequests = requests.filter(req => req.status === 'approved');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-100 flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Moderator Panel</CardTitle>
            <CardDescription>Manage speaking requests</CardDescription>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="text-2xl font-bold">{pendingRequests.length}</p>
                  <p className="text-sm text-gray-600">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{approvedRequests.length}</p>
                  <p className="text-sm text-gray-600">Approved</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-2xl font-bold">{requests.length}</p>
                  <p className="text-sm text-gray-600">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Speaking Requests</CardTitle>
            <CardDescription>Review and manage requests</CardDescription>
          </CardHeader>
          <CardContent>
            {requests.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No requests yet</p>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="font-medium">{request.attendees?.name || 'Unknown'}</p>
                          <Badge variant="outline">{request.attendee_id}</Badge>
                          {getStatusBadge(request.status)}
                        </div>
                        <p className="text-gray-700 mb-2">{request.question}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(request.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    {request.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => updateRequestStatus(request.id, 'approved')}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button 
                          onClick={() => updateRequestStatus(request.id, 'rejected')}
                          size="sm"
                          variant="outline"
                          className="border-red-200 text-red-700 hover:bg-red-50"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
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

export default Moderator;
