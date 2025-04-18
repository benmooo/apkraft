import { IconRefreshDot } from "@tabler/icons-react";
import { Button } from "./ui/button";

interface ErrorRetryProps {
  message?: string;
  onRetry: () => void;
  isRetrying: boolean;
}

export default function ErrorRetry({
  message,
  onRetry,
  isRetrying,
}: ErrorRetryProps) {
  return (
    <div className="flex flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto h-12 w-12 text-primary" />
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground">
          Error
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          {message || "Oops, something went wrong."}
        </p>
        <div className="mt-6">
          <Button disabled={isRetrying} onClick={onRetry} variant="secondary">
            <IconRefreshDot
              className={isRetrying ? "animate-spin" : ""}
            ></IconRefreshDot>
            <span className="px-2">Retry</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
