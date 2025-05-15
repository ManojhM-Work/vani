
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Search } from "lucide-react";

interface ApiSidebarProps {
  requests: any[];
  onSelectRequest: (request: any) => void;
  selectedRequestId?: string;
}

export const ApiSidebar = ({ requests, onSelectRequest, selectedRequestId }: ApiSidebarProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  
  // Group requests by folder
  const folderStructure: Record<string, any[]> = {
    "Ungrouped": []
  };
  
  requests.forEach(request => {
    const folder = request.folder || "Ungrouped";
    if (!folderStructure[folder]) {
      folderStructure[folder] = [];
    }
    folderStructure[folder].push(request);
  });
  
  const toggleFolder = (folder: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folder]: !prev[folder]
    }));
  };
  
  // Filter requests based on search term
  const filteredRequests = searchTerm.trim() === "" 
    ? requests 
    : requests.filter(req => 
        req.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        req.url?.toLowerCase().includes(searchTerm.toLowerCase())
      );
  
  return (
    <div className="w-full h-full border-r flex flex-col">
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search APIs..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2">
          {searchTerm.trim() !== "" ? (
            // Display flat list when searching
            <>
              <p className="text-xs text-muted-foreground px-2 py-1">
                {filteredRequests.length} result(s)
              </p>
              <div className="space-y-1">
                {filteredRequests.map((request, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className={`w-full justify-start text-left text-sm h-auto py-2 ${selectedRequestId === request.id ? 'bg-muted' : ''}`}
                    onClick={() => onSelectRequest(request)}
                  >
                    <div>
                      <div className="flex items-center">
                        <span className={`px-1.5 py-0.5 text-xs rounded mr-2 ${getMethodColor(request.method)}`}>
                          {request.method}
                        </span>
                        <span className="font-medium truncate">{request.name || 'Unnamed Request'}</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-1">{request.url}</p>
                    </div>
                  </Button>
                ))}
              </div>
            </>
          ) : (
            // Display folder structure when not searching
            <>
              {Object.keys(folderStructure).map((folder) => (
                <div key={folder} className="mb-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-left font-medium mb-1"
                    onClick={() => toggleFolder(folder)}
                  >
                    <span className="mr-2">{expandedFolders[folder] ? '▼' : '►'}</span>
                    {folder} ({folderStructure[folder].length})
                  </Button>
                  
                  {expandedFolders[folder] && (
                    <div className="ml-4 space-y-1">
                      {folderStructure[folder].map((request, i) => (
                        <Button
                          key={i}
                          variant="ghost"
                          className={`w-full justify-start text-left text-sm h-auto py-2 ${selectedRequestId === request.id ? 'bg-muted' : ''}`}
                          onClick={() => onSelectRequest(request)}
                        >
                          <div>
                            <div className="flex items-center">
                              <span className={`px-1.5 py-0.5 text-xs rounded mr-2 ${getMethodColor(request.method)}`}>
                                {request.method}
                              </span>
                              <span className="font-medium truncate">{request.name || 'Unnamed Request'}</span>
                            </div>
                            <p className="text-xs text-muted-foreground truncate mt-1">{request.url}</p>
                          </div>
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

// Helper function to get the color for a method
const getMethodColor = (method: string) => {
  switch(method?.toUpperCase()) {
    case 'GET': return 'bg-blue-100 text-blue-800';
    case 'POST': return 'bg-green-100 text-green-800';
    case 'PUT': return 'bg-amber-100 text-amber-800';
    case 'DELETE': return 'bg-red-100 text-red-800';
    case 'PATCH': return 'bg-purple-100 text-purple-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};
