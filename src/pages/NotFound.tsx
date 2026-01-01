import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileSearch } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-center p-4">
      <div className="flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 mb-8">
        <FileSearch className="w-12 h-12 text-primary" />
      </div>
      <h1 className="text-6xl font-bold text-primary">404</h1>
      <h2 className="text-2xl font-semibold text-foreground mt-4 mb-2">
        Page Not Found
      </h2>
      <p className="text-muted-foreground max-w-md mx-auto mb-8">
        Oops! The page you are looking for does not exist. It might have been
        moved or deleted.
      </p>
      <Button asChild>
        <Link to="/">Go Back to Home</Link>
      </Button>
    </div>
  );
};

export default NotFound;