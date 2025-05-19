
import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface QueryParam {
  key: string;
  value: string;
  description: string;
  id: string;
}

interface QueryParamsTableProps {
  params: QueryParam[];
  onChange: (params: QueryParam[]) => void;
}

export const QueryParamsTable = ({ params, onChange }: QueryParamsTableProps) => {
  const [newKey, setNewKey] = useState<string>("");
  const [newValue, setNewValue] = useState<string>("");
  const [newDescription, setNewDescription] = useState<string>("");

  const addParam = () => {
    if (!newKey.trim()) return;
    
    const newParam: QueryParam = {
      key: newKey.trim(),
      value: newValue.trim(),
      description: newDescription.trim(),
      id: `param-${Date.now()}`
    };
    
    onChange([...params, newParam]);
    
    // Reset inputs
    setNewKey("");
    setNewValue("");
    setNewDescription("");
  };

  const updateParam = (id: string, field: keyof QueryParam, value: string) => {
    const updatedParams = params.map(param => {
      if (param.id === id) {
        return { ...param, [field]: value };
      }
      return param;
    });
    
    onChange(updatedParams);
  };

  const deleteParam = (id: string) => {
    const updatedParams = params.filter(param => param.id !== id);
    onChange(updatedParams);
  };

  const buildQueryString = (): string => {
    if (params.length === 0) return "";
    
    const queryParts = params
      .filter(param => param.key.trim() !== "")
      .map(param => `${encodeURIComponent(param.key)}=${encodeURIComponent(param.value)}`)
      .join("&");
      
    return queryParts ? `?${queryParts}` : "";
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-base font-medium">Query Parameters</h3>
        {params.length > 0 && (
          <Badge variant="outline" className="font-mono text-xs">
            {buildQueryString()}
          </Badge>
        )}
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30%]">Key</TableHead>
              <TableHead className="w-[30%]">Value</TableHead>
              <TableHead className="w-[30%]">Description</TableHead>
              <TableHead className="w-[10%]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {params.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-4">
                  No query parameters added yet
                </TableCell>
              </TableRow>
            ) : (
              params.map((param) => (
                <TableRow key={param.id}>
                  <TableCell>
                    <Input
                      value={param.key}
                      onChange={(e) => updateParam(param.id, "key", e.target.value)}
                      placeholder="Key"
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={param.value}
                      onChange={(e) => updateParam(param.id, "value", e.target.value)}
                      placeholder="Value"
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={param.description}
                      onChange={(e) => updateParam(param.id, "description", e.target.value)}
                      placeholder="Description"
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => deleteParam(param.id)}
                      className="h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
            <TableRow>
              <TableCell>
                <Input
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder="Key"
                  className="h-8"
                />
              </TableCell>
              <TableCell>
                <Input
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="Value"
                  className="h-8"
                />
              </TableCell>
              <TableCell>
                <Input
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Description"
                  className="h-8"
                />
              </TableCell>
              <TableCell>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={addParam}
                  className="h-8 w-8"
                  disabled={!newKey.trim()}
                >
                  <PlusCircle className="h-4 w-4 text-primary" />
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default QueryParamsTable;
