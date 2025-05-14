
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FileInputProps {
  accept?: string;
  onChange: (file: File | null) => void;
  label?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const FileInput: React.FC<FileInputProps> = ({
  accept,
  onChange,
  label = "Select File",
  icon,
  className,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onChange(file);
    
    // Reset the input value to allow selecting the same file again
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    
    if (file) {
      // Check if the file type is acceptable
      if (accept) {
        const fileType = file.type;
        const fileExtension = `.${file.name.split('.').pop()}`;
        const acceptedTypes = accept.split(',');
        
        const isAccepted = acceptedTypes.some(type => {
          if (type.startsWith('.')) {
            // Check file extension
            return type.toLowerCase() === fileExtension.toLowerCase();
          } else {
            // Check mime type
            return file.type.match(new RegExp(type.replace('*', '.*')));
          }
        });
        
        if (!isAccepted) {
          return; // Don't accept the file if it doesn't match the accepted types
        }
      }
      
      onChange(file);
    }
  };

  return (
    <div 
      className={cn(
        "relative",
        className
      )}
    >
      <input
        type="file"
        className="hidden"
        ref={inputRef}
        accept={accept}
        onChange={handleFileChange}
      />
      <div 
        className={cn(
          "border-2 border-dashed rounded-md p-4 text-center cursor-pointer transition-colors",
          isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/50",
        )}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Button 
          type="button" 
          variant="outline" 
          size="sm"
          className="mb-2"
        >
          {icon}
          {label}
        </Button>
        <p className="text-xs text-muted-foreground">
          or drag and drop file here
        </p>
      </div>
    </div>
  );
};
