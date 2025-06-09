import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, FileText, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { downloadHtmlReport, HtmlReportData } from "@/utils/htmlReportGenerator";

export interface TestResult {
  name: string;
  status: "passed" | "failed" | "skipped";
  time?: number;
  error?: string;
  assertions?: {
    name: string;
    status: "passed" | "failed";
    error?: string;
  }[];
}

interface TestReportProps {
  results: TestResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    duration: number;
  };
  type: "functional" | "automation";
  configuration?: {
    url?: string;
    method?: string;
    browser?: string;
    headless?: boolean;
    screenshots?: boolean;
    video?: boolean;
  };
}

export const TestReport = ({ results, summary, type, configuration }: TestReportProps) => {
  const [activeTab, setActiveTab] = useState<string>("summary");
  const { toast } = useToast();

  const handleDownloadReport = () => {
    const reportData = {
      type,
      summary,
      results,
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${type}-test-report-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Report Downloaded",
      description: `${type.charAt(0).toUpperCase() + type.slice(1)} test report has been downloaded.`,
    });
  };

  const handleDownloadHtmlReport = () => {
    const reportData: HtmlReportData = {
      type,
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Test Report`,
      summary,
      results: results.map(result => ({
        name: result.name,
        status: result.status,
        time: result.time,
        error: result.error,
        assertions: result.assertions
      })),
      configuration,
      timestamp: new Date().toISOString()
    };

    downloadHtmlReport(reportData);

    toast({
      title: "HTML Report Downloaded",
      description: `Detailed HTML report has been downloaded successfully.`,
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Test Report</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownloadReport}>
            <Download className="mr-2 h-4 w-4" />
            JSON Report
          </Button>
          <Button variant="outline" onClick={handleDownloadHtmlReport}>
            <Globe className="mr-2 h-4 w-4" />
            HTML Report
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-4 py-4">
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-3xl font-bold">{summary.total}</p>
                  <p className="text-sm text-muted-foreground">Total Tests</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-3xl font-bold text-green-500">{summary.passed}</p>
                  <p className="text-sm text-muted-foreground">Passed</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-3xl font-bold text-red-500">{summary.failed}</p>
                  <p className="text-sm text-muted-foreground">Failed</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-3xl font-bold">{summary.duration.toFixed(2)}s</p>
                  <p className="text-sm text-muted-foreground">Duration</p>
                </CardContent>
              </Card>
            </div>

            {/* Success rate bar */}
            <div className="mt-6">
              <div className="flex justify-between mb-1 text-sm">
                <span>Success Rate</span>
                <span>{Math.round((summary.passed / summary.total) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-green-500 h-2.5 rounded-full"
                  style={{ width: `${(summary.passed / summary.total) * 100}%` }}
                ></div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="results">
            <div className="border rounded-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Test Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Duration
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-gray-200">
                  {results.map((result, index) => (
                    <tr key={index} className="hover:bg-muted/50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {result.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            result.status === "passed"
                              ? "bg-green-100 text-green-800"
                              : result.status === "failed"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {result.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {result.time ? `${result.time.toFixed(2)}ms` : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="details">
            <div className="space-y-4">
              {results.map((result, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{result.name}</CardTitle>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          result.status === "passed"
                            ? "bg-green-100 text-green-800"
                            : result.status === "failed"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {result.status}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    {result.error && (
                      <div className="bg-red-50 text-red-800 p-3 rounded-md">
                        <p className="font-medium">Error:</p>
                        <pre className="whitespace-pre-wrap text-xs mt-1">{result.error}</pre>
                      </div>
                    )}

                    {result.assertions && result.assertions.length > 0 && (
                      <div>
                        <p className="font-medium mb-2">Assertions:</p>
                        <div className="space-y-2">
                          {result.assertions.map((assertion, i) => (
                            <div
                              key={i}
                              className={`p-2 rounded-md ${
                                assertion.status === "passed"
                                  ? "bg-green-50 text-green-800"
                                  : "bg-red-50 text-red-800"
                              }`}
                            >
                              <div className="flex items-center">
                                <span
                                  className={`mr-2 ${
                                    assertion.status === "passed" ? "text-green-500" : "text-red-500"
                                  }`}
                                >
                                  {assertion.status === "passed" ? "✓" : "✗"}
                                </span>
                                <span>{assertion.name}</span>
                              </div>
                              {assertion.error && (
                                <pre className="whitespace-pre-wrap text-xs mt-1 pl-6">
                                  {assertion.error}
                                </pre>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
