"use client";

import { useState } from "react";
import { Breadcrumb, PageHero } from "@/components/shared";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const faqs = [
  {
    question: "Do you support bulk and project orders?",
    answer:
      "Yes. Reliable Drapes is structured for B2B supply and project-based fulfillment across multiple categories including curtains, blinds, wallpapers, and flooring.",
  },
  {
    question: "Can I request custom specifications?",
    answer:
      "Absolutely. Customization is available based on product type, quantity, and project requirements. Our team works closely with you to match exact specifications for your space.",
  },
  {
    question: "How do I get quotations for my business?",
    answer:
      "Use the Contact page or connect with our team through the Store Locator network for quotation support. We typically respond within 24-48 business hours.",
  },
  {
    question: "Where can I view collections before ordering?",
    answer:
      "You can browse the Shop section and access detailed material specifications through our E-Catalogue. For hands-on viewing, visit any of our store locations listed in the Store Locator.",
  },
  {
    question: "What is the typical delivery timeline?",
    answer:
      "Standard orders are dispatched within 5-7 business days. Custom and bulk orders may require 2-4 weeks depending on specifications. Exact timelines are confirmed at order placement.",
  },
  {
    question: "Do you offer installation services?",
    answer:
      "We work with a network of certified installation partners across India. Installation support can be arranged as part of your order — speak with your account manager for details.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept bank transfers, UPI, credit/debit cards, and net banking. For B2B accounts, we also offer credit terms based on account history and order volume.",
  },
  {
    question: "How can I become a dealer or trade partner?",
    answer:
      "Visit the Trader Login page to learn about our B2B dealer program. You can also reach out through the Contact page and our partnerships team will get in touch.",
  },
];

function FaqItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-[#e8e6e1] last:border-b-0">
      <button
        onClick={onToggle}
        className="flex w-full cursor-pointer items-center justify-between py-5 text-left transition-colors md:py-6"
      >
        <span className="pr-4 text-[15px] font-semibold text-gray-900 md:text-base">
          {question}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f3f3f5]"
        >
          <ChevronDown className="h-4 w-4 text-[#575757]" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="pr-4 pb-5 text-sm leading-relaxed text-[#575757] md:pr-10 md:pb-6 md:text-base">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <main className="mt-14 min-h-screen bg-white md:mt-16 lg:mt-[72px]">
      <PageHero
        heading="Frequently Asked Questions"
        backgroundImage="/images/heroes/faq-hero.jpg"
      />
      <Breadcrumb />

      <section className="bg-gradient-to-b from-[#f8f8f8] via-white to-[#f8f8f8] py-12 md:py-16 lg:py-20">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px w-8 bg-[#2F2582]" />
              <span className="text-xs font-semibold tracking-[0.15em] text-[#2F2582] uppercase">
                Support
              </span>
            </div>
            <h2 className="text-[28px] font-medium tracking-[-0.02em] text-black md:text-[34px]">
              Common Questions
            </h2>
            <p className="mt-3 max-w-xl text-sm text-[#575757] md:text-base">
              Find answers to the most frequently asked questions about our
              products, services, and ordering process.
            </p>
          </div>

          <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-[#d9d9d9] bg-white px-6 md:mt-14 md:px-8">
            {faqs.map((item, index) => (
              <FaqItem
                key={item.question}
                question={item.question}
                answer={item.answer}
                isOpen={openIndex === index}
                onToggle={() =>
                  setOpenIndex(openIndex === index ? null : index)
                }
              />
            ))}
          </div>

          <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-[#d9d9d9] bg-[#fafafa] p-6 text-center md:p-8">
            <p className="text-sm text-[#575757] md:text-base">
              Still have questions?{" "}
              <a
                href="/contact"
                className="font-semibold text-[#2F2582] transition-colors hover:underline"
              >
                Contact our team
              </a>{" "}
              and we will get back to you within 24 hours.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
