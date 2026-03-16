import { PRIVACY_POLICY } from "@/lib/constants";

export default function PrivacyPolicyPage() {
  const { title, lastUpdated, sections } = PRIVACY_POLICY;

  return (
    <main className="min-h-screen bg-white pt-32 pb-16">
      <article className="mx-auto max-w-3xl px-4 md:px-8">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">{title}</h1>
        <p className="mb-6 text-sm text-gray-500">
          Last updated: {lastUpdated}
        </p>

        <div className="prose prose-sm max-w-none space-y-6 text-gray-700">
          {sections.map((section) => (
            <section key={section.id}>
              <h2 className="text-xl font-semibold text-gray-900">
                {section.title}
              </h2>
              <p>{section.content}</p>

              {section.subsections && (
                <div className="ml-3 space-y-4 sm:ml-6">
                  {section.subsections.map((subsection, index) => (
                    <div key={index}>
                      <h3 className="font-semibold text-gray-900">
                        {subsection.title}
                      </h3>
                      <ul className="mt-2 ml-4 list-disc space-y-1 sm:ml-6">
                        {subsection.items.map((item, itemIndex) => (
                          <li key={itemIndex}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {section.items && !section.subsections && (
                <ul className="ml-4 list-disc space-y-2 sm:ml-6">
                  {section.items.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}
