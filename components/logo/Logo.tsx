import { DocumentTextIcon } from "@heroicons/react/24/solid";

export default function Logo({ collapsed = false }) {
  return (
    <div className="flex items-center gap-3">
      {/* Icon */}
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500">
        <DocumentTextIcon className="h-6 w-6 text-white" />
      </div>

      {/* Text */}
      {!collapsed && (
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            Remitra
          </span>
          <span className="text-xs text-gray-500">
            Kelola Keuangan Mitra
          </span>
        </div>
      )}
    </div>
  );
}