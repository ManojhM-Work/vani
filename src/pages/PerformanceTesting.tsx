
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ApiSidebar } from '../components/testing/ApiSidebar';
import { PerformanceGraphs } from '../components/testing/PerformanceGraphs';

const PerformanceTesting = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Performance Testing</h2>
      
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/5">
          <ApiSidebar />
        </div>
        
        <div className="w-full md:w-2/5">
          <Card>
            <CardHeader>
              <CardTitle>Test Configuration</CardTitle>
              <CardDescription>Configure your load test parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="endpoint">API Endpoint</Label>
                <Input id="endpoint" placeholder="https://api.example.com/endpoint" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="method">Method</Label>
                  <Select defaultValue="GET">
                    <SelectTrigger id="method">
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="test-type">Test Type</Label>
                  <Select defaultValue="load">
                    <SelectTrigger id="test-type">
                      <SelectValue placeholder="Select test type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="load">Load Test</SelectItem>
                      <SelectItem value="stress">Stress Test</SelectItem>
                      <SelectItem value="soak">Soak Test</SelectItem>
                      <SelectItem value="spike">Spike Test</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Separator />
              
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="basic">Basic</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced</TabsTrigger>
                </TabsList>
                <TabsContent value="basic" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="virtual-users">Virtual Users</Label>
                      <span className="text-sm text-muted-foreground">50</span>
                    </div>
                    <Slider defaultValue={[50]} max={1000} step={10} />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="duration">Test Duration (seconds)</Label>
                      <span className="text-sm text-muted-foreground">60</span>
                    </div>
                    <Slider defaultValue={[60]} max={3600} step={10} />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="ramp-up">Ramp-up Period (seconds)</Label>
                      <span className="text-sm text-muted-foreground">10</span>
                    </div>
                    <Slider defaultValue={[10]} max={600} step={5} />
                  </div>
                </TabsContent>
                <TabsContent value="advanced" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="timeout">Request Timeout (ms)</Label>
                    <Input id="timeout" type="number" defaultValue={5000} />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="iterations">Iterations per User</Label>
                    <Input id="iterations" type="number" defaultValue={10} />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch id="follow-redirects" defaultChecked />
                    <Label htmlFor="follow-redirects">Follow Redirects</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch id="keep-alive" defaultChecked />
                    <Label htmlFor="keep-alive">Keep Alive</Label>
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="pt-4">
                <Button className="w-full">Start Performance Test</Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="w-full md:w-2/5">
          <PerformanceGraphs />
        </div>
      </div>
    </div>
  );
};

export default PerformanceTesting;
