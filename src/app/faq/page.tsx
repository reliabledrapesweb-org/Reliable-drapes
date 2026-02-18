import { Breadcrumb, PageHero } from "@/components/shared";

const faqs = [
  {
    question: "Do you support bulk and project orders?",
    answer:
      "Yes. Reliable Drapes is structured for B2B supply and project-based fulfillment across multiple categories.",
  },
  {
    question: "Can I request custom specifications?",
    answer:
      "Yes. Customization is available based on product type, quantity, and project requirements.",
  },
  {
    question: "How do I get quotations for my business?",
    answer:
      "Use the Contact page or connect with our team through the Store Locator network for quotation support.",
  },
  {
    question: "Where can I view collections before ordering?",
    answer:
      "You can browse the Shop section and access detailed materials through the E-Catalogue.",
  },
];

export default function FaqPage() {
  return (
    <main className="mt-14 min-h-screen bg-white md:mt-16 lg:mt-[72px]">
      <PageHero heading="Frequently Asked Questions" />
      <Breadcrumb />

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {faqs.map((item) => (
            <div key={item.question} className="rounded-xl border border-gray-200 p-5">
              <h2 className="text-base font-semibold text-gray-900 md:text-lg">
                {item.question}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-700 md:text-base">
                {item.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
