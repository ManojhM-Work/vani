
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "./AppSidebar";
import AppHeader from "./AppHeader";
import AIChatbot from "../chatbot/AIChatbot";

const AppLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <SidebarProvider defaultOpen={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
      <div className="min-h-screen flex flex-col w-full">
        <AppHeader 
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <div className="flex flex-1 overflow-hidden">
          <AppSidebar isOpen={isSidebarOpen} />
          <main className="flex-1 overflow-auto p-6">
            <Outlet />
          </main>
        </div>
        <AIChatbot />
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
