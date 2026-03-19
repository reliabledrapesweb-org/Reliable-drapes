import { Breadcrumb, PageHero } from "@/components/shared";
import {
  ShieldCheck,
  Camera,
  Package,
  Clock,
  MessageCircle,
  AlertTriangle,
} from "lucide-react";

const policies = [
  {
    icon: Clock,
    title: "7-Day Return Window",
    description:
      "Return requests must be raised within 7 days of delivery. Include your order details and supporting photographs of the issue.",
  },
  {
    icon: ShieldCheck,
    title: "Eligible Returns",
    description:
      "Returns are accepted only for products that are damaged, defective, or incorrectly delivered. Items must be unused and in their original packaging.",
  },
  {
    icon: AlertTriangle,
    title: "Non-Returnable Items",
    description:
      "Custom-made or made-to-order products are not eligible for return unless they arrive damaged or defective.",
  },
  {
    icon: Camera,
    title: "Photo Documentation",
    description:
      "Please provide clear photographs showing the damage or defect when submitting your return request. This helps us process your claim faster.",
  },
  {
    icon: Package,
    title: "Return Packaging",
    description:
      "Products must be returned in their original packaging to ensure safe transit. We may arrange pickup depending on order size and location.",
  },
  {
    icon: MessageCircle,
    title: "How to Initiate",
    description:
      "Contact us through the Contact page or reach out to your account manager directly. Our team will guide you through the return process.",
  },
];

export default function ReturnPolicyPage() {
  return (
    <main className="mt-14 min-h-screen bg-white md:mt-16 lg:mt-[68px] xl:mt-20">
      <PageHero
        heading="Return Policy"
        backgroundImage="/images/heroes/return-policy-hero.jpg"
      />
      <Breadcrumb />

      <section className="bg-gradient-to-b from-[#f8f8f8] via-white to-[#f8f8f8] py-12 md:py-16 lg:py-20">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px w-8 bg-[#2F2582]" />
              <span className="text-xs font-semibold tracking-[0.15em] text-[#2F2582] uppercase">
                Our Policy
              </span>
            </div>
            <h2 className="text-[28px] font-medium tracking-[-0.02em] text-black md:text-[34px]">
              Returns & Exchanges
            </h2>
            <p className="mt-3 max-w-xl text-sm text-[#575757] md:text-base">
              Reliable Drapes primarily serves business customers. We stand
              behind the quality of every product we deliver.
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-3xl gap-5 sm:grid-cols-2 md:mt-14">
            {policies.map((item) => (
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
        </div>
      </section>
    </main>
  );
}
