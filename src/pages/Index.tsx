
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, Users, Settings, Smartphone, Bell, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Digital Speaker Queue</h1>
            <Link to="/moderator-auth">
              <Button variant="outline">Moderator Login</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Digital Speaker Queue
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Orderly Q&A for Modern Events. No more passing microphones. Manage your speakers with a clean, digital interface.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/join-event">
              <Button size="lg" className="text-lg px-8 py-4 bg-blue-600 hover:bg-blue-700">
                Join an Event
              </Button>
            </Link>
            <Link to="/moderator-auth">
              <Button size="lg" variant="outline" className="text-lg px-8 py-4">
                Moderator Login
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* For Moderators */}
          <Card className="p-6">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Settings className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">For Moderators</CardTitle>
              <CardDescription>Complete control over your Q&A sessions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-semibold">Create Events</h4>
                  <p className="text-sm text-gray-600">Set up events with unique QR codes for easy joining</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mic className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-semibold">Manage Queue in Real-time</h4>
                  <p className="text-sm text-gray-600">Approve, dismiss, and reorder speakers instantly</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-semibold">Full Control</h4>
                  <p className="text-sm text-gray-600">Start, pause, and end sessions with complete authority</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* For Attendees */}
          <Card className="p-6">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Smartphone className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">For Attendees</CardTitle>
              <CardDescription>Simple, seamless participation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Smartphone className="w-5 h-5 text-green-600 mt-1" />
                <div>
                  <h4 className="font-semibold">Join Instantly</h4>
                  <p className="text-sm text-gray-600">Scan QR code with your phone - no registration required</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mic className="w-5 h-5 text-green-600 mt-1" />
                <div>
                  <h4 className="font-semibold">Ask from Your Seat</h4>
                  <p className="text-sm text-gray-600">Submit questions and use your phone as a microphone</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Bell className="w-5 h-5 text-green-600 mt-1" />
                <div>
                  <h4 className="font-semibold">Clear Notifications</h4>
                  <p className="text-sm text-gray-600">Know exactly when it's your turn to speak</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Index;
