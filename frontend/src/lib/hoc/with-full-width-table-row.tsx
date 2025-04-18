import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "../utils";

interface WithFullWidthCellProps {
  colSpan: number;
  className?: string;
}

// Higher-Order Component with proper prop type inference
const withFullWidthTableRow = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
) => {
  // Define the props for the enhanced component, extending the WrappedComponent's props
  type EnhancedProps = P & WithFullWidthCellProps;

  const EnhancedComponent = ({
    colSpan,
    className,
    ...rest
  }: EnhancedProps) => {
    // Cast rest to P since we know the remaining props should match the wrapped component's props
    const componentProps = rest as P;

    return (
      <TableRow>
        <TableCell
          colSpan={colSpan}
          className={cn("h-24 text-center", className)}
        >
          <WrappedComponent {...componentProps} />
        </TableCell>
      </TableRow>
    );
  };

  // Set a more descriptive display name for debugging
  EnhancedComponent.displayName = `withFullWidthTableRow(${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`;

  return EnhancedComponent;
};

export default withFullWidthTableRow;
