import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { FileInput } from "@/components/FileInput";
import { FileJson, AlertCircle, Play, Download } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const httpMethods = ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"];

const FunctionalTesting = () => {
  const [url, setUrl] = useState<string>("");
  const [method, setMethod] = useState<string>("GET");
  const [requestBody, setRequestBody] = useState<string>("");
  const [responseData, setResponseData] = useState<string>("");
  const [responseHeaders, setResponseHeaders] = useState<string>("");
  const [requestHeaders, setRequestHeaders] = useState<string>("{\n  \"Content-Type\": \"application/json\"\n}");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [collectionFile, setCollectionFile] = useState<File | null>(null);
  const [collectionData, setCollectionData] = useState<any>(null);
  const [showCollectionImport, setShowCollectionImport] = useState<boolean>(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [testScriptContent, setTestScriptContent] = useState<string>("// Write test scripts here to validate response\n// Example: pm.test(\"Status code is 200\", () => pm.response.code === 200);");
  
  const { toast } = useToast();

  const handleFileChange = (file: File | null) => {
    if (!file) {
      setCollectionFile(null);
      return;
    }
    
    setCollectionFile(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);
        setCollectionData(jsonData);
        toast({
          title: "Collection Imported",
          description: `Successfully imported ${file.name}`,
        });
        
        // Automatically show collection import panel when file is loaded
        setShowCollectionImport(true);
      } catch (error) {
        toast({
          title: "Invalid JSON",
          description: "The file doesn't contain valid JSON data",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  const loadRequestFromCollection = (request: any) => {
    // Example of loading from collection - adjust based on your collection format
    if (!request) return;
    
    try {
      setUrl(request.url || "");
      setMethod(request.method || "GET");
      setRequestBody(request.body ? JSON.stringify(request.body, null, 2) : "");
      setRequestHeaders(request.headers ? JSON.stringify(request.headers, null, 2) : "");
      setSelectedRequestId(request.id || request.name);
      
      // If the request has tests, load them too
      if (request.tests) {
        setTestScriptContent(request.tests);
      } else {
        setTestScriptContent("// Write test scripts here to validate response\n// Example: pm.test(\"Status code is 200\", () => pm.response.code === 200);");
      }
      
      toast({
        title: "Request Loaded",
        description: `Loaded ${request.name || 'request'} from collection`,
      });
    } catch (error) {
      toast({
        title: "Error Loading Request",
        description: "Failed to load request data",
        variant: "destructive",
      });
    }
  };

  const handleSendRequest = async () => {
    if (!url) {
      toast({
        title: "URL Required",
        description: "Please enter a URL to send the request",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setResponseData("");
    setResponseHeaders("");
    setStatusCode(null);
    setResponseTime(null);

    // Simulate API call with timing
    const startTime = Date.now();
    
    try {
      // Mock response for demo purposes
      setTimeout(() => {
        // Generate mock response based on method
        let mockResponse;
        
        // If we're testing from an imported collection and have a selected request
        if (collectionData && selectedRequestId) {
          // Find the selected request in the collection
          const request = collectionData.items.find((item: any) => 
            (item.id || item.name) === selectedRequestId
          );
          
          // If the request has a mock response defined, use it
          if (request && request.mockResponse) {
            mockResponse = request.mockResponse;
          } else {
            // Use default mock responses based on method
            mockResponse = getMockResponseForMethod(method);
          }
        } else {
          // Use default mock responses based on method
          mockResponse = getMockResponseForMethod(method);
        }

        const endTime = Date.now();
        setResponseTime(endTime - startTime);
        setStatusCode(mockResponse.status);
        setResponseData(JSON.stringify(mockResponse.data, null, 2));
        setResponseHeaders(JSON.stringify(mockResponse.headers, null, 2));
        setIsLoading(false);

        // Run tests if there's test script content
        if (testScriptContent && testScriptContent.trim() !== "") {
          // In a real app we'd execute the tests, but here we'll just simulate it
          const testResult = simulateTestExecution(testScriptContent, mockResponse);
          // Update the UI with test results (would be added to state)
          toast({
            title: testResult.passed ? "Tests Passed" : "Tests Failed",
            description: `${testResult.passed ? "All" : testResult.passCount} of ${testResult.totalCount} tests passed`,
            variant: testResult.passed ? "default" : "destructive",
          });
        }

        toast({
          title: `${mockResponse.status} Response`,
          description: `Request completed in ${endTime - startTime}ms`,
        });
      }, 800);
    } catch (error) {
      setIsLoading(false);
      toast({
        title: "Request Failed",
        description: "An error occurred while sending the request",
        variant: "destructive",
      });
    }
  };

  const getMockResponseForMethod = (method: string) => {
    switch (method) {
      case "GET":
        return {
          data: { message: "Success", items: [{ id: 1, name: "Item 1" }, { id: 2, name: "Item 2" }] },
          status: 200,
          headers: {
            "content-type": "application/json",
            "x-response-time": "12ms",
          },
        };
      case "POST":
        return {
          data: { id: 101, success: true },
          status: 201,
          headers: {
            "content-type": "application/json",
            "location": "/api/resource/101",
          },
        };
      case "PUT":
        return {
          data: { updated: true },
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        };
      case "DELETE":
        return {
          data: {},
          status: 204,
          headers: {},
        };
      default:
        return {
          data: { message: "Method supported" },
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        };
    }
  };

  const simulateTestExecution = (script: string, response: any) => {
    // In a real app, we'd actually execute the test script
    // For demo, we'll simulate different results
    
    // Generate a random test result (success more likely)
    const passedAll = Math.random() > 0.3;
    const totalCount = Math.floor(Math.random() * 5) + 1; // 1-5 tests
    const passCount = passedAll ? totalCount : Math.floor(Math.random() * totalCount);
    
    return {
      passed: passedAll,
      totalCount,
      passCount,
      results: [
        // We'd have actual test results here
      ]
    };
  };

  const handleRunAllTests = () => {
    if (!collectionData || !collectionData.items || collectionData.items.length === 0) {
      toast({
        title: "No Collection",
        description: "Please import a valid collection with requests first",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    toast({
      title: "Running Collection",
      description: `Executing ${collectionData.items.length} requests in the collection...`,
    });

    // Simulate running all tests in the collection
    setTimeout(() => {
      setIsLoading(false);
      
      // Mock results for all tests
      const totalRequests = collectionData.items.length;
      const passedRequests = Math.floor(Math.random() * totalRequests * 0.7) + 
                           Math.floor(totalRequests * 0.3); // At least 30% pass
      
      toast({
        title: "Collection Tests Completed",
        description: `${passedRequests} of ${totalRequests} requests passed`,
        variant: passedRequests === totalRequests ? "default" : "destructive",
      });
    }, 1500);
  };

  const getStatusColor = (status: number | null) => {
    if (!status) return "text-muted-foreground";
    if (status >= 200 && status < 300) return "text-green-500";
    if (status >= 300 && status < 400) return "text-blue-500";
    if (status >= 400) return "text-red-500";
    return "text-muted-foreground";
  };

  const exportCollection = () => {
    if (!collectionData) {
      toast({
        title: "No Collection",
        description: "There is no collection data to export",
        variant: "destructive",
      });
      return;
    }

    // Create a Blob with the updated collection data (would include tests, etc.)
    const blob = new Blob([JSON.stringify(collectionData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link element to trigger download
    const a = document.createElement("a");
    a.href = url;
    a.download = collectionFile ? collectionFile.name : "collection.json";
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Collection Exported",
      description: "Your collection has been exported successfully",
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold">Functional Testing</h2>
        <p className="text-muted-foreground mt-2">
          Test your APIs with a Postman-like interface
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>Request Builder</CardTitle>
              <div className="flex space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowCollectionImport(!showCollectionImport)}
                >
                  <FileJson className="h-4 w-4 mr-2" />
                  {showCollectionImport ? "Hide Collection" : "Import Collection"}
                </Button>
                {collectionData && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={exportCollection}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {showCollectionImport && (
                <div className="p-4 border rounded-md mb-4 bg-muted/50">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium">Import Collection</h3>
                    {collectionData && collectionData.items && collectionData.items.length > 0 && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleRunAllTests}
                        disabled={isLoading}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Run All
                      </Button>
                    )}
                  </div>
                  
                  <FileInput 
                    accept=".json"
                    onChange={handleFileChange}
                    label="Select Collection File"
                  />
                  {collectionFile && (
                    <div className="mt-2">
                      <p className="text-sm">Imported: {collectionFile.name}</p>
                      {collectionData && collectionData.items && collectionData.items.length > 0 && (
                        <div className="mt-2">
                          <Label className="text-xs mb-1 block">Available Requests</Label>
                          <Select onValueChange={(value) => {
                            const request = collectionData.items.find((item: any) => 
                              (item.id || item.name) === value
                            );
                            if (request) loadRequestFromCollection(request);
                          }}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select a request" />
                            </SelectTrigger>
                            <SelectContent>
                              {collectionData.items.map((item: any) => (
                                <SelectItem key={item.id || item.name} value={item.id || item.name}>
                                  {item.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Select value={method} onValueChange={setMethod}>
                  <SelectTrigger className="w-[30%]">
                    <SelectValue placeholder="Method" />
                  </SelectTrigger>
                  <SelectContent>
                    {httpMethods.map((method) => (
                      <SelectItem key={method} value={method}>
                        {method}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="https://api.example.com/endpoint"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1"
                />
              </div>

              <Tabs defaultValue="body">
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="body">Body</TabsTrigger>
                  <TabsTrigger value="headers">Headers</TabsTrigger>
                </TabsList>
                <TabsContent value="body" className="space-y-4">
                  <Textarea
                    placeholder={`{\n  "key": "value"\n}`}
                    value={requestBody}
                    onChange={(e) => setRequestBody(e.target.value)}
                    className="min-h-[200px] font-mono"
                  />
                </TabsContent>
                <TabsContent value="headers" className="space-y-4">
                  <Textarea
                    placeholder="Content-Type: application/json"
                    value={requestHeaders}
                    onChange={(e) => setRequestHeaders(e.target.value)}
                    className="min-h-[200px] font-mono"
                  />
                </TabsContent>
              </Tabs>

              <Button 
                onClick={handleSendRequest} 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Request"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Response</CardTitle>
              <div className="flex items-center space-x-4">
                {statusCode && (
                  <div className={`font-mono ${getStatusColor(statusCode)}`}>
                    {statusCode}
                  </div>
                )}
                {responseTime && (
                  <div className="text-muted-foreground text-sm">
                    {responseTime}ms
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="response">
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="response">Response</TabsTrigger>
                  <TabsTrigger value="headers">Headers</TabsTrigger>
                  <TabsTrigger value="test">Test Scripts</TabsTrigger>
                </TabsList>
                <TabsContent value="response">
                  <div className="mt-4 bg-card p-4 rounded-md border">
                    <pre className="font-mono text-sm whitespace-pre-wrap min-h-[400px] overflow-auto">
                      {responseData || "No response yet"}
                    </pre>
                  </div>
                </TabsContent>
                <TabsContent value="headers">
                  <div className="mt-4 bg-card p-4 rounded-md border">
                    <pre className="font-mono text-sm whitespace-pre-wrap min-h-[400px] overflow-auto">
                      {responseHeaders || "No headers yet"}
                    </pre>
                  </div>
                </TabsContent>
                <TabsContent value="test">
                  <div className="mt-4 space-y-4">
                    <div>
                      <Label>Test Script</Label>
                      <Textarea
                        placeholder="pm.test('Status code is 200', function() { pm.response.to.have.status(200); });"
                        className="min-h-[200px] font-mono"
                        value={testScriptContent}
                        onChange={(e) => setTestScriptContent(e.target.value)}
                      />
                    </div>
                    <Button
                      onClick={handleSendRequest}
                      disabled={isLoading}
                      className="w-full"
                    >
                      Run Test
                    </Button>
                    <div className="bg-card p-4 rounded-md border">
                      <h4 className="font-medium mb-2">Test Results</h4>
                      {responseData ? (
                        <div className="text-sm space-y-1">
                          <p className="text-green-500">✓ Status code is 200</p>
                          <p className="text-green-500">✓ Response time is under 200ms</p>
                          <p className="text-green-500">✓ Response has required fields</p>
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-sm">
                          No tests have been run yet
                        </p>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FunctionalTesting;
