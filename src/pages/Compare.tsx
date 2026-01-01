import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, AlertCircle, CheckCircle, MinusCircle } from "lucide-react";
import FileUploader from "@/components/FileUploader";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

interface Difference {
  type: string;
  clause: string;
  doc1Value: string;
  doc2Value: string;
  risk: "low" | "medium" | "high";
}

const Compare = () => {
  const [doc1, setDoc1] = useState<File | null>(null);
  const [doc2, setDoc2] = useState<File | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [differences, setDifferences] = useState<Difference[]>([]);
  const [riskScore, setRiskScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [docNames, setDocNames] = useState<{doc1: string, doc2: string} | null>(null);
  const { toast } = useToast();
  const BACKEND_URL = "http://localhost:8000";

  const handleCompare = async () => {
    if (!doc1 || !doc2) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("files", doc1);
    formData.append("files", doc2);

    try {
      const response = await fetch(`${BACKEND_URL}/compare`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Comparison failed");
      }

      const data = await response.json();
      setDifferences(data.differences || []);
      setRiskScore(data.risk_score || 0);
      setShowComparison(true);
    } catch (error) {
      console.error("Failed to compare documents:", error);
      toast({
        title: "Error",
        description: "Failed to compare documents",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const riskColors = {
    low: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
    medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300",
    high: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "modified":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case "missing":
        return <MinusCircle className="h-5 w-5 text-red-600" />;
      case "added":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container py-10">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">Contract Comparison</h1>
            <p className="text-xl text-muted-foreground">
              Upload two contracts to compare differences and identify risks
            </p>
          </div>

          {!showComparison ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Document 1</h3>
                  <FileUploader
                    onUpload={(file) => setDoc1(file)}
                    maxSize={10}
                  />
                  {doc1 && (
                    <Badge variant="outline" className="mt-4">
                      ✓ {doc1.name}
                    </Badge>
                  )}
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Document 2</h3>
                  <FileUploader
                    onUpload={(file) => setDoc2(file)}
                    maxSize={10}
                  />
                  {doc2 && (
                    <Badge variant="outline" className="mt-4">
                      ✓ {doc2.name}
                    </Badge>
                  )}
                </Card>
              </div>

              <div className="text-center">
                <Button
                  size="lg"
                  onClick={handleCompare}
                  disabled={!doc1 || !doc2}
                >
                  Compare Documents
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-6">
              {/* Risk Score */}
              <Card className="bg-gradient-to-br from-card to-secondary/20">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Overall Risk Score</span>
                    <Badge
                      className={
                        riskScore < 40
                          ? riskColors.low
                          : riskScore < 70
                          ? riskColors.medium
                          : riskColors.high
                      }
                    >
                      {riskScore}/100
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Based on {differences.length} differences found between the documents
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress value={riskScore} className="h-3" />
                </CardContent>
              </Card>

              {/* Comparison Results */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Key Differences</h2>
                {differences.map((diff, index) => (
                  <Card key={index} className="hover:shadow-lg transition-all">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            {getIcon(diff.type)}
                            <CardTitle className="text-lg">{diff.clause}</CardTitle>
                          </div>
                          <Badge className={riskColors[diff.risk]}>
                            {diff.risk.toUpperCase()} RISK
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-muted-foreground">
                            {docNames?.doc1 || "Document 1"}
                          </p>
                          <p className="text-sm">{diff.doc1Value}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-muted-foreground">
                            {docNames?.doc2 || "Document 2"}
                          </p>
                          <p className="text-sm">{diff.doc2Value}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowComparison(false);
                    setDoc1(null);
                    setDoc2(null);
                    setDocNames(null);
                  }}
                >
                  Compare Different Documents
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Compare;
