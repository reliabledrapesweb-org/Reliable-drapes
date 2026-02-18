import Image from "next/image";

const GOOGLE_REVIEW_IMAGES = [
  "/images/google-reviews/review-1.jpg",
  "/images/google-reviews/review-2.jpg",
  "/images/google-reviews/review-3.jpg",
  "/images/google-reviews/review-4.jpg",
  "/images/google-reviews/review-5.jpg",
];

const GOOGLE_REVIEW_SEARCH_URL =
  "https://www.google.com/search?q=Reliable+Drapes+Panipat+reviews";

export function GoogleReviewsSection() {
  return (
    <section className="bg-[#f8f8f8] py-12 md:py-16 lg:py-20">
      <div className="container mx-auto px-6">
        <div className="mx-auto mb-12 flex max-w-6xl flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.16em] text-[#2F2582] uppercase md:text-sm">
              Google Reviews
            </p>
            <h2 className="mt-2 text-[28px] font-medium tracking-[-1.5px] text-black lg:text-[36px]">
              Customer Feedback
            </h2>
            <p className="mt-3 text-sm text-[#575757] md:text-base">
              Real review snapshots from Google highlighting client experience
              with Reliable Drapes.
            </p>
          </div>
          <a
            href={GOOGLE_REVIEW_SEARCH_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-full border border-[#2F2582] px-5 py-2.5 text-sm font-medium text-[#2F2582] transition-colors hover:bg-[#2F2582] hover:text-white"
          >
            View On Google
          </a>
        </div>

        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {GOOGLE_REVIEW_IMAGES.map((src, index) => (
              <a
                key={src}
                href={src}
                target="_blank"
                rel="noopener noreferrer"
                className="group block overflow-hidden rounded-2xl border border-[#d0d0d0] bg-[#fcfcfc] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="relative aspect-[9/16] w-full bg-[#ededed]">
                  <Image
                    src={src}
                    alt={`Google review screenshot ${index + 1}`}
                    fill
                    className="object-contain transition-transform duration-300 group-hover:scale-[1.01]"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                  />
                </div>
              </a>
            ))}
        </div>
      </div>
    </section>
  );
}
