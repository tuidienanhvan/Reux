// src/components/skeletons/SidebarSkeleton.jsx
const SidebarSkeleton = () => {
  return (
    <aside className="h-full w-full border-r border-base-300 bg-base-200 flex flex-col font-kurohe">
      {/* Header skeleton (copy cấu trúc thật) */}
      <div className="border-b border-base-300 w-full p-5">
        {/* icon + text */}
        <div className="flex items-center gap-2">
          <div className="size-6 bg-base-300 animate-pulse rounded" />
          <div className="hidden lg:block h-4 w-24 bg-base-300 animate-pulse rounded" />
        </div>

        {/* tab buttons */}
        <div className="mt-3 flex items-center gap-2">
          <div className="h-6 w-16 bg-base-300 animate-pulse rounded" />
          <div className="h-6 w-16 bg-base-300 animate-pulse rounded" />
        </div>

        {/* checkbox + text */}
        <div className="mt-3 flex items-center gap-2">
          <div className="size-4 bg-base-300 animate-pulse rounded" />
          <div className="hidden lg:block h-3 w-20 bg-base-300 animate-pulse rounded" />
        </div>

        {/* số online */}
        <div className="hidden lg:block mt-1 h-3 w-16 bg-base-300 animate-pulse rounded" />
      </div>

      {/* Danh sách user skeleton */}
      <div className="overflow-y-auto w-full py-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="p-3 flex items-center gap-3">
            <div className="size-12 rounded-full bg-base-300 animate-pulse mx-auto lg:mx-0" />
            <div className="hidden lg:block flex-1 space-y-2">
              <div className="h-4 w-32 bg-base-300 animate-pulse rounded" />
              <div className="h-3 w-20 bg-base-300 animate-pulse rounded" />
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default SidebarSkeleton;
