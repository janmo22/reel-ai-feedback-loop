
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import AppLayout from "@/components/layout/AppLayout";
import LandingPage from "./pages/LandingPage";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import UploadPage from "./pages/UploadPage";
import ResultsPage from "./pages/ResultsPage";
import HistoryPage from "./pages/HistoryPage";
import SettingsPage from "./pages/SettingsPage";
import StrategyPage from "./pages/StrategyPage";
import CompetitorsPage from "./pages/CompetitorsPage";
import MyProfileAnalysisPage from "./pages/MyProfileAnalysisPage";
import CreateVideoPage from "./pages/CreateVideoPage";
import VideosPage from "./pages/VideosPage";
import NotFound from "./pages/NotFound";
import CompetitorVideoAnalysisPage from './pages/CompetitorVideoAnalysisPage';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/dashboard" element={<AppLayout><Outlet /></AppLayout>}>
              <Route index element={<Index />} />
              <Route path="create-video" element={<CreateVideoPage />} />
              <Route path="videos" element={<VideosPage />} />
              <Route path="upload" element={<UploadPage />} />
              <Route path="results/:videoId" element={<ResultsPage />} />
              <Route path="results" element={<ResultsPage />} />
              <Route path="history" element={<HistoryPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="strategy" element={<StrategyPage />} />
              <Route path="competitors" element={<CompetitorsPage />} />
              <Route path="my-profile-analysis" element={<MyProfileAnalysisPage />} />
              <Route path="/competitor-video/:videoId" element={<CompetitorVideoAnalysisPage />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
