import { ChevronRight } from "lucide-react";

export function Breadcrumb() {
  return (
    <div className="w-full bg-gray-100 py-3">
      <div className="mx-auto max-w-[1440px] px-6">
        <nav className="flex items-center gap-2 text-sm">
          <a
            href="#"
            className="text-gray-600 transition-colors hover:text-[#2f2582]"
          >
            Home
          </a>
          <ChevronRight className="h-4 w-4 text-gray-400" />
          <a
            href="#"
            className="text-gray-600 transition-colors hover:text-[#2f2582]"
          >
            E- catalogue
          </a>
          <ChevronRight className="h-4 w-4 text-gray-400" />
          <span className="text-[#2f2582]">All About Catalogue</span>
        </nav>
      </div>
    </div>
  );
}
