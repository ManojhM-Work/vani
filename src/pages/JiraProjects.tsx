import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, 
  Search, 
  Settings, 
  Users, 
  Calendar,
  Star,
  MoreHorizontal,
  Folder
} from "lucide-react";

interface Project {
  id: string;
  name: string;
  key: string;
  description: string;
  lead: string;
  type: string;
  category: string;
  created: string;
  issueCount: number;
  memberCount: number;
  avatar?: string;
}

const mockProjects: Project[] = [
  {
    id: "1",
    name: "VANI Testing Platform",
    key: "VTP",
    description: "Main testing platform for API conversions and automation",
    lead: "John Doe",
    type: "Software",
    category: "Development",
    created: "2024-01-15",
    issueCount: 45,
    memberCount: 8,
  },
  {
    id: "2", 
    name: "Performance Analytics",
    key: "PA",
    description: "Performance monitoring and analytics dashboard",
    lead: "Jane Smith",
    type: "Software",
    category: "Analytics",
    created: "2024-02-01",
    issueCount: 23,
    memberCount: 5,
  },
  {
    id: "3",
    name: "CI/CD Pipeline",
    key: "CICD",
    description: "Continuous integration and deployment workflows",
    lead: "Mike Johnson",
    type: "DevOps",
    category: "Infrastructure", 
    created: "2024-01-30",
    issueCount: 12,
    memberCount: 3,
  }
];

const JiraProjects = () => {
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    key: "",
    description: "",
    type: "Software",
    lead: "",
    category: ""
  });

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.key.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateProject = () => {
    const project: Project = {
      id: Date.now().toString(),
      name: newProject.name,
      key: newProject.key.toUpperCase(),
      description: newProject.description,
      lead: newProject.lead,
      type: newProject.type,
      category: newProject.category,
      created: new Date().toISOString().split('T')[0],
      issueCount: 0,
      memberCount: 1
    };
    
    setProjects([...projects, project]);
    setNewProject({
      name: "",
      key: "",
      description: "",
      type: "Software",
      lead: "",
      category: ""
    });
    setIsCreateDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Jira-style header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Projects</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your team's projects and track progress
              </p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#0052CC] hover:bg-[#0043A3] text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Create project
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create new project</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Project name *</Label>
                    <Input
                      id="name"
                      value={newProject.name}
                      onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                      placeholder="Enter project name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="key">Project key *</Label>
                    <Input
                      id="key"
                      value={newProject.key}
                      onChange={(e) => setNewProject({...newProject, key: e.target.value})}
                      placeholder="e.g., PROJ"
                      maxLength={10}
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newProject.description}
                      onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                      placeholder="Describe your project"
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Project type</Label>
                    <Select value={newProject.type} onValueChange={(value) => setNewProject({...newProject, type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Software">Software</SelectItem>
                        <SelectItem value="Business">Business</SelectItem>
                        <SelectItem value="DevOps">DevOps</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="lead">Project lead</Label>
                    <Input
                      id="lead"
                      value={newProject.lead}
                      onChange={(e) => setNewProject({...newProject, lead: e.target.value})}
                      placeholder="Enter project lead name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={newProject.category}
                      onChange={(e) => setNewProject({...newProject, category: e.target.value})}
                      placeholder="e.g., Development, QA, Infrastructure"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateProject}
                    className="bg-[#0052CC] hover:bg-[#0043A3] text-white"
                    disabled={!newProject.name || !newProject.key}
                  >
                    Create
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        {/* Search and filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            View settings
          </Button>
        </div>

        {/* Projects grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="hover:shadow-md transition-shadow border-border">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={project.avatar} />
                      <AvatarFallback className="bg-[#0052CC] text-white text-sm">
                        {project.key.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Link 
                        to={`/jira/projects/${project.key}/board`}
                        className="font-medium text-foreground hover:text-[#0052CC] transition-colors"
                      >
                        {project.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">{project.key}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {project.description}
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Project lead</span>
                    <span className="font-medium">{project.lead}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Type</span>
                    <Badge variant="secondary" className="text-xs">
                      {project.type}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Issues</span>
                    <Link 
                      to={`/jira/projects/${project.key}/issues`}
                      className="font-medium text-[#0052CC] hover:underline"
                    >
                      {project.issueCount}
                    </Link>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Members</span>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span className="font-medium">{project.memberCount}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    asChild
                  >
                    <Link to={`/jira/projects/${project.key}/board`}>
                      <Folder className="h-3 w-3 mr-2" />
                      Board
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    asChild
                  >
                    <Link to={`/jira/projects/${project.key}/issues`}>
                      Issues
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No projects found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? "Try adjusting your search terms" : "Get started by creating your first project"}
            </p>
            {!searchTerm && (
              <Button 
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-[#0052CC] hover:bg-[#0043A3] text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create project
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default JiraProjects;