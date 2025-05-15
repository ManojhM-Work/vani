
import { useLocation } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { Code, FileType2, FlaskConical, Gauge } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

interface AppSidebarProps {
  isOpen: boolean;
}

const AppSidebar = ({ isOpen }: AppSidebarProps) => {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  // Check if sidebar is collapsed
  const isCollapsed = state === "collapsed";

  /* Navigation items for the sidebar */
  const navigationItems = [
    { title: "Dashboard", url: "/", icon: Code },
    { title: "Conversion", url: "/conversion", icon: FileType2 },
    { title: "Functional Tests", url: "/functional", icon: FlaskConical },
    { title: "Automation", url: "/automation", icon: Code },
    { title: "Performance", url: "/performance", icon: Gauge },
  ];

  /* Helper functions */
  const isActive = (path: string) => {
    // Handle home route exact match and other routes with startsWith
    if (path === "/") return currentPath === "/";
    return currentPath.startsWith(path);
  };
  
  const isExpanded = navigationItems.some((item) => isActive(item.url));
  
  const getNavClass = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium px-3 py-2 rounded-md flex items-center"
      : "hover:bg-muted/50 px-3 py-2 rounded-md flex items-center";

  return (
    <Sidebar 
      className={isCollapsed ? "w-14 transition-all duration-300" : "w-64 transition-all duration-300"} 
      collapsible="icon"
    >
      <SidebarTrigger className="m-2 self-end" />

      <SidebarContent>
        <div className="my-4 px-4">
          {!isCollapsed && (
            <h2 className="text-xl font-bold text-primary">VANI</h2>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-2">
            {!isCollapsed && "Navigation"}
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end={item.url === "/"} className={getNavClass}>
                      <item.icon className="h-5 w-5" />
                      {!isCollapsed && (
                        <span className="ml-3">{item.title}</span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
