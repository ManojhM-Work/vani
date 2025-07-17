import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  ArrowLeft,
  Search,
  Filter,
  Plus,
  Bug,
  Bookmark,
  CheckCircle,
  AlertTriangle,
  Circle,
  ArrowUpDown,
  ChevronDown
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  updated: string;
  labels: string[];
  storyPoints?: number;
}

const mockIssues: Issue[] = [
  {
    id: "1",
    key: "VTP-1",
    title: "Implement API conversion feature",
    description: "Create endpoint for converting API specifications from OpenAPI to different formats",
    type: "Task",
    priority: "High",
    status: "In Progress",
    assignee: "John Doe",
    reporter: "Jane Smith",
    created: "2024-01-15",
    updated: "2024-01-18",
    labels: ["backend", "api"],
    storyPoints: 8
  },
  {
    id: "2", 
    key: "VTP-2",
    title: "Fix authentication bug in login flow",
    description: "Users cannot login with valid credentials due to session handling issue",
    type: "Bug",
    priority: "Highest",
    status: "To Do",
    assignee: "Mike Johnson",
    reporter: "John Doe",
    created: "2024-01-16",
    updated: "2024-01-16",
    labels: ["auth", "critical", "security"]
  },
  {
    id: "3",
    key: "VTP-3", 
    title: "Design user dashboard interface",
    description: "Create modern and intuitive dashboard design with key metrics and navigation",
    type: "Story",
    priority: "Medium",
    status: "Done",
    assignee: "Sarah Wilson",
    reporter: "Jane Smith",
    created: "2024-01-14",
    updated: "2024-01-17",
    labels: ["ui", "design", "frontend"],
    storyPoints: 5
  },
  {
    id: "4",
    key: "VTP-4",
    title: "Performance testing integration",
    description: "Add comprehensive performance testing capabilities to the platform",
    type: "Epic",
    priority: "High", 
    status: "In Review",
    assignee: "John Doe",
    reporter: "Mike Johnson",
    created: "2024-01-17",
    updated: "2024-01-18",
    labels: ["performance", "testing", "backend"],
    storyPoints: 13
  },
  {
    id: "5",
    key: "VTP-5",
    title: "Update documentation for API endpoints",
    description: "Comprehensive documentation update for all API endpoints with examples",
    type: "Task",
    priority: "Low",
    status: "To Do",
    assignee: "Sarah Wilson",
    reporter: "John Doe",
    created: "2024-01-18",
    updated: "2024-01-18",
    labels: ["documentation", "api"]
  },
  {
    id: "6",
    key: "VTP-6",
    title: "Memory leak in test runner",
    description: "Test runner consuming excessive memory during long test suites",
    type: "Bug",
    priority: "Medium",
    status: "In Progress",
    assignee: "Mike Johnson",
    reporter: "Sarah Wilson",
    created: "2024-01-18",
    updated: "2024-01-18",
    labels: ["testing", "performance", "bug"]
  }
];

const JiraIssues = () => {
  const { projectKey } = useParams();
  const [issues, setIssues] = useState<Issue[]>(mockIssues);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof Issue>("created");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

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
      case "Highest": return "text-red-600 bg-red-50 border-red-200";
      case "High": return "text-red-500 bg-red-50 border-red-200";
      case "Medium": return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "Low": return "text-green-600 bg-green-50 border-green-200";
      case "Lowest": return "text-gray-600 bg-gray-50 border-gray-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusColor = (status: Issue["status"]) => {
    switch (status) {
      case "To Do": return "bg-gray-100 text-gray-800 border-gray-200";
      case "In Progress": return "bg-blue-100 text-blue-800 border-blue-200";
      case "In Review": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Done": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const filteredIssues = issues.filter(issue =>
    issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    issue.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
    issue.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedIssues = [...filteredIssues].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    return sortDirection === "asc" ? comparison : -comparison;
  });

  const handleSort = (field: keyof Issue) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
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
                  {projectKey} Issues
                </h1>
                <p className="text-sm text-muted-foreground">
                  All issues • {issues.length} total
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to={`/jira/projects/${projectKey}/board`}>
                  Board view
                </Link>
              </Button>
              <Button className="bg-[#0052CC] hover:bg-[#0043A3] text-white">
                <Plus className="h-4 w-4 mr-2" />
                Create issue
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        {/* Search and filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search issues..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Sort by {sortField} <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleSort("key")}>
                Issue Key
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort("title")}>
                Summary
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort("status")}>
                Status
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort("priority")}>
                Priority
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort("created")}>
                Created
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort("updated")}>
                Updated
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Issues table */}
        <Card className="border-border">
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort("type")}
                >
                  <div className="flex items-center">
                    Type
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort("key")}
                >
                  <div className="flex items-center">
                    Key
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50 min-w-[300px]"
                  onClick={() => handleSort("title")}
                >
                  <div className="flex items-center">
                    Summary
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort("status")}
                >
                  <div className="flex items-center">
                    Status
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort("priority")}
                >
                  <div className="flex items-center">
                    Priority
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>Reporter</TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort("created")}
                >
                  <div className="flex items-center">
                    Created
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort("updated")}
                >
                  <div className="flex items-center">
                    Updated
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedIssues.map((issue) => (
                <TableRow 
                  key={issue.id} 
                  className="border-border hover:bg-muted/50 cursor-pointer"
                  onClick={() => {/* Open issue detail */}}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getIssueIcon(issue.type)}
                      <span className="text-sm">{issue.type}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm text-[#0052CC] hover:underline">
                      {issue.key}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-foreground line-clamp-1">
                        {issue.title}
                      </div>
                      <div className="text-sm text-muted-foreground line-clamp-1 mt-1">
                        {issue.description}
                      </div>
                      {issue.labels.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {issue.labels.slice(0, 3).map((label) => (
                            <Badge 
                              key={label} 
                              variant="outline" 
                              className="text-xs px-2 py-0"
                            >
                              {label}
                            </Badge>
                          ))}
                          {issue.labels.length > 3 && (
                            <Badge variant="outline" className="text-xs px-2 py-0">
                              +{issue.labels.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-xs ${getStatusColor(issue.status)}`}>
                      {issue.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-xs ${getPriorityColor(issue.priority)}`}>
                      {issue.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {issue.assignee ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs bg-muted">
                            {issue.assignee.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{issue.assignee}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs bg-muted">
                          {issue.reporter.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{issue.reporter}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {new Date(issue.created).toLocaleDateString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {new Date(issue.updated).toLocaleDateString()}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {sortedIssues.length === 0 && (
          <div className="text-center py-12">
            <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No issues found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? "Try adjusting your search terms" : "Get started by creating your first issue"}
            </p>
            {!searchTerm && (
              <Button className="bg-[#0052CC] hover:bg-[#0043A3] text-white">
                <Plus className="h-4 w-4 mr-2" />
                Create issue
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default JiraIssues;