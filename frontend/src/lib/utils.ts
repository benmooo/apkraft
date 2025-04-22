import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { saveAs } from "file-saver";
import * as TE from "fp-ts/TaskEither";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import { baseUrl } from "./client";
import { toast } from "sonner";
import { getFileInfo } from "./api";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format file size to human-readable format
export const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + " B";
  const units = ["KB", "MB", "GB"];
  let size = bytes / 1024;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return size.toFixed(1) + " " + units[unitIndex];
};

export const downloadFile = (fileId: number) =>
  pipe(
    TE.tryCatch(async () => await getFileInfo(fileId), E.toError),
    TE.match(
      (error) => {
        toast.error("Error downloading APK", {
          description: error.message,
        });
      },
      (info) => saveAs(`${baseUrl}/files/static/${info.path}`, info.name),
    ),
  )();
