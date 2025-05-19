
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Play, FileCode, Plus, Clock, BarChart2 } from "lucide-react";
import { ApiSidebar } from '../components/testing/ApiSidebar';
import { AutomationScriptList } from '../components/testing/AutomationScriptList';
import { TestReport } from '../components/testing/TestReport';

const AutomationTesting = () => {
  // Mock data for API requests
  const [apiRequests, setApiRequests] = useState([
    { 
      id: "1", 
      name: "Get User Profile", 
      url: "https://api.example.com/users/1", 
      method: "GET",
      folder: "User API"
    },
    { 
      id: "2", 
      name: "Create User", 
      url: "https://api.example.com/users", 
      method: "POST",
      folder: "User API"
    },
    { 
      id: "3", 
      name: "Update Product", 
      url: "https://api.example.com/products/1", 
      method: "PUT",
      folder: "Product API"
    }
  ]);
  
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  
  // Mock data for scripts
  const [scripts, setScripts] = useState([
    { id: "1", name: "User Registration Flow", content: "// Test script content", type: "functional" },
    { id: "2", name: "Product Checkout", content: "// Test script content", type: "functional" },
    { id: "3", name: "API Health Check", content: "// Test script content", type: "health" },
    { id: "4", name: "Load Test", content: "// Test script content", type: "performance" }
  ]);
  
  const [selectedScriptId, setSelectedScriptId] = useState<string | null>(null);
  
  // Mock test results
  const testResults = {
    results: [
      { id: "1", name: "Test Case 1", status: "passed", duration: "2.3s" },
      { id: "2", name: "Test Case 2", status: "failed", duration: "1.5s", error: "Expected 200 but got 404" },
      { id: "3", name: "Test Case 3", status: "passed", duration: "0.8s" }
    ],
    summary: {
      total: 3,
      passed: 2,
      failed: 1,
      duration: "4.6s"
    },
    type: "functional"
  };
  
  const handleSelectScript = (script: any) => {
    setSelectedScriptId(script.id);
  };
  
  const handleRunScript = (script: any) => {
    console.log("Running script:", script);
    // In a real app, this would trigger the script execution
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Automation Testing</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1">
          <ApiSidebar 
            requests={apiRequests} 
            onSelectRequest={setSelectedRequest} 
            selectedRequestId={selectedRequest?.id} 
          />
        </div>
        
        <div className="col-span-1">
          <Tabs defaultValue="scripts">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="scripts">Test Scripts</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
            </TabsList>
            <TabsContent value="scripts" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Automation Scripts</h3>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Script
                </Button>
              </div>
              <AutomationScriptList 
                scripts={scripts} 
                onSelectScript={handleSelectScript} 
                onRunScript={handleRunScript} 
                selectedScriptId={selectedScriptId} 
              />
            </TabsContent>
            <TabsContent value="schedule">
              <Card>
                <CardHeader>
                  <CardTitle>Test Schedule</CardTitle>
                  <CardDescription>Schedule automated tests to run periodically</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-md flex items-center justify-between">
                      <div>
                        <p className="font-medium">Daily API Health Check</p>
                        <div className="flex items-center mt-1 text-sm text-muted-foreground">
                          <Clock className="h-3.5 w-3.5 mr-1" />
                          <span>Every day at 8:00 AM</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon">
                          <FileCode className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">Edit</Button>
                      </div>
                    </div>
                    
                    <div className="p-4 border rounded-md flex items-center justify-between">
                      <div>
                        <p className="font-medium">Weekly Performance Check</p>
                        <div className="flex items-center mt-1 text-sm text-muted-foreground">
                          <Clock className="h-3.5 w-3.5 mr-1" />
                          <span>Every Monday at 3:00 AM</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon">
                          <FileCode className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">Edit</Button>
                      </div>
                    </div>
                    
                    <Button className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Schedule
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Run Test</CardTitle>
              <CardDescription>Execute automation tests on demand</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button className="w-full">
                    <Play className="h-4 w-4 mr-2" />
                    Run Selected
                  </Button>
                  
                  <Button variant="outline" className="w-full">
                    <BarChart2 className="h-4 w-4 mr-2" />
                    Run with Metrics
                  </Button>
                </div>
                
                <div className="p-4 border rounded-md bg-muted">
                  <p className="text-sm text-center text-muted-foreground">Select a test script from the left to run</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="col-span-1">
          <TestReport 
            results={testResults.results}
            summary={testResults.summary}
            type={testResults.type}
          />
        </div>
      </div>
    </div>
  );
};

export default AutomationTesting;
