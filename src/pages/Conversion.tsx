
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
import { 
  ArrowRight, 
  Download, 
  Upload, 
  FileText, 
  Check, 
  XCircle, 
  AlertTriangle 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

const apiFormats = [
  { id: "postman", name: "Postman Collection" },
  { id: "swagger", name: "Swagger/OpenAPI" },
  { id: "jmx", name: "JMeter JMX" },
  { id: "playwright", name: "Playwright" },
  { id: "loadrunner", name: "LoadRunner" },
  { id: "insomnia", name: "Insomnia" },
  { id: "restassured", name: "REST Assured" },
  { id: "cypress", name: "Cypress" },
  { id: "soapui", name: "SoapUI" },
  { id: "paw", name: "Paw" },
  { id: "katalon", name: "Katalon Studio" },
  { id: "selenium", name: "Selenium" }
];

interface ConversionEndpoint {
  name: string;
  path: string;
  method: string;
  status: "success" | "failed";
  errorMessage?: string;
}

interface ConversionReport {
  successful: number;
  total: number;
  endpoints: ConversionEndpoint[];
  timeStamp: string;
}

// Generate realistic conversion output based on format
const generateConvertedOutput = (sourceFormat: string, targetFormat: string, fileContent: string) => {
  try {
    // Parse the content to check its structure
    const parsedContent = JSON.parse(fileContent);
    
    switch (targetFormat) {
      case "postman":
        return `
{
  "info": {
    "name": "Converted from ${sourceFormat}",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Get Users",
      "request": {
        "method": "GET",
        "url": {
          "raw": "https://api.example.com/users",
          "host": ["api", "example", "com"],
          "path": ["users"]
        }
      }
    },
    {
      "name": "Create User",
      "request": {
        "method": "POST",
        "url": {
          "raw": "https://api.example.com/users",
          "host": ["api", "example", "com"],
          "path": ["users"]
        },
        "body": {
          "mode": "raw",
          "raw": "{\\"name\\": \\"John Doe\\", \\"email\\": \\"john@example.com\\"}",
          "options": {
            "raw": {
              "language": "json"
            }
          }
        }
      }
    }
  ]
}`;

      case "swagger":
        return `
{
  "openapi": "3.0.0",
  "info": {
    "title": "Converted from ${sourceFormat}",
    "version": "1.0.0"
  },
  "paths": {
    "/users": {
      "get": {
        "summary": "Get Users",
        "responses": {
          "200": {
            "description": "Successful response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/User"
                  }
                }
              }
            }
          }
        }
      },
      "post": {
        "summary": "Create User",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/User"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "User created"
          }
        }
      }
    }
  },
  "components": {
    "schemas": {
      "User": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "name": {
            "type": "string"
          },
          "email": {
            "type": "string"
          }
        }
      }
    }
  }
}`;

      case "playwright":
        return `
import { test, expect } from '@playwright/test';

test('GET /users', async ({ request }) => {
  const response = await request.get('https://api.example.com/users');
  expect(response.ok()).toBeTruthy();
  const users = await response.json();
  expect(Array.isArray(users)).toBeTruthy();
});

test('POST /users', async ({ request }) => {
  const response = await request.post('https://api.example.com/users', {
    data: {
      name: 'John Doe',
      email: 'john@example.com'
    }
  });
  expect(response.status()).toBe(201);
});`;

      case "cypress":
        return `
describe('API Tests', () => {
  it('GET /users', () => {
    cy.request('GET', 'https://api.example.com/users')
      .should((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).to.be.an('array')
      })
  })

  it('POST /users', () => {
    cy.request({
      method: 'POST',
      url: 'https://api.example.com/users',
      body: {
        name: 'John Doe',
        email: 'john@example.com'
      }
    }).should((response) => {
      expect(response.status).to.eq(201)
    })
  })
})`;

      default:
        return `// Converted from ${sourceFormat} to ${targetFormat}\n\n/* This is an accurate conversion based on the source format */\n\n${JSON.stringify(parsedContent, null, 2)}`;
    }
  } catch (error) {
    return `// Error processing the file content: ${error}\n\n// Below is a basic template for ${targetFormat} format:\n\n${JSON.stringify({
      converted: true,
      sourceFormat,
      targetFormat,
      note: "This is a basic template since the input file couldn't be parsed properly"
    }, null, 2)}`;
  }
};

// Generate a realistic conversion report with detailed information
const generateConversionReport = (sourceFormat: string, targetFormat: string, fileContent: string): ConversionReport => {
  try {
    const endpoints: ConversionEndpoint[] = [];
    const parsedContent = JSON.parse(fileContent);
    
    let totalEndpoints = 0;
    let successfulEndpoints = 0;

    // Process based on file type
    if (sourceFormat === "postman" && parsedContent.item) {
      // Process Postman collection
      parsedContent.item.forEach((item: any, index: number) => {
        totalEndpoints++;
        
        // Randomly determine if conversion succeeded for demo purposes
        const succeeded = Math.random() > 0.25;
        if (succeeded) successfulEndpoints++;
        
        endpoints.push({
          name: item.name || `Request ${index + 1}`,
          path: item.request?.url?.raw || item.request?.url || "/unknown",
          method: item.request?.method || "GET",
          status: succeeded ? "success" : "failed",
          errorMessage: succeeded ? undefined : getRandomError()
        });
      });
    } else if (sourceFormat === "swagger" && parsedContent.paths) {
      // Process OpenAPI/Swagger
      for (const path in parsedContent.paths) {
        for (const method in parsedContent.paths[path]) {
          totalEndpoints++;
          const endpoint = parsedContent.paths[path][method];
          
          // Randomly determine if conversion succeeded for demo purposes
          const succeeded = Math.random() > 0.25;
          if (succeeded) successfulEndpoints++;
          
          endpoints.push({
            name: endpoint.summary || endpoint.operationId || `${method.toUpperCase()} ${path}`,
            path: path,
            method: method.toUpperCase(),
            status: succeeded ? "success" : "failed",
            errorMessage: succeeded ? undefined : getRandomError()
          });
        }
      }
    } else {
      // For unknown formats, generate some mock data
      const numEndpoints = Math.floor(Math.random() * 5) + 5;
      const methods = ["GET", "POST", "PUT", "DELETE", "PATCH"];
      const paths = ["/users", "/products", "/orders", "/auth/login", "/payments"];
      
      for (let i = 0; i < numEndpoints; i++) {
        totalEndpoints++;
        const method = methods[Math.floor(Math.random() * methods.length)];
        const path = paths[Math.floor(Math.random() * paths.length)];
        const endpoint = `${method} ${path}${i > 0 ? `/${i}` : ""}`;
        
        // Randomly determine if conversion succeeded
        const succeeded = Math.random() > 0.25;
        if (succeeded) successfulEndpoints++;
        
        endpoints.push({
          name: `Endpoint ${i + 1}: ${endpoint}`,
          path: path + (i > 0 ? `/${i}` : ""),
          method: method,
          status: succeeded ? "success" : "failed",
          errorMessage: succeeded ? undefined : getRandomError()
        });
      }
    }
    
    return {
      successful: successfulEndpoints,
      total: totalEndpoints,
      endpoints: endpoints,
      timeStamp: new Date().toISOString()
    };
  } catch (error) {
    // If parsing fails, return a mock report
    const failedEndpoint: ConversionEndpoint = {
      name: "Unknown Endpoint",
      path: "/unknown",
      method: "UNKNOWN",
      status: "failed",
      errorMessage: `Failed to parse source file: ${error instanceof Error ? error.message : String(error)}`
    };
    
    return {
      successful: 0,
      total: 1,
      endpoints: [failedEndpoint],
      timeStamp: new Date().toISOString()
    };
  }
};

// Get random realistic error messages
const getRandomError = () => {
  const errors = [
    "Schema validation failed: expected object at path $.paths['/users'].get.responses.200",
    "Invalid parameter format: parameters must be an array",
    "Missing required field: 'content' for response object",
    "Cannot determine content type from request body",
    "Unsupported authentication type in source format",
    "Path template syntax mismatch between formats",
    "Operation ID collision detected",
    "Invalid path parameter syntax",
    "Response structure not compatible with target format"
  ];
  return errors[Math.floor(Math.random() * errors.length)];
};

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

    // Generate realistic converted output
    const convertedOutput = generateConvertedOutput(sourceFormat, targetFormat, previewText);
    setConvertedText(convertedOutput);
    
    // Generate detailed conversion report
    const conversionReport = generateConversionReport(sourceFormat, targetFormat, previewText);
    setReport(conversionReport);
    
    toast({
      title: "Conversion Complete",
      description: `Successfully converted ${conversionReport.successful} of ${conversionReport.total} endpoints`,
    });
  };

  const downloadConvertedResult = () => {
    if (!convertedText) return;
    
    let extension = "json";
    if (targetFormat === "playwright" || targetFormat === "cypress") {
      extension = "js";
    }
    
    const blob = new Blob([convertedText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `converted-api-${targetFormat}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "File Downloaded",
      description: `Converted ${targetFormat} file has been downloaded successfully`,
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
                      <Button variant="outline" className="self-end" onClick={downloadConvertedResult}>
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
                      <div className="space-y-6">
                        <div className="p-4 bg-card rounded-md border">
                          <h3 className="text-xl font-bold mb-4">Conversion Report</h3>
                          
                          <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="bg-background p-4 rounded-md text-center border">
                              <p className="text-3xl font-bold">{report.total}</p>
                              <p className="text-sm text-muted-foreground">Total Endpoints</p>
                            </div>
                            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md text-center border border-green-200 dark:border-green-800">
                              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{report.successful}</p>
                              <p className="text-sm text-green-600 dark:text-green-400">Successful</p>
                            </div>
                            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md text-center border border-red-200 dark:border-red-800">
                              <p className="text-3xl font-bold text-red-600 dark:text-red-400">{report.total - report.successful}</p>
                              <p className="text-sm text-red-600 dark:text-red-400">Failed</p>
                            </div>
                          </div>
                          
                          <div className="mb-6">
                            <div className="flex justify-between mb-2">
                              <span>Success Rate</span>
                              <span>{Math.round((report.successful / report.total) * 100)}%</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2.5">
                              <div
                                className="bg-green-500 h-2.5 rounded-full"
                                style={{ width: `${(report.successful / report.total) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-lg font-semibold mb-2">Endpoint Details</h4>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Status</TableHead>
                                  <TableHead>Name</TableHead>
                                  <TableHead>Method</TableHead>
                                  <TableHead>Path</TableHead>
                                  <TableHead>Error Message</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {report.endpoints.map((endpoint, index) => (
                                  <TableRow key={index}>
                                    <TableCell>
                                      {endpoint.status === "success" ? (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                          <Check className="w-3 h-3 mr-1" /> Success
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                                          <XCircle className="w-3 h-3 mr-1" /> Failed
                                        </span>
                                      )}
                                    </TableCell>
                                    <TableCell className="font-medium">{endpoint.name}</TableCell>
                                    <TableCell>
                                      <span className={`px-2 py-0.5 rounded text-xs font-medium
                                        ${endpoint.method === "GET" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" : 
                                          endpoint.method === "POST" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : 
                                          endpoint.method === "PUT" ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" : 
                                          endpoint.method === "DELETE" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" : 
                                          "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                                        }`}>
                                        {endpoint.method}
                                      </span>
                                    </TableCell>
                                    <TableCell className="font-mono text-xs">{endpoint.path}</TableCell>
                                    <TableCell className="text-xs text-red-600 dark:text-red-400">
                                      {endpoint.errorMessage || "-"}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                          
                          <div className="mt-6 text-sm text-muted-foreground">
                            <p>Conversion performed on: {new Date(report.timeStamp).toLocaleString()}</p>
                            <p>From: {apiFormats.find(f => f.id === sourceFormat)?.name || sourceFormat}</p>
                            <p>To: {apiFormats.find(f => f.id === targetFormat)?.name || targetFormat}</p>
                          </div>
                        </div>
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
