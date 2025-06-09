import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Code, Play, FileCode, Download } from "lucide-react";
import { FileInput } from "@/components/FileInput";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TestReport, TestResult } from "@/components/testing/TestReport";

const AutomationTesting = () => {
  const [testFile, setTestFile] = useState<File | null>(null);
  const [browser, setBrowser] = useState<string>("chromium");
  const [headless, setHeadless] = useState<boolean>(true);
  const [captureScreenshots, setCaptureScreenshots] = useState<boolean>(true);
  const [captureVideo, setCaptureVideo] = useState<boolean>(false);
  const [testScript, setTestScript] = useState<string>(`import { test, expect } from '@playwright/test';

test('basic test', async ({ page }) => {
  // Navigate to the target website
  await page.goto('https://example.com');
  
  // Assert that the page title contains the expected text
  await expect(page).toHaveTitle(/Example Domain/);
  
  // Find an element with specific text and click it
  const link = page.getByRole('link', { name: 'More information' });
  await expect(link).toBeVisible();
});`);
  
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [testResults, setTestResults] = useState<string | null>(null);
  const [testStatus, setTestStatus] = useState<'idle' | 'running' | 'success' | 'failure'>('idle');
  const [testFiles, setTestFiles] = useState<{name: string, content: string}[]>([]);
  const [activeTestFile, setActiveTestFile] = useState<string | null>(null);
  
  const { toast } = useToast();

  const handleFileChange = (file: File | null) => {
    if (!file) {
      setTestFile(null);
      return;
    }

    setTestFile(file);

    // Read file content and update editor
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const content = event.target.result as string;
        setTestScript(content);
        
        // Add to test files if not already there
        if (!testFiles.some(tf => tf.name === file.name)) {
          setTestFiles([...testFiles, { name: file.name, content }]);
        } else {
          // Update existing file
          setTestFiles(testFiles.map(tf => 
            tf.name === file.name ? { ...tf, content } : tf
          ));
        }
        
        setActiveTestFile(file.name);
        
        toast({
          title: "Test File Loaded",
          description: `Successfully loaded ${file.name}`,
        });
      }
    };
    reader.readAsText(file);
  };

  const switchTestFile = (fileName: string) => {
    const file = testFiles.find(tf => tf.name === fileName);
    if (file) {
      setTestScript(file.content);
      setActiveTestFile(fileName);
    }
  };

  const handleScriptChange = (newContent: string) => {
    setTestScript(newContent);
    
    // If we have an active test file, update its content
    if (activeTestFile) {
      setTestFiles(testFiles.map(tf => 
        tf.name === activeTestFile ? { ...tf, content: newContent } : tf
      ));
    }
  };

  const handleRunTests = () => {
    if (!testScript.trim()) {
      toast({
        title: "No test script",
        description: "Please enter a test script or upload a test file",
        variant: "destructive",
      });
      return;
    }

    setIsRunning(true);
    setTestResults(null);
    setTestStatus('running');

    // Generate description based on test configuration
    const configDescription = [
      `Browser: ${browser}`,
      `Headless: ${headless ? 'Yes' : 'No'}`,
      `Screenshots: ${captureScreenshots ? 'Enabled' : 'Disabled'}`,
      `Video: ${captureVideo ? 'Enabled' : 'Disabled'}`,
    ].join(' | ');

    toast({
      title: "Starting Tests",
      description: configDescription,
    });

    // Mock test execution with a delay
    setTimeout(() => {
      // Simulate test running messages for a more realistic experience
      setTestResults(`Initializing browser: ${browser}...\nLaunching in ${headless ? 'headless' : 'headed'} mode...`);
      
      setTimeout(() => {
        setTestResults(prev => prev + "\nRunning tests...");
        
        setTimeout(() => {
          // Decide if tests pass or fail (80% chance of success)
          const success = Math.random() > 0.2;
          
          // Generate mock test results
          let mockResults;
          if (success) {
            mockResults = `
Running tests with ${browser} ${headless ? '(headless)' : '(headed)'}
${captureScreenshots ? '✓ Screenshots enabled' : ''}
${captureVideo ? '✓ Video recording enabled' : ''}

Running 3 tests using 1 worker
  ✓ basic test (2.3s)
  ✓ navigation test (1.8s)
  ✓ authentication test (3.1s)

3 passed (7.2s)
            `;
            setTestStatus('success');
          } else {
            mockResults = `
Running tests with ${browser} ${headless ? '(headless)' : '(headed)'}
${captureScreenshots ? '✓ Screenshots enabled' : ''}
${captureVideo ? '✓ Video recording enabled' : ''}

Running 3 tests using 1 worker
  ✓ basic test (2.3s)
  ✓ navigation test (1.8s)
  ✗ authentication test (3.1s)
    Error: Timed out waiting for selector '.login-form'

2 passed, 1 failed (7.2s)
            `;
            setTestStatus('failure');
          }
          
          setTestResults(mockResults);
          setIsRunning(false);
          
          toast({
            title: success ? "Tests completed" : "Tests finished with errors",
            description: success ? "All tests passed successfully" : "Some tests failed - check the results",
            variant: success ? "default" : "destructive",
          });
        }, 1000);
      }, 800);
    }, 500);
  };

  const exportTestFile = () => {
    if (!testScript) {
      toast({
        title: "No test script",
        description: "There is no test script to export",
        variant: "destructive",
      });
      return;
    }

    const blob = new Blob([testScript], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = activeTestFile || "test.spec.js";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Test File Exported",
      description: `Saved as ${activeTestFile || "test.spec.js"}`,
    });
  };

  const runAllTestFiles = () => {
    if (testFiles.length === 0) {
      toast({
        title: "No test files",
        description: "Please upload test files first",
        variant: "destructive",
      });
      return;
    }

    setIsRunning(true);
    setTestResults(null);
    setTestStatus('running');

    toast({
      title: "Running All Tests",
      description: `Executing ${testFiles.length} test files...`,
    });

    // Mock execution of multiple test files
    setTimeout(() => {
      let results = `Running ${testFiles.length} test files with ${browser} ${headless ? '(headless)' : '(headed)'}\n`;
      
      testFiles.forEach((file, i) => {
        const success = Math.random() > 0.2; // 80% chance of success
        results += `\nFile: ${file.name}\n`;
        results += success 
          ? "  ✓ All tests passed\n" 
          : "  ✗ Some tests failed\n";
      });
      
      results += `\nTest suite completed. ${Math.floor(testFiles.length * 0.8)} of ${testFiles.length} files passed all tests.`;
      
      setTestResults(results);
      setIsRunning(false);
      setTestStatus(Math.random() > 0.2 ? 'success' : 'failure');
      
      toast({
        title: "Test Suite Completed",
        description: `Finished running ${testFiles.length} test files`,
      });
    }, 2000);
  };

  const generateTestResults = () => {
    // Mock test results for demonstration
    const mockResults: TestResult[] = [
      {
        name: "Navigation Test",
        status: Math.random() > 0.3 ? "passed" : "failed",
        time: Math.random() * 1000 + 500,
        assertions: [
          {
            name: "Page loaded successfully",
            status: "passed" as const
          },
          {
            name: "Navigation elements visible",
            status: "passed" as const
          }
        ]
      },
      {
        name: "Authentication Test",
        status: Math.random() > 0.3 ? "passed" : "failed",
        time: Math.random() * 1500 + 800,
        error: Math.random() > 0.7 ? "Login form not found" : undefined,
        assertions: [
          {
            name: "Login form exists",
            status: Math.random() > 0.3 ? "passed" : "failed" as const,
            error: Math.random() > 0.7 ? "Element not found" : undefined
          }
        ]
      },
      {
        name: "Form Submission Test",
        status: Math.random() > 0.3 ? "passed" : "failed",
        time: Math.random() * 2000 + 1000,
        assertions: [
          {
            name: "Form submits successfully",
            status: "passed" as const
          }
        ]
      }
    ];

    return mockResults;
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold">Automation Testing</h2>
        <p className="text-muted-foreground mt-2">
          Create and run automated tests with Playwright
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Test Configuration</CardTitle>
              <CardDescription>Configure your test environment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="browser">Browser</Label>
                <Select value={browser} onValueChange={setBrowser}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select browser" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="chromium">Chromium</SelectItem>
                    <SelectItem value="firefox">Firefox</SelectItem>
                    <SelectItem value="webkit">WebKit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="headless" 
                    checked={headless} 
                    onCheckedChange={(checked) => setHeadless(checked as boolean)} 
                  />
                  <Label htmlFor="headless">Headless Mode</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="screenshots" 
                    checked={captureScreenshots} 
                    onCheckedChange={(checked) => setCaptureScreenshots(checked as boolean)}
                  />
                  <Label htmlFor="screenshots">Capture Screenshots</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="video" 
                    checked={captureVideo} 
                    onCheckedChange={(checked) => setCaptureVideo(checked as boolean)}
                  />
                  <Label htmlFor="video">Record Video</Label>
                </div>
              </div>

              <div className="border border-dashed rounded-md p-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium mb-2 block">Import Test File</Label>
                  {testFiles.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={runAllTestFiles}
                      disabled={isRunning}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Run All
                    </Button>
                  )}
                </div>
                
                <FileInput
                  accept=".js,.ts"
                  onChange={handleFileChange}
                  label="Select Test File"
                  icon={<FileCode className="h-4 w-4 mr-2" />}
                />
                
                {testFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <Label className="text-sm font-medium">Test Files</Label>
                    <div className="max-h-40 overflow-y-auto border rounded-md divide-y">
                      {testFiles.map((file, index) => (
                        <div 
                          key={index} 
                          className={`p-2 text-sm cursor-pointer hover:bg-muted ${activeTestFile === file.name ? 'bg-muted' : ''}`}
                          onClick={() => switchTestFile(file.name)}
                        >
                          <div className="flex items-center">
                            <FileCode className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span className="truncate">{file.name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button 
                  className="flex-1" 
                  disabled={isRunning}
                  onClick={handleRunTests}
                >
                  <Play className="mr-2 h-4 w-4" />
                  {isRunning ? "Running Tests..." : "Run Tests"}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={exportTestFile}
                  disabled={!testScript.trim()}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>

              {testStatus === 'running' && (
                <Alert>
                  <AlertDescription className="text-sm">
                    Tests are currently running...
                  </AlertDescription>
                </Alert>
              )}
              
              {testStatus === 'success' && (
                <Alert className="bg-green-50 text-green-800 border-green-200">
                  <AlertDescription className="text-sm">
                    All tests passed successfully
                  </AlertDescription>
                </Alert>
              )}
              
              {testStatus === 'failure' && (
                <Alert className="bg-red-50 text-red-800 border-red-200">
                  <AlertDescription className="text-sm">
                    Some tests failed - check results for details
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Tabs defaultValue="editor">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="editor">Test Script</TabsTrigger>
              <TabsTrigger value="results">Test Results</TabsTrigger>
              <TabsTrigger value="report">Test Report</TabsTrigger>
            </TabsList>
            <TabsContent value="editor">
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Code className="mr-2 h-4 w-4" />
                      <span className="text-sm font-medium">
                        {activeTestFile ? activeTestFile : "Playwright Test Script"}
                      </span>
                    </div>
                  </div>
                  <Textarea 
                    value={testScript}
                    onChange={(e) => handleScriptChange(e.target.value)}
                    className="min-h-[500px] font-mono text-sm"
                  />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="results">
              <Card>
                <CardContent className="pt-4">
                  {testResults ? (
                    <pre className="bg-card p-4 rounded-md overflow-auto h-[500px] text-sm font-mono whitespace-pre">
                      {testResults}
                    </pre>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[500px]">
                      <p className="text-muted-foreground">
                        {isRunning ? "Running tests..." : "No test results yet. Run tests to see results here."}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="report">
              <Card>
                <CardContent className="pt-4">
                  {testStatus === 'success' || testStatus === 'failure' ? (
                    <TestReport 
                      results={generateTestResults()}
                      summary={{
                        total: 3,
                        passed: testStatus === 'success' ? 3 : 2,
                        failed: testStatus === 'success' ? 0 : 1,
                        skipped: 0,
                        duration: 7.2
                      }}
                      type="automation"
                      configuration={{
                        browser: browser,
                        headless: headless,
                        screenshots: captureScreenshots,
                        video: captureVideo
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[500px]">
                      <p className="text-muted-foreground">
                        Run tests to generate a detailed report
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AutomationTesting;
