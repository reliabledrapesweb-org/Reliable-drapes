import { Breadcrumb, PageHero } from "@/components/shared";

export default function ReturnPolicyPage() {
  return (
    <main className="mt-14 min-h-screen bg-white md:mt-16 lg:mt-[72px]">
      <PageHero heading="Return Policy" />
      <Breadcrumb />

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-6 text-sm leading-relaxed text-gray-700 md:text-base">
          <p>
            Reliable Drapes primarily serves business customers. Returns are
            accepted only for damaged, defective, or incorrectly delivered
            products.
          </p>
          <p>
            Return requests should be raised within 7 days of delivery with
            order details and supporting photos.
          </p>
          <p>
            Products must be unused and in original packaging. Custom-made or
            made-to-order items are not eligible for return unless damaged or
            defective.
          </p>
          <p>
            To initiate a return, contact us through the Contact page or your
            account manager.
          </p>
        </div>
      </div>
    </main>
  );
}
