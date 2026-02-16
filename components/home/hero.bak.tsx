"use client";
import type React from "react"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { motion, useAnimation, useInView } from "framer-motion"
import { ArrowRight, Leaf, Droplets, Sun, Wind } from "lucide-react"
import { useRouter } from "next/navigation"

export default function Hero() {
  const router = useRouter()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const heroRef = useRef(null)
  const isInView = useInView(heroRef, { once: false, amount: 0.1 })
  const mainControls = useAnimation()

  // Handle mouse movement for parallax effect
  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect()
    const x = (clientX - left) / width - 0.5
    const y = (clientY - top) / height - 0.5
    setMousePosition({ x, y })
  }

  useEffect(() => {
    if (isInView) {
      mainControls.start("visible")
    } else {
      mainControls.start("hidden")
    }
  }, [isInView, mainControls])

  // Initialize animations on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      mainControls.start("visible")
    }, 500)
    return () => clearTimeout(timer)
  }, [mainControls])

  return (
    <section
      ref={heroRef}
      className="relative min-h-[90vh] overflow-hidden bg-gradient-to-br from-cream-50 via-cream-100 to-cream-50"
      onMouseMove={handleMouseMove}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated circles */}
        <motion.div
          className="absolute top-[10%] left-[15%] h-64 w-64 rounded-full bg-emerald-100/40 blur-xl"
          animate={{
            x: mousePosition.x * -30,
            y: mousePosition.y * -30,
          }}
          transition={{ type: "spring", damping: 15 }}
        />
        <motion.div
          className="absolute bottom-[20%] right-[10%] h-80 w-80 rounded-full bg-primary/20 blur-xl"
          animate={{
            x: mousePosition.x * -50,
            y: mousePosition.y * -50,
          }}
          transition={{ type: "spring", damping: 15 }}
        />

        {/* Animated nature elements */}
        <div className="absolute inset-0 opacity-10">
          {typeof window !== 'undefined' && Array.from({ length: 20 }).map((_, i) => {
            // Use fixed positions based on index instead of random values
            // This ensures server and client render the same positions
            const fixedPositions = [
              { left: "28.219281729595924%", top: "77.71235893773213%" },
              { left: "34.16898822915944%", top: "52.434585400114116%" },
              { left: "32.9223073855127%", top: "86.13010615980457%" },
              { left: "25.23893642651779%", top: "6.938742423181621%" },
              { left: "23.272624564642584%", top: "19.462188398989177%" },
              { left: "69.92376370218828%", top: "87.74252005939204%" },
              { left: "30.507450132436954%", top: "8.889666046405898%" },
              { left: "10.567160859735491%", top: "25.114775313023085%" },
              { left: "42.10871010711209%", top: "12.098063920053425%" },
              { left: "54.65668988018662%", top: "75.86708626336299%" },
              { left: "80.33039076564008%", top: "61.34422612852678%" },
              { left: "80.61242544889612%", top: "64.9551270923341%" },
              { left: "63.807885648627625%", top: "27.512361823416764%" },
              { left: "88.59353393572586%", top: "7.902298937823405%" },
              { left: "50.42961775420927%", top: "35.751021633363045%" },
              { left: "27.44105796402554%", top: "41.90080637217467%" },
              { left: "57.517943306496186%", top: "25.354818465207018%" },
              { left: "39.14566114048911%", top: "20.754959717937737%" },
              { left: "52.54229217739198%", top: "78.22657793091152%" },
              { left: "84.44781138482696%", top: "79.36980062833896%" }
            ];

            // Get the position for this element from our fixed positions array
            const position = fixedPositions[i];

            // Use fixed durations and delays based on index
            const fixedDuration = 3 + (i % 5);
            const fixedDelay = i % 5;

            return (
              <motion.div
                key={i}
                className="absolute"
                initial={{ y: 0, opacity: 0.5 }}
                animate={{
                  y: [0, -15, 0],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: fixedDuration,
                  repeat: Infinity,
                  repeatType: 'loop',
                  ease: 'easeInOut',
                  delay: fixedDelay * 0.3,
                  times: [0, 0.5, 1]
                }}
                style={{
                  position: 'absolute',
                  left: position.left,
                  top: position.top,
                  willChange: 'transform, opacity'
                }}
              >
                {i % 4 === 0 && <Leaf className="text-emerald-600" size={i % 2 === 0 ? 24 : 16} />}
                {i % 4 === 1 && <Droplets className="text-blue-600" size={i % 2 === 0 ? 24 : 16} />}
                {i % 4 === 2 && <Sun className="text-yellow-600" size={i % 2 === 0 ? 24 : 16} />}
                {i % 4 === 3 && <Wind className="text-teal-600" size={i % 2 === 0 ? 24 : 16} />}
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="container relative z-10 flex flex-col items-center justify-center min-h-[90vh] py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Text content - takes 7 columns on desktop */}
          <motion.div
            className="lg:col-span-7 space-y-8 text-center lg:text-left"
            initial="hidden"
            animate={mainControls}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.2,
                  when: "beforeChildren",
                  staggerDirection: 1
                }
              },
            }}
          >
            <motion.div
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { duration: 0.5 } },
              }}
            >
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
                <span className="relative inline-block">
                  <span className="relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-emerald-700 to-primary">
                    SOIL
                  </span>
                  <motion.span
                    className="absolute -bottom-2 left-0 h-3 w-full bg-emerald-200 rounded-full -z-10"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 1, duration: 0.8 }}
                  />
                </span>{" "}
                to{" "}
                <span className="relative inline-block">
                  <span className="relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-primary to-emerald-700">
                    SOUL
                  </span>
                  <motion.span
                    className="absolute -bottom-2 left-0 h-3 w-full bg-emerald-200 rounded-full -z-10"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 0.8, duration: 0.8, ease: "easeOut" }}
                  />
                </span>
              </h1>
              <motion.p
                className="text-xl md:text-2xl text-emerald-800 font-medium"
                initial={{ y: 40 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.8, duration: 0.8 }}
              >
                Connecting Nature, Knowledge & You
              </motion.p>
            </motion.div>

            <motion.div
              className="overflow-hidden"
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { duration: 0.5 } },
              }}
            >
              <motion.p
                className="text-lg md:text-xl text-primary font-semibold"
                initial={{ y: 40 }}
                animate={{ y: 0 }}
                transition={{ delay: 1, duration: 0.8 }}
              >
                One App, Infinite Green Possibilities!
              </motion.p>
            </motion.div>

            <motion.p
              className="text-base md:text-lg text-emerald-700 max-w-xl mx-auto lg:mx-0"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
              }}
            >
              Your one-stop destination for eco-friendly products, services, and knowledge. Save nature, grow nature,
              and create impact.
            </motion.p>

            <motion.div
              className="flex flex-wrap gap-4 justify-center lg:justify-start"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
              }}
            >
              <Button
                size="lg"
                className="group relative overflow-hidden bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-800 hover:to-emerald-700 text-white"
                onClick={() => router.push("/shop")}
              >
                <span className="relative z-10 flex items-center">
                  Shop Now
                  <motion.span
                    initial={{ x: -4, opacity: 0 }}
                    whileHover={{ x: 4, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </motion.span>
                </span>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="group relative overflow-hidden border-emerald-600 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50"
                onClick={() => router.push("/services")}
              >
                <span className="relative z-10 flex items-center">
                  Explore Services
                  <motion.span
                    initial={{ x: -4, opacity: 0 }}
                    whileHover={{ x: 4, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </motion.span>
                </span>
              </Button>
            </motion.div>

            <motion.div
              className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-emerald-800"
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { duration: 0.8, delay: 0.2 } },
              }}
            >
              {["100% Sustainable", "Ethically Sourced", "Carbon Neutral"].map((item, index) => (
                <motion.div
                  key={item}
                  className="flex items-center"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.4 + index * 0.2 }}
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 mr-2">
                    <svg className="h-4 w-4 text-emerald-700" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span>{item}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Image and 3D elements - takes 5 columns on desktop */}
          <motion.div
            className="lg:col-span-5 relative"
            initial="hidden"
            animate={mainControls}
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { duration: 0.8, delay: 0.4 } },
            }}
          >
            <div className="relative">
              {/* Main image with 3D effect */}
              <motion.div
                className="relative h-[400px] w-full rounded-2xl overflow-hidden shadow-2xl"
                style={{
                  transformStyle: "preserve-3d",
                  perspective: "1000px",
                }}
                animate={{
                  rotateY: mousePosition.x * 5,
                  rotateX: mousePosition.y * -5,
                }}
                transition={{ type: "spring", damping: 15 }}
              >
                <Image
                  src="/nature.jpg?height=600&width=600"
                  alt="Eco-friendly products"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/50 to-transparent" />

                {/* Floating elements over the image */}
                <motion.div
                  className="absolute top-6 right-6 bg-cream-50/90 backdrop-blur-sm p-3 rounded-lg shadow-lg"
                  animate={{
                    y: [0, -10, 0],
                    rotateZ: [0, 2, 0],
                  }}
                  transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                  style={{
                    transformStyle: "preserve-3d",
                    transform: "translateZ(20px)",
                  }}
                >
                  <Leaf className="h-8 w-8 text-emerald-700" />
                </motion.div>

                <motion.div
                  className="absolute bottom-6 left-6 bg-cream-50/90 backdrop-blur-sm p-3 rounded-lg shadow-lg"
                  animate={{
                    y: [0, 10, 0],
                    rotateZ: [0, -2, 0],
                  }}
                  transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                  style={{
                    transformStyle: "preserve-3d",
                    transform: "translateZ(30px)",
                  }}
                >
                  <Droplets className="h-8 w-8 text-blue-600" />
                </motion.div>
              </motion.div>

              {/* Decorative elements */}
              <motion.div
                className="absolute -top-8 -left-8 h-24 w-24 bg-emerald-100 rounded-full opacity-80"
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 10, 0],
                }}
                transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                style={{
                  transformStyle: "preserve-3d",
                  transform: "translateZ(-10px)",
                }}
              />
              <motion.div
                className="absolute -bottom-10 -right-10 h-32 w-32 bg-primary/20 rounded-full opacity-80"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, -10, 0],
                }}
                transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                style={{
                  transformStyle: "preserve-3d",
                  transform: "translateZ(-20px)",
                }}
              />

              {/* Animated stats card */}
              <motion.div
                className="absolute -right-5 top-1/2 transform -translate-y-1/2 bg-cream-50 rounded-xl shadow-xl p-4 w-32"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.6, duration: 0.8 }}
                style={{
                  transformStyle: "preserve-3d",
                  transform: "translateZ(40px)",
                }}
              >
                <motion.div>
                  <p className="text-xs text-emerald-800 font-medium">Impact</p>
                  <p className="text-2xl font-bold text-emerald-700">10K+</p>
                  <p className="text-xs text-emerald-800">Trees Planted</p>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{
          y: [0, 10, 0],
        }}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      >
        <div className="flex flex-col items-center">
          <p className="text-sm text-emerald-800 mb-2">Scroll to explore</p>
          <div className="h-10 w-6 border-2 border-emerald-400 rounded-full flex justify-center">
            <motion.div
              className="h-2 w-2 bg-emerald-600 rounded-full"
              animate={{
                y: [0, 12, 0],
              }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            />
          </div>
        </div>
      </motion.div>
    </section>
  )
}