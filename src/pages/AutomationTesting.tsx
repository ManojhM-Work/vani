
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Play, FileCode, Plus, Clock, BarChart2 } from "lucide-react";
import { ApiSidebar } from '../components/testing/ApiSidebar';
import { AutomationScriptList } from '../components/testing/AutomationScriptList';
import { TestReport } from '../components/testing/TestReport';

const AutomationTesting = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Automation Testing</h2>
      
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/5">
          <ApiSidebar />
        </div>
        
        <div className="w-full md:w-2/5">
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
              <AutomationScriptList />
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
        
        <div className="w-full md:w-2/5">
          <TestReport />
        </div>
      </div>
    </div>
  );
};

export default AutomationTesting;
