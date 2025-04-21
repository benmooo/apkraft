import { useState } from "react";
import { defaultPageSize } from "../lib/config";

export const usePagination = (pageSize = defaultPageSize) => {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize,
  });

  return {
    pagination,
    onPaginationChange: setPagination,
  };
};
