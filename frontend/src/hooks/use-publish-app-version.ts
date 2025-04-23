import { publishAppVersion } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryClient } from "..";

export const usePublishAppVersion = (id: number, publish: boolean) =>
  useMutation({
    mutationFn: () => publishAppVersion(id, publish),
    onSuccess: () => {
      toast(
        `Version ${id} ${publish ? "published" : "unpublished"} successfully`,
        {
          description: "The version has been successfully published.",
        },
      );
      queryClient.invalidateQueries({ queryKey: ["app-versions"] });
    },
    onError: (error) => {
      console.error(
        `Error ${publish ? "publishing" : "unpublishing"} version ${id}:`,
        error,
      );
    },
  });
