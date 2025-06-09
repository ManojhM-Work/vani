
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { 
  LayoutDashboard, 
  FileType2, 
  FlaskConical, 
  Code, 
  Gauge,
  GitBranch,
  ChevronDown 
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface AppSidebarProps {
  isOpen: boolean;
}

const AppSidebar = ({ isOpen }: AppSidebarProps) => {
  const location = useLocation();

  const navigationItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/",
    },
    {
      title: "API Conversion",
      icon: FileType2,
      href: "/conversion",
    },
    {
      title: "Functional Testing",
      icon: FlaskConical,
      href: "/functional",
    },
    {
      title: "Automation Testing",
      icon: Code,
      href: "/automation",
    },
    {
      title: "Performance Testing",
      icon: Gauge,
      href: "/performance",
    },
    {
      title: "CI/CD Integration",
      icon: GitBranch,
      href: "/cicd",
    },
  ];

  return (
    <Sidebar className={cn("transition-all duration-300", !isOpen && "w-0")}>
      <SidebarHeader className="border-b px-6 py-4">
        <h2 className="text-xl font-bold">VANI</h2>
      </SidebarHeader>
      <SidebarContent className="px-4 py-6">
        <SidebarMenu>
          {navigationItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild isActive={location.pathname === item.href}>
                <Link to={item.href}>
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
