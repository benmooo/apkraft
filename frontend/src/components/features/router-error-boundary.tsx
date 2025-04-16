import { isRouteErrorResponse, useRouteError } from "react-router";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";

/**
 * React Router v7 Error Boundary component
 * This component catches and displays route errors in a user-friendly way
 */
export function RouterErrorBoundary() {
  const error = useRouteError();

  // Default error message
  let title = "Something went wrong";
  let message = "An unexpected error occurred. Please try again later.";
  let errorDetails = error instanceof Error ? error.message : String(error);

  // Handle specific route error responses
  if (isRouteErrorResponse(error)) {
    // Handle specific status codes
    if (error.status === 404) {
      title = "Page Not Found";
      message = "Sorry, the page you're looking for doesn't exist.";
    } else if (error.status === 401) {
      title = "Unauthorized";
      message = "You must be logged in to view this page.";
    } else if (error.status === 403) {
      title = "Forbidden";
      message = "You don't have permission to access this page.";
    } else if (error.status === 500) {
      title = "Server Error";
      message = "There was a problem with our server. Please try again later.";
    }

    errorDetails = error.statusText || String(error.data);
  }

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center p-4 text-center">
      <div className="w-full max-w-md space-y-4 rounded-lg border p-6 shadow-lg">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{message}</p>

        {/* Show error details in development environment */}
        {process.env.NODE_ENV !== "production" && (
          <div className="mt-4 rounded-md bg-muted p-4">
            <details className="cursor-pointer text-left">
              <summary className="font-medium">Error Details</summary>
              <pre className="mt-2 max-h-96 overflow-auto whitespace-pre-wrap text-sm">
                {errorDetails}
              </pre>
              {isRouteErrorResponse(error) && (
                <div className="mt-2 text-sm">
                  <div>Status: {error.status}</div>
                  <div>Status Text: {error.statusText}</div>
                </div>
              )}
            </details>
          </div>
        )}

        <div className="flex justify-center gap-4 pt-4">
          <Button asChild variant="outline">
            <Link to="/">Go to Home</Link>
          </Button>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Default loader error for routes that have no other error handling
 */
export function DefaultLoaderError() {
  return (
    <div className="flex h-[50vh] flex-col items-center justify-center p-4 text-center">
      <h2 className="text-xl font-semibold">Failed to load data</h2>
      <p className="mt-2 text-muted-foreground">
        There was a problem loading this page's data.
      </p>
      <Button onClick={() => window.location.reload()} className="mt-4">
        Retry
      </Button>
    </div>
  );
}

/**
 * Action error component for handling form submission errors
 */
export function ActionError() {
  const error = useRouteError();
  let message = "The form submission failed. Please try again.";

  if (isRouteErrorResponse(error)) {
    message = error.statusText || String(error.data) || message;
  } else if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === "string") {
    message = error;
  }

  return (
    <div className="rounded-md bg-destructive/15 p-3 text-destructive">
      <p className="font-medium">Error</p>
      <p className="text-sm">{message}</p>
    </div>
  );
}
