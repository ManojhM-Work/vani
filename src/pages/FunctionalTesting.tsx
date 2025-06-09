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
import { FileJson, AlertCircle, Play, Download, List, Plus, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ApiRequestCard } from "@/components/testing/ApiRequestCard";
import { TestReport, TestResult } from "@/components/testing/TestReport";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

const httpMethods = ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"];

interface QueryParam {
  key: string;
  value: string;
  description: string;
}

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
  const [showTestReport, setShowTestReport] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [activeRequest, setActiveRequest] = useState<any>(null);
  const [queryParams, setQueryParams] = useState<QueryParam[]>([]);
  
  const { toast } = useToast();

  const addQueryParam = () => {
    setQueryParams([...queryParams, { key: "", value: "", description: "" }]);
  };

  const removeQueryParam = (index: number) => {
    const newParams = [...queryParams];
    newParams.splice(index, 1);
    setQueryParams(newParams);
  };

  const updateQueryParam = (index: number, field: keyof QueryParam, value: string) => {
    const newParams = [...queryParams];
    newParams[index] = { ...newParams[index], [field]: value };
    setQueryParams(newParams);
  };

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
        
        // Process the collection to extract all requests
        let requests = [];
        
        // Handle Postman format which typically has items in the root or within folders
        if (jsonData.item) {
          const extractRequests = (items: any[], parentName = '') => {
            let extracted: any[] = [];
            
            items.forEach((item: any) => {
              // If it's a folder (has items array)
              if (item.item) {
                const folderName = parentName ? `${parentName}/${item.name}` : item.name;
                extracted = [...extracted, ...extractRequests(item.item, folderName)];
              } else if (item.request) {
                // It's a request
                const name = parentName ? `${parentName}/${item.name}` : item.name;
                extracted.push({
                  id: item.id || name,
                  name: name,
                  url: item.request.url?.raw || item.request.url,
                  method: item.request.method || "GET",
                  headers: item.request.header || {},
                  body: item.request.body?.raw ? JSON.parse(item.request.body.raw) : {},
                  tests: item.event?.find((e: any) => e.listen === 'test')?.script?.exec?.join('\n') || '',
                  queryParams: []
                });
              }
            });
            
            return extracted;
          };
          
          requests = extractRequests(jsonData.item);
        }
        
        setCollectionData({
          ...jsonData,
          processedRequests: requests
        });
        
        toast({
          title: "Collection Imported",
          description: `Successfully imported ${file.name} with ${requests.length} requests`,
        });
        
        // Show the sidebar after importing
        setShowCollectionImport(true);
        
        // Select the first request if available
        if (requests.length > 0) {
          setActiveRequest(requests[0]);
          setSelectedRequestId(requests[0].id);
          setUrl(requests[0].url || '');
          setMethod(requests[0].method || 'GET');
          setRequestHeaders(typeof requests[0].headers === 'object' 
            ? JSON.stringify(requests[0].headers, null, 2) 
            : requests[0].headers || '');
          setRequestBody(typeof requests[0].body === 'object' 
            ? JSON.stringify(requests[0].body, null, 2) 
            : requests[0].body || '');
          setTestScriptContent(requests[0].tests || '');
        }
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

    // Mock running test with enhanced reporting
    const startTime = Date.now();
    
    try {
      // Mock response for demo purposes
      setTimeout(() => {
        // Generate mock response based on method
        let mockResponse;
        
        // If we're testing from an imported collection and have a selected request
        if (collectionData && selectedRequestId) {
          // Find the selected request in the collection
          const request = collectionData.processedRequests.find((item: any) => 
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
        const responseTime = endTime - startTime;
        
        setResponseTime(responseTime);
        setStatusCode(mockResponse.status);
        setResponseData(JSON.stringify(mockResponse.data, null, 2));
        setResponseHeaders(JSON.stringify(mockResponse.headers, null, 2));
        setIsLoading(false);

        // Run tests if there's test script content
        if (testScriptContent && testScriptContent.trim() !== "") {
          // In a real app we'd execute the tests
          const testResult = simulateTestExecution(testScriptContent, mockResponse);
          
          // Generate test results for report
          const results: TestResult[] = testResult.tests.map((test) => ({
            name: test.name,
            status: test.passed ? "passed" : "failed",
            time: test.time,
            error: test.error,
            assertions: test.assertions
          }));
          
          setTestResults(results);
          setShowTestReport(true);
          
          toast({
            title: testResult.allPassed ? "Tests Passed" : "Tests Failed",
            description: `${testResult.passCount} of ${testResult.totalCount} tests passed`,
            variant: testResult.allPassed ? "default" : "destructive",
          });
        }

        toast({
          title: `${mockResponse.status} Response`,
          description: `Request completed in ${responseTime}ms`,
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
    // Enhanced test simulation with more detailed results
    const testsToRun = Math.floor(Math.random() * 5) + 1; // 1-5 tests
    const tests = [];
    let passCount = 0;
    
    for (let i = 0; i < testsToRun; i++) {
      const passed = Math.random() > 0.3; // 70% chance of passing
      if (passed) passCount++;
      
      const assertions = [];
      const assertionCount = Math.floor(Math.random() * 3) + 1;
      
      for (let j = 0; j < assertionCount; j++) {
        const assertionPassed = passed || (Math.random() > 0.5);
        assertions.push({
          name: `Check ${j+1}`,
          passed: assertionPassed,
          error: assertionPassed ? undefined : "Expected value did not match actual value"
        });
      }
      
      tests.push({
        name: `Test ${i + 1}`,
        passed,
        time: Math.floor(Math.random() * 100) + 10,
        error: passed ? undefined : "Test condition failed",
        assertions
      });
    }
    
    return {
      allPassed: passCount === testsToRun,
      passCount,
      totalCount: testsToRun,
      tests
    };
  };

  const handleRunAllTests = () => {
    if (!collectionData || !collectionData.processedRequests || collectionData.processedRequests.length === 0) {
      toast({
        title: "No Collection",
        description: "Please import a valid collection with requests first",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    setShowTestReport(false);
    
    toast({
      title: "Running Collection",
      description: `Executing ${collectionData.processedRequests.length} requests in the collection...`,
    });
    
    // Simulate running all tests in the collection
    setTimeout(() => {
      const results: TestResult[] = [];
      const requests = collectionData.processedRequests;
      
      for (let i = 0; i < requests.length; i++) {
        const request = requests[i];
        const response = getMockResponseForMethod(request.method);
        const passed = Math.random() > 0.3; // 70% chance of passing
        
        const assertions = [];
        for (let j = 0; j < Math.floor(Math.random() * 5) + 1; j++) {
          const assertionPassed = Math.random() > 0.3;
          assertions.push({
            name: `Assertion ${j + 1}`,
            status: assertionPassed ? "passed" : "failed",
            error: assertionPassed ? undefined : "Expected value did not match actual value"
          });
        }
        
        results.push({
          name: request.name,
          status: passed ? "passed" : "failed",
          time: Math.floor(Math.random() * 500) + 50,
          assertions
        });
      }
      
      const passedCount = results.filter(r => r.status === "passed").length;
      
      setTestResults(results);
      setShowTestReport(true);
      setIsLoading(false);
      
      toast({
        title: "Collection Tests Completed",
        description: `${passedCount} of ${results.length} requests passed`,
        variant: passedCount === results.length ? "default" : "destructive",
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

  const handleRequestSelection = (requestId: string) => {
    const request = collectionData.processedRequests.find(r => r.id === requestId);
    if (request) {
      setActiveRequest(request);
      setSelectedRequestId(requestId);
      setUrl(request.url || '');
      setMethod(request.method || 'GET');
      setRequestHeaders(typeof request.headers === 'object' 
        ? JSON.stringify(request.headers, null, 2) 
        : request.headers || '');
      setRequestBody(typeof request.body === 'object' 
        ? JSON.stringify(request.body, null, 2) 
        : request.body || '');
      setTestScriptContent(request.tests || '');
      
      // Reset response data when changing requests
      setResponseData('');
      setResponseHeaders('');
      setStatusCode(null);
      setResponseTime(null);
      setShowTestReport(false);
    }
  };

  const updateRequestInCollection = (updatedRequest: any) => {
    if (!collectionData || !collectionData.processedRequests) return;
    
    const updatedRequests = collectionData.processedRequests.map(req => 
      req.id === updatedRequest.id ? updatedRequest : req
    );
    
    setCollectionData({
      ...collectionData,
      processedRequests: updatedRequests
    });
    
    // Also update UI state if the active request was updated
    if (selectedRequestId === updatedRequest.id) {
      setUrl(updatedRequest.url || '');
      setMethod(updatedRequest.method || 'GET');
      setRequestHeaders(typeof updatedRequest.headers === 'object' 
        ? JSON.stringify(updatedRequest.headers, null, 2) 
        : updatedRequest.headers || '');
      setRequestBody(typeof updatedRequest.body === 'object' 
        ? JSON.stringify(updatedRequest.body, null, 2) 
        : updatedRequest.body || '');
      setTestScriptContent(updatedRequest.tests || '');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold">Functional Testing</h2>
        <p className="text-muted-foreground mt-2">
          Test your APIs with a Postman-like interface
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/3 space-y-6">
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
                    <h3 className="text-sm font-medium">Collection</h3>
                    {collectionData && collectionData.processedRequests && collectionData.processedRequests.length > 0 && (
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
                  
                  {collectionData && collectionData.processedRequests && collectionData.processedRequests.length > 0 && (
                    <div className="mt-4 border rounded-md divide-y">
                      {collectionData.processedRequests.map((req: any) => (
                        <div
                          key={req.id}
                          className={`p-2 text-sm cursor-pointer hover:bg-muted ${
                            selectedRequestId === req.id ? "bg-muted" : ""
                          }`}
                          onClick={() => handleRequestSelection(req.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center truncate">
                              <span className={`font-mono text-xs mr-2 px-1.5 rounded ${
                                req.method === 'GET' ? 'bg-blue-100 text-blue-800' :
                                req.method === 'POST' ? 'bg-green-100 text-green-800' :
                                req.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                                req.method === 'DELETE' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {req.method}
                              </span>
                              <span className="truncate">{req.name}</span>
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground truncate mt-1">
                            {req.url}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeRequest ? (
                <ApiRequestCard 
                  request={activeRequest}
                  onSendRequest={handleSendRequest}
                  onUpdateRequest={(req) => updateRequestInCollection(req)}
                />
              ) : (
                <div>
                  <div className="flex items-center space-x-2 mb-4">
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

                  <Tabs defaultValue="queryParams">
                    <TabsList className="grid grid-cols-3">
                      <TabsTrigger value="queryParams">Query Params</TabsTrigger>
                      <TabsTrigger value="body">Body</TabsTrigger>
                      <TabsTrigger value="headers">Headers</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="queryParams" className="space-y-4">
                      <div className="border rounded-md p-4">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-sm font-medium">Query Parameters</h3>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={addQueryParam}
                          >
                            <Plus className="h-3.5 w-3.5 mr-1" />
                            Add Parameter
                          </Button>
                        </div>
                        
                        {queryParams.length > 0 ? (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-[30%]">Key</TableHead>
                                <TableHead className="w-[30%]">Value</TableHead>
                                <TableHead className="w-[30%]">Description</TableHead>
                                <TableHead className="w-[10%]"></TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {queryParams.map((param, index) => (
                                <TableRow key={index}>
                                  <TableCell>
                                    <Input 
                                      value={param.key} 
                                      placeholder="parameter_name"
                                      onChange={(e) => updateQueryParam(index, 'key', e.target.value)}
                                      size={20}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Input 
                                      value={param.value} 
                                      placeholder="value"
                                      onChange={(e) => updateQueryParam(index, 'value', e.target.value)}
                                      size={20}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Input 
                                      value={param.description} 
                                      placeholder="Parameter description"
                                      onChange={(e) => updateQueryParam(index, 'description', e.target.value)}
                                      size={30}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => removeQueryParam(index)}
                                    >
                                      <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        ) : (
                          <div className="text-center py-6 text-sm text-muted-foreground">
                            No query parameters added yet.
                          </div>
                        )}
                      </div>
                    </TabsContent>
                    
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
                    className="w-full mt-4"
                    disabled={isLoading}
                  >
                    {isLoading ? "Sending..." : "Send Request"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="md:w-2/3">
          {showTestReport ? (
            <TestReport 
              results={testResults} 
              summary={{
                total: testResults.length,
                passed: testResults.filter(r => r.status === "passed").length,
                failed: testResults.filter(r => r.status === "failed").length,
                skipped: testResults.filter(r => r.status === "skipped").length,
                duration: testResults.reduce((acc, curr) => acc + (curr.time || 0), 0) / 1000
              }}
              type="functional"
              configuration={{
                url: url,
                method: method
              }}
            />
          ) : (
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Response</CardTitle>
                <div className="flex items-center space-x-4">
                  {statusCode && (
                    <div className={`font-mono ${
                      statusCode >= 200 && statusCode < 300 ? "text-green-500" :
                      statusCode >= 300 && statusCode < 400 ? "text-blue-500" :
                      statusCode >= 400 ? "text-red-500" : "text-muted-foreground"
                    }`}>
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
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default FunctionalTesting;
