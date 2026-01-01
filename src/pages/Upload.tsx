import { useNavigate } from "react-router-dom";
import FileUploader from "@/components/FileUploader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Shield, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Upload = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleUpload = async (file: File) => {
    toast({
      title: "Uploading...",
      description: `Uploading ${file.name}`,
    });

    const formData = new FormData();
    formData.append("files", file);

    try {
      const response = await fetch("http://localhost:8000/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();

      toast({
        title: "Upload successful!",
        description: `Processed ${data.chunks} chunks from ${file.name}`,
      });
      navigate("/dashboard");
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "Please make sure the backend is running on port 8000",
        variant: "destructive",
      });
    }
  };

  const features = [
    {
      icon: Shield,
      title: "Secure Processing",
      description: "Your documents are encrypted and processed securely",
    },
    {
      icon: Zap,
      title: "Fast Analysis",
      description: "AI-powered extraction and analysis in seconds",
    },
    {
      icon: FileText,
      title: "PDF Support",
      description: "Upload any legal PDF document up to 10MB",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container py-10">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">Upload Document</h1>
            <p className="text-xl text-muted-foreground">
              Upload your legal document to start analyzing
            </p>
          </div>

          <FileUploader onUpload={handleUpload} />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="text-center border-border/50">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;
