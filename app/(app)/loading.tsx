import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3" aria-busy="true" aria-label="Loading">
      {Array.from({ length: 9 }, (_, index) => (
        <Skeleton key={index} className="h-28 rounded-2xl bg-card" />
      ))}
    </div>
  );
}
