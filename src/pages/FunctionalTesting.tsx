
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
import { FileJson, AlertCircle } from "lucide-react";
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
        switch (method) {
          case "GET":
            mockResponse = {
              data: { message: "Success", items: [{ id: 1, name: "Item 1" }, { id: 2, name: "Item 2" }] },
              status: 200,
              headers: {
                "content-type": "application/json",
                "x-response-time": "12ms",
              },
            };
            break;
          case "POST":
            mockResponse = {
              data: { id: 101, success: true },
              status: 201,
              headers: {
                "content-type": "application/json",
                "location": "/api/resource/101",
              },
            };
            break;
          case "PUT":
            mockResponse = {
              data: { updated: true },
              status: 200,
              headers: {
                "content-type": "application/json",
              },
            };
            break;
          case "DELETE":
            mockResponse = {
              data: {},
              status: 204,
              headers: {},
            };
            break;
          default:
            mockResponse = {
              data: { message: "Method supported" },
              status: 200,
              headers: {
                "content-type": "application/json",
              },
            };
        }

        const endTime = Date.now();
        setResponseTime(endTime - startTime);
        setStatusCode(mockResponse.status);
        setResponseData(JSON.stringify(mockResponse.data, null, 2));
        setResponseHeaders(JSON.stringify(mockResponse.headers, null, 2));
        setIsLoading(false);

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

  const getStatusColor = (status: number | null) => {
    if (!status) return "text-muted-foreground";
    if (status >= 200 && status < 300) return "text-green-500";
    if (status >= 300 && status < 400) return "text-blue-500";
    if (status >= 400) return "text-red-500";
    return "text-muted-foreground";
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
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowCollectionImport(!showCollectionImport)}
              >
                <FileJson className="h-4 w-4 mr-2" />
                Import Collection
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {showCollectionImport && (
                <div className="p-4 border rounded-md mb-4 bg-muted/50">
                  <h3 className="text-sm font-medium mb-2">Import Collection</h3>
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
                            const request = collectionData.items.find((item: any) => item.id === value);
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
                  <TabsTrigger value="test">Test Results</TabsTrigger>
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
                        placeholder={`pm.test("Status code is 200", function() {\n  pm.response.to.have.status(200);\n});`}
                        className="min-h-[200px] font-mono"
                      />
                    </div>
                    <div className="bg-card p-4 rounded-md border">
                      <h4 className="font-medium mb-2">Test Results</h4>
                      <p className="text-muted-foreground text-sm">
                        No tests have been run yet
                      </p>
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
