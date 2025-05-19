
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QueryParam, QueryParamsTable } from "./QueryParamsTable";

interface ApiRequestBuilderProps {
  onSubmit: (requestData: ApiRequestData) => void;
}

export interface ApiRequestData {
  url: string;
  method: string;
  headers: Record<string, string>;
  queryParams: QueryParam[];
  body: string;
}

export const ApiRequestBuilder = ({ onSubmit }: ApiRequestBuilderProps) => {
  const [url, setUrl] = useState<string>("");
  const [method, setMethod] = useState<string>("GET");
  const [body, setBody] = useState<string>("");
  const [headers, setHeaders] = useState<Record<string, string>>({
    "Content-Type": "application/json",
  });
  const [queryParams, setQueryParams] = useState<QueryParam[]>([]);

  const updateHeader = (key: string, value: string) => {
    setHeaders((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = () => {
    // Build complete URL with query parameters
    const queryString = queryParams
      .filter(param => param.key.trim() !== "")
      .map(param => `${encodeURIComponent(param.key)}=${encodeURIComponent(param.value)}`)
      .join("&");
      
    const fullUrl = queryString ? `${url}${url.includes('?') ? '&' : '?'}${queryString}` : url;
    
    onSubmit({
      url: fullUrl,
      method,
      headers,
      queryParams,
      body,
    });
  };

  return (
    <Card>
      <CardContent className="pt-6 pb-4">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-32">
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                  <SelectItem value="PATCH">PATCH</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://api.example.com/endpoint"
              />
            </div>
            <Button onClick={handleSubmit}>Send</Button>
          </div>

          <Tabs defaultValue="query-params">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="query-params">Query Params</TabsTrigger>
              <TabsTrigger value="headers">Headers</TabsTrigger>
              <TabsTrigger value="body">Body</TabsTrigger>
            </TabsList>

            <TabsContent value="query-params" className="pt-4">
              <QueryParamsTable params={queryParams} onChange={setQueryParams} />
            </TabsContent>
            
            <TabsContent value="headers" className="pt-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="content-type">Content-Type</Label>
                  <Input
                    id="content-type"
                    value={headers["Content-Type"]}
                    onChange={(e) =>
                      updateHeader("Content-Type", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="authorization">Authorization</Label>
                  <Input
                    id="authorization"
                    value={headers["Authorization"] || ""}
                    onChange={(e) =>
                      updateHeader("Authorization", e.target.value)
                    }
                    placeholder="Bearer token"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="body" className="pt-4">
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder='{
  "key": "value"
}'
                className="min-h-[200px] font-mono"
              />
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiRequestBuilder;
