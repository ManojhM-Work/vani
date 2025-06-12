
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Upload,
  Brain,
  Download,
  FileText,
  ArrowRight,
  Sparkles,
  Check,
  AlertTriangle,
} from "lucide-react";

interface TTRDialogProps {
  children: React.ReactNode;
}

interface ToolIdentification {
  name: string;
  confidence: number;
  format: string;
  version?: string;
}

interface ConversionResult {
  sourcePreview: string;
  convertedPreview: string;
  report: {
    successful: number;
    total: number;
    issues: string[];
  };
}

export const TTRDialog = ({ children }: TTRDialogProps) => {
  const [open, setOpen] = useState(false);
  const [toolName, setToolName] = useState("");
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [targetFile, setTargetFile] = useState<File | null>(null);
  const [sourceContent, setSourceContent] = useState("");
  const [targetContent, setTargetContent] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sourceIdentification, setSourceIdentification] = useState<ToolIdentification | null>(null);
  const [targetIdentification, setTargetIdentification] = useState<ToolIdentification | null>(null);
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);
  const [activeTab, setActiveTab] = useState("upload");
  const { toast } = useToast();

  const handleFileUpload = (file: File, type: 'source' | 'target') => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (type === 'source') {
        setSourceFile(file);
        setSourceContent(content);
      } else {
        setTargetFile(file);
        setTargetContent(content);
      }
    };
    reader.readAsText(file);
  };

  const analyzeToolsWithAI = async () => {
    if (!sourceContent || !targetContent) {
      toast({
        title: "Missing Files",
        description: "Please upload both source and target sample files",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock AI identification results
      const sourceId: ToolIdentification = {
        name: detectToolFromContent(sourceContent),
        confidence: 0.92,
        format: "JSON",
        version: "2.1.0"
      };
      
      const targetId: ToolIdentification = {
        name: detectToolFromContent(targetContent),
        confidence: 0.88,
        format: "YAML",
        version: "3.0.0"
      };
      
      setSourceIdentification(sourceId);
      setTargetIdentification(targetId);
      
      toast({
        title: "AI Analysis Complete",
        description: `Identified tools with ${Math.round((sourceId.confidence + targetId.confidence) / 2 * 100)}% average confidence`,
      });
      
      setActiveTab("results");
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze the tools. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const detectToolFromContent = (content: string): string => {
    try {
      const parsed = JSON.parse(content);
      if (parsed.info && parsed.item) return "Postman Collection";
      if (parsed.openapi || parsed.swagger) return "OpenAPI/Swagger";
      if (parsed.TestPlan) return "JMeter";
      if (parsed.projects) return "Insomnia";
      return "Unknown Tool";
    } catch {
      if (content.includes("openapi:") || content.includes("swagger:")) return "OpenAPI/Swagger YAML";
      if (content.includes("<?xml")) return "SoapUI/XML Tool";
      return "Custom Format";
    }
  };

  const performConversion = async () => {
    if (!sourceIdentification || !targetIdentification) return;
    
    setIsAnalyzing(true);
    
    try {
      // Simulate conversion process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const convertedContent = generateConvertedContent(sourceContent, targetIdentification.name);
      const report = generateConversionReport(sourceContent, convertedContent);
      
      setConversionResult({
        sourcePreview: sourceContent.substring(0, 1000) + "...",
        convertedPreview: convertedContent,
        report
      });
      
      setActiveTab("conversion");
      
      toast({
        title: "Conversion Complete",
        description: `Successfully converted ${report.successful} of ${report.total} endpoints`,
      });
    } catch (error) {
      toast({
        title: "Conversion Failed",
        description: "Failed to perform conversion. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateConvertedContent = (source: string, targetTool: string): string => {
    const timestamp = new Date().toISOString();
    return `# Converted to ${targetTool} format
# Generated on: ${timestamp}
# Source: ${sourceIdentification?.name}

${targetTool === "Postman Collection" ? `{
  "info": {
    "name": "Converted Collection - ${toolName}",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Sample Endpoint",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/api/sample"
      }
    }
  ]
}` : `openapi: 3.0.0
info:
  title: Converted API - ${toolName}
  version: 1.0.0
paths:
  /api/sample:
    get:
      summary: Sample endpoint
      responses:
        '200':
          description: Success`}`;
  };

  const generateConversionReport = (source: string, converted: string) => {
    return {
      successful: 8,
      total: 10,
      issues: [
        "Complex authentication scheme needs manual review",
        "Custom headers may require adjustment"
      ]
    };
  };

  const downloadConversion = () => {
    if (!conversionResult) return;
    
    const blob = new Blob([conversionResult.convertedPreview], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `converted-${toolName || 'api'}-${Date.now()}.${targetIdentification?.format.toLowerCase() || 'txt'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded",
      description: "Converted file has been downloaded",
    });
  };

  const downloadReport = () => {
    if (!conversionResult) return;
    
    const report = {
      toolName,
      timestamp: new Date().toISOString(),
      sourceFormat: sourceIdentification,
      targetFormat: targetIdentification,
      conversion: conversionResult.report,
      sourcePreview: conversionResult.sourcePreview,
      convertedPreview: conversionResult.convertedPreview
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ttr-report-${toolName || 'conversion'}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Report Downloaded",
      description: "TTR analysis report has been downloaded",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Tool-to-Tool Recognition (TTR)
          </DialogTitle>
          <DialogDescription>
            AI-powered tool identification and conversion assistance
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload">Upload & Setup</TabsTrigger>
            <TabsTrigger value="results">AI Analysis</TabsTrigger>
            <TabsTrigger value="conversion">Conversion</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="tool-name">Tool/Convention Name</Label>
                <Input
                  id="tool-name"
                  placeholder="Enter the name of your new tool or convention"
                  value={toolName}
                  onChange={(e) => setToolName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Source Tool Sample</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <input
                        type="file"
                        id="source-file"
                        className="hidden"
                        accept=".json,.yaml,.yml,.xml"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'source')}
                      />
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => document.getElementById('source-file')?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Source Sample
                      </Button>
                      {sourceFile && (
                        <p className="text-sm text-muted-foreground">
                          {sourceFile.name}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Target Tool Sample</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <input
                        type="file"
                        id="target-file"
                        className="hidden"
                        accept=".json,.yaml,.yml,.xml"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'target')}
                      />
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => document.getElementById('target-file')?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Target Sample
                      </Button>
                      {targetFile && (
                        <p className="text-sm text-muted-foreground">
                          {targetFile.name}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Button
                onClick={analyzeToolsWithAI}
                disabled={!sourceFile || !targetFile || isAnalyzing}
                className="w-full"
              >
                {isAnalyzing ? (
                  "Analyzing with AI..."
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Analyze Tools with AI
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            {sourceIdentification && targetIdentification ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        Source Tool Identified
                        <Badge variant="secondary">
                          {Math.round(sourceIdentification.confidence * 100)}% confidence
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p><strong>Tool:</strong> {sourceIdentification.name}</p>
                        <p><strong>Format:</strong> {sourceIdentification.format}</p>
                        {sourceIdentification.version && (
                          <p><strong>Version:</strong> {sourceIdentification.version}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        Target Tool Identified
                        <Badge variant="secondary">
                          {Math.round(targetIdentification.confidence * 100)}% confidence
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p><strong>Tool:</strong> {targetIdentification.name}</p>
                        <p><strong>Format:</strong> {targetIdentification.format}</p>
                        {targetIdentification.version && (
                          <p><strong>Version:</strong> {targetIdentification.version}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex items-center justify-center">
                  <ArrowRight className="h-6 w-6 text-muted-foreground" />
                </div>

                <Button onClick={performConversion} disabled={isAnalyzing} className="w-full">
                  {isAnalyzing ? "Converting..." : "Perform Conversion"}
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Upload files and run AI analysis to see results here</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="conversion" className="space-y-4">
            {conversionResult ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Source Preview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={conversionResult.sourcePreview}
                        readOnly
                        className="h-32 font-mono text-xs"
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Converted Preview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={conversionResult.convertedPreview}
                        readOnly
                        className="h-32 font-mono text-xs"
                      />
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Conversion Report</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-500" />
                          <span>Success: {conversionResult.report.successful}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          <span>Total: {conversionResult.report.total}</span>
                        </div>
                      </div>
                      
                      {conversionResult.report.issues.length > 0 && (
                        <div>
                          <p className="font-medium mb-2">Issues to Review:</p>
                          <ul className="space-y-1">
                            {conversionResult.report.issues.map((issue, index) => (
                              <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                                <AlertTriangle className="h-3 w-3 mt-0.5 text-yellow-500" />
                                {issue}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <div className="flex gap-2">
                  <Button onClick={downloadConversion} variant="outline" className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Download Conversion
                  </Button>
                  <Button onClick={downloadReport} variant="outline" className="flex-1">
                    <FileText className="h-4 w-4 mr-2" />
                    Download Report
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Complete the AI analysis to see conversion results here</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
