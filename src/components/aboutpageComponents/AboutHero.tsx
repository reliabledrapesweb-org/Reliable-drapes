import Image from "next/image";

export function AboutHero() {
  return (
    <section className="relative h-[350px] flex items-center overflow-hidden">
      {/* Background Image with Overlays */}
      <div className="absolute inset-0">
        <Image
          width={100}
          height={100}
          src="/images/abouthero.png"
          alt="Luxury home furnishings"
          className="w-full h-full cursor-pointer object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50" />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Content */}
      <div className="relative z-10 justify-start text-start px-6 md:px-20 lg:px-32">
        {/* Logo */}
        <div className="mb-8 flex justify-start">
          <Image
            src="/images/logo.png"
            alt="Logo"
            width={120}
            height={38}
            className="object-contain md:w-[130px] lg:w-[140px]"
            priority
          />
        </div>

        {/* Heading */}
        <h1 className="text-white text-4xl lg:text-5xl mb-2 tracking-tight">
          About Reliable Drapes
        </h1>
        <p className="text-white/90 text-base lg:text-lg">
          A Unit of Shree Ambica Furnishings (India) Pvt. Ltd.
        </p>
      </div>
    </section>
  );
}
