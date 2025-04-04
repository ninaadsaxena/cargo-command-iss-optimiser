
import React, { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-space-navy text-space-white">
      <div className="glass-panel p-8 max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <AlertCircle className="h-16 w-16 text-nasa-red animate-pulse" />
        </div>
        <h1 className="text-4xl font-bold mb-4">404 Error</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Mission control, we have a problem. The requested page was not found.
        </p>
        <Button asChild>
          <Link to="/" className="flex items-center gap-2">
            <Home size={16} />
            Return to Command Center
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
