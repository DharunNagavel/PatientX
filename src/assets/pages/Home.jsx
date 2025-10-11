import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
const features = [
  {
    title: "Data Ownership",
    description:
      "Patients have full control over their health data with secure encryption and blockchain-based consent.",
    gradient: "from-[#0a2647] via-[#144272] to-[#205295]",
  },
  {
    title: "Privacy-Preserving Marketplace",
    description:
      "Sell anonymized health data safely using advanced privacy methods like differential privacy and federated learning.",
    gradient: "from-[#144272] via-[#205295] to-[#78C6A3]",
  },
  {
    title: "AI-Driven Insights",
    description:
      "Receive research-backed health insights and personalized feedback directly from verified researchers.",
    gradient: "from-[#205295] via-[#78C6A3] to-[#B6EADA]",
  },
  {
    title: "Data Monetization",
    description:
      "Earn tokens whenever your data contributes to medical research or AI model training.",
    gradient: "from-[#78C6A3] via-[#205295] to-[#144272]",
  },
];

const Home = () => {
  const sectionRef = useRef(null);
  const cardRefs = useRef([]);

  const scrollToCards = () => {
    sectionRef.current.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      const totalCards = cardRefs.current.length;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: `+=${totalCards * 120}%`, 
          scrub: true,
          pin: true,
        },
      });
      cardRefs.current.forEach((card, i) => {
        if (i < totalCards - 1) {
          tl.to(
            card,
            {
              yPercent: -100,
              opacity: 0,
              ease: "none",
            },
            i 
          );
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <>
      <section className="relative bg-gradient-to-r from-[#0a2647] via-[#144272] to-[#205295] text-white min-h-screen flex items-center justify-center px-6 md:px-20 overflow-hidden">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 items-center gap-10">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Empowering Patients to Own <br /> Their Health Data
            </h1>
            <p className="text-lg text-gray-200">
              A secure, privacy-focused platform where you control, share, and
              benefit from your medical data.
            </p>
            <div className="flex gap-4 pt-4">
              <button
                onClick={scrollToCards}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition"
              >
                Get Started
              </button>
              <button className="border border-blue-400 hover:bg-blue-500 hover:text-white font-semibold px-6 py-3 rounded-lg transition">
                Learn More
              </button>
            </div>
          </div>
          <div className="flex justify-center md:justify-end">
            <img
              src="/heroImage.png"
              alt="Hero Illustration"
              className="w-[420px] md:w-[520px] lg:w-[600px] object-contain"
              loading="lazy"
            />
          </div>
        </div>
      </section>
      <section
        ref={sectionRef}
        className="relative bg-black h-screen overflow-hidden"
      >
        {features.map((feature, index) => (
          <div
            key={index}
            ref={(el) => (cardRefs.current[index] = el)}
            className="absolute top-0 left-0 w-full h-full flex items-center justify-center"
            style={{ zIndex: features.length - index }}
          >
            <div
              className={`w-[90%] md:w-[80%] max-w-5xl text-center text-white rounded-3xl border-4 bg-gradient-to-r ${feature.gradient} 
              p-10 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(120,198,163,0.5)]`}
              style={{
                borderImage: `linear-gradient(to right, #78C6A3, #205295) 1`,
              }}
            >
              <h2 className="text-4xl font-bold mb-4">{feature.title}</h2>
              <p className="max-w-2xl mx-auto text-lg text-gray-100">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </section>
    </>
  );
};

export default Home;
