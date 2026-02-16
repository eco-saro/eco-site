"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Heart } from "lucide-react";

export default function About() {
    return (
        <section className="relative py-32 bg-[#FDFBF7] overflow-hidden font-sans text-[#1A1A1A]" id="about">
            <div className="container relative mx-auto px-6 max-w-7xl">

                {/* Title Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-20 text-left"
                >
                    <h2 className="text-[60px] md:text-[80px] font-bold tracking-tighter text-[#86A789] leading-none mb-4 -rotate-2 origin-left inline-block">
                        Our EcoSaro Story
                    </h2>
                    <div className="flex flex-col gap-1 mt-6">
                        <span className="text-xl md:text-2xl font-semibold tracking-tight text-gray-700">
                            Seeds, Fertilizers & More
                        </span>
                        <span className="text-xs font-bold text-gray-400 opacity-50 ml-1">(02)</span>
                    </div>
                </motion.div>

                <div className="flex flex-col lg:flex-row items-start justify-between gap-12">

                    {/* Left Side: Small Polaroids & Vision */}
                    <div className="w-full lg:w-1/3 flex flex-col gap-12">
                        <div className="flex gap-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
                                whileInView={{ opacity: 1, scale: 1, rotate: -3 }}
                                viewport={{ once: true }}
                                className="w-40 aspect-square bg-white p-3 shadow-xl border border-gray-100"
                            >
                                <div className="w-full h-full relative overflow-hidden bg-gray-50">
                                    <Image src="/seeds.jpg" alt="Seeds" fill className="object-cover" />
                                </div>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, rotate: 5 }}
                                whileInView={{ opacity: 1, scale: 1, rotate: 2 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                                className="w-40 aspect-square bg-white p-3 shadow-xl border border-gray-100"
                            >
                                <div className="w-full h-full relative overflow-hidden bg-gray-50">
                                    <Image src="/Organic Plant Food.webp" alt="Growth" fill className="object-cover" />
                                </div>
                            </motion.div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="space-y-4"
                        >
                            <h3 className="text-2xl font-bold tracking-tight">Our Vision & Mission</h3>
                            <ul className="space-y-3 text-sm text-gray-600 font-medium leading-relaxed max-w-sm">
                                <li className="flex gap-2">
                                    <span className="text-emerald-500">•</span>
                                    <span><strong>Vision:</strong> To build a sustainable Earth where future generations can live healthy lives in a clean and green environment.</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-emerald-500">•</span>
                                    <span><strong>Mission:</strong> To make eco-friendly living simple and accessible by bringing all green solutions into one trusted platform.</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-emerald-500">•</span>
                                    <span>EcoSaro empowers a community-driven ecosystem where people come together to build eco wealth.</span>
                                </li>
                            </ul>
                        </motion.div>
                    </div>

                    {/* Center: Large Polaroid */}
                    <div className="relative flex-1 w-full flex justify-center items-center py-10">
                        {/* Back Polaroid Frame */}
                        <motion.div
                            className="absolute z-10 w-[400px] md:w-[500px] aspect-[4/5] bg-white shadow-2xl origin-center"
                            style={{ rotate: "3deg" }}
                            initial={{ opacity: 0, scale: 0.9, rotate: 8 }}
                            whileInView={{ opacity: 1, scale: 1, rotate: 3 }}
                            viewport={{ once: true }}
                        />

                        {/* Main Content Image (Front) */}
                        <motion.div
                            className="relative z-30 w-[360px] md:w-[450px] aspect-[4/5] overflow-hidden shadow-xl"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <Image
                                src="/garden.png"
                                alt="Community Garden"
                                fill
                                className="object-cover"
                            />
                        </motion.div>

                        {/* Sketchy Arrow */}
                        <div className="absolute top-0 right-[-10%] z-40 hidden xl:block opacity-40">
                            <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
                                <path d="M10 20 Q 110 30 60 110" stroke="black" strokeWidth="2" strokeDasharray="6 4" />
                                <path d="M55 100l5 12 12-5" stroke="black" strokeWidth="2" />
                            </svg>
                        </div>
                    </div>

                    {/* Right Side: Cultivating & Sustainable Choices */}
                    <div className="w-full lg:w-1/3 flex flex-col gap-10 lg:pt-20">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="space-y-6"
                        >
                            <h3 className="text-3xl md:text-4xl font-bold tracking-tighter leading-tight max-w-xs">
                                Cultivating a <br /> Greener Tomorrow
                            </h3>
                            <p className="text-sm text-gray-500 leading-relaxed max-w-sm">
                                EcoSaro is a one-stop eco-commerce platform bringing all green possibilities into one place.
                                Inspired by Pasumai Puratchi, we protect the environment by promoting sustainable
                                and conscious living. We believe healthy lives begin with a healthy environment.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="relative self-start group"
                        >
                            {/* Sketchy Smiley */}
                            <div className="absolute -top-12 -left-6 opacity-60">
                                <svg width="40" height="40" viewBox="0 0 40 40">
                                    <circle cx="20" cy="20" r="15" stroke="black" strokeWidth="1.5" strokeDasharray="3 2" fill="none" />
                                    <path d="M15 17c0 0 1-1.5 2-1.5s2 1.5 2 1.5M21 17c0 0 1-1.5 2-1.5s2 1.5 2 1.5" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
                                    <path d="M14 25c0 0 3 4 6 4s6-4 6-4" stroke="black" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                                </svg>
                            </div>

                            <div className="bg-white px-8 py-3 shadow-lg border border-gray-100 italic font-mono text-sm tracking-tight cursor-pointer hover:bg-black hover:text-white transition-all duration-300">
                                Sustainable Choices
                                <div className="absolute -bottom-2 -right-4 w-4 h-4 text-emerald-500">
                                    <Heart className="w-full h-full fill-current" />
                                </div>
                            </div>

                            {/* Loopy arrow from smiley to button */}
                            <div className="absolute -top-6 -left-2 opacity-30 -z-10">
                                <svg width="60" height="60" viewBox="0 0 60 60">
                                    <path d="M10 10 Q 5 40 40 45" stroke="black" strokeWidth="1" fill="none" strokeDasharray="2 2" />
                                </svg>
                            </div>
                        </motion.div>
                    </div>

                </div>

                {/* Footer Accent: Sketchy Leaf */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
                    whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 1 }}
                    className="mt-20 flex justify-center opacity-30"
                >
                    <svg width="80" height="80" viewBox="0 0 80 80" className="text-[#86A789]">
                        <path d="M40 70C40 70 65 50 65 30C65 15 55 10 40 10C25 10 15 15 15 30C15 50 40 70 40 70Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
                        <path d="M40 10V70" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M40 30L65 20M40 50L60 40M40 30L15 20M40 50L20 40" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                </motion.div>

                {/* Unit Info (Bottom Right) */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 0.6 }}
                    viewport={{ once: true }}
                    className="absolute bottom-0 right-6 text-[10px] font-mono tracking-widest text-gray-400"
                >
                    ECOSARO IS A UNIT OF WATONEZZ LLP
                </motion.div>

            </div>

            {/* Background Subtle Elements */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[10%] left-[50%] w-[500px] h-[500px] bg-[#D9EDBF]/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[20%] right-[10%] w-[300px] h-[300px] bg-[#FDF7E4]/40 blur-[100px] rounded-full" />
            </div>
        </section>
    );
}
