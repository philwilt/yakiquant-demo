import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface SkeletonChartProps {
  title?: string;
  height?: string;
}

export function SkeletonChart({ title, height = "h-full" }: SkeletonChartProps) {
  return (
    <Card className={`${height} flex flex-col`}>
      <CardHeader className="pb-2 pt-4 px-4 shrink-0">
        {title ? (
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
        ) : (
          <Skeleton className="h-4 w-32" />
        )}
      </CardHeader>
      <CardContent className="flex-1 px-4 pb-4">
        <Skeleton className="h-full w-full rounded-md" />
      </CardContent>
    </Card>
  );
}
