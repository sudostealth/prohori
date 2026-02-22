import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="w-full h-full p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
         <div className="space-y-2">
           <Skeleton className="h-8 w-64 bg-[#222]" />
           <Skeleton className="h-4 w-96 bg-[#222]" />
         </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-28 w-full bg-[#1A1A1A] rounded-xl" />
        ))}
      </div>

      <Skeleton className="h-[400px] w-full bg-[#1A1A1A] rounded-xl" />
    </div>
  );
}
