
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
import { Code, Play, FileType } from "lucide-react";

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
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      setTestFile(null);
      return;
    }

    const file = e.target.files[0];
    setTestFile(file);

    // Read file content and update editor
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setTestScript(event.target.result as string);
      }
    };
    reader.readAsText(file);
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

    // Mock test execution with a delay
    setTimeout(() => {
      // Generate mock test results
      const mockResults = `
Running 3 tests using 1 worker
  ✓ basic test (2.3s)
  ✓ navigation test (1.8s)
  ✓ authentication test (3.1s)

3 passed (7.2s)
      `;
      
      setTestResults(mockResults);
      setIsRunning(false);
      
      toast({
        title: "Tests completed",
        description: "All tests passed successfully",
      });
    }, 3000);
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

              <div className="border-2 border-dashed rounded-md p-4 flex flex-col items-center justify-center">
                <FileType className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-2">
                  Upload test script or create one below
                </p>
                <input
                  type="file"
                  id="file-upload"
                  accept=".js,.ts"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById("file-upload")?.click()}
                >
                  Select File
                </Button>
                {testFile && (
                  <p className="text-sm mt-2">
                    Selected: <span className="font-medium">{testFile.name}</span>
                  </p>
                )}
              </div>

              <Button 
                className="w-full" 
                disabled={isRunning}
                onClick={handleRunTests}
              >
                <Play className="mr-2 h-4 w-4" />
                {isRunning ? "Running Tests..." : "Run Tests"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Tabs defaultValue="editor">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="editor">Test Script</TabsTrigger>
              <TabsTrigger value="results">Test Results</TabsTrigger>
            </TabsList>
            <TabsContent value="editor">
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Code className="mr-2 h-4 w-4" />
                      <span className="text-sm font-medium">Playwright Test Script</span>
                    </div>
                  </div>
                  <Textarea 
                    value={testScript}
                    onChange={(e) => setTestScript(e.target.value)}
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
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AutomationTesting;
