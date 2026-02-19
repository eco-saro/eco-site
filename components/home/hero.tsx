"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Menu, Heart } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen bg-[#FDFBF7] overflow-hidden font-sans text-[#1A1A1A] flex items-center justify-center py-20">
      <div className="container relative mx-auto px-6 max-w-7xl">

        {/* Left Side: Title & Subtitle */}
        <div className="relative z-20 max-w-2xl text-left lg:absolute lg:top-[-40px] lg:left-0 lg:pt-20">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-[64px] md:text-[84px] font-bold leading-[0.85] tracking-tighter text-black mb-6">
              Eco-Conscious <br />
              <span className="relative inline-block">
                Living
                <motion.svg
                  viewBox="0 0 200 20"
                  className="absolute -bottom-1 left-0 w-full h-8 text-[#D9EDBF] -z-10"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1, delay: 0.5 }}
                >
                  <path
                    d="M5 12C60 8 140 8 195 12"
                    stroke="currentColor"
                    strokeWidth="10"
                    strokeLinecap="round"
                    fill="none"
                  />
                </motion.svg>
              </span>
            </h1>
            <p className="text-xl md:text-2xl font-semibold text-[#4A4A4A] mt-10 tracking-tight">
              Seeds, Fertilizers & More
            </p>
          </motion.div>

          {/* Doodles near text */}
          <motion.div
            className="absolute -right-20 top-1/2 md:block hidden opacity-60"
            animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 5, repeat: Infinity }}
          >
            <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Sketchy Smiley */}
              <path d="M30 50C41.0457 50 50 41.0457 50 30C50 18.9543 41.0457 10 30 10C18.9543 10 10 18.9543 10 30C10 41.0457 18.9543 50 30 50Z" stroke="black" strokeWidth="1.5" strokeDasharray="4 2" />
              <path d="M22 25C22 25 24 22 26 22" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M34 25C34 25 36 22 38 22" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M20 38C20 38 25 44 30 44C35 44 40 38 40 38" stroke="black" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </svg>
          </motion.div>
        </div>

        {/* Center Content: Main Image & Overlapping Frames */}
        <div className="relative w-full flex justify-center items-center mt-32 lg:mt-0 xl:scale-110">

          {/* Back Polaroid Frame */}
          <motion.div
            className="absolute z-10 w-[380px] md:w-[480px] h-[480px] md:h-[600px] bg-white shadow-2xl origin-center"
            style={{ rotate: "-5deg" }}
            initial={{ opacity: 0, scale: 0.9, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: -5 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="w-full h-[85%] border-[16px] border-white bg-[#F9F9F9] overflow-hidden">
              {/* Empty or very subtle texture */}
            </div>
          </motion.div>

          {/* Main Content Image (Front) */}
          <motion.div
            className="relative z-30 w-[340px] md:w-[420px] h-[460px] md:h-[580px] overflow-hidden shadow-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Image
              src="/hero-women.png"
              alt="Woman holding organic plant"
              fill
              className="object-cover transition-transform duration-700 hover:scale-105"
              priority
            />
          </motion.div>

          {/* Floating Small Polaroid (Right) */}
          <motion.div
            className="absolute z-40 right-[-10%] top-[15%] w-[160px] md:w-[220px] aspect-square bg-white shadow-2xl border-[12px] border-white flex flex-col items-center"
            style={{ rotate: "10deg" }}
            initial={{ opacity: 0, x: 50, rotate: 20 }}
            animate={{ opacity: 1, x: 0, rotate: 10 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            <div className="w-full h-full bg-[#FAFAFA] flex items-center justify-center p-4">
              <Image src="/Organic Plant Food.webp" alt="Accent Image" width={120} height={120} className="object-contain opacity-70" />
            </div>
            <div className="w-full h-8" /> {/* Blank space for caption style */}
          </motion.div>

          {/* Dotted Arrow pointing to a frame */}
          <motion.div
            className="absolute z-50 right-[-15%] top-[40%]"
            initial={{ opacity: 0, pathLength: 0 }}
            animate={{ opacity: 1, pathLength: 1 }}
            transition={{ delay: 1, duration: 1 }}
          >
            <svg width="100" height="100" viewBox="0 0 100 100">
              <path d="M10 80 Q 50 10 90 20" stroke="black" strokeWidth="1.5" fill="none" strokeDasharray="5,5" />
              <path d="M85 12l8 8-8 3" stroke="black" strokeWidth="2" fill="none" />
            </svg>
          </motion.div>

          {/* Caption Labels around images */}
          <motion.div
            className="absolute z-50 left-[-5%] bottom-[25%] bg-white px-5 py-2 shadow-lg border border-gray-100 -rotate-2 font-mono text-[10px] md:text-xs tracking-tighter uppercase"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 1.2 }}
          >
            Heirloom Seeds
            {/* Dotted connector */}
            <div className="absolute -top-12 -left-6 opacity-30">
              <svg width="60" height="60" viewBox="0 0 60 60">
                <path d="M10 50 Q 30 10 50 50" stroke="black" strokeWidth="1" fill="none" strokeDasharray="3 3" />
              </svg>
            </div>
          </motion.div>

          <motion.div
            className="absolute z-50 right-[0%] bottom-[15%] bg-white px-5 py-2 shadow-lg border border-gray-100 rotate-3 font-mono text-[10px] md:text-xs tracking-tighter uppercase"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 1.4 }}
          >
            Sustainable Growth
          </motion.div>
        </div>

        {/* Right Section: Mission & Page Number */}
        <div className="relative z-30 flex flex-col items-end gap-16 lg:absolute lg:right-0 lg:bottom-10 lg:w-64">
          {/* Mission Statement */}
          <motion.div
            className="pr-20 text-right max-w-[300px]"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.6 }}
          >
            <div className="flex items-center justify-end gap-2 mb-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]">Our Mission</span>
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                <Heart className="w-3 h-3 text-red-500 fill-current" />
              </motion.div>
            </div>
            <p className="text-[10px] md:text-xs leading-relaxed text-gray-500 font-medium">
              To cultivate a green future, one seed at a time. Empowering conscious living through nature.
            </p>
          </motion.div>

          {/* Big Number Accent */}
          <motion.div
            className="text-[160px] md:text-[200px] font-thin text-[#1A1A1A]/5 select-none leading-none tracking-tighter hidden xl:block"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 0.05, y: 0 }}
            transition={{ duration: 1, delay: 1 }}
          >
            (01)
          </motion.div>
        </div>

        {/* Bottom Left: Thumbnails in Polaroid Style */}
        <div className="absolute bottom-8 left-0 z-40 flex items-end gap-8 invisible md:visible">
          {[
            { id: "(02)", img: "/seeds.jpg", delay: 2 },
            { id: "(03)", img: "/neem face wash.webp", delay: 2.2 }
          ].map((prod) => (
            <motion.div
              key={prod.id}
              className="flex flex-col gap-3"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: prod.delay }}
            >
              <span className="text-[10px] font-bold text-gray-400 opacity-50 ml-1">{prod.id}</span>
              <div className="w-28 md:w-36 aspect-square bg-white p-3 shadow-xl border border-gray-100 hover:scale-110 transition-transform cursor-pointer">
                <div className="w-full h-full relative overflow-hidden bg-[#F5F5F5]">
                  <Image src={prod.img} alt="Product Thumb" fill className="object-cover" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>

      {/* Decorative Brush Sprays (Background) */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden text-[#C7E9B0]/20">
        <Menu className="absolute top-[20%] right-[10%] w-[400px] h-[400px] opacity-10 blur-[80px]" />
        <div className="absolute bottom-[-10%] left-[5%] w-[500px] h-[500px] bg-[#FDF7E4]/50 blur-[120px] rounded-full" />
      </div>
    </section>
  );
}