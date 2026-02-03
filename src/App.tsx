import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import DashboardPage from "./pages/Dashboard";
import PodsPage from "./pages/Pods";
import LocationsPage from "./pages/Locations";
import ReservationsPage from "./pages/Reservations";
import UsersPage from "./pages/Users";
import PartnerPage from "./pages/Partner";
import NotificationsPage from "./pages/Notifications";
import SMSDetailsPage from "./pages/SMSDetails";
import EmailDetailsPage from "./pages/EmailDetails";
import PaymentsPage from "./pages/Payments";
import PaymentDetailPage from "./pages/PaymentDetail";
import LogsPage from "./pages/Logs";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./contexts/AuthContext";
import { ApiConfigProvider } from "./contexts/ApiConfigContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <ApiConfigProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter basename={import.meta.env.VITE_APP_BASE || '/'}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                <Route path="/locations" element={<ProtectedRoute><LocationsPage /></ProtectedRoute>} />
                <Route path="/pods" element={<ProtectedRoute><PodsPage /></ProtectedRoute>} />
                <Route path="/reservations" element={<ProtectedRoute><ReservationsPage /></ProtectedRoute>} />
                <Route path="/users" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />
                <Route path="/partner" element={<ProtectedRoute><PartnerPage /></ProtectedRoute>} />
                <Route path="/notification" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
                <Route path="/notification/sms/:recordId" element={<ProtectedRoute><SMSDetailsPage /></ProtectedRoute>} />
                <Route path="/notification/email/:recordId" element={<ProtectedRoute><EmailDetailsPage /></ProtectedRoute>} />
                <Route path="/payments" element={<ProtectedRoute><PaymentsPage /></ProtectedRoute>} />
                <Route path="/payments/:paymentId" element={<ProtectedRoute><PaymentDetailPage /></ProtectedRoute>} />
                <Route path="/logs" element={<ProtectedRoute><LogsPage /></ProtectedRoute>} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ApiConfigProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
