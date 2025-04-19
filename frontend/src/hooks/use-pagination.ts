import { useState } from "react";
import { defaultPageSize } from "../lib/config";

export const usePagination = () => {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: defaultPageSize,
  });

  return {
    pagination,
    onPaginationChange: setPagination,
  };
};
