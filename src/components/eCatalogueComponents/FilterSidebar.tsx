import { Check, Minus } from "lucide-react";

export function FilterSidebar() {
  const filters = [
    { label: "Main Curtains", checked: true },
    { label: "Sheer Curtains", checked: false },
    { label: "Blackout Curtains", checked: false },
  ];

  return (
    <aside className="w-full flex-shrink-0 lg:w-[220px]">
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between border-b border-[#8d8d8d] pb-4">
          <h2 className="text-[20px] text-[#161616]">Filter By</h2>
          <Minus className="h-4 w-4 text-black" />
        </div>

        <div className="mt-8 space-y-4">
          {filters.map((filter) => (
            <label
              key={filter.label}
              className="group flex cursor-pointer items-center justify-between"
            >
              <span className="text-[18px] text-[#575757]">{filter.label}</span>
              <div
                className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${
                  filter.checked
                    ? "border-black bg-black"
                    : "border-[#d9d9d9] bg-[#d9d9d9] group-hover:border-gray-400"
                }`}
              >
                {filter.checked && <Check className="h-3 w-3 text-white" />}
              </div>
              <input
                type="checkbox"
                defaultChecked={filter.checked}
                className="sr-only"
              />
            </label>
          ))}
        </div>

        <button className="mt-8 w-full rounded-full bg-[#2f2582] px-8 py-3 text-[16px] tracking-[2px] text-white uppercase transition-colors hover:bg-[#241c66]">
          Reset Filters
        </button>
      </div>
    </aside>
  );
}
