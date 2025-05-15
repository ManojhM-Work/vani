
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileInput } from "@/components/FileInput";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download, FileText } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface ConversionResult {
  success: boolean;
  message: string;
  name?: string;
}

interface ApiImportProps {
  onComplete: (convertedApis: any[]) => void;
}

export const ApiImportCard = ({ onComplete }: ApiImportProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [results, setResults] = useState<ConversionResult[] | null>(null);
  
  const handleFileChange = (file: File | null) => {
    setFile(file);
    setResults(null);
  };
  
  const handleConvert = async () => {
    if (!file) {
      toast({
        title: "No File Selected",
        description: "Please select a file to convert",
        variant: "destructive",
      });
      return;
    }
    
    setIsConverting(true);
    
    try {
      // Read the file content
      const fileContent = await readFileAsText(file);
      
      // Parse file content
      const parsedContent = JSON.parse(fileContent);
      
      // Mock conversion process
      const convertedApis: any[] = [];
      const conversionResults: ConversionResult[] = [];
      
      // Process based on file format (Postman collection, OpenAPI, etc)
      if (parsedContent.info && parsedContent.item) {
        // Process Postman collection
        parsedContent.item.forEach((item: any) => {
          try {
            if (item.request) {
              // Convert single request
              const convertedRequest = convertPostmanRequest(item);
              convertedApis.push(convertedRequest);
              
              conversionResults.push({
                success: true,
                message: "Successfully converted",
                name: item.name
              });
            } else if (Array.isArray(item.item)) {
              // Process folder with items
              item.item.forEach((subItem: any) => {
                try {
                  if (subItem.request) {
                    const convertedRequest = convertPostmanRequest(subItem);
                    convertedApis.push(convertedRequest);
                    
                    conversionResults.push({
                      success: true,
                      message: "Successfully converted",
                      name: subItem.name
                    });
                  }
                } catch (err) {
                  conversionResults.push({
                    success: false,
                    message: `Error: ${err instanceof Error ? err.message : String(err)}`,
                    name: subItem.name
                  });
                }
              });
            }
          } catch (err) {
            conversionResults.push({
              success: false,
              message: `Error: ${err instanceof Error ? err.message : String(err)}`,
              name: item.name
            });
          }
        });
      } else if (parsedContent.openapi) {
        // Process OpenAPI format
        // For demo purposes, just add mock errors and successes
        for (const path in parsedContent.paths) {
          for (const method in parsedContent.paths[path]) {
            const endpoint = parsedContent.paths[path][method];
            try {
              convertedApis.push({
                name: endpoint.summary || `${method.toUpperCase()} ${path}`,
                url: path,
                method: method.toUpperCase(),
                headers: {},
                queryParams: [],
                body: {}
              });
              
              conversionResults.push({
                success: true,
                message: "Successfully converted",
                name: endpoint.summary || `${method.toUpperCase()} ${path}`
              });
            } catch (err) {
              conversionResults.push({
                success: false,
                message: `Error: ${err instanceof Error ? err.message : String(err)}`,
                name: endpoint.summary || `${method.toUpperCase()} ${path}`
              });
            }
          }
        }
      }
      
      setResults(conversionResults);
      onComplete(convertedApis);
      
      toast({
        title: "Conversion Complete",
        description: `Successfully converted ${conversionResults.filter(r => r.success).length} of ${conversionResults.length} APIs`,
      });
    } catch (err) {
      toast({
        title: "Conversion Failed",
        description: `Error: ${err instanceof Error ? err.message : String(err)}`,
        variant: "destructive",
      });
    } finally {
      setIsConverting(false);
    }
  };
  
  const downloadReport = () => {
    if (!results) return;
    
    const report = {
      timestamp: new Date().toISOString(),
      filename: file?.name,
      summary: {
        total: results.length,
        success: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
      },
      details: results
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = `api-conversion-report-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Report Downloaded",
      description: "Conversion report has been saved to your device",
    });
  };
  
  // Helper functions
  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
  };
  
  const convertPostmanRequest = (item: any) => {
    const { request } = item;
    
    // Extract method
    const method = request.method;
    
    // Extract URL
    let url = "";
    if (typeof request.url === "string") {
      url = request.url;
    } else if (request.url && request.url.raw) {
      url = request.url.raw;
    }
    
    // Extract query params
    const queryParams = request.url?.query?.map((q: any) => ({
      key: q.key,
      value: q.value
    })) || [];
    
    // Extract headers
    const headers: Record<string, string> = {};
    if (request.header) {
      request.header.forEach((h: any) => {
        headers[h.key] = h.value;
      });
    }
    
    // Extract body
    let body = null;
    if (request.body) {
      if (request.body.mode === "raw" && request.body.raw) {
        try {
          body = JSON.parse(request.body.raw);
        } catch {
          body = request.body.raw;
        }
      } else if (request.body.mode === "urlencoded" && request.body.urlencoded) {
        const formData: Record<string, string> = {};
        request.body.urlencoded.forEach((param: any) => {
          formData[param.key] = param.value;
        });
        body = formData;
      }
    }
    
    return {
      name: item.name,
      method,
      url,
      headers,
      queryParams,
      body,
      tests: item.event?.find((e: any) => e.listen === "test")?.script?.exec?.join("\n") || ""
    };
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>API Import & Conversion</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border border-dashed rounded-md p-4">
          <FileInput
            accept=".json,.yaml,.yml"
            onChange={handleFileChange}
            label="Select API Collection File"
            icon={<FileText className="h-4 w-4 mr-2" />}
          />
          {file && (
            <p className="text-sm mt-2">
              Selected: <span className="font-medium">{file.name}</span>
            </p>
          )}
        </div>
        
        <Button 
          className="w-full" 
          onClick={handleConvert}
          disabled={!file || isConverting}
        >
          {isConverting ? "Converting..." : "Convert API Collection"}
        </Button>
        
        {results && (
          <>
            <Alert className="mt-4">
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <span>
                    Successfully converted <span className="font-bold">{results.filter(r => r.success).length}</span> of <span className="font-bold">{results.length}</span> APIs
                  </span>
                  <Button variant="outline" size="sm" onClick={downloadReport}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Report
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
            
            <div className="border rounded-md mt-4 max-h-[300px] overflow-y-auto">
              <div className="divide-y">
                {results.map((result, index) => (
                  <div key={index} className="p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{result.name || `API ${index + 1}`}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {result.success ? "Success" : "Failed"}
                      </span>
                    </div>
                    {!result.success && (
                      <p className="text-xs text-red-500 mt-1">{result.message}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
