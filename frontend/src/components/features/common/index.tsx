import EmptyData from "@/components/empty-data";
import ErrorRetry from "@/components/error-retry";
import LoadingSpinner from "@/components/loading-spinner";
import withFullWidthTableRow from "@/lib/hoc/with-full-width-table-row";

export const LoadingTableRow = withFullWidthTableRow(LoadingSpinner);
export const ErrorTableRow = withFullWidthTableRow(ErrorRetry);
export const EmptyTableRow = withFullWidthTableRow(EmptyData);
