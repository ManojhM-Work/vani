import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FileInput } from "@/components/FileInput";
import { FileJson } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Mock data for charts
const generateMockData = () => {
  const data = [];
  for (let i = 0; i < 20; i++) {
    data.push({
      time: `${i}s`,
      responseTime: Math.floor(Math.random() * 100) + 100,
      throughput: Math.floor(Math.random() * 50) + 50,
      users: 50,
    });
  }
  return data;
};

const PerformanceTesting = () => {
  const [targetUrl, setTargetUrl] = useState<string>("");
  const [threadCount, setThreadCount] = useState<number>(10);
  const [rampUp, setRampUp] = useState<number>(5);
  const [duration, setDuration] = useState<number>(60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [testResults, setTestResults] = useState<any>(null);
  const [selectedMetric, setSelectedMetric] = useState<string>("responseTime");
  const [jmxFile, setJmxFile] = useState<File | null>(null);
  const [jmxLoaded, setJmxLoaded] = useState<boolean>(false);
  
  const { toast } = useToast();

  const handleFileChange = (file: File | null) => {
    if (!file) {
      setJmxFile(null);
      setJmxLoaded(false);
      return;
    }
    
    setJmxFile(file);
    
    // For JMX files, we would typically parse them, but for this demo we'll just simulate success
    setTimeout(() => {
      // Mock JMX import success
      setTargetUrl("https://api.example.com/test");
      setThreadCount(25);
      setRampUp(10);
      setDuration(120);
      setJmxLoaded(true);
      
      toast({
        title: "JMX File Loaded",
        description: `Successfully imported ${file.name}`,
      });
    }, 500);
  };

  const handleRunTest = () => {
    if (!targetUrl && !jmxLoaded) {
      toast({
        title: "URL Required",
        description: "Please enter a target URL or import a JMX file for testing",
        variant: "destructive",
      });
      return;
    }

    setIsRunning(true);
    setProgress(0);
    setTestResults(null);

    // Mock test execution with progress updates
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        const newProgress = prevProgress + (100 / duration) * 2;
        
        if (newProgress >= 100) {
          clearInterval(interval);
          setIsRunning(false);
          
          // Generate mock results after test is complete
          const mockData = generateMockData();
          setTestResults({
            summary: {
              totalRequests: 5000,
              successfulRequests: 4850,
              failedRequests: 150,
              averageResponseTime: 234,
              minResponseTime: 89,
              maxResponseTime: 1200,
              throughput: 83.33,
              errorRate: 3.0,
            },
            chartData: mockData,
          });
          
          toast({
            title: "Test Completed",
            description: "Performance test run has finished",
          });
          
          return 100;
        }
        return newProgress;
      });
    }, 1000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold">Performance Testing</h2>
        <p className="text-muted-foreground mt-2">
          Run JMeter-like performance tests with real-time monitoring
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Test Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border border-dashed rounded-md p-4">
                <Label className="text-sm font-medium mb-2 block">Import JMX File</Label>
                <FileInput
                  accept=".jmx"
                  onChange={handleFileChange}
                  label="Select JMX File"
                  icon={<FileJson className="h-4 w-4 mr-2" />}
                />
                {jmxFile && (
                  <div className="mt-2">
                    <p className="text-sm">
                      Imported: <span className="font-medium">{jmxFile.name}</span>
                    </p>
                    {jmxLoaded && (
                      <Alert className="mt-2 bg-muted">
                        <AlertDescription className="text-xs">
                          JMX file loaded successfully. Configuration parameters have been updated.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="target-url">Target URL</Label>
                <Input
                  id="target-url"
                  placeholder="https://api.example.com/endpoint"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="thread-count">Thread Count (Users): {threadCount}</Label>
                </div>
                <Slider
                  id="thread-count"
                  min={1}
                  max={100}
                  step={1}
                  value={[threadCount]}
                  onValueChange={(value) => setThreadCount(value[0])}
                  disabled={isRunning}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="ramp-up">Ramp-up Period (seconds): {rampUp}</Label>
                </div>
                <Slider
                  id="ramp-up"
                  min={0}
                  max={30}
                  step={1}
                  value={[rampUp]}
                  onValueChange={(value) => setRampUp(value[0])}
                  disabled={isRunning}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="duration">Test Duration (seconds): {duration}</Label>
                </div>
                <Slider
                  id="duration"
                  min={5}
                  max={300}
                  step={5}
                  value={[duration]}
                  onValueChange={(value) => setDuration(value[0])}
                  disabled={isRunning}
                />
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="thinktime" />
                  <Label htmlFor="thinktime">Add Think Time</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox id="cookies" />
                  <Label htmlFor="cookies">Use Cookies</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox id="keepalive" defaultChecked />
                  <Label htmlFor="keepalive">Keep-Alive Connections</Label>
                </div>
              </div>
              
              <Button 
                onClick={handleRunTest} 
                className="w-full" 
                disabled={isRunning}
              >
                {isRunning ? "Running Test..." : "Start Test"}
              </Button>
              
              {isRunning && (
                <div className="space-y-2">
                  <Label>Test Progress: {Math.round(progress)}%</Label>
                  <Progress value={progress} className="h-2" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              {testResults ? (
                <Tabs defaultValue="summary">
                  <TabsList className="grid grid-cols-3">
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                    <TabsTrigger value="charts">Charts</TabsTrigger>
                    <TabsTrigger value="errors">Errors</TabsTrigger>
                  </TabsList>
                  <TabsContent value="summary" className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <Card>
                        <CardContent className="p-4 text-center">
                          <p className="text-sm text-muted-foreground">Requests</p>
                          <p className="text-2xl font-bold">{testResults.summary.totalRequests}</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <p className="text-sm text-muted-foreground">Avg Response</p>
                          <p className="text-2xl font-bold">{testResults.summary.averageResponseTime} ms</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <p className="text-sm text-muted-foreground">Throughput</p>
                          <p className="text-2xl font-bold">{testResults.summary.throughput}/s</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <p className="text-sm text-muted-foreground">Error Rate</p>
                          <p className="text-2xl font-bold">{testResults.summary.errorRate}%</p>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <Card>
                      <CardContent className="p-4">
                        <h4 className="text-lg font-medium mb-4">Detailed Statistics</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Total Requests</p>
                            <p className="font-medium">{testResults.summary.totalRequests}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Successful Requests</p>
                            <p className="font-medium">{testResults.summary.successfulRequests}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Failed Requests</p>
                            <p className="font-medium">{testResults.summary.failedRequests}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Average Response Time</p>
                            <p className="font-medium">{testResults.summary.averageResponseTime} ms</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Min Response Time</p>
                            <p className="font-medium">{testResults.summary.minResponseTime} ms</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Max Response Time</p>
                            <p className="font-medium">{testResults.summary.maxResponseTime} ms</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="charts">
                    <div className="mt-4 space-y-6">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-lg font-medium">Response Time Over Time</h4>
                          <div className="flex space-x-4">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className={selectedMetric === "responseTime" ? "bg-primary text-primary-foreground" : ""}
                              onClick={() => setSelectedMetric("responseTime")}
                            >
                              Response Time
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className={selectedMetric === "throughput" ? "bg-primary text-primary-foreground" : ""}
                              onClick={() => setSelectedMetric("throughput")}
                            >
                              Throughput
                            </Button>
                          </div>
                        </div>
                        <Card>
                          <CardContent className="pt-6">
                            <div className="h-[300px]">
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={testResults.chartData}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="time" />
                                  <YAxis />
                                  <Tooltip />
                                  <Legend />
                                  {selectedMetric === "responseTime" ? (
                                    <Line 
                                      type="monotone" 
                                      dataKey="responseTime" 
                                      stroke="#33C3F0" 
                                      activeDot={{ r: 8 }} 
                                      name="Response Time (ms)" 
                                    />
                                  ) : (
                                    <Line 
                                      type="monotone" 
                                      dataKey="throughput" 
                                      stroke="#06B6D4" 
                                      activeDot={{ r: 8 }} 
                                      name="Throughput (req/s)" 
                                    />
                                  )}
                                  <Line
                                    type="monotone" 
                                    dataKey="users" 
                                    stroke="#8E9196" 
                                    strokeDasharray="5 5" 
                                    name="Active Users" 
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="errors">
                    <div className="mt-4">
                      <Card>
                        <CardContent className="p-4">
                          <p className="text-muted-foreground text-sm mb-4">
                            Error distribution by type
                          </p>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span>HTTP 404 Not Found</span>
                              <span>72 occurrences (48%)</span>
                            </div>
                            <Progress value={48} className="h-2" />
                            
                            <div className="flex items-center justify-between">
                              <span>HTTP 500 Server Error</span>
                              <span>45 occurrences (30%)</span>
                            </div>
                            <Progress value={30} className="h-2" />
                            
                            <div className="flex items-center justify-between">
                              <span>Connection Timeout</span>
                              <span>33 occurrences (22%)</span>
                            </div>
                            <Progress value={22} className="h-2" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-12 text-center">
                  <p className="text-muted-foreground mb-4">
                    No test results available. Configure and run a test to see results here.
                  </p>
                  {!isRunning && (
                    <Button variant="outline" onClick={handleRunTest}>
                      Start Test
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PerformanceTesting;
