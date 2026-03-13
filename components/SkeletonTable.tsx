import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface SkeletonTableProps {
  rows?: number;
  title?: string;
}

export function SkeletonTable({ rows = 5, title }: SkeletonTableProps) {
  return (
    <Card>
      <CardHeader className="pb-2 pt-4 px-4">
        {title ? (
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
        ) : (
          <Skeleton className="h-4 w-32" />
        )}
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-2">
        {/* Column headers */}
        <div className="flex gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-3 flex-1" />
          ))}
        </div>
        {/* Rows */}
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4 items-center">
            {Array.from({ length: 6 }).map((_, j) => (
              <Skeleton key={j} className="h-5 flex-1" />
            ))}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
