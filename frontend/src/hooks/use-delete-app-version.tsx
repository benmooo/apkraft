import { deleteVersion } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryClient } from "..";

export const useDeleteAppVersion = (id: number) =>
  useMutation({
    mutationFn: () => deleteVersion(id),
    onSuccess: () => {
      toast(`Version ${id} deleted successfully`, {
        description: "The version has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ["app-versions"] });
    },
    onError: (error) => {
      console.error("Error deleting version:", error);
    },
  });
