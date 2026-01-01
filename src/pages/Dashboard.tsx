import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Trash2, FileSearch, MessageSquare, Eye, Plus, BarChart3, Activity, Zap, TrendingUp, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Document {
  id: string;
  name: string;
  uploadDate: string;
  size: string;
  pages: number;
}

const Dashboard = () => {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  const BACKEND_URL = "http://localhost:8000";

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/documents`);
      const data = await response.json();
      const docs = data.documents.map((name: string, index: number) => ({
        id: (index + 1).toString(),
        name,
        uploadDate: new Date().toISOString().split('T')[0], // Placeholder
        size: "Unknown", // Would need backend enhancement
        pages: 0, // Would need backend enhancement
      }));
      setDocuments(docs);
    } catch (error) {
      console.error("Failed to fetch documents:", error);
      toast({
        title: "Error",
        description: "Failed to load documents",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string, name: string) => {
    setDocuments(documents.filter(doc => doc.id !== id));
    toast({
      title: "Document deleted",
      description: `${name} has been removed`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container py-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground mt-2">
                Manage and analyze your legal documents
              </p>
            </div>
          </div>
          <Button asChild size="lg">
            <Link to="/upload">
              <Plus className="mr-2 h-5 w-5" />
              Upload Document
            </Link>
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{documents.length}</div>
              <p className="text-xs text-muted-foreground">
                +2 from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pages</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {documents.reduce((sum, doc) => sum + doc.pages, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                +12 from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {documents.reduce((sum, doc) => sum + parseFloat(doc.size.split(' ')[0]), 0).toFixed(1)} MB
              </div>
              <p className="text-xs text-muted-foreground">
                +0.5 MB from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Common tasks to get you started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" asChild className="h-auto p-4">
                <Link to="/upload" className="flex flex-col items-center gap-2">
                  <Plus className="h-6 w-6" />
                  <span>Upload Document</span>
                </Link>
              </Button>
              <Button variant="outline" asChild className="h-auto p-4">
                <Link to="/compare" className="flex flex-col items-center gap-2">
                  <FileSearch className="h-6 w-6" />
                  <span>Compare Documents</span>
                </Link>
              </Button>
              <Button variant="outline" asChild className="h-auto p-4">
                <Link to="/chat" className="flex flex-col items-center gap-2">
                  <MessageSquare className="h-6 w-6" />
                  <span>Ask AI Assistant</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Your latest document interactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {documents.slice(0, 3).map((doc) => (
                <div key={doc.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Uploaded {new Date(doc.uploadDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>2 hours ago</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {documents.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No documents yet</h3>
            <p className="text-muted-foreground mb-6">
              Upload your first legal document to get started
            </p>
            <Button asChild>
              <Link to="/upload">Upload Document</Link>
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc) => (
              <Card key={doc.id} className="group hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(doc.id, doc.name)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  <CardTitle className="line-clamp-2 mt-4">{doc.name}</CardTitle>
                  <CardDescription>
                    {doc.pages} pages • {doc.size}
                    <br />
                    Uploaded {new Date(doc.uploadDate).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="default" asChild className="w-full">
                    <Link to={`/document/${encodeURIComponent(doc.name)}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      Open
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="w-full">
                    <Link to={`/clauses/${encodeURIComponent(doc.name)}`}>
                      <FileSearch className="mr-2 h-4 w-4" />
                      Extract Clauses
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="w-full">
                    <Link to="/chat" state={{ documentId: doc.id }}>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Ask Questions
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
