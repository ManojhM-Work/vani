
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Play, FileText } from "lucide-react";

interface Script {
  id: string;
  name: string;
  content: string;
  type: string;
}

interface AutomationScriptListProps {
  scripts: Script[];
  onSelectScript: (script: Script) => void;
  onRunScript: (script: Script) => void;
  selectedScriptId: string | null;
}

export const AutomationScriptList = ({ 
  scripts, 
  onSelectScript, 
  onRunScript, 
  selectedScriptId 
}: AutomationScriptListProps) => {
  const [filter, setFilter] = useState<string>("all");
  
  // Group scripts by type
  const scriptTypes = ["all", ...Array.from(new Set(scripts.map(s => s.type)))];
  
  const filteredScripts = filter === "all" 
    ? scripts 
    : scripts.filter(s => s.type === filter);
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Automation Scripts</CardTitle>
        <div className="flex overflow-auto py-1 space-x-1 text-sm">
          {scriptTypes.map(type => (
            <Button
              key={type}
              variant={filter === type ? "default" : "outline"}
              size="sm"
              className="text-xs h-7"
              onClick={() => setFilter(type)}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[calc(100vh-250px)]">
          <div className="space-y-1">
            {filteredScripts.map((script) => (
              <div 
                key={script.id}
                className={`group rounded-md p-2 hover:bg-muted cursor-pointer ${
                  selectedScriptId === script.id ? "bg-muted" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div 
                    className="flex items-center flex-1 overflow-hidden"
                    onClick={() => onSelectScript(script)}
                  >
                    <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{script.name}</p>
                      <p className="text-xs text-muted-foreground">{script.type}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="opacity-0 group-hover:opacity-100"
                    onClick={() => onRunScript(script)}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                </div>
                <Separator className="mt-2" />
              </div>
            ))}

            {filteredScripts.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                {filter === "all" ? (
                  <p>No scripts available</p>
                ) : (
                  <p>No {filter} scripts available</p>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
