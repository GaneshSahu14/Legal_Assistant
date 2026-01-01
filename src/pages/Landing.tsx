import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, FileSearch, GitCompare, FileText, ArrowRight, Sparkles } from "lucide-react";

const Landing = () => {
  const features = [
    {
      icon: MessageSquare,
      title: "Legal Q&A (RAG)",
      description: "Ask questions about your documents and get instant, accurate answers with citations.",
      color: "text-blue-400",
      bgColor: "bg-gradient-to-br from-blue-500/10 to-cyan-500/10 dark:from-blue-500/20 dark:to-cyan-500/20",
      borderColor: "border-blue-500/20",
      glowColor: "shadow-blue-500/20",
    },
    {
      icon: FileSearch,
      title: "Clause Extraction",
      description: "Automatically identify and extract key clauses like confidentiality, termination, and liability.",
      color: "text-emerald-400",
      bgColor: "bg-gradient-to-br from-emerald-500/10 to-green-500/10 dark:from-emerald-500/20 dark:to-green-500/20",
      borderColor: "border-emerald-500/20",
      glowColor: "shadow-emerald-500/20",
    },
    {
      icon: GitCompare,
      title: "Contract Comparison",
      description: "Compare two contracts side-by-side and identify differences, missing clauses, and risks.",
      color: "text-purple-400",
      bgColor: "bg-gradient-to-br from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20",
      borderColor: "border-purple-500/20",
      glowColor: "shadow-purple-500/20",
    },
    {
      icon: FileText,
      title: "Document Summaries",
      description: "Generate concise summaries of lengthy legal documents to save time and effort.",
      color: "text-orange-400",
      bgColor: "bg-gradient-to-br from-orange-500/10 to-red-500/10 dark:from-orange-500/20 dark:to-red-500/20",
      borderColor: "border-orange-500/20",
      glowColor: "shadow-orange-500/20",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px] animate-pulse" />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-gradient-x" />
        <div className="container relative py-24 md:py-32">
          <div className="mx-auto max-w-3xl text-center space-y-8">
            <div className="inline-flex items-center rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-1.5 text-sm backdrop-blur-sm animate-in fade-in slide-in-from-top-4 duration-1000 shadow-lg shadow-primary/20">
              <Sparkles className="mr-2 h-4 w-4 animate-pulse text-yellow-300" />
              AI-Powered Legal Document Analysis
            </div>

            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl md:text-7xl animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200 bg-gradient-to-r from-white via-primary-foreground to-white bg-clip-text text-transparent animate-gradient-x">
              Your Legal Documents,
              <br />
              <span className="bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 bg-clip-text text-transparent animate-gradient-x">Simplified</span>
            </h1>

            <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-400">
              Extract clauses, compare contracts, ask questions, and get instant insights from your legal documents with AI.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-600">
              <Button size="lg" variant="secondary" asChild className="text-lg h-12 px-8 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/30 active:scale-95 bg-gradient-to-r from-primary-foreground to-primary-foreground hover:from-primary-foreground/90 hover:to-primary-foreground/90">
                <Link to="/auth" className="group">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1 group-hover:scale-110" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg h-12 px-8 bg-transparent/20 backdrop-blur-sm border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:border-primary-foreground/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/20 active:scale-95">
                <Link to="/auth">
                  Sign In
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-background to-secondary/20">
        <div className="container">
          <div className="text-center space-y-4 mb-16 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Powerful Features
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to analyze and understand legal documents efficiently
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={index}
                  className="relative overflow-hidden transition-all duration-500 hover:shadow-xl hover:-translate-y-2 hover:scale-[1.02] border-border/50 animate-in fade-in slide-in-from-bottom-4 duration-1000"
                  style={{ animationDelay: `${800 + index * 200}ms` }}
                >
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-4 transition-all duration-300 hover:scale-110 group`}>
                      <Icon className={`h-6 w-6 ${feature.color} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12`} />
                    </div>
                    <CardTitle className="text-xl transition-colors duration-300">{feature.title}</CardTitle>
                    <CardDescription className="text-base transition-colors duration-300">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 animate-gradient-x" />
        <div className="container relative">
          <Card className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 border-primary/20 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500 animate-glow">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-gradient-x opacity-50" />
            <CardContent className="relative p-12 text-center space-y-6">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient-x">
                Ready to get started?
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Upload your first document and experience the power of AI-driven legal analysis
              </p>
              <Button size="lg" asChild className="text-lg h-12 px-8 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/30 active:scale-95 animate-pulse">
                <Link to="/auth" className="group">
                  Get Started Now
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1 group-hover:scale-110" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Landing;
