
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface ApiRequestCardProps {
  request: any;
  onSendRequest: (request: any) => void;
  onUpdateRequest: (updatedRequest: any) => void;
}

export const ApiRequestCard = ({ request, onSendRequest, onUpdateRequest }: ApiRequestCardProps) => {
  const [editedRequest, setEditedRequest] = useState(request);
  const { toast } = useToast();
  
  const updateField = (field: string, value: any) => {
    const updated = { ...editedRequest, [field]: value };
    setEditedRequest(updated);
    onUpdateRequest(updated);
  };
  
  const handleSendRequest = () => {
    if (!editedRequest.url) {
      toast({
        title: "URL Required",
        description: "Please provide a URL for the request",
        variant: "destructive",
      });
      return;
    }
    onSendRequest(editedRequest);
    toast({
      title: "Request Sent",
      description: `${editedRequest.method} request to ${editedRequest.url} has been sent.`
    });
  };
  
  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-lg">{editedRequest.name || 'API Request'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-24">
            <select 
              className="w-full p-2 border rounded"
              value={editedRequest.method}
              onChange={e => updateField('method', e.target.value)}
            >
              {['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].map(method => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
          </div>
          <Input 
            value={editedRequest.url || ''}
            onChange={e => updateField('url', e.target.value)}
            placeholder="https://api.example.com/endpoint"
            className="flex-1"
          />
        </div>
        
        <Tabs defaultValue="params">
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="params">Query Params</TabsTrigger>
            <TabsTrigger value="headers">Headers</TabsTrigger>
            <TabsTrigger value="body">Body</TabsTrigger>
            <TabsTrigger value="tests">Tests</TabsTrigger>
          </TabsList>
          
          <TabsContent value="params">
            <div className="border rounded-md p-3">
              {(editedRequest.queryParams || []).length > 0 ? (
                <div className="space-y-2">
                  {(editedRequest.queryParams || []).map((param: any, index: number) => (
                    <div key={index} className="flex gap-2">
                      <Input 
                        value={param.key || ''} 
                        onChange={e => {
                          const newParams = [...editedRequest.queryParams];
                          newParams[index] = { ...param, key: e.target.value };
                          updateField('queryParams', newParams);
                        }}
                        placeholder="Key"
                        className="flex-1"
                      />
                      <Input 
                        value={param.value || ''} 
                        onChange={e => {
                          const newParams = [...editedRequest.queryParams];
                          newParams[index] = { ...param, value: e.target.value };
                          updateField('queryParams', newParams);
                        }}
                        placeholder="Value"
                        className="flex-1"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No query parameters</p>
              )}
              <Button 
                variant="outline" 
                className="mt-2"
                onClick={() => {
                  const params = editedRequest.queryParams || [];
                  updateField('queryParams', [...params, { key: '', value: '' }]);
                }}
              >
                Add Parameter
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="headers">
            <Textarea
              value={typeof editedRequest.headers === 'object' 
                ? JSON.stringify(editedRequest.headers, null, 2) 
                : editedRequest.headers || ''}
              onChange={e => {
                try {
                  const headers = JSON.parse(e.target.value);
                  updateField('headers', headers);
                } catch {
                  updateField('headers', e.target.value);
                }
              }}
              placeholder='{"Content-Type": "application/json"}'
              className="min-h-[200px] font-mono"
            />
          </TabsContent>
          
          <TabsContent value="body">
            <Textarea
              value={typeof editedRequest.body === 'object' 
                ? JSON.stringify(editedRequest.body, null, 2) 
                : editedRequest.body || ''}
              onChange={e => {
                try {
                  const body = JSON.parse(e.target.value);
                  updateField('body', body);
                } catch {
                  updateField('body', e.target.value);
                }
              }}
              placeholder='{"key": "value"}'
              className="min-h-[200px] font-mono"
            />
          </TabsContent>
          
          <TabsContent value="tests">
            <Textarea
              value={editedRequest.tests || ''}
              onChange={e => updateField('tests', e.target.value)}
              placeholder='pm.test("Status code is 200", function() {\n  pm.response.to.have.status(200);\n});'
              className="min-h-[200px] font-mono"
            />
          </TabsContent>
        </Tabs>
        
        <Button onClick={handleSendRequest} className="w-full">
          Send Request
        </Button>
      </CardContent>
    </Card>
  );
};
