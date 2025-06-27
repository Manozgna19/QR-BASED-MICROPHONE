
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ModeratorAuth from "./pages/ModeratorAuth";
import ModeratorDashboard from "./pages/ModeratorDashboard";
import CreateEvent from "./pages/CreateEvent";
import JoinEvent from "./pages/JoinEvent";
import AttendeeSession from "./pages/AttendeeSession";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/moderator-auth" element={<ModeratorAuth />} />
          <Route path="/moderator-dashboard" element={<ModeratorDashboard />} />
          <Route path="/create-event" element={<CreateEvent />} />
          <Route path="/join-event" element={<JoinEvent />} />
          <Route path="/session/:eventCode" element={<AttendeeSession />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
