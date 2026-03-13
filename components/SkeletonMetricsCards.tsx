import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonMetricsCards() {
  return (
    <div className="grid grid-cols-4 gap-3 xl:grid-cols-8">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <CardHeader className="pb-1 pt-3 px-4">
            <Skeleton className="h-3 w-24" />
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <Skeleton className="h-7 w-32 mb-1" />
            <Skeleton className="h-3 w-16" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
