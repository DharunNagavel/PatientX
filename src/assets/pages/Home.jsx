import React, { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    title: "Data Ownership",
    description:
      "Patients have full control over their health data with secure encryption and blockchain-based consent.",
  },
  {
    title: "Privacy-Preserving Marketplace",
    description:
      "Sell anonymized health data safely using advanced privacy methods like differential privacy and federated learning.",
  },
  {
    title: "AI-Driven Insights",
    description:
      "Receive research-backed health insights and personalized feedback directly from verified researchers.",
  },
  {
    title: "Data Monetization",
    description:
      "Earn tokens whenever your data contributes to medical research or AI model training.",
  },
];

const Home = () => {
  const sectionRef = useRef(null);
  const containerRef = useRef(null);

  const scrollToCards = () => {
    sectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const sections = gsap.utils.toArray(".panel");

      gsap.to(sections, {
        xPercent: -100 * (sections.length - 1),
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          pin: true,
          scrub: 1,
          snap: 1 / (sections.length - 1),
          end: () =>
            "+=" + sectionRef.current.offsetWidth * sections.length,
        },
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <>
      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-[#020617] via-[#0B1120] to-[#0f172a] text-white overflow-hidden px-6 md:px-20">

        <div className="absolute w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] top-[-150px] left-[-150px]" />
        <div className="absolute w-[400px] h-[400px] bg-cyan-500/20 rounded-full blur-[120px] bottom-[-150px] right-[-150px]" />

        <div className="relative z-10 max-w-7xl mx-auto grid md:grid-cols-2 items-center gap-16">

          <div className="space-y-8">
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
              Empowering Patients to Own <br />
              <span className="text-blue-400">Their Health Data</span>
            </h1>

            <p className="text-lg text-gray-300 max-w-xl">
              A decentralized healthcare marketplace where patients control
              and monetize medical data securely.
            </p>

            <button
              onClick={scrollToCards}
              className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 
              text-white font-semibold transition shadow-lg shadow-blue-500/40"
            >
              Explore Features
            </button>
          </div>

          <div className="flex justify-center md:justify-end">
            <img
              src="/image.png"
              alt="Blockchain Healthcare"
              className="w-[420px] md:w-[520px] object-contain drop-shadow-[0_0_40px_rgba(59,130,246,0.4)]"
            />
          </div>
        </div>
      </section>

      {/* FEATURES HORIZONTAL */}
      <section
        ref={sectionRef}
        className="relative h-screen bg-[#020617] overflow-hidden"
      >
        <div
          ref={containerRef}
          className="flex h-full"
        >
          {features.map((feature, index) => (
            <div
              key={index}
              className="panel min-w-full flex items-center justify-center px-10"
            >
              <div
                className="max-w-3xl text-center 
                bg-white/5 backdrop-blur-xl 
                border border-blue-500/20 
                rounded-3xl p-16 text-white 
                shadow-[0_0_60px_rgba(59,130,246,0.15)]"
              >
                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-blue-400">
                  {feature.title}
                </h2>
                <p className="text-lg text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default Home;
