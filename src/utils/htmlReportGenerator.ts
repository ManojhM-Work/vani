
export interface HtmlReportData {
  type: 'functional' | 'automation';
  title: string;
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    duration: number;
  };
  results: Array<{
    name: string;
    status: 'passed' | 'failed' | 'skipped';
    time?: number;
    error?: string;
    assertions?: Array<{
      name: string;
      status: 'passed' | 'failed';
      error?: string;
    }>;
  }>;
  configuration?: {
    url?: string;
    method?: string;
    browser?: string;
    headless?: boolean;
    screenshots?: boolean;
    video?: boolean;
  };
  timestamp: string;
}

export const generateHtmlReport = (data: HtmlReportData): string => {
  const { type, title, summary, results, configuration, timestamp } = data;
  
  const successRate = Math.round((summary.passed / summary.total) * 100);
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6; 
            color: #333; 
            background: #f8f9fa;
            padding: 20px;
        }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; 
            padding: 30px; 
            border-radius: 8px 8px 0 0;
        }
        .header h1 { font-size: 2.5em; margin-bottom: 10px; }
        .header .meta { opacity: 0.9; font-size: 1.1em; }
        .summary { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
            gap: 20px; 
            padding: 30px; 
            border-bottom: 1px solid #eee;
        }
        .summary-card { 
            text-align: center; 
            padding: 20px; 
            border-radius: 8px; 
            border: 1px solid #eee;
        }
        .summary-card h3 { font-size: 2.5em; margin-bottom: 5px; }
        .summary-card p { color: #666; font-weight: 500; }
        .passed { color: #22c55e; }
        .failed { color: #ef4444; }
        .skipped { color: #f59e0b; }
        .total { color: #3b82f6; }
        .duration { color: #8b5cf6; }
        .progress-bar { 
            width: 100%; 
            height: 20px; 
            background: #e5e7eb; 
            border-radius: 10px; 
            overflow: hidden; 
            margin: 20px 0;
        }
        .progress-fill { 
            height: 100%; 
            background: linear-gradient(90deg, #22c55e, #16a34a); 
            transition: width 0.3s ease;
        }
        .config { 
            padding: 30px; 
            background: #f8f9fa; 
            border-bottom: 1px solid #eee;
        }
        .config h2 { margin-bottom: 15px; color: #374151; }
        .config-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
            gap: 15px;
        }
        .config-item { 
            display: flex; 
            justify-content: space-between; 
            padding: 10px 15px; 
            background: white; 
            border-radius: 6px; 
            border: 1px solid #e5e7eb;
        }
        .config-item strong { color: #374151; }
        .results { padding: 30px; }
        .results h2 { margin-bottom: 20px; color: #374151; }
        .test-item { 
            margin-bottom: 20px; 
            border: 1px solid #e5e7eb; 
            border-radius: 8px; 
            overflow: hidden;
        }
        .test-header { 
            padding: 15px 20px; 
            background: #f8f9fa; 
            display: flex; 
            justify-content: space-between; 
            align-items: center;
        }
        .test-name { font-weight: 600; color: #374151; }
        .status-badge { 
            padding: 4px 12px; 
            border-radius: 20px; 
            font-size: 0.85em; 
            font-weight: 600;
        }
        .status-passed { background: #dcfce7; color: #166534; }
        .status-failed { background: #fef2f2; color: #991b1b; }
        .status-skipped { background: #fef3c7; color: #92400e; }
        .test-details { padding: 20px; }
        .test-time { color: #6b7280; font-size: 0.9em; margin-bottom: 10px; }
        .error-message { 
            background: #fef2f2; 
            border-left: 4px solid #ef4444; 
            padding: 15px; 
            margin: 10px 0; 
            border-radius: 0 6px 6px 0;
        }
        .error-message pre { 
            white-space: pre-wrap; 
            font-family: 'Monaco', 'Menlo', monospace; 
            font-size: 0.9em; 
            color: #991b1b;
        }
        .assertions { margin-top: 15px; }
        .assertions h4 { margin-bottom: 10px; color: #374151; }
        .assertion { 
            display: flex; 
            align-items: center; 
            padding: 8px 12px; 
            margin-bottom: 5px; 
            border-radius: 6px;
        }
        .assertion-passed { background: #dcfce7; }
        .assertion-failed { background: #fef2f2; }
        .assertion-icon { margin-right: 8px; font-weight: bold; }
        .assertion-passed .assertion-icon { color: #166534; }
        .assertion-failed .assertion-icon { color: #991b1b; }
        .footer { 
            text-align: center; 
            padding: 20px; 
            color: #6b7280; 
            border-top: 1px solid #e5e7eb;
        }
        @media print {
            body { background: white; padding: 0; }
            .container { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${title}</h1>
            <div class="meta">
                Generated on ${new Date(timestamp).toLocaleString()} | 
                Test Type: ${type.charAt(0).toUpperCase() + type.slice(1)}
            </div>
        </div>

        <div class="summary">
            <div class="summary-card">
                <h3 class="total">${summary.total}</h3>
                <p>Total Tests</p>
            </div>
            <div class="summary-card">
                <h3 class="passed">${summary.passed}</h3>
                <p>Passed</p>
            </div>
            <div class="summary-card">
                <h3 class="failed">${summary.failed}</h3>
                <p>Failed</p>
            </div>
            <div class="summary-card">
                <h3 class="skipped">${summary.skipped}</h3>
                <p>Skipped</p>
            </div>
            <div class="summary-card">
                <h3 class="duration">${summary.duration.toFixed(2)}s</h3>
                <p>Duration</p>
            </div>
        </div>

        <div style="padding: 30px; border-bottom: 1px solid #eee;">
            <h2 style="margin-bottom: 15px; color: #374151;">Success Rate</h2>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span>Overall Success Rate</span>
                <span style="font-weight: 600;">${successRate}%</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${successRate}%"></div>
            </div>
        </div>

        ${configuration ? `
        <div class="config">
            <h2>Test Configuration</h2>
            <div class="config-grid">
                ${configuration.url ? `<div class="config-item"><span>URL:</span><strong>${configuration.url}</strong></div>` : ''}
                ${configuration.method ? `<div class="config-item"><span>Method:</span><strong>${configuration.method}</strong></div>` : ''}
                ${configuration.browser ? `<div class="config-item"><span>Browser:</span><strong>${configuration.browser}</strong></div>` : ''}
                ${configuration.headless !== undefined ? `<div class="config-item"><span>Headless:</span><strong>${configuration.headless ? 'Yes' : 'No'}</strong></div>` : ''}
                ${configuration.screenshots !== undefined ? `<div class="config-item"><span>Screenshots:</span><strong>${configuration.screenshots ? 'Enabled' : 'Disabled'}</strong></div>` : ''}
                ${configuration.video !== undefined ? `<div class="config-item"><span>Video Recording:</span><strong>${configuration.video ? 'Enabled' : 'Disabled'}</strong></div>` : ''}
            </div>
        </div>
        ` : ''}

        <div class="results">
            <h2>Test Results</h2>
            ${results.map(result => `
                <div class="test-item">
                    <div class="test-header">
                        <span class="test-name">${result.name}</span>
                        <span class="status-badge status-${result.status}">${result.status.toUpperCase()}</span>
                    </div>
                    <div class="test-details">
                        ${result.time ? `<div class="test-time">Duration: ${result.time.toFixed(2)}ms</div>` : ''}
                        
                        ${result.error ? `
                            <div class="error-message">
                                <strong>Error Details:</strong>
                                <pre>${result.error}</pre>
                            </div>
                        ` : ''}

                        ${result.assertions && result.assertions.length > 0 ? `
                            <div class="assertions">
                                <h4>Assertions:</h4>
                                ${result.assertions.map(assertion => `
                                    <div class="assertion assertion-${assertion.status}">
                                        <span class="assertion-icon">${assertion.status === 'passed' ? '✓' : '✗'}</span>
                                        <span>${assertion.name}</span>
                                    </div>
                                    ${assertion.error ? `
                                        <div class="error-message" style="margin-left: 20px; margin-top: 5px;">
                                            <pre>${assertion.error}</pre>
                                        </div>
                                    ` : ''}
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                </div>
            `).join('')}
        </div>

        <div class="footer">
            <p>Report generated by Test Management System | ${new Date(timestamp).toLocaleString()}</p>
        </div>
    </div>
</body>
</html>
  `.trim();
};

export const downloadHtmlReport = (data: HtmlReportData, filename?: string) => {
  const htmlContent = generateHtmlReport(data);
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `${data.type}-test-report-${new Date().toISOString().slice(0, 10)}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
