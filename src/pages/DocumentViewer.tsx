import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, FileText, List, Sparkles, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Document, Page, pdfjs } from "react-pdf";
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

interface Clause {
  id: number;
  type: string;
  content: string;
  page: number;
  section: string;
  risk: "low" | "medium" | "high";
}

const DocumentViewer = () => {
  const { id } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [clauses, setClauses] = useState<Clause[]>([]);
  const [loading, setLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [pdfLoading, setPdfLoading] = useState(true);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const { toast } = useToast();
  const BACKEND_URL = "http://localhost:8000";

  useEffect(() => {
    if (id) {
      fetchClauses(id);
      fetchPdf(id);
    }
  }, [id]);

  // Cleanup PDF URL on unmount or when URL changes
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  const fetchClauses = async (filename: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/clauses/${filename}`);
      const data = await response.json();
      setClauses(data.clauses || []);
    } catch (error) {
      console.error("Failed to fetch clauses:", error);
      toast({
        title: "Error",
        description: "Failed to load clauses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPdf = async (filename: string) => {
    try {
      setPdfLoading(true);
      setPdfError(null);
      const response = await fetch(`${BACKEND_URL}/document/${filename}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch PDF: ${response.statusText}`);
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (error) {
      console.error("Failed to fetch PDF:", error);
      setPdfError(error instanceof Error ? error.message : "Failed to load PDF document");
      toast({
        title: "Error",
        description: "Failed to load PDF document",
        variant: "destructive",
      });
    } finally {
      setPdfLoading(false);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error("PDF load error:", error);
    setPdfError(error.message || "Failed to load PDF document");
  };

  const goToPrevPage = () => {
    setPageNumber(prev => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber(prev => Math.min(prev + 1, numPages || 1));
  };

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 2.0));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };

  const clauseColors: Record<string, string> = {
    Confidentiality: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
    Termination: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300",
    Liability: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
    "Governing Law": "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300",
  };

  return (
    <div className="h-[calc(100vh-4rem)] bg-gradient-to-b from-background to-secondary/20">
      <div className="container h-full py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
          {/* Sidebar */}
          <Card className="lg:col-span-1 p-4 flex flex-col">
            <Tabs defaultValue="clauses" className="flex-1 flex flex-col">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="clauses">
                  <List className="h-4 w-4 mr-2" />
                  Clauses
                </TabsTrigger>
                <TabsTrigger value="search">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </TabsTrigger>
              </TabsList>

              <TabsContent value="clauses" className="flex-1 mt-4">
                <ScrollArea className="h-[calc(100vh-16rem)]">
                  <div className="space-y-3">
                    {clauses.map((clause) => (
                      <Card
                        key={clause.id}
                        className="p-3 cursor-pointer hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <Badge className={clauseColors[clause.type]}>
                            {clause.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Page {clause.page}
                          </span>
                        </div>
                        <p className="text-sm line-clamp-2">{clause.content}</p>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="search" className="flex-1 mt-4">
                <div className="space-y-4">
                  <Input
                    placeholder="Search in document..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Button className="w-full">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Summarize Document
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </Card>

          {/* PDF Viewer */}
          <Card className="lg:col-span-3 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Document Viewer</h2>
              </div>
              <Badge variant="outline">Document ID: {id}</Badge>
            </div>

            {/* PDF Controls */}
            {pdfUrl && numPages && (
              <div className="flex items-center justify-between mb-4 p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToPrevPage}
                    disabled={pageNumber <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">
                    Page {pageNumber} of {numPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToNextPage}
                    disabled={pageNumber >= numPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={zoomOut}
                    disabled={scale <= 0.5}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">{Math.round(scale * 100)}%</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={zoomIn}
                    disabled={scale >= 2.0}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* PDF Content */}
            <div className="flex-1 bg-muted/30 rounded-lg overflow-auto">
              {pdfLoading && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-2">
                    <FileText className="h-8 w-8 mx-auto text-muted-foreground animate-pulse" />
                    <p className="text-sm text-muted-foreground">Loading PDF...</p>
                  </div>
                </div>
              )}

              {pdfError && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-2">
                    <FileText className="h-8 w-8 mx-auto text-red-500" />
                    <p className="text-sm text-red-500">{pdfError}</p>
                  </div>
                </div>
              )}

              {pdfUrl && !pdfLoading && !pdfError && (
                <div className="flex justify-center p-4">
                  <Document
                    file={pdfUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={onDocumentLoadError}
                    loading={
                      <div className="flex items-center justify-center py-8">
                        <div className="text-center space-y-2">
                          <FileText className="h-8 w-8 mx-auto text-muted-foreground animate-pulse" />
                          <p className="text-sm text-muted-foreground">Loading PDF...</p>
                        </div>
                      </div>
                    }
                    error={
                      <div className="flex items-center justify-center py-8">
                        <div className="text-center space-y-2">
                          <FileText className="h-8 w-8 mx-auto text-red-500" />
                          <p className="text-sm text-red-500">Failed to load PDF</p>
                        </div>
                      </div>
                    }
                  >
                    <Page
                      pageNumber={pageNumber}
                      scale={scale}
                      renderTextLayer={true}
                      renderAnnotationLayer={true}
                      loading={
                        <div className="flex items-center justify-center py-8">
                          <div className="text-sm text-muted-foreground">Loading page...</div>
                        </div>
                      }
                    />
                  </Document>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;
