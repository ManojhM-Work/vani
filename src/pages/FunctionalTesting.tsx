
import { useState } from "react";
import ApiRequestBuilder, { ApiRequestData } from "../components/testing/ApiRequestBuilder";
import { ApiSidebar } from "../components/testing/ApiSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Code } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ApiResponse {
  status: number;
  data: any;
  headers: Record<string, string>;
  time: number;
}

const FunctionalTesting = () => {
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Mock API requests for ApiSidebar
  const [apiRequests, setApiRequests] = useState([
    { 
      id: "1", 
      name: "Get User Profile", 
      url: "https://api.example.com/users/1", 
      method: "GET",
      folder: "User API"
    },
    { 
      id: "2", 
      name: "Create User", 
      url: "https://api.example.com/users", 
      method: "POST",
      folder: "User API"
    },
    { 
      id: "3", 
      name: "Update Product", 
      url: "https://api.example.com/products/1", 
      method: "PUT",
      folder: "Product API"
    }
  ]);
  
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  const handleApiRequest = async (requestData: ApiRequestData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Mock API request
      const startTime = performance.now();
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Simulate response generation
      const mockResponse = generateMockResponse(requestData);
      const endTime = performance.now();
      
      setResponse({
        status: mockResponse.status,
        data: mockResponse.data,
        headers: mockResponse.headers,
        time: Math.round(endTime - startTime)
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send request");
      setResponse(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate a realistic mock response based on the request
  const generateMockResponse = (request: ApiRequestData) => {
    // Success responses for different methods
    if (request.url.includes('error')) {
      return {
        status: 500,
        data: { error: "Internal Server Error", message: "Something went wrong on the server" },
        headers: {
          "content-type": "application/json",
          "server": "MockServer/1.0"
        }
      };
    } else if (request.url.includes('notfound')) {
      return {
        status: 404,
        data: { error: "Not Found", message: "The requested resource was not found" },
        headers: {
          "content-type": "application/json",
          "server": "MockServer/1.0"
        }
      };
    }
    
    switch (request.method) {
      case "GET":
        return {
          status: 200,
          data: {
            id: "item-123",
            name: "Test Item",
            description: "This is a test item",
            createdAt: new Date().toISOString(),
            tags: ["test", "mock", "api"]
          },
          headers: {
            "content-type": "application/json",
            "cache-control": "max-age=3600",
            "server": "MockServer/1.0"
          }
        };
        
      case "POST":
        const requestBody = request.body ? JSON.parse(request.body) : {};
        return {
          status: 201,
          data: {
            id: "new-item-" + Math.floor(Math.random() * 1000),
            ...requestBody,
            createdAt: new Date().toISOString()
          },
          headers: {
            "content-type": "application/json",
            "location": "/items/new-item-123",
            "server": "MockServer/1.0"
          }
        };
        
      case "PUT":
      case "PATCH":
        return {
          status: 200,
          data: {
            id: "item-123",
            ...JSON.parse(request.body || '{}'),
            updatedAt: new Date().toISOString()
          },
          headers: {
            "content-type": "application/json",
            "server": "MockServer/1.0"
          }
        };
        
      case "DELETE":
        return {
          status: 204,
          data: null,
          headers: {
            "content-type": "application/json",
            "server": "MockServer/1.0"
          }
        };
        
      default:
        return {
          status: 200,
          data: { message: "Mock response" },
          headers: {
            "content-type": "application/json",
            "server": "MockServer/1.0"
          }
        };
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Functional Testing</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1">
          <ApiSidebar 
            requests={apiRequests} 
            onSelectRequest={setSelectedRequest} 
            selectedRequestId={selectedRequest?.id} 
          />
        </div>
        
        <div className="col-span-1">
          <ApiRequestBuilder onSubmit={handleApiRequest} />
        </div>
        
        <div className="col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Response</span>
                {response && !error && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{response.time}ms</span>
                    <span className={`px-2 py-1 text-xs rounded-md ${
                      response.status < 300
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : response.status < 400
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                        : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                    }`}>
                      {response.status}
                    </span>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : error ? (
                <div className="p-4 rounded-md bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-800">
                  <p className="font-medium mb-1">Error</p>
                  <p>{error}</p>
                </div>
              ) : response ? (
                <ScrollArea className="h-[400px] rounded-md border p-4">
                  <div className="font-mono text-sm">
                    <div className="mb-4">
                      <Button variant="outline" size="sm" className="mb-2">
                        <Code className="h-4 w-4 mr-2" />
                        Headers
                      </Button>
                      <pre className="bg-muted p-2 rounded-md overflow-x-auto">
                        {JSON.stringify(response.headers, null, 2)}
                      </pre>
                    </div>
                    <div>
                      <Button variant="outline" size="sm" className="mb-2">
                        <Code className="h-4 w-4 mr-2" />
                        Body
                      </Button>
                      <pre className="bg-muted p-2 rounded-md overflow-x-auto">
                        {JSON.stringify(response.data, null, 2)}
                      </pre>
                    </div>
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex flex-col items-center justify-center text-center h-64 text-muted-foreground">
                  <Code className="h-12 w-12 mb-2 opacity-50" />
                  <p>Send a request to see the response here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FunctionalTesting;
