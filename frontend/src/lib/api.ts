import { Models } from "@/schemas";
import client from "./client";

export const getFileInfo = async (fileId: number) => {
  const { data } = await client.get(`/files/${fileId}`);
  return data as Models.File;
};

export const deleteVersion = async (id: number) => {
  const { data } = await client.delete(`/app_versions/${id}`);
  return data;
};

export const publishAppVersion = async (id: number) => {
  const { data } = await client.patch(`/app_versions/${id}`, {
    published_at: new Date().toISOString(),
  });
  return data;
};
