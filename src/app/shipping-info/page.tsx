import { Breadcrumb, PageHero } from "@/components/shared";
import {
  Truck,
  Clock,
  MapPin,
  CreditCard,
  PackageCheck,
  Headphones,
} from "lucide-react";

const shippingDetails = [
  {
    icon: Clock,
    title: "Standard Dispatch",
    description:
      "Orders are typically dispatched within 5-7 business days. Dispatch timelines and tracking details are shared at order confirmation.",
  },
  {
    icon: Truck,
    title: "Bulk & Custom Orders",
    description:
      "Large-volume and custom B2B orders may require staggered dispatch and coordinated delivery scheduling based on project timelines.",
  },
  {
    icon: MapPin,
    title: "Pan-India Delivery",
    description:
      "We deliver across India through our logistics partners. Remote locations may have extended delivery windows — timelines are confirmed at checkout.",
  },
  {
    icon: CreditCard,
    title: "Shipping Charges",
    description:
      "Delivery charges, if applicable, are calculated based on order size, weight, and destination. All costs are communicated before payment confirmation.",
  },
  {
    icon: PackageCheck,
    title: "Order Tracking",
    description:
      "Once dispatched, you will receive tracking details via email and SMS. Track your shipment in real time through our logistics partner's portal.",
  },
  {
    icon: Headphones,
    title: "Priority & Project Shipping",
    description:
      "For priority dispatch, project-based shipping support, or special handling requirements, contact our team via the Contact page.",
  },
];

export default function ShippingInfoPage() {
  return (
    <main className="mt-14 min-h-screen bg-white md:mt-16 lg:mt-[68px] xl:mt-20">
      <PageHero
        heading="Shipping Information"
        backgroundImage="/images/heroes/shipping-hero.jpg"
      />
      <Breadcrumb />

      <section className="bg-gradient-to-b from-[#f8f8f8] via-white to-[#f8f8f8] py-12 md:py-16 lg:py-20">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px w-8 bg-[#2F2582]" />
              <span className="text-xs font-semibold tracking-[0.15em] text-[#2F2582] uppercase">
                Delivery
              </span>
            </div>
            <h2 className="text-[28px] font-medium tracking-[-0.02em] text-black md:text-[34px]">
              Shipping & Logistics
            </h2>
            <p className="mt-3 max-w-xl text-sm text-[#575757] md:text-base">
              Everything you need to know about how we handle dispatch, delivery,
              and logistics for your orders.
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-3xl gap-5 sm:grid-cols-2 md:mt-14">
            {shippingDetails.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-[#d9d9d9] bg-white p-6 transition-shadow duration-300 hover:shadow-md"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#2F2582]/10">
                  <item.icon className="h-5 w-5 text-[#2F2582]" />
                </div>
                <h3 className="text-base font-semibold text-gray-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#575757]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-[#d9d9d9] bg-[#fafafa] p-6 text-center md:p-8">
            <p className="text-sm text-[#575757] md:text-base">
              Need help with a specific shipment?{" "}
              <a
                href="/contact"
                className="font-semibold text-[#2F2582] transition-colors hover:underline"
              >
                Contact our team
              </a>{" "}
              for priority support and project-based logistics.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
