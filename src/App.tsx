
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import { ThemeProvider } from "./hooks/useTheme";

// Pages
import Dashboard from "./pages/Dashboard";
import Conversion from "./pages/Conversion";
import FunctionalTesting from "./pages/FunctionalTesting";
import AutomationTesting from "./pages/AutomationTesting";
import PerformanceTesting from "./pages/PerformanceTesting";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/conversion" element={<Conversion />} />
              <Route path="/functional" element={<FunctionalTesting />} />
              <Route path="/automation" element={<AutomationTesting />} />
              <Route path="/performance" element={<PerformanceTesting />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
