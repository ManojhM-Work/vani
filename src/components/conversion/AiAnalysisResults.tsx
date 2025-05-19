
import React, { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertCircle,
  Check,
  CheckCircle,
  Download,
  FileText,
  Zap,
} from "lucide-react";
import { 
  ValidationIssue, 
  Improvement, 
  Documentation, 
  EndpointDoc 
} from "../../services/aiApiService";

interface AiAnalysisResultsProps {
  semanticStructure: any;
  validationIssues: ValidationIssue[];
  suggestedImprovements: Improvement[];
  generatedDocumentation: Documentation;
  onDownloadDocumentation: () => void;
}

export const AiAnalysisResults: React.FC<AiAnalysisResultsProps> = ({
  semanticStructure,
  validationIssues,
  suggestedImprovements,
  generatedDocumentation,
  onDownloadDocumentation,
}) => {
  const [activeTab, setActiveTab] = useState<string>("semantic");

  const errorCount = validationIssues.filter((issue) => issue.type === "error").length;
  const warningCount = validationIssues.filter((issue) => issue.type === "warning").length;

  return (
    <div className="space-y-6">
      <div className="flex overflow-x-auto gap-2 pb-2">
        <Button
          variant={activeTab === "semantic" ? "default" : "outline"}
          onClick={() => setActiveTab("semantic")}
          className="whitespace-nowrap"
        >
          <Zap className="h-4 w-4 mr-2" />
          Semantic Analysis
        </Button>
        <Button
          variant={activeTab === "validation" ? "default" : "outline"}
          onClick={() => setActiveTab("validation")}
          className="whitespace-nowrap"
        >
          <AlertCircle className="h-4 w-4 mr-2" />
          Validation Issues
          {(errorCount + warningCount) > 0 && (
            <Badge variant="destructive" className="ml-2">
              {errorCount + warningCount}
            </Badge>
          )}
        </Button>
        <Button
          variant={activeTab === "improvements" ? "default" : "outline"}
          onClick={() => setActiveTab("improvements")}
          className="whitespace-nowrap"
        >
          <Check className="h-4 w-4 mr-2" />
          Suggested Improvements
          {suggestedImprovements.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {suggestedImprovements.length}
            </Badge>
          )}
        </Button>
        <Button
          variant={activeTab === "documentation" ? "default" : "outline"}
          onClick={() => setActiveTab("documentation")}
          className="whitespace-nowrap"
        >
          <FileText className="h-4 w-4 mr-2" />
          Generated Documentation
        </Button>
      </div>

      <div className="relative overflow-hidden">
        {activeTab === "semantic" && <SemanticAnalysisView semanticStructure={semanticStructure} />}
        {activeTab === "validation" && <ValidationIssuesView issues={validationIssues} />}
        {activeTab === "improvements" && <ImprovementsView improvements={suggestedImprovements} />}
        {activeTab === "documentation" && (
          <DocumentationView 
            documentation={generatedDocumentation} 
            onDownload={onDownloadDocumentation} 
          />
        )}
      </div>
    </div>
  );
};

const SemanticAnalysisView: React.FC<{ semanticStructure: any }> = ({ semanticStructure }) => {
  if (!semanticStructure || Object.keys(semanticStructure).length === 0) {
    return <EmptyState message="No semantic analysis available" />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>API Structure Overview</CardTitle>
          <CardDescription>
            Semantic understanding of your API's purpose and organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card border rounded-lg p-4">
              <h4 className="text-sm font-medium mb-2">Main Resource</h4>
              <p className="text-2xl font-bold capitalize">
                {semanticStructure.mainResource || "None detected"}
              </p>
            </div>
            <div className="bg-card border rounded-lg p-4">
              <h4 className="text-sm font-medium mb-2">Total Resources</h4>
              <p className="text-2xl font-bold">
                {semanticStructure.resources?.length || 0}
              </p>
            </div>
            <div className="bg-card border rounded-lg p-4">
              <h4 className="text-sm font-medium mb-2">Total Endpoints</h4>
              <p className="text-2xl font-bold">
                {semanticStructure.endpoints?.length || 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {semanticStructure.relationships && semanticStructure.relationships.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resource Relationships</CardTitle>
            <CardDescription>
              How resources in your API are related and organized
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Resource</TableHead>
                  <TableHead>Endpoints</TableHead>
                  <TableHead>CRUD Operations</TableHead>
                  <TableHead>API Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {semanticStructure.relationships.map((rel: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium capitalize">{rel.resource}</TableCell>
                    <TableCell>{rel.endpoints}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {rel.operations.get > 0 && (
                          <Badge variant="outline" className="bg-blue-50 border-blue-200">
                            GET
                          </Badge>
                        )}
                        {rel.operations.post > 0 && (
                          <Badge variant="outline" className="bg-green-50 border-green-200">
                            POST
                          </Badge>
                        )}
                        {rel.operations.put > 0 && (
                          <Badge variant="outline" className="bg-amber-50 border-amber-200">
                            PUT
                          </Badge>
                        )}
                        {rel.operations.patch > 0 && (
                          <Badge variant="outline" className="bg-purple-50 border-purple-200">
                            PATCH
                          </Badge>
                        )}
                        {rel.operations.delete > 0 && (
                          <Badge variant="outline" className="bg-red-50 border-red-200">
                            DELETE
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {rel.hasFullCrud ? (
                        <Badge variant="default">Full CRUD</Badge>
                      ) : rel.isReadOnly ? (
                        <Badge variant="secondary">Read Only</Badge>
                      ) : (
                        <Badge variant="outline">Partial CRUD</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {semanticStructure.endpoints && semanticStructure.endpoints.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Endpoint Categorization</CardTitle>
            <CardDescription>
              AI-detected semantic information for each endpoint
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Endpoint</TableHead>
                    <TableHead>Semantic Type</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Security Level</TableHead>
                    <TableHead>Data Category</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {semanticStructure.endpoints.map((endpoint: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={`
                            ${endpoint.method === 'GET' ? 'bg-blue-50 border-blue-200 text-blue-700' : ''}
                            ${endpoint.method === 'POST' ? 'bg-green-50 border-green-200 text-green-700' : ''}
                            ${endpoint.method === 'PUT' ? 'bg-amber-50 border-amber-200 text-amber-700' : ''}
                            ${endpoint.method === 'PATCH' ? 'bg-purple-50 border-purple-200 text-purple-700' : ''}
                            ${endpoint.method === 'DELETE' ? 'bg-red-50 border-red-200 text-red-700' : ''}
                          `}
                          >
                            {endpoint.method}
                          </Badge>
                          <span>{endpoint.path || endpoint.url}</span>
                        </div>
                      </TableCell>
                      <TableCell>{endpoint.semanticType}</TableCell>
                      <TableCell>{endpoint.purposeCategory}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            endpoint.securityLevel === 'public' ? 'outline' :
                            endpoint.securityLevel === 'admin' ? 'destructive' : 'default'
                          }
                        >
                          {endpoint.securityLevel}
                        </Badge>
                      </TableCell>
                      <TableCell>{endpoint.dataCategory}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const ValidationIssuesView: React.FC<{ issues: ValidationIssue[] }> = ({ issues }) => {
  if (issues.length === 0) {
    return (
      <div className="text-center p-8">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold">No Validation Issues Found</h3>
        <p className="text-muted-foreground">Your API specification looks valid!</p>
      </div>
    );
  }

  const errorCount = issues.filter(issue => issue.type === 'error').length;
  const warningCount = issues.filter(issue => issue.type === 'warning').length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Validation Issues</CardTitle>
          <CardDescription>
            {errorCount} errors and {warningCount} warnings found in your API specification
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {issues.map((issue, index) => (
              <div 
                key={index} 
                className={`p-4 rounded-lg border ${
                  issue.type === 'error' 
                    ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800' 
                    : 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div 
                    className={`mt-1 p-1 rounded-full ${
                      issue.type === 'error' 
                        ? 'bg-red-100 dark:bg-red-800/30' 
                        : 'bg-amber-100 dark:bg-amber-800/30'
                    }`}
                  >
                    <AlertCircle 
                      className={`h-4 w-4 ${
                        issue.type === 'error' 
                          ? 'text-red-600 dark:text-red-400' 
                          : 'text-amber-600 dark:text-amber-400'
                      }`} 
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">
                        {issue.path}
                      </p>
                      <Badge 
                        variant={issue.type === 'error' ? 'destructive' : 'outline'}
                        className={issue.type === 'warning' ? 'bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200' : ''}
                      >
                        {issue.type}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm">{issue.message}</p>
                    {issue.suggestion && (
                      <div className="mt-2 text-sm bg-white dark:bg-slate-900 p-2 rounded border">
                        <span className="font-medium">Suggestion:</span> {issue.suggestion}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const ImprovementsView: React.FC<{ improvements: Improvement[] }> = ({ improvements }) => {
  if (improvements.length === 0) {
    return <EmptyState message="No improvements suggested" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Suggested Improvements</CardTitle>
        <CardDescription>
          AI-generated recommendations to enhance your API specification
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {improvements.map((improvement, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center text-left">
                  <div className="bg-green-100 dark:bg-green-900/30 p-1 rounded-full mr-2">
                    <Zap className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span>Improve: <span className="font-medium">{improvement.path}</span></span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pl-9">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Implementation:</p>
                    <div className="mt-1 text-sm p-2 bg-slate-100 dark:bg-slate-800 rounded">
                      {improvement.currentImplementation}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Suggested Implementation:</p>
                    <div className="mt-1 text-sm p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                      {improvement.suggestedImplementation}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Reason:</p>
                    <p className="mt-1 text-sm">{improvement.reason}</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};

const DocumentationView: React.FC<{ 
  documentation: Documentation, 
  onDownload: () => void 
}> = ({ 
  documentation, 
  onDownload 
}) => {
  if (!documentation || !documentation.endpoints || documentation.endpoints.length === 0) {
    return <EmptyState message="No documentation generated" />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>API Documentation</CardTitle>
            <CardDescription>
              AI-generated comprehensive documentation
            </CardDescription>
          </div>
          <Button variant="outline" onClick={onDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download Documentation
          </Button>
        </CardHeader>
        <CardContent>
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <h2 className="text-xl font-semibold mb-2">Overview</h2>
            <p className="mb-6">{documentation.overview}</p>
            
            <h2 className="text-xl font-semibold mb-2">Endpoints</h2>
            <div className="space-y-8">
              {documentation.endpoints.map((endpoint, index) => (
                <div key={index} className="border-t pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant="outline"
                      className={`
                      ${endpoint.method === 'GET' ? 'bg-blue-50 border-blue-200 text-blue-700' : ''}
                      ${endpoint.method === 'POST' ? 'bg-green-50 border-green-200 text-green-700' : ''}
                      ${endpoint.method === 'PUT' ? 'bg-amber-50 border-amber-200 text-amber-700' : ''}
                      ${endpoint.method === 'PATCH' ? 'bg-purple-50 border-purple-200 text-purple-700' : ''}
                      ${endpoint.method === 'DELETE' ? 'bg-red-50 border-red-200 text-red-700' : ''}
                    `}
                    >
                      {endpoint.method}
                    </Badge>
                    <h3 className="text-lg font-semibold">{endpoint.name}</h3>
                  </div>
                  
                  <p className="text-sm mb-3">{endpoint.description}</p>
                  <p className="text-sm font-mono bg-slate-100 dark:bg-slate-800 p-2 rounded mb-4">
                    {endpoint.method} {endpoint.path}
                  </p>

                  {endpoint.parameters && endpoint.parameters.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">Parameters</h4>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Required</TableHead>
                              <TableHead>Description</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {endpoint.parameters.map((param, pIndex) => (
                              <TableRow key={pIndex}>
                                <TableCell className="font-mono text-sm">{param.name}</TableCell>
                                <TableCell>{param.type}</TableCell>
                                <TableCell>
                                  {param.required ? (
                                    <Badge variant="outline">Required</Badge>
                                  ) : (
                                    <Badge variant="outline" className="bg-slate-100">Optional</Badge>
                                  )}
                                </TableCell>
                                <TableCell>{param.description}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}

                  {endpoint.requestBody && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">Request Body</h4>
                      <p className="text-sm mb-1">{endpoint.requestBody.description}</p>
                      <p className="text-sm text-muted-foreground mb-2">Content-Type: {endpoint.requestBody.contentType}</p>
                      {endpoint.requestBody.schema && (
                        <pre className="text-xs bg-slate-100 dark:bg-slate-800 p-3 rounded overflow-auto">
                          {JSON.stringify(endpoint.requestBody.schema, null, 2)}
                        </pre>
                      )}
                    </div>
                  )}

                  {endpoint.responses && endpoint.responses.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">Responses</h4>
                      <div className="space-y-2">
                        {endpoint.responses.map((response, rIndex) => (
                          <div 
                            key={rIndex} 
                            className={`p-3 rounded border ${
                              response.statusCode.startsWith('2') 
                                ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20' 
                                : response.statusCode.startsWith('4') || response.statusCode.startsWith('5')
                                  ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20' 
                                  : 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/20'
                            }`}
                          >
                            <div className="flex justify-between items-center mb-2">
                              <p className="font-medium">
                                Status Code: <span className="font-mono">{response.statusCode}</span>
                              </p>
                              {response.contentType && (
                                <Badge variant="outline">
                                  {response.contentType}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm">{response.description}</p>
                            {response.schema && (
                              <pre className="mt-2 text-xs bg-white dark:bg-slate-900 p-2 rounded overflow-auto">
                                {JSON.stringify(response.schema, null, 2)}
                              </pre>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div className="text-center p-8">
    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
    <h3 className="text-lg font-medium">{message}</h3>
    <p className="text-sm text-muted-foreground mt-1">
      Once your API is analyzed, results will appear here
    </p>
  </div>
);

export default AiAnalysisResults;
