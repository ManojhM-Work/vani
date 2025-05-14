
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

interface AppHeaderProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

const AppHeader = ({ isSidebarOpen, toggleSidebar }: AppHeaderProps) => {
  return (
    <header className="h-16 border-b border-border bg-card flex items-center px-4 shadow-sm">
      <Button 
        variant="ghost" 
        size="icon"
        onClick={toggleSidebar}
        className="mr-4"
      >
        <Menu size={20} />
      </Button>
      
      <div className="flex-1 flex items-center">
        <h1 className="text-xl font-bold text-primary md:text-2xl">VANI</h1>
      </div>
      
      <div className="flex items-center space-x-4">
        <ThemeToggle />
      </div>
    </header>
  );
};

export default AppHeader;
