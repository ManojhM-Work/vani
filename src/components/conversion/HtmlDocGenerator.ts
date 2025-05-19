
import { Documentation, EndpointDoc } from "../../services/aiApiService";

export const generateHtmlDocumentation = (
  documentation: Documentation,
  sourceFormat: string,
  targetFormat: string
): string => {
  const sourceFormatName = sourceFormat;
  const targetFormatName = targetFormat;
  
  const getMethodColor = (method: string): string => {
    switch (method.toUpperCase()) {
      case 'GET': return '#1e88e5';
      case 'POST': return '#43a047'; 
      case 'PUT': return '#fb8c00';
      case 'DELETE': return '#e53935';
      case 'PATCH': return '#8e24aa';
      default: return '#757575';
    }
  };
  
  const getMethodBgColor = (method: string): string => {
    switch (method.toUpperCase()) {
      case 'GET': return '#e3f2fd';
      case 'POST': return '#e8f5e9'; 
      case 'PUT': return '#fff3e0';
      case 'DELETE': return '#ffebee';
      case 'PATCH': return '#f3e5f5';
      default: return '#f5f5f5';
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Generate endpoint documentation HTML
  const generateEndpointHtml = (endpoint: EndpointDoc): string => {
    const methodColor = getMethodColor(endpoint.method);
    const methodBgColor = getMethodBgColor(endpoint.method);

    return `
      <div class="endpoint">
        <div class="endpoint-header">
          <div class="method-badge" style="background-color: ${methodBgColor}; color: ${methodColor}; border: 1px solid ${methodColor};">
            ${endpoint.method}
          </div>
          <h3 class="endpoint-title">${endpoint.name}</h3>
        </div>
        
        <p class="endpoint-description">${endpoint.description}</p>
        <p class="endpoint-path"><code>${endpoint.method} ${endpoint.path}</code></p>
        
        ${endpoint.parameters && endpoint.parameters.length > 0 ? `
          <div class="section">
            <h4>Parameters</h4>
            <table class="params-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Required</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                ${endpoint.parameters.map(param => `
                  <tr>
                    <td><code>${param.name}</code></td>
                    <td>${param.type}</td>
                    <td>${param.required ? '<span class="badge required">Required</span>' : '<span class="badge optional">Optional</span>'}</td>
                    <td>${param.description}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : ''}
        
        ${endpoint.requestBody ? `
          <div class="section">
            <h4>Request Body</h4>
            <p>${endpoint.requestBody.description}</p>
            <p class="content-type">Content-Type: <code>${endpoint.requestBody.contentType}</code></p>
            ${endpoint.requestBody.schema ? `
              <pre class="schema"><code>${JSON.stringify(endpoint.requestBody.schema, null, 2)}</code></pre>
            ` : ''}
          </div>
        ` : ''}
        
        ${endpoint.responses && endpoint.responses.length > 0 ? `
          <div class="section">
            <h4>Responses</h4>
            <div class="responses">
              ${endpoint.responses.map(response => {
                const isSuccess = response.statusCode.startsWith('2');
                const isClientError = response.statusCode.startsWith('4');
                const isServerError = response.statusCode.startsWith('5');
                
                let responseClass = 'response';
                if (isSuccess) responseClass += ' response-success';
                else if (isClientError) responseClass += ' response-client-error';
                else if (isServerError) responseClass += ' response-server-error';
                
                return `
                  <div class="${responseClass}">
                    <div class="response-header">
                      <div class="status-code">${response.statusCode}</div>
                      ${response.contentType ? `<div class="content-type-badge">${response.contentType}</div>` : ''}
                    </div>
                    <p class="response-description">${response.description}</p>
                    ${response.schema ? `
                      <pre class="schema"><code>${JSON.stringify(response.schema, null, 2)}</code></pre>
                    ` : ''}
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  };

  // Full HTML document template
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>API Documentation - ${sourceFormatName} to ${targetFormatName}</title>
  <style>
    /* Base styles */
    :root {
      --primary-color: #2563eb;
      --primary-light: #dbeafe;
      --success-color: #16a34a;
      --success-light: #dcfce7;
      --warning-color: #ea580c;
      --warning-light: #ffedd5;
      --error-color: #dc2626;
      --error-light: #fee2e2;
      --text-color: #1f2937;
      --text-light: #6b7280;
      --bg-color: #ffffff;
      --card-bg: #f9fafb;
      --border-color: #e5e7eb;
      --code-bg: #f1f5f9;
      --sidebar-width: 240px;
    }
    
    /* Dark mode (optional) */
    @media (prefers-color-scheme: dark) {
      :root {
        --primary-color: #3b82f6;
        --primary-light: #1e3a8a;
        --success-color: #22c55e;
        --success-light: #14532d;
        --warning-color: #f59e0b;
        --warning-light: #713f12;
        --error-color: #ef4444;
        --error-light: #7f1d1d;
        --text-color: #f9fafb;
        --text-light: #9ca3af;
        --bg-color: #0f172a;
        --card-bg: #1e293b;
        --border-color: #334155;
        --code-bg: #1e293b;
      }
    }
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      color: var(--text-color);
      background-color: var(--bg-color);
      margin: 0;
      padding: 0;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }
    
    /* Typography */
    h1, h2, h3, h4, h5, h6 {
      margin-top: 0;
      margin-bottom: 0.5rem;
      font-weight: 600;
      line-height: 1.2;
    }
    
    h1 {
      font-size: 2.5rem;
      margin-bottom: 1.5rem;
    }
    
    h2 {
      font-size: 2rem;
      margin-top: 2rem;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid var(--border-color);
    }
    
    h3 {
      font-size: 1.5rem;
    }
    
    h4 {
      font-size: 1.25rem;
      margin-bottom: 0.75rem;
    }
    
    p {
      margin-bottom: 1rem;
    }
    
    /* Utility Classes */
    .text-muted {
      color: var(--text-light);
    }
    
    .mb-1 {
      margin-bottom: 0.25rem;
    }
    
    .mb-2 {
      margin-bottom: 0.5rem;
    }
    
    .mb-4 {
      margin-bottom: 1rem;
    }
    
    .mt-2 {
      margin-top: 0.5rem;
    }
    
    .mt-4 {
      margin-top: 1rem;
    }
    
    /* Components */
    .header {
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 2rem;
      margin-bottom: 2rem;
    }
    
    .metadata {
      display: flex;
      flex-wrap: wrap;
      gap: 2rem;
      margin-bottom: 2rem;
      font-size: 0.9rem;
      color: var(--text-light);
    }
    
    .metadata-item {
      display: flex;
      align-items: center;
    }
    
    .metadata-label {
      font-weight: 500;
      margin-right: 0.5rem;
    }
    
    .badge {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      font-size: 0.75rem;
      font-weight: 500;
    }
    
    .required {
      background-color: var(--error-light);
      color: var(--error-color);
    }
    
    .optional {
      background-color: var(--code-bg);
      color: var(--text-light);
    }
    
    code {
      font-family: Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
      font-size: 0.9em;
      padding: 0.2em 0.4em;
      border-radius: 0.25rem;
      background-color: var(--code-bg);
    }
    
    pre {
      background-color: var(--code-bg);
      border-radius: 0.5rem;
      padding: 1rem;
      overflow: auto;
      margin-bottom: 1rem;
    }
    
    pre code {
      padding: 0;
      background-color: transparent;
      white-space: pre;
    }
    
    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 1.5rem;
    }
    
    th, td {
      padding: 0.75rem 1rem;
      text-align: left;
      border-bottom: 1px solid var(--border-color);
    }
    
    th {
      font-weight: 600;
      background-color: var(--card-bg);
    }
    
    tr:hover {
      background-color: var(--card-bg);
    }
    
    /* API Endpoints */
    .endpoint {
      margin-bottom: 3rem;
      padding-bottom: 2rem;
      border-bottom: 1px solid var(--border-color);
    }
    
    .endpoint:last-child {
      border-bottom: none;
    }
    
    .endpoint-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    
    .endpoint-title {
      font-size: 1.5rem;
      margin: 0;
    }
    
    .endpoint-path {
      margin-bottom: 1.5rem;
    }
    
    .endpoint-path code {
      font-size: 1rem;
      padding: 0.5rem 1rem;
    }
    
    .method-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 0.25rem;
      font-weight: 600;
      font-size: 0.875rem;
    }
    
    .section {
      margin-top: 1.5rem;
      margin-bottom: 1.5rem;
    }
    
    .params-table code {
      font-weight: 500;
    }
    
    .content-type {
      font-size: 0.9rem;
      color: var(--text-light);
      margin-bottom: 0.5rem;
    }
    
    .responses {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    .response {
      border: 1px solid var(--border-color);
      border-radius: 0.5rem;
      overflow: hidden;
    }
    
    .response-success {
      border-color: var(--success-color);
    }
    
    .response-client-error {
      border-color: var(--warning-color);
    }
    
    .response-server-error {
      border-color: var(--error-color);
    }
    
    .response-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 1rem;
      background-color: var(--card-bg);
      border-bottom: 1px solid var(--border-color);
    }
    
    .response-success .response-header {
      background-color: var(--success-light);
      border-bottom-color: var(--success-color);
    }
    
    .response-client-error .response-header {
      background-color: var(--warning-light);
      border-bottom-color: var(--warning-color);
    }
    
    .response-server-error .response-header {
      background-color: var(--error-light);
      border-bottom-color: var(--error-color);
    }
    
    .status-code {
      font-weight: 600;
      font-size: 1rem;
    }
    
    .content-type-badge {
      font-size: 0.8rem;
      padding: 0.2rem 0.5rem;
      border-radius: 0.25rem;
      background-color: var(--code-bg);
    }
    
    .response-description {
      padding: 1rem;
      margin: 0;
    }
    
    .schema {
      margin: 0;
      border-radius: 0;
      border-top: 1px solid var(--border-color);
    }
    
    .footer {
      margin-top: 3rem;
      padding-top: 2rem;
      border-top: 1px solid var(--border-color);
      text-align: center;
      font-size: 0.9rem;
      color: var(--text-light);
    }
    
    /* Responsive styles */
    @media (max-width: 768px) {
      .container {
        padding: 1rem;
      }
      
      h1 {
        font-size: 2rem;
      }
      
      h2 {
        font-size: 1.75rem;
      }
      
      .metadata {
        flex-direction: column;
        gap: 0.5rem;
      }
      
      table {
        display: block;
        overflow-x: auto;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>API Documentation</h1>
      <div class="metadata">
        <div class="metadata-item">
          <span class="metadata-label">Source Format:</span>
          <span>${sourceFormatName}</span>
        </div>
        <div class="metadata-item">
          <span class="metadata-label">Target Format:</span>
          <span>${targetFormatName}</span>
        </div>
        <div class="metadata-item">
          <span class="metadata-label">Generated on:</span>
          <span>${formatDate(new Date())}</span>
        </div>
      </div>
    </div>

    <section>
      <h2>Overview</h2>
      <p>${documentation.overview}</p>
    </section>

    <section>
      <h2>API Endpoints</h2>
      ${documentation.endpoints.map(endpoint => generateEndpointHtml(endpoint)).join('')}
    </section>

    <div class="footer">
      <p>Generated by AI-Enhanced API Testing Platform</p>
      <p>${formatDate(new Date())}</p>
    </div>
  </div>
</body>
</html>
  `;
};
