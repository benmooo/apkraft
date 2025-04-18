import { useState } from "react";
import { defaultPageSize } from "../config";

export const usePagination = () => {
  const [pagination, setPagination] = useState({
    pageIndex: 1,
    pageSize: defaultPageSize,
  });

  return {
    pagination,
    onPaginationChange: setPagination,
  };
};
