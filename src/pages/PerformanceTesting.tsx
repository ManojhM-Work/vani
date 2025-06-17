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
import { Switch } from "@/components/ui/switch";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FileInput } from "@/components/FileInput";
import { FileJson, Play, Download, Globe, FileSpreadsheet } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { downloadHtmlReport, HtmlReportData } from "@/utils/htmlReportGenerator";

// Mock data for charts
const generateMockData = (duration = 20, baseResponseTime = 100, baseThroughput = 50) => {
  const data = [];
  for (let i = 0; i < duration; i++) {
    // Add some randomness to make the chart more realistic
    const variation = Math.sin(i / 3) * 30;
    const userVariation = Math.floor(Math.random() * 10);
    
    data.push({
      time: `${i}s`,
      responseTime: Math.max(10, Math.floor(baseResponseTime + variation + Math.random() * 50)),
      throughput: Math.max(5, Math.floor(baseThroughput + variation / 2 + Math.random() * 20)),
      users: 50 + userVariation,
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
  const [jmxContent, setJmxContent] = useState<string | null>(null);
  const [multipleJmxFiles, setMultipleJmxFiles] = useState<{name: string, content: string}[]>([]);
  const [activeJmxFile, setActiveJmxFile] = useState<string | null>(null);
  const [csvRequired, setCsvRequired] = useState<boolean>(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [testDataRequired, setTestDataRequired] = useState<boolean>(false);
  const [testDataFile, setTestDataFile] = useState<File | null>(null);
  
  const { toast } = useToast();

  const handleJmxFileChange = (file: File | null) => {
    if (!file) {
      setJmxFile(null);
      setJmxLoaded(false);
      return;
    }
    
    setJmxFile(file);
    
    // Read JMX file content
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        // Store the JMX content (would be XML in real app)
        const content = e.target?.result as string;
        setJmxContent(content);
        
        // Add to collection of JMX files
        if (!multipleJmxFiles.some(jmx => jmx.name === file.name)) {
          setMultipleJmxFiles([...multipleJmxFiles, { name: file.name, content }]);
        } else {
          // Update existing file
          setMultipleJmxFiles(multipleJmxFiles.map(jmx => 
            jmx.name === file.name ? { ...jmx, content } : jmx
          ));
        }
        
        setActiveJmxFile(file.name);
        
        // For JMX files, we would typically parse them, but for this demo we'll just simulate success
        setTimeout(() => {
          // Mock JMX import success - set values based on "loaded" JMX file
          setThreadCount(25);
          setRampUp(10);
          setDuration(120);
          setJmxLoaded(true);
          
          toast({
            title: "JMX File Loaded",
            description: `Successfully imported ${file.name}`,
          });
        }, 500);
      } catch (error) {
        toast({
          title: "Error Loading JMX",
          description: "Failed to parse the JMX file",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  const handleCsvFileChange = (file: File | null) => {
    setCsvFile(file);
    if (file) {
      toast({
        title: "CSV File Loaded",
        description: `Successfully loaded ${file.name}`,
      });
    }
  };

  const handleTestDataFileChange = (file: File | null) => {
    setTestDataFile(file);
    if (file) {
      toast({
        title: "Test Data File Loaded",
        description: `Successfully loaded ${file.name}`,
      });
    }
  };

  const selectJmxFile = (fileName: string) => {
    const file = multipleJmxFiles.find(jmx => jmx.name === fileName);
    if (file) {
      setJmxContent(file.content);
      setActiveJmxFile(fileName);
      
      // Simulate loading parameters from the JMX file
      const randomThreads = Math.floor(Math.random() * 50) + 10;
      const randomRampUp = Math.floor(Math.random() * 15) + 5;
      const randomDuration = Math.floor(Math.random() * 180) + 30;
      
      // Update the UI with "parsed" values from the JMX
      setTargetUrl(`https://api.example.com/${fileName.toLowerCase().replace('.jmx', '')}`);
      setThreadCount(randomThreads);
      setRampUp(randomRampUp);
      setDuration(randomDuration);
      
      toast({
        title: "JMX Configuration Loaded",
        description: `Loaded test configuration from ${fileName}`,
      });
    }
  };
  
  const exportJmxFile = () => {
    if (!jmxContent) {
      toast({
        title: "No JMX Content",
        description: "There is no JMX file to export",
        variant: "destructive",
      });
      return;
    }

    // Create a modified version that includes current parameters
    const updatedJmx = jmxContent; // In a real app, we'd update XML with current parameters
    
    const blob = new Blob([updatedJmx], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = activeJmxFile || "performance_test.jmx";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "JMX File Exported",
      description: `Saved with current configuration as ${activeJmxFile || "performance_test.jmx"}`,
    });
  };

  const handleRunTest = () => {
    if (!jmxLoaded) {
      toast({
        title: "JMX File Required",
        description: "Please import a JMX file for testing",
        variant: "destructive",
      });
      return;
    }

    if (csvRequired && !csvFile) {
      toast({
        title: "CSV File Required",
        description: "Please upload a CSV data file as it's marked as required",
        variant: "destructive",
      });
      return;
    }

    if (testDataRequired && !testDataFile) {
      toast({
        title: "Test Data File Required",
        description: "Please upload a test data file as it's marked as required",
        variant: "destructive",
      });
      return;
    }

    setIsRunning(true);
    setProgress(0);
    setTestResults(null);

    const dataFileInfo = [];
    if (csvFile) dataFileInfo.push(`CSV: ${csvFile.name}`);
    if (testDataFile) dataFileInfo.push(`Test Data: ${testDataFile.name}`);

    toast({
      title: "Starting Performance Test",
      description: `Threads: ${threadCount} | Duration: ${duration}s | JMX: ${activeJmxFile}${dataFileInfo.length > 0 ? ` | ${dataFileInfo.join(' | ')}` : ''}`,
    });

    // Mock test execution with progress updates
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        const newProgress = prevProgress + (100 / duration) * 2;
        
        if (newProgress >= 100) {
          clearInterval(interval);
          setIsRunning(false);
          
          // Generate mock results after test is complete
          const mockData = generateMockData(20, threadCount * 8, threadCount * 3);
          setTestResults({
            summary: {
              totalRequests: threadCount * duration / 2,
              successfulRequests: Math.floor(threadCount * duration / 2 * 0.97),
              failedRequests: Math.ceil(threadCount * duration / 2 * 0.03),
              averageResponseTime: 150 + (threadCount * 3),
              minResponseTime: 50 + (threadCount),
              maxResponseTime: 500 + (threadCount * 15),
              throughput: (threadCount * 1.5).toFixed(2),
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

  const runAllJmxFiles = () => {
    if (multipleJmxFiles.length === 0) {
      toast({
        title: "No JMX Files",
        description: "Please import JMX files first",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Batch Execution",
      description: `Running ${multipleJmxFiles.length} performance test scenarios sequentially`,
    });
    
    setIsRunning(true);
    setProgress(0);
    
    // Simulate running all JMX files one after another
    let currentFile = 0;
    const totalFiles = multipleJmxFiles.length;
    
    const runNextFile = () => {
      if (currentFile >= totalFiles) {
        // All files have been run
        setIsRunning(false);
        toast({
          title: "Batch Execution Complete",
          description: `Completed all ${totalFiles} test scenarios`,
        });
        return;
      }
      
      const file = multipleJmxFiles[currentFile];
      toast({
        title: `Running Test ${currentFile + 1} of ${totalFiles}`,
        description: `Executing: ${file.name}`,
      });
      
      // Mock execution time for each file
      setTimeout(() => {
        currentFile++;
        setProgress((currentFile / totalFiles) * 100);
        runNextFile();
      }, 3000);
    };
    
    runNextFile();
  };

  const handleDownloadHtmlReport = () => {
    if (!testResults) {
      toast({
        title: "No Results Available",
        description: "Please run a test first to generate a report.",
        variant: "destructive",
      });
      return;
    }

    const reportData: HtmlReportData = {
      type: "automation", // Performance testing maps to automation type for report generation
      title: "Performance Test Report",
      summary: {
        total: 1, // Single performance test
        passed: testResults.summary.errorRate < 5 ? 1 : 0,
        failed: testResults.summary.errorRate >= 5 ? 1 : 0,
        skipped: 0,
        duration: duration,
      },
      results: [
        {
          name: `Performance Test - ${targetUrl || activeJmxFile || 'Manual Configuration'}`,
          status: testResults.summary.errorRate < 5 ? "passed" : "failed",
          time: duration * 1000, // Convert to milliseconds
          error: testResults.summary.errorRate >= 5 ? `High error rate: ${testResults.summary.errorRate}%` : undefined,
          assertions: [
            {
              name: `Total Requests: ${testResults.summary.totalRequests}`,
              status: "passed",
            },
            {
              name: `Successful Requests: ${testResults.summary.successfulRequests}`,
              status: "passed",
            },
            {
              name: `Failed Requests: ${testResults.summary.failedRequests}`,
              status: testResults.summary.failedRequests > 0 ? "failed" : "passed",
              error: testResults.summary.failedRequests > 0 ? `${testResults.summary.failedRequests} requests failed` : undefined,
            },
            {
              name: `Average Response Time: ${testResults.summary.averageResponseTime}ms`,
              status: testResults.summary.averageResponseTime < 1000 ? "passed" : "failed",
              error: testResults.summary.averageResponseTime >= 1000 ? "Response time exceeds 1000ms threshold" : undefined,
            },
            {
              name: `Throughput: ${testResults.summary.throughput}/s`,
              status: "passed",
            },
            {
              name: `Error Rate: ${testResults.summary.errorRate}%`,
              status: testResults.summary.errorRate < 5 ? "passed" : "failed",
              error: testResults.summary.errorRate >= 5 ? "Error rate exceeds 5% threshold" : undefined,
            },
          ],
        },
      ],
      configuration: {
        url: targetUrl,
        method: "GET",
        browser: "JMeter Performance Test",
        headless: true,
        screenshots: false,
        video: false,
      },
      timestamp: new Date().toISOString(),
    };

    downloadHtmlReport(reportData, `performance-test-report-${new Date().toISOString().slice(0, 10)}.html`);

    toast({
      title: "HTML Report Downloaded",
      description: "Detailed performance test report has been downloaded successfully.",
    });
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
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>Test Configuration</CardTitle>
              <div className="flex gap-2">
                {jmxContent && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={exportJmxFile}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export JMX
                  </Button>
                )}
                {testResults && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDownloadHtmlReport}
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    HTML Report
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border border-dashed rounded-md p-4">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium">Import JMX File</Label>
                  {multipleJmxFiles.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={runAllJmxFiles}
                      disabled={isRunning}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Run All
                    </Button>
                  )}
                </div>
                <FileInput
                  accept=".jmx"
                  onChange={handleJmxFileChange}
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
                
                {multipleJmxFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <Label className="text-xs">Available Test Scenarios</Label>
                    <div className="max-h-32 overflow-y-auto border rounded-md divide-y">
                      {multipleJmxFiles.map((file, index) => (
                        <div 
                          key={index}
                          className={`p-2 text-sm cursor-pointer hover:bg-muted ${activeJmxFile === file.name ? 'bg-muted' : ''}`}
                          onClick={() => selectJmxFile(file.name)}
                        >
                          <div className="flex items-center">
                            <FileJson className="h-3 w-3 mr-2 flex-shrink-0" />
                            <span className="truncate">{file.name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="csv-required" className="text-sm font-medium">CSV Data Required</Label>
                  <Switch
                    id="csv-required"
                    checked={csvRequired}
                    onCheckedChange={setCsvRequired}
                  />
                </div>
                
                {csvRequired && (
                  <div className="border border-dashed rounded-md p-4">
                    <Label className="text-sm font-medium mb-2 block">Import CSV Data File</Label>
                    <FileInput
                      accept=".csv"
                      onChange={handleCsvFileChange}
                      label="Select CSV File"
                      icon={<FileSpreadsheet className="h-4 w-4 mr-2" />}
                    />
                    {csvFile && (
                      <div className="mt-2">
                        <p className="text-sm">
                          Imported: <span className="font-medium">{csvFile.name}</span>
                        </p>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="test-data-required" className="text-sm font-medium">Test Data Required</Label>
                  <Switch
                    id="test-data-required"
                    checked={testDataRequired}
                    onCheckedChange={setTestDataRequired}
                  />
                </div>
                
                {testDataRequired && (
                  <div className="border border-dashed rounded-md p-4">
                    <Label className="text-sm font-medium mb-2 block">Import Test Data File</Label>
                    <FileInput
                      accept=".csv,.json,.xlsx"
                      onChange={handleTestDataFileChange}
                      label="Select Test Data File"
                      icon={<FileSpreadsheet className="h-4 w-4 mr-2" />}
                    />
                    {testDataFile && (
                      <div className="mt-2">
                        <p className="text-sm">
                          Imported: <span className="font-medium">{testDataFile.name}</span>
                        </p>
                      </div>
                    )}
                  </div>
                )}
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
              <div className="flex items-center justify-between">
                <CardTitle>Test Results</CardTitle>
                {testResults && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadHtmlReport}
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    Download HTML Report
                  </Button>
                )}
              </div>
              {activeJmxFile && jmxLoaded && (
                <p className="text-sm text-muted-foreground">
                  Active scenario: {activeJmxFile}
                  {csvFile && csvRequired && (
                    <span> | Data: {csvFile.name}</span>
                  )}
                </p>
              )}
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
                    {isRunning 
                      ? "Test in progress... Results will appear here when complete."
                      : "No test results available. Configure and run a test to see results here."}
                  </p>
                  {!isRunning && !jmxLoaded && (
                    <Alert>
                      <AlertDescription>
                        Import a JMX file to load test configurations and start testing.
                      </AlertDescription>
                    </Alert>
                  )}
                  {!isRunning && jmxLoaded && (
                    <Button variant="outline" onClick={handleRunTest}>
                      <Play className="h-4 w-4 mr-2" />
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
