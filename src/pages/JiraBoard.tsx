import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, 
  Filter,
  Search,
  Settings,
  MoreHorizontal,
  ArrowLeft,
  Bug,
  Bookmark,
  CheckCircle,
  Circle,
  AlertTriangle
} from "lucide-react";

interface Issue {
  id: string;
  key: string;
  title: string;
  description: string;
  type: "Task" | "Bug" | "Story" | "Epic";
  priority: "Highest" | "High" | "Medium" | "Low" | "Lowest";
  status: "To Do" | "In Progress" | "In Review" | "Done";
  assignee?: string;
  reporter: string;
  created: string;
  labels: string[];
  storyPoints?: number;
}

const mockIssues: Issue[] = [
  {
    id: "1",
    key: "VTP-1",
    title: "Implement API conversion feature",
    description: "Create endpoint for converting API specifications",
    type: "Task",
    priority: "High",
    status: "In Progress",
    assignee: "John Doe",
    reporter: "Jane Smith",
    created: "2024-01-15",
    labels: ["backend", "api"],
    storyPoints: 8
  },
  {
    id: "2", 
    key: "VTP-2",
    title: "Fix authentication bug",
    description: "Users cannot login with valid credentials",
    type: "Bug",
    priority: "Highest",
    status: "To Do",
    assignee: "Mike Johnson",
    reporter: "John Doe",
    created: "2024-01-16",
    labels: ["auth", "critical"]
  },
  {
    id: "3",
    key: "VTP-3", 
    title: "Design user dashboard",
    description: "Create mockups for main user dashboard",
    type: "Story",
    priority: "Medium",
    status: "Done",
    assignee: "Sarah Wilson",
    reporter: "Jane Smith",
    created: "2024-01-14",
    labels: ["ui", "design"],
    storyPoints: 5
  },
  {
    id: "4",
    key: "VTP-4",
    title: "Performance testing integration",
    description: "Add performance testing capabilities to the platform",
    type: "Epic",
    priority: "High", 
    status: "In Review",
    assignee: "John Doe",
    reporter: "Mike Johnson",
    created: "2024-01-17",
    labels: ["performance", "testing"],
    storyPoints: 13
  }
];

const columns = [
  { id: "To Do", title: "To Do", color: "bg-gray-100" },
  { id: "In Progress", title: "In Progress", color: "bg-blue-100" },
  { id: "In Review", title: "In Review", color: "bg-yellow-100" },
  { id: "Done", title: "Done", color: "bg-green-100" }
];

const JiraBoard = () => {
  const { projectKey } = useParams();
  const [issues, setIssues] = useState<Issue[]>(mockIssues);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newIssue, setNewIssue] = useState({
    title: "",
    description: "",
    type: "Task" as Issue["type"],
    priority: "Medium" as Issue["priority"],
    assignee: "",
    labels: ""
  });

  const getIssueIcon = (type: Issue["type"]) => {
    switch (type) {
      case "Bug": return <Bug className="h-4 w-4 text-red-500" />;
      case "Story": return <Bookmark className="h-4 w-4 text-green-500" />;
      case "Epic": return <AlertTriangle className="h-4 w-4 text-purple-500" />;
      default: return <CheckCircle className="h-4 w-4 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: Issue["priority"]) => {
    switch (priority) {
      case "Highest": return "text-red-600";
      case "High": return "text-red-400";
      case "Medium": return "text-yellow-500";
      case "Low": return "text-green-400";
      case "Lowest": return "text-gray-400";
      default: return "text-gray-400";
    }
  };

  const handleCreateIssue = () => {
    const issue: Issue = {
      id: Date.now().toString(),
      key: `${projectKey}-${issues.length + 1}`,
      title: newIssue.title,
      description: newIssue.description,
      type: newIssue.type,
      priority: newIssue.priority,
      status: "To Do",
      assignee: newIssue.assignee || undefined,
      reporter: "Current User",
      created: new Date().toISOString().split('T')[0],
      labels: newIssue.labels.split(',').map(l => l.trim()).filter(l => l),
      storyPoints: newIssue.type === "Story" || newIssue.type === "Epic" ? 0 : undefined
    };
    
    setIssues([...issues, issue]);
    setNewIssue({
      title: "",
      description: "",
      type: "Task",
      priority: "Medium",
      assignee: "",
      labels: ""
    });
    setIsCreateDialogOpen(false);
  };

  const moveIssue = (issueId: string, newStatus: Issue["status"]) => {
    setIssues(issues.map(issue => 
      issue.id === issueId ? { ...issue, status: newStatus } : issue
    ));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/jira/projects" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  {projectKey} Board
                </h1>
                <p className="text-sm text-muted-foreground">
                  Kanban board • {issues.length} issues
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#0052CC] hover:bg-[#0043A3] text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Create issue
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Create issue</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="issue-type">Issue type</Label>
                      <Select value={newIssue.type} onValueChange={(value: Issue["type"]) => setNewIssue({...newIssue, type: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Task">Task</SelectItem>
                          <SelectItem value="Bug">Bug</SelectItem>
                          <SelectItem value="Story">Story</SelectItem>
                          <SelectItem value="Epic">Epic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="issue-title">Summary *</Label>
                      <Input
                        id="issue-title"
                        value={newIssue.title}
                        onChange={(e) => setNewIssue({...newIssue, title: e.target.value})}
                        placeholder="Enter issue summary"
                      />
                    </div>
                    <div>
                      <Label htmlFor="issue-description">Description</Label>
                      <Textarea
                        id="issue-description"
                        value={newIssue.description}
                        onChange={(e) => setNewIssue({...newIssue, description: e.target.value})}
                        placeholder="Describe the issue"
                      />
                    </div>
                    <div>
                      <Label htmlFor="issue-priority">Priority</Label>
                      <Select value={newIssue.priority} onValueChange={(value: Issue["priority"]) => setNewIssue({...newIssue, priority: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Highest">Highest</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="Lowest">Lowest</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="issue-assignee">Assignee</Label>
                      <Input
                        id="issue-assignee"
                        value={newIssue.assignee}
                        onChange={(e) => setNewIssue({...newIssue, assignee: e.target.value})}
                        placeholder="Enter assignee name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="issue-labels">Labels</Label>
                      <Input
                        id="issue-labels"
                        value={newIssue.labels}
                        onChange={(e) => setNewIssue({...newIssue, labels: e.target.value})}
                        placeholder="Enter labels separated by commas"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 mt-6">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleCreateIssue}
                      className="bg-[#0052CC] hover:bg-[#0043A3] text-white"
                      disabled={!newIssue.title}
                    >
                      Create
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {columns.map((column) => (
            <div key={column.id} className="bg-card rounded-lg border">
              <div className="p-4 border-b">
                <h3 className="font-medium text-foreground flex items-center justify-between">
                  {column.title}
                  <Badge variant="secondary" className="ml-2">
                    {issues.filter(issue => issue.status === column.id).length}
                  </Badge>
                </h3>
              </div>
              <div className="p-4 space-y-3">
                {issues
                  .filter(issue => issue.status === column.id)
                  .map((issue) => (
                    <Card 
                      key={issue.id}
                      className="hover:shadow-md transition-shadow cursor-pointer border-border"
                      onClick={() => {/* Open issue detail modal */}}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {getIssueIcon(issue.type)}
                            <span className="text-xs text-muted-foreground font-mono">
                              {issue.key}
                            </span>
                          </div>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <h4 className="text-sm font-medium text-foreground mb-2 line-clamp-2">
                          {issue.title}
                        </h4>
                        
                        {issue.labels.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {issue.labels.map((label) => (
                              <Badge 
                                key={label} 
                                variant="outline" 
                                className="text-xs px-2 py-0"
                              >
                                {label}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Circle className={`h-3 w-3 ${getPriorityColor(issue.priority)}`} />
                            {issue.storyPoints && (
                              <Badge variant="outline" className="text-xs">
                                {issue.storyPoints}
                              </Badge>
                            )}
                          </div>
                          {issue.assignee && (
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs bg-muted">
                                {issue.assignee.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                        
                        {/* Quick status change buttons */}
                        <div className="mt-3 flex gap-1">
                          {columns
                            .filter(col => col.id !== issue.status)
                            .slice(0, 2)
                            .map((col) => (
                              <Button
                                key={col.id}
                                variant="outline"
                                size="sm"
                                className="h-6 text-xs px-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveIssue(issue.id, col.id as Issue["status"]);
                                }}
                              >
                                {col.title}
                              </Button>
                            ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                
                {/* Add issue to column */}
                <Button
                  variant="ghost"
                  className="w-full h-10 border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50"
                  onClick={() => setIsCreateDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create issue
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JiraBoard;