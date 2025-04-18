import client from "@/lib/client";
import { useState } from "react";
import { pipe, flow, identity } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";
import { Models } from "@/schemas";
import { AxiosProgressEvent } from "axios";
import { toError } from "fp-ts/Either";

export const useFileUpload = (endpoint = "/files") => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [data, setData] = useState<Models.File | null>(null);

  const onUploadProgress = (event: AxiosProgressEvent) => {
    const percent = Math.round((event.loaded * 100) / (event.total || 1));
    setProgress(percent);
  };

  const _upload = async (formdata: FormData) => {
    const { data } = await client.post(endpoint, formdata, {
      onUploadProgress,
    });
    return data as Models.File;
  };

  const createFormData = (f: File) => {
    const formData = new FormData();
    formData.append("file", f);
    return formData;
  };

  const _uploadFile = flow(
    createFormData,
    TE.right,
    TE.flatMap((d) => TE.tryCatch(() => _upload(d), toError)),
    TE.match(
      (err) => {
        setError((err as Error).toString());
        setUploading(false);
      },
      (data) => {
        setUploading(false);
        setData(data);
      },
    ),
  );

  const uploadFile = (file: File) => {
    setUploading(true);
    setError(null);
    pipe(file, _uploadFile)();
  };

  return {
    uploadFile,
    uploading,
    error,
    progress,
    data,
  };
};
