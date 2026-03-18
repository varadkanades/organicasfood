import Skeleton from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen p-8 space-y-8">
      <Skeleton className="h-96 w-full" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    </div>
  );
}
