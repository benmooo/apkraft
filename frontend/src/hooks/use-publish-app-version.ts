import { publishAppVersion } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryClient } from "..";

export const usePublishAppVersion = (id: number) =>
  useMutation({
    mutationFn: () => publishAppVersion(id),
    onSuccess: () => {
      toast(`Version ${id} published successfully`, {
        description: "The version has been successfully published.",
      });
      queryClient.invalidateQueries({ queryKey: ["app-versions"] });
    },
    onError: (error) => {
      console.error("Error publishing version:", error);
    },
  });
