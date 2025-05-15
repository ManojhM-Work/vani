import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { ArrowRight, Download, Upload, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const apiFormats = [
  { id: "postman", name: "Postman Collection" },
  { id: "swagger", name: "Swagger/OpenAPI" },
  { id: "jmx", name: "JMeter JMX" },
  { id: "playwright", name: "Playwright" },
  { id: "loadrunner", name: "LoadRunner" },
  { id: "insomnia", name: "Insomnia" },
  { id: "restassured", name: "REST Assured" },
];

interface ConversionReport {
  successful: number;
  total: number;
  errors: Array<{endpoint: string; message: string}>;
  timeStamp: string;
}

const Conversion = () => {
  const [sourceFormat, setSourceFormat] = useState<string>("");
  const [targetFormat, setTargetFormat] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [previewText, setPreviewText] = useState<string>("");
  const [convertedText, setConvertedText] = useState<string>("");
  const [report, setReport] = useState<ConversionReport | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      setFile(null);
      setPreviewText("");
      return;
    }

    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    
    // Read file content for preview
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target) {
        setPreviewText(event.target.result as string);
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleConvert = () => {
    // In a real implementation, this would call an API to perform the conversion
    if (!sourceFormat || !targetFormat) {
      toast({
        title: "Missing formats",
        description: "Please select both source and target formats",
        variant: "destructive"
      });
      return;
    }
    
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please upload a file to convert",
        variant: "destructive"
      });
      return;
    }

    // Mock conversion - in reality would call an API
    setConvertedText(`Converted from ${sourceFormat} to ${targetFormat}:\n\n// This is a mock conversion\n{\n  "converted": true,\n  "sourceFormat": "${sourceFormat}",\n  "targetFormat": "${targetFormat}",\n  "timestamp": "${new Date().toISOString()}"\n}`);
    
    // Create a mock report
    const mockReport: ConversionReport = {
      successful: Math.floor(Math.random() * 5) + 5, // Random number between 5-10
      total: Math.floor(Math.random() * 5) + 7, // Random number between 7-12
      errors: [],
      timeStamp: new Date().toISOString()
    };
    
    // Generate some mock errors if successful is less than total
    if (mockReport.successful < mockReport.total) {
      const errorCount = mockReport.total - mockReport.successful;
      for (let i = 0; i < errorCount; i++) {
        mockReport.errors.push({
          endpoint: `/api/mock/endpoint${i+1}`,
          message: `Invalid schema at path $.paths[${i}].parameters`
        });
      }
    }
    
    setReport(mockReport);
    
    toast({
      title: "Conversion Complete",
      description: `Successfully converted ${mockReport.successful} of ${mockReport.total} endpoints`,
    });
  };

  const downloadReport = () => {
    if (!report) return;
    
    const reportData = {
      source: sourceFormat,
      target: targetFormat,
      fileName: file?.name || "unknown",
      ...report
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `conversion-report-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Report Downloaded",
      description: "Conversion report has been downloaded successfully",
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold">API Conversion</h2>
        <p className="text-muted-foreground mt-2">
          Convert between different API specification formats
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Convert API Specifications</CardTitle>
          <CardDescription>
            Upload a file and select source and target formats
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="source-format">Source Format</Label>
                <Select 
                  value={sourceFormat} 
                  onValueChange={setSourceFormat}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select source format" />
                  </SelectTrigger>
                  <SelectContent>
                    {apiFormats.map((format) => (
                      <SelectItem key={format.id} value={format.id}>
                        {format.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end justify-center">
                <ArrowRight className="text-muted-foreground h-5 w-5" />
              </div>

              <div>
                <Label htmlFor="target-format">Target Format</Label>
                <Select 
                  value={targetFormat} 
                  onValueChange={setTargetFormat}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select target format" />
                  </SelectTrigger>
                  <SelectContent>
                    {apiFormats.map((format) => (
                      <SelectItem key={format.id} value={format.id}>
                        {format.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center">
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-2">
                Drag and drop your file here, or click to browse
              </p>
              <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={handleFileChange}
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                Select File
              </Button>
              {file && (
                <p className="text-sm mt-2">
                  Selected: <span className="font-medium">{file.name}</span>
                </p>
              )}
            </div>
            
            <Button onClick={handleConvert}>Convert</Button>

            <Tabs defaultValue="preview">
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="preview">Source Preview</TabsTrigger>
                <TabsTrigger value="converted">Converted Result</TabsTrigger>
                <TabsTrigger value="report">Conversion Report</TabsTrigger>
              </TabsList>
              <TabsContent value="preview">
                <Card>
                  <CardContent className="pt-4">
                    <pre className="bg-card p-4 rounded-md overflow-auto h-64 text-sm whitespace-pre-wrap">
                      {previewText || "No file selected"}
                    </pre>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="converted">
                <Card>
                  <CardContent className="flex flex-col gap-4 pt-4">
                    <pre className="bg-card p-4 rounded-md overflow-auto h-64 text-sm whitespace-pre-wrap">
                      {convertedText || "No conversion performed yet"}
                    </pre>
                    {convertedText && (
                      <Button variant="outline" className="self-end">
                        <Download className="h-4 w-4 mr-2" />
                        Download Result
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="report">
                <Card>
                  <CardContent className="pt-4">
                    {report ? (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-semibold">Conversion Summary</h3>
                          <Button variant="outline" onClick={downloadReport}>
                            <Download className="h-4 w-4 mr-2" />
                            Download Report
                          </Button>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <Card>
                            <CardContent className="pt-6 text-center">
                              <p className="text-4xl font-bold">{report.successful}</p>
                              <p className="text-sm text-muted-foreground">Successful</p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="pt-6 text-center">
                              <p className="text-4xl font-bold">{report.errors.length}</p>
                              <p className="text-sm text-muted-foreground">Failed</p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="pt-6 text-center">
                              <p className="text-4xl font-bold">{report.total}</p>
                              <p className="text-sm text-muted-foreground">Total</p>
                            </CardContent>
                          </Card>
                        </div>
                        
                        {report.errors.length > 0 && (
                          <div>
                            <h4 className="text-md font-medium mb-2">Errors</h4>
                            <div className="border rounded-md max-h-64 overflow-y-auto">
                              {report.errors.map((error, idx) => (
                                <div key={idx} className="border-b p-3 last:border-b-0">
                                  <p className="font-medium">{error.endpoint}</p>
                                  <p className="text-sm text-red-500">{error.message}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-64">
                        <FileText className="h-10 w-10 text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">No report generated yet. Convert an API to see the report.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Conversion;
