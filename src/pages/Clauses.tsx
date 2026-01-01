import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";

interface Clause {
  id: number;
  type: string;
  content: string;
  page: number;
  section: string;
  risk: "low" | "medium" | "high";
}

const Clauses = () => {
  const { id } = useParams();
  const [clauses, setClauses] = useState<Clause[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedClauses, setExpandedClauses] = useState<Set<number>>(new Set());
  const { toast } = useToast();
  const BACKEND_URL = "http://localhost:8000";

  useEffect(() => {
    if (id) {
      fetchClauses(id);
    }
  }, [id]);

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

  const toggleExpanded = (clauseId: number) => {
    console.log('Toggling clause:', clauseId);
    setExpandedClauses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(clauseId)) {
        newSet.delete(clauseId);
        console.log('Collapsed clause:', clauseId);
      } else {
        newSet.add(clauseId);
        console.log('Expanded clause:', clauseId);
      }
      console.log('Current expanded clauses:', Array.from(newSet));
      return newSet;
    });
  };

  const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const clauseColors: Record<string, string> = {
    Confidentiality: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
    Termination: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300",
    Indemnification: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300",
    Liability: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
    "Governing Law": "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
  };

  const riskColors = {
    low: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
    medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300",
    high: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container py-10">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
              <Link to="/dashboard">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Extracted Clauses</h1>
              <p className="text-muted-foreground mt-1">
                Document ID: {id} • {clauses.length} clauses found
              </p>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading clauses...</p>
            </div>
          ) : clauses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No clauses found in this document.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {clauses.map((clause) => (
              <Card key={clause.id} className="hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge className={clauseColors[clause.type]}>
                          {clause.type}
                        </Badge>
                        <Badge variant="outline">{clause.section}</Badge>
                        <Badge className={riskColors[clause.risk]}>
                          {clause.risk.toUpperCase()} RISK
                        </Badge>
                      </div>
                      <CardTitle className="text-xl">{clause.type} Clause</CardTitle>
                      <CardDescription>
                        Found on page {clause.page} in {clause.section}
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/document/${encodeURIComponent(id || '')}`}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View in PDF
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Collapsible open={expandedClauses.has(clause.id)} onOpenChange={() => toggleExpanded(clause.id)}>
                    <p className="text-sm leading-relaxed text-foreground/90">
                      {expandedClauses.has(clause.id) ? clause.content : truncateText(clause.content)}
                    </p>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="mt-2 p-0 h-auto text-primary hover:text-primary/80 transition-colors">
                        {expandedClauses.has(clause.id) ? (
                          <>
                            <ChevronUp className="h-4 w-4 mr-1" />
                            Show Less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4 mr-1" />
                            Show Full
                          </>
                        )}
                      </Button>
                    </CollapsibleTrigger>
                  </Collapsible>
                </CardContent>
              </Card>
            ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Clauses;
