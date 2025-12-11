import { PageHero, SearchBar } from "@/components/shared";

export default function StoreLocatorPage() {
    return (
        <main className="mt-14 min-h-screen bg-white md:mt-16 lg:mt-[72px]">
            <PageHero heading="E-catalogue" />
            <div className="w-full py-12 md:py-16 lg:py-20">
                <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
                    {/* Header Section */}
                    <div className="mb-12 md:mb-16 lg:mb-20">
                        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                            <div className="flex flex-col gap-4">
                                <p className="text-xs font-medium tracking-[6px] text-[#575757] uppercase md:text-sm md:tracking-[8px]">
                                    Store Locator
                                </p>
                                <h1 className="text-2xl leading-tight font-bold text-[#161616] md:text-[32px]">
                                    All Across India
                                </h1>
                            </div>

                            <div className="w-full lg:w-auto lg:min-w-[420px]">
                                <SearchBar />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}