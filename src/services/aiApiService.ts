
import { OpenAI } from "openai";

// Interface for the API analysis results
interface ApiAnalysisResult {
  semanticStructure: any;
  validationIssues: ValidationIssue[];
  suggestedImprovements: Improvement[];
  generatedDocumentation: Documentation;
}

export interface ValidationIssue {
  type: 'error' | 'warning';
  path: string;
  message: string;
  suggestion?: string;
}

export interface Improvement {
  path: string;
  currentImplementation: string;
  suggestedImplementation: string;
  reason: string;
}

export interface Documentation {
  overview: string;
  endpoints: EndpointDoc[];
}

export interface EndpointDoc {
  name: string;
  description: string;
  path: string;
  method: string;
  parameters?: ParameterDoc[];
  requestBody?: RequestBodyDoc;
  responses?: ResponseDoc[];
}

export interface ParameterDoc {
  name: string;
  description: string;
  required: boolean;
  type: string;
}

export interface RequestBodyDoc {
  description: string;
  contentType: string;
  schema: any;
}

export interface ResponseDoc {
  statusCode: string;
  description: string;
  contentType?: string;
  schema?: any;
}

// Mock OpenAI client for demonstration
// In a real implementation, you would use a proper API key
const mockOpenAI = {
  chat: {
    completions: {
      create: async (options: any) => {
        // Mock AI response generator
        const generateMockResponse = (prompt: string) => {
          // Generate different mock responses based on the prompt content
          if (prompt.toLowerCase().includes("semantic")) {
            return generateSemanticAnalysis(options.messages[1].content);
          } 
          else if (prompt.toLowerCase().includes("validate")) {
            return generateValidationResponse(options.messages[1].content);
          }
          else if (prompt.toLowerCase().includes("documentation")) {
            return generateDocumentation(options.messages[1].content);
          }
          return { choices: [{ message: { content: "Mock response" } }] };
        };
        
        return generateMockResponse(options.messages[1].content);
      }
    }
  }
};

// Helper function to extract API endpoints from content
function extractEndpoints(content: string): any[] {
  try {
    const data = JSON.parse(content);
    let endpoints = [];

    // Handle Postman collections
    if (data.item) {
      data.item.forEach((item: any) => {
        if (item.request) {
          endpoints.push({
            name: item.name,
            method: item.request.method,
            url: typeof item.request.url === 'string' ? item.request.url : item.request.url?.raw,
            headers: item.request.header,
            body: item.request.body
          });
        }
      });
    }
    // Handle OpenAPI/Swagger
    else if (data.paths) {
      for (const path in data.paths) {
        for (const method in data.paths[path]) {
          const endpoint = data.paths[path][method];
          endpoints.push({
            name: endpoint.summary || `${method.toUpperCase()} ${path}`,
            method: method.toUpperCase(),
            path: path,
            parameters: endpoint.parameters,
            requestBody: endpoint.requestBody,
            responses: endpoint.responses
          });
        }
      }
    }

    return endpoints;
  } catch (error) {
    console.error("Failed to parse API content:", error);
    return [];
  }
}

// Generate semantic analysis based on API content
function generateSemanticAnalysis(content: string) {
  const endpoints = extractEndpoints(content);
  
  // Identify common patterns and relationships between endpoints
  const relationships = [];
  const resourceGroups = new Map();
  
  // Group endpoints by resource
  endpoints.forEach((endpoint) => {
    let resource = "";
    if (endpoint.path) {
      const parts = endpoint.path.split('/');
      resource = parts.length > 1 ? parts[1] : "unknown";
    } else if (endpoint.url) {
      const urlParts = endpoint.url.split('/');
      resource = urlParts.length > 3 ? urlParts[3] : "unknown";
    }
    
    if (!resourceGroups.has(resource)) {
      resourceGroups.set(resource, []);
    }
    resourceGroups.get(resource).push(endpoint);
  });
  
  // Analyze CRUD operations per resource
  resourceGroups.forEach((endpoints, resource) => {
    const operations = {
      get: endpoints.filter(e => e.method === 'GET').length,
      post: endpoints.filter(e => e.method === 'POST').length,
      put: endpoints.filter(e => e.method === 'PUT').length,
      delete: endpoints.filter(e => e.method === 'DELETE').length,
      patch: endpoints.filter(e => e.method === 'PATCH').length,
    };
    
    relationships.push({
      resource,
      endpoints: endpoints.length,
      operations,
      hasFullCrud: operations.get > 0 && operations.post > 0 && 
                   (operations.put > 0 || operations.patch > 0) && 
                   operations.delete > 0,
      isReadOnly: operations.get > 0 && 
                  operations.post === 0 && 
                  operations.put === 0 && 
                  operations.patch === 0 && 
                  operations.delete === 0
    });
  });
  
  // Create semantic structure
  const semanticStructure = {
    endpoints: endpoints.map(endpoint => ({
      ...endpoint,
      semanticType: determineSemanticsType(endpoint),
      purposeCategory: determinePurposeCategory(endpoint),
      securityLevel: determineSecurityLevel(endpoint),
      dataCategory: determineDataCategory(endpoint),
    })),
    relationships,
    resources: Array.from(resourceGroups.keys()),
    mainResource: findMainResource(resourceGroups)
  };
  
  return { 
    choices: [{
      message: {
        content: JSON.stringify({
          semanticStructure
        })
      }
    }]
  };
}

// Generate validation response
function generateValidationResponse(content: string) {
  const endpoints = extractEndpoints(content);
  
  // Analyze common validation issues
  const validationIssues: ValidationIssue[] = [];
  
  endpoints.forEach((endpoint, index) => {
    // Check for missing descriptions
    if (!endpoint.name || endpoint.name === endpoint.path) {
      validationIssues.push({
        type: 'warning',
        path: `endpoints[${index}]`,
        message: 'Missing or generic endpoint name/description',
        suggestion: 'Add a descriptive name that explains the endpoint purpose'
      });
    }
    
    // Check for inconsistent path patterns
    if (endpoint.path && !endpoint.path.startsWith('/')) {
      validationIssues.push({
        type: 'error',
        path: `endpoints[${index}].path`,
        message: 'Path should start with /',
        suggestion: `Change ${endpoint.path} to /${endpoint.path}`
      });
    }
    
    // Check for missing response codes
    if (endpoint.responses) {
      const hasSuccessResponse = Object.keys(endpoint.responses)
        .some(code => code.startsWith('2'));
      
      const hasErrorResponse = Object.keys(endpoint.responses)
        .some(code => code.startsWith('4') || code.startsWith('5'));
        
      if (!hasSuccessResponse) {
        validationIssues.push({
          type: 'warning',
          path: `endpoints[${index}].responses`,
          message: 'Missing success response definition',
          suggestion: 'Add at least one 2xx response code'
        });
      }
      
      if (!hasErrorResponse) {
        validationIssues.push({
          type: 'warning',
          path: `endpoints[${index}].responses`,
          message: 'Missing error response definition',
          suggestion: 'Add at least one 4xx or 5xx response code'
        });
      }
    }
    
    // Check for missing parameters for path variables
    if (endpoint.path && endpoint.path.includes('{')) {
      const pathParams = extractPathParams(endpoint.path);
      const definedParams = (endpoint.parameters || [])
        .filter((p: any) => p.in === 'path')
        .map((p: any) => p.name);
      
      pathParams.forEach(param => {
        if (!definedParams.includes(param)) {
          validationIssues.push({
            type: 'error',
            path: `endpoints[${index}].parameters`,
            message: `Path parameter {${param}} is used but not defined in parameters`,
            suggestion: `Add a path parameter definition for "${param}"`
          });
        }
      });
    }
  });
  
  // Generate improvement suggestions
  const improvements: Improvement[] = [
    {
      path: 'general',
      currentImplementation: 'Various endpoints with inconsistent naming patterns',
      suggestedImplementation: 'Follow REST resource naming conventions (e.g., plural nouns for collections)',
      reason: 'Consistent naming improves API understandability and follows best practices'
    },
    {
      path: 'security',
      currentImplementation: 'Some endpoints may not specify security requirements',
      suggestedImplementation: 'Add explicit security schemes and requirements',
      reason: 'Clear security definitions help ensure proper authentication and authorization'
    },
    {
      path: 'documentation',
      currentImplementation: 'Some endpoints have minimal descriptions',
      suggestedImplementation: 'Add detailed descriptions for all endpoints, parameters, and responses',
      reason: 'Comprehensive documentation improves API usability'
    }
  ];
  
  // Add specific suggestions based on endpoint analysis
  endpoints.forEach((endpoint, index) => {
    if (endpoint.method === 'GET' && !endpoint.path?.includes('?') && !endpoint.parameters) {
      improvements.push({
        path: `endpoints[${index}]`,
        currentImplementation: `GET ${endpoint.path || endpoint.url} with no query parameters`,
        suggestedImplementation: 'Add pagination and filtering parameters',
        reason: 'GET operations on collections should support pagination and filtering'
      });
    }
  });
  
  return { 
    choices: [{
      message: {
        content: JSON.stringify({
          validationIssues,
          suggestedImprovements: improvements
        })
      }
    }]
  };
}

// Generate documentation based on API content
function generateDocumentation(content: string) {
  const endpoints = extractEndpoints(content);
  
  // Generate documentation for each endpoint
  const endpointDocs: EndpointDoc[] = endpoints.map(endpoint => {
    // Extract path parameters
    const pathParams: ParameterDoc[] = [];
    if (endpoint.path && endpoint.path.includes('{')) {
      const params = extractPathParams(endpoint.path);
      params.forEach(paramName => {
        pathParams.push({
          name: paramName,
          description: `Unique identifier for the ${paramName.replace('Id', '')}`,
          required: true,
          type: 'string'
        });
      });
    }
    
    // Extract query parameters
    const queryParams: ParameterDoc[] = [];
    if (endpoint.parameters) {
      endpoint.parameters
        .filter((p: any) => p.in === 'query')
        .forEach((param: any) => {
          queryParams.push({
            name: param.name,
            description: param.description || `Parameter to filter by ${param.name}`,
            required: param.required || false,
            type: param.schema?.type || 'string'
          });
        });
    }
    
    // Generate example responses
    const responses: ResponseDoc[] = [];
    if (endpoint.responses) {
      Object.keys(endpoint.responses).forEach(statusCode => {
        responses.push({
          statusCode,
          description: endpoint.responses[statusCode].description || getDefaultResponseDescription(statusCode),
          contentType: 'application/json',
          schema: endpoint.responses[statusCode].content?.['application/json']?.schema
        });
      });
    } else {
      // Generate default responses based on method
      if (['GET', 'PUT', 'PATCH'].includes(endpoint.method)) {
        responses.push({
          statusCode: '200',
          description: endpoint.method === 'GET' ? 'Successfully retrieved resource' : 'Successfully updated resource'
        });
      } else if (endpoint.method === 'POST') {
        responses.push({
          statusCode: '201',
          description: 'Successfully created resource'
        });
      } else if (endpoint.method === 'DELETE') {
        responses.push({
          statusCode: '204',
          description: 'Successfully deleted resource'
        });
      }
      
      responses.push({
        statusCode: '400',
        description: 'Bad request - client error'
      });
      
      responses.push({
        statusCode: '401',
        description: 'Unauthorized - authentication required'
      });
      
      responses.push({
        statusCode: '404',
        description: 'Resource not found'
      });
    }
    
    return {
      name: endpoint.name || `${endpoint.method} ${endpoint.path || endpoint.url}`,
      description: generateEndpointDescription(endpoint),
      path: endpoint.path || extractPathFromUrl(endpoint.url),
      method: endpoint.method,
      parameters: [...pathParams, ...queryParams],
      requestBody: endpoint.requestBody ? {
        description: endpoint.requestBody.description || 'Request payload',
        contentType: 'application/json',
        schema: endpoint.requestBody.content?.['application/json']?.schema
      } : undefined,
      responses
    };
  });
  
  // Generate overview documentation
  const overview = generateApiOverview(endpoints);
  
  return { 
    choices: [{
      message: {
        content: JSON.stringify({
          generatedDocumentation: {
            overview,
            endpoints: endpointDocs
          }
        })
      }
    }]
  };
}

// Helper functions for semantic analysis
function determineSemanticsType(endpoint: any): string {
  const method = endpoint.method?.toUpperCase();
  const path = endpoint.path || endpoint.url || '';
  
  if (method === 'GET') {
    if (path.match(/\/[^/]+\/\{[^}]+\}$/)) {
      return 'resource-retrieval';
    }
    return 'collection-retrieval';
  } else if (method === 'POST') {
    return 'resource-creation';
  } else if (method === 'PUT') {
    return 'full-resource-update';
  } else if (method === 'PATCH') {
    return 'partial-resource-update';
  } else if (method === 'DELETE') {
    return 'resource-deletion';
  }
  
  return 'unknown';
}

function determinePurposeCategory(endpoint: any): string {
  const path = endpoint.path || endpoint.url || '';
  const method = endpoint.method?.toUpperCase();
  
  if (path.includes('auth') || path.includes('login') || path.includes('token')) {
    return 'authentication';
  } else if (path.includes('user') || path.includes('account')) {
    return 'user-management';
  } else if (method === 'GET' && !path.match(/\/[^/]+\/\{[^}]+\}$/)) {
    return 'data-retrieval';
  } else if (['POST', 'PUT', 'PATCH'].includes(method)) {
    return 'data-manipulation';
  } else if (method === 'DELETE') {
    return 'data-deletion';
  }
  
  return 'general-purpose';
}

function determineSecurityLevel(endpoint: any): string {
  const path = endpoint.path || endpoint.url || '';
  const method = endpoint.method?.toUpperCase();
  
  if (path.includes('public') || path.includes('/health')) {
    return 'public';
  } else if (path.includes('admin') || path.includes('manage')) {
    return 'admin';
  } else if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    return 'authenticated';
  }
  
  return 'standard';
}

function determineDataCategory(endpoint: any): string {
  const path = endpoint.path || endpoint.url || '';
  
  if (path.includes('user') || path.includes('account') || path.includes('profile')) {
    return 'personal-data';
  } else if (path.includes('payment') || path.includes('billing') || path.includes('subscription')) {
    return 'financial-data';
  } else if (path.includes('health') || path.includes('medical')) {
    return 'health-data';
  }
  
  return 'general-data';
}

function findMainResource(resourceGroups: Map<string, any[]>): string {
  let mainResource = '';
  let maxEndpoints = 0;
  
  resourceGroups.forEach((endpoints, resource) => {
    if (endpoints.length > maxEndpoints && resource !== 'unknown') {
      maxEndpoints = endpoints.length;
      mainResource = resource;
    }
  });
  
  return mainResource;
}

function extractPathParams(path: string): string[] {
  const matches = path.match(/\{([^}]+)\}/g) || [];
  return matches.map(match => match.replace(/[{}]/g, ''));
}

function extractPathFromUrl(url: string): string {
  if (!url) return '';
  try {
    const urlObj = new URL(url);
    return urlObj.pathname;
  } catch (e) {
    // If it's not a valid URL, try a simple extraction
    const parts = url.split('://');
    if (parts.length > 1) {
      const pathParts = parts[1].split('/');
      return '/' + pathParts.slice(1).join('/');
    }
    return '';
  }
}

function generateEndpointDescription(endpoint: any): string {
  const method = endpoint.method.toUpperCase();
  const path = endpoint.path || extractPathFromUrl(endpoint.url) || '';
  
  // Extract resource name from path
  const pathParts = path.split('/').filter(p => p && !p.includes('{'));
  const resource = pathParts.length > 0 ? pathParts[pathParts.length - 1] : 'resource';
  
  // Generate description based on HTTP method
  switch (method) {
    case 'GET':
      return path.includes('{') 
        ? `Retrieves a specific ${resource.replace(/s$/, '')} by its identifier`
        : `Retrieves a list of ${resource}`;
    case 'POST':
      return `Creates a new ${resource.replace(/s$/, '')}`;
    case 'PUT':
      return `Updates an existing ${resource.replace(/s$/, '')} with a complete replacement`;
    case 'PATCH':
      return `Partially updates an existing ${resource.replace(/s$/, '')}`;
    case 'DELETE':
      return `Deletes a ${resource.replace(/s$/, '')}`;
    default:
      return `Performs a ${method} operation on ${resource}`;
  }
}

function generateApiOverview(endpoints: any[]): string {
  // Count of endpoints by method
  const methodCounts: Record<string, number> = {};
  endpoints.forEach(endpoint => {
    const method = endpoint.method.toUpperCase();
    methodCounts[method] = (methodCounts[method] || 0) + 1;
  });
  
  // Extract resources from endpoints
  const resources = new Set<string>();
  endpoints.forEach(endpoint => {
    const path = endpoint.path || extractPathFromUrl(endpoint.url) || '';
    const pathParts = path.split('/').filter(p => p && !p.includes('{'));
    if (pathParts.length > 0) {
      resources.add(pathParts[0]);
    }
  });
  
  // Generate overview
  return `This API provides ${endpoints.length} endpoints across ${resources.size} primary resources. ` +
    `It includes ${methodCounts['GET'] || 0} GET endpoints for data retrieval, ` +
    `${methodCounts['POST'] || 0} POST endpoints for resource creation, ` +
    `${(methodCounts['PUT'] || 0) + (methodCounts['PATCH'] || 0)} update endpoints, and ` +
    `${methodCounts['DELETE'] || 0} DELETE endpoints for resource removal. ` +
    `The main resources include: ${Array.from(resources).join(', ')}.`;
}

function getDefaultResponseDescription(statusCode: string): string {
  switch (statusCode[0]) {
    case '2':
      return statusCode === '200' ? 'Successful operation' : 
             statusCode === '201' ? 'Resource created successfully' :
             statusCode === '204' ? 'Operation successful, no content returned' :
             'Successful operation';
    case '4':
      return statusCode === '400' ? 'Bad request - invalid input' :
             statusCode === '401' ? 'Unauthorized - authentication required' :
             statusCode === '403' ? 'Forbidden - insufficient permissions' :
             statusCode === '404' ? 'Resource not found' :
             statusCode === '409' ? 'Conflict with current state' :
             'Client error';
    case '5':
      return statusCode === '500' ? 'Internal server error' :
             statusCode === '503' ? 'Service unavailable' :
             'Server error';
    default:
      return 'Response';
  }
}

// Main service class
export class AIApiService {
  private openai;

  constructor() {
    // In a real application, you'd use the actual OpenAI client
    // with a valid API key from environment variables
    this.openai = mockOpenAI;
  }

  async analyzeApiSpecification(apiContent: string): Promise<ApiAnalysisResult> {
    try {
      // Get semantic analysis
      const semanticResponse = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are an API analysis assistant that provides semantic understanding of API specifications." },
          { role: "user", content: `Analyze this API specification semantically: ${apiContent}` }
        ]
      });

      // Get validation issues and improvement suggestions
      const validationResponse = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are an API validation assistant that identifies issues and suggests improvements." },
          { role: "user", content: `Validate this API specification and suggest improvements: ${apiContent}` }
        ]
      });

      // Generate documentation
      const documentationResponse = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are an API documentation generator that produces comprehensive docs from specifications." },
          { role: "user", content: `Generate detailed documentation for this API specification: ${apiContent}` }
        ]
      });

      // Parse responses
      const semanticData = JSON.parse(semanticResponse.choices[0].message.content);
      const validationData = JSON.parse(validationResponse.choices[0].message.content);
      const documentationData = JSON.parse(documentationResponse.choices[0].message.content);

      // Combine results
      return {
        semanticStructure: semanticData.semanticStructure || {},
        validationIssues: validationData.validationIssues || [],
        suggestedImprovements: validationData.suggestedImprovements || [],
        generatedDocumentation: documentationData.generatedDocumentation || { overview: "", endpoints: [] }
      };
    } catch (error) {
      console.error("Failed to analyze API specification:", error);
      return {
        semanticStructure: {},
        validationIssues: [],
        suggestedImprovements: [],
        generatedDocumentation: { overview: "", endpoints: [] }
      };
    }
  }
}
