import { Models } from "@/schemas";
import client from "./client";

export const getFileInfo = async (fileId: number) => {
  const { data } = await client.get(`/files/${fileId}`);
  return data as Models.File;
};

export const deleteVersion = async (id: number) => {
  const { data } = await client.delete(`/app-versions/${id}`);
  return data;
};

export const publishAppVersion = async (id: number, publish: boolean) => {
  const { data } = await client.post(`/app-versions/${id}/publish`, {
    publish,
  });
  return data;
};
