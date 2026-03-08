import { Breadcrumb, PageHero } from "@/components/shared";

export default function ShippingInfoPage() {
  return (
    <main className="mt-14 min-h-screen bg-white md:mt-16 lg:mt-[72px]">
      <PageHero
        heading="Shipping Information"
        backgroundImage="/images/heroes/shipping-hero.jpg"
      />
      <Breadcrumb />

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-6 text-sm leading-relaxed text-gray-700 md:text-base">
          <p>
            Shipping timelines vary by order type, stock availability, and
            delivery location. Standard dispatch details are shared at order
            confirmation.
          </p>
          <p>
            Large-volume and custom B2B orders may require staggered dispatch
            and coordinated delivery scheduling.
          </p>
          <p>
            Delivery charges, if applicable, are communicated before payment
            confirmation.
          </p>
          <p>
            For priority dispatch and project-based shipping support, contact
            our team via the Contact page.
          </p>
        </div>
      </div>
    </main>
  );
}
