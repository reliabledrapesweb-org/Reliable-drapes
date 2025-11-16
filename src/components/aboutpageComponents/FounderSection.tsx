import Image from "next/image";

export function FounderSection() {
  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          {/* Image */}
          <div className="flex-shrink-0">
            <div className="relative">
              <div className="w-80 h-80 bg-white rounded-3xl shadow-xl transform rotate-[-7.66deg]" />
              <div className="absolute inset-0 w-80 h-80">
                <Image
                  width={100}
                  height={100}
                  src="/images/founderPic.png"
                  alt="Founder portrait"
                  className="w-full h-full object-cover rounded-3xl border-4 border-white shadow-lg transform translate-x-2 translate-y-2"
                />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 max-w-2xl">
            <h2 className="text-3xl lg:text-4xl mb-6 text-black">
              Our Founder
            </h2>

            {/* Founder Info */}
            <div className="flex items-center gap-4 mb-6">
              <Image
                width={100}
                height={100}
                src="/images/founderPic.png"
                alt="Mr. Sumit Narang"
                className="w-12 h-12 rounded-full object-cover border border-white shadow-sm"
              />
              <div>
                <h3 className="text-xl text-black">Mr. Sumit Narang</h3>
                <p className="text-[#575757] text-lg">Founder & CEO</p>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4 text-[#575757] text-lg leading-relaxed">
              <p className="mb-4">His Vision Behind Reliable Drapes</p>

              <p>
                Our founder envisioned a home furnishings brand that combines
                elegance, quality, and innovation. With a deep passion for
                design and decades of experience in textiles, they built
                Reliable Drapes on the principles of craftsmanship, creativity,
                and timeless style.
              </p>

              <p>
                To inspire every home with beautiful, functional, and
                personalized furnishings that bring comfort, elegance, and a
                sense of individuality to living spaces.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
