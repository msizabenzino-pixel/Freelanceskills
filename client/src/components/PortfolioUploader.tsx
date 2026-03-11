import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { X, Upload, FileText, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

interface PortfolioItem {
  id: string;
  file: File;
  preview: string;
  progress: number;
  status: "uploading" | "completed" | "error";
  type: string;
}

export function PortfolioUploader() {
  const [items, setItems] = useState<PortfolioItem[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newItems = acceptedFiles.map((file) => {
      const id = Math.random().toString(36).substring(7);
      const preview = URL.createObjectURL(file);
      
      // Simulate upload process
      simulateUpload(id);

      return {
        id,
        file,
        preview,
        progress: 0,
        status: "uploading" as const,
        type: file.type,
      };
    });

    setItems((prev) => [...prev, ...newItems].slice(0, 10));
  }, []);

  const simulateUpload = (id: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setItems((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, progress, status: "completed" } : item
          )
        );
      } else {
        setItems((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, progress } : item
          )
        );
      }
    }, 500);
  };

  const removeItem = (id: string) => {
    setItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter((i) => i.id !== id);
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
      "application/pdf": [".pdf"],
    },
    maxFiles: 10,
    maxSize: 5 * 1024 * 1024, // 5MB
    onDropRejected: (fileRejections) => {
      fileRejections.forEach((rejection) => {
        toast({
          title: "Upload Error",
          description: `${rejection.file.name}: ${rejection.errors[0].message}`,
          variant: "destructive",
        });
      });
    },
  });

  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        data-testid="portfolio-dropzone"
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <Upload className="w-10 h-10 text-muted-foreground" />
          <p className="font-medium">
            {isDragActive ? "Drop files here" : "Drag & drop your work here"}
          </p>
          <p className="text-sm text-muted-foreground">
            Supports images and PDFs (Max 10 files, 5MB each)
          </p>
          <Button variant="secondary" size="sm" className="mt-2">
            Browse Files
          </Button>
        </div>
      </div>

      {items.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item, index) => (
            <Card
              key={item.id}
              className="relative group overflow-hidden border-border"
              data-testid={`portfolio-file-${index}`}
            >
              <div className="aspect-square relative bg-muted flex items-center justify-center">
                {item.type.startsWith("image/") ? (
                  <img
                    src={item.preview}
                    alt={item.file.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <FileText className="w-12 h-12 text-muted-foreground" />
                )}

                {item.status === "uploading" && (
                  <div className="absolute inset-0 bg-background/60 flex flex-col items-center justify-center p-4">
                    <Loader2 className="w-6 h-6 animate-spin text-primary mb-2" />
                    <Progress
                      value={item.progress}
                      className="h-1"
                      data-testid={`portfolio-progress-${index}`}
                    />
                  </div>
                )}

                <button
                  onClick={() => removeItem(item.id)}
                  className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  data-testid={`portfolio-remove-${index}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-2 text-xs truncate font-medium border-t">
                {item.file.name}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
