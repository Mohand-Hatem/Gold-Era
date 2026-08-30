"use client"

import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from "react"
import { FaArrowLeft, FaArrowRight } from "react-icons/fa"
import { motion, AnimatePresence } from "framer-motion"

export interface Testimonial {
  quote: string
  name: string
  designation: string
  src: string
}

export interface Colors {
  name?: string
  designation?: string
  testimony?: string
  arrowBackground?: string
  arrowForeground?: string
  arrowHoverBackground?: string
}

export interface FontSizes {
  name?: string
  designation?: string
  quote?: string
}

export interface CircularTestimonialsProps {
  testimonials: Testimonial[]
  autoplay?: boolean
  colors?: Colors
  fontSizes?: FontSizes
}

function calculateGap(width: number) {
  const minWidth = 1024
  const maxWidth = 1456
  const minGap = 60
  const maxGap = 86
  if (width <= minWidth) return minGap
  if (width >= maxWidth)
    return Math.max(minGap, maxGap + 0.06018 * (width - maxWidth))
  return minGap + (maxGap - minGap) * ((width - minWidth) / (maxWidth - minWidth))
}

export const CircularTestimonials = ({
  testimonials,
  autoplay = true,
  colors = {},
  fontSizes = {},
}: CircularTestimonialsProps) => {
  // Color & font config
  const colorName = colors.name
  const colorDesignation = colors.designation
  const colorTestimony = colors.testimony
  const colorArrowBg = colors.arrowBackground ?? "#2563eb"
  const colorArrowFg = colors.arrowForeground ?? "#ffffff"
  const colorArrowHoverBg = colors.arrowHoverBackground ?? "#1d4ed8"
  const fontSizeName = fontSizes.name ?? "1.5rem"
  const fontSizeDesignation = fontSizes.designation ?? "0.925rem"
  const fontSizeQuote = fontSizes.quote ?? "1.125rem"

  // State
  const [activeIndex, setActiveIndex] = useState(0)
  const [hoverPrev, setHoverPrev] = useState(false)
  const [hoverNext, setHoverNext] = useState(false)
  const [containerWidth, setContainerWidth] = useState(1200)

  const imageContainerRef = useRef<HTMLDivElement>(null)
  const autoplayIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const testimonialsLength = useMemo(() => testimonials.length, [testimonials])
  const activeTestimonial = useMemo(
    () => testimonials[activeIndex],
    [activeIndex, testimonials]
  )

  // Responsive gap calculation
  useEffect(() => {
    function handleResize() {
      if (imageContainerRef.current) {
        setContainerWidth(imageContainerRef.current.offsetWidth)
      }
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Navigation handlers
  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % testimonialsLength)
    if (autoplayIntervalRef.current) clearInterval(autoplayIntervalRef.current)
  }, [testimonialsLength])

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + testimonialsLength) % testimonialsLength)
    if (autoplayIntervalRef.current) clearInterval(autoplayIntervalRef.current)
  }, [testimonialsLength])

  // Autoplay
  useEffect(() => {
    if (autoplay) {
      autoplayIntervalRef.current = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % testimonialsLength)
      }, 5000)
    }
    return () => {
      if (autoplayIntervalRef.current) clearInterval(autoplayIntervalRef.current)
    }
  }, [autoplay, testimonialsLength])

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrev()
      if (e.key === "ArrowRight") handleNext()
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [handleNext, handlePrev])

  // Compute transforms for each image (always show 3: left, center, right)
  function getImageStyle(index: number): React.CSSProperties {
    const gap = calculateGap(containerWidth)
    const maxStickUp = gap * 0.8
    const isActive = index === activeIndex
    const isLeft = (activeIndex - 1 + testimonialsLength) % testimonialsLength === index
    const isRight = (activeIndex + 1) % testimonialsLength === index

    if (isActive) {
      return {
        zIndex: 3,
        opacity: 1,
        pointerEvents: "auto",
        transform: `translateX(0px) translateY(0px) scale(1) rotateY(0deg)`,
        transition: "all 0.8s cubic-bezier(.4,2,.3,1)",
      }
    }
    if (isLeft) {
      return {
        zIndex: 2,
        opacity: 1,
        pointerEvents: "auto",
        transform: `translateX(-${gap}px) translateY(-${maxStickUp}px) scale(0.85) rotateY(15deg)`,
        transition: "all 0.8s cubic-bezier(.4,2,.3,1)",
      }
    }
    if (isRight) {
      return {
        zIndex: 2,
        opacity: 1,
        pointerEvents: "auto",
        transform: `translateX(${gap}px) translateY(-${maxStickUp}px) scale(0.85) rotateY(-15deg)`,
        transition: "all 0.8s cubic-bezier(.4,2,.3,1)",
      }
    }
    // Hide all other images
    return {
      zIndex: 1,
      opacity: 0,
      pointerEvents: "none",
      transition: "all 0.8s cubic-bezier(.4,2,.3,1)",
    }
  }

  // Framer Motion variants for quote
  const quoteVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  }

  return (
    <div className="testimonial-container w-full max-w-5xl px-4 sm:px-6 py-8">
      <div className="testimonial-grid grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
        {/* Images Perspective 3D Carousel */}
        <div className="image-container relative w-full h-72 sm:h-96 [perspective:1000px]" ref={imageContainerRef}>
          {testimonials.map((testimonial, index) => (
            <img
              key={testimonial.src}
              src={testimonial.src}
              alt={testimonial.name}
              className="testimonial-image absolute inset-0 w-full h-full object-cover rounded-3xl shadow-2xl border-4 border-white/80 dark:border-slate-800"
              data-index={index}
              style={getImageStyle(index)}
            />
          ))}
        </div>

        {/* Content Box with Framer Motion Text */}
        <div className="testimonial-content flex flex-col justify-between space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              variants={quoteVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="space-y-3 min-h-[160px]"
            >
              <div>
                <h3
                  className="font-bold tracking-tight text-slate-900 dark:text-white"
                  style={{
                    color: colorName,
                    fontSize: fontSizeName,
                  }}
                >
                  {activeTestimonial.name}
                </h3>
                <p
                  className="text-slate-500 dark:text-slate-400 font-medium"
                  style={{
                    color: colorDesignation,
                    fontSize: fontSizeDesignation,
                  }}
                >
                  {activeTestimonial.designation}
                </p>
              </div>

              <motion.p
                className="quote text-slate-700 dark:text-slate-200 leading-relaxed font-normal italic"
                style={{
                  color: colorTestimony,
                  fontSize: fontSizeQuote,
                }}
              >
                &ldquo;
                {activeTestimonial.quote.split(" ").map((word, i) => (
                  <motion.span
                    key={i}
                    initial={{
                      filter: "blur(8px)",
                      opacity: 0,
                      y: 5,
                    }}
                    animate={{
                      filter: "blur(0px)",
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      duration: 0.22,
                      ease: "easeInOut",
                      delay: 0.02 * i,
                    }}
                    style={{ display: "inline-block" }}
                  >
                    {word}&nbsp;
                  </motion.span>
                ))}
                &rdquo;
              </motion.p>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          <div className="arrow-buttons flex items-center gap-3 pt-2">
            <button
              type="button"
              className="arrow-button flex h-11 w-11 items-center justify-center rounded-2xl shadow-md transition-all active:scale-90"
              onClick={handlePrev}
              style={{
                backgroundColor: hoverPrev ? colorArrowHoverBg : colorArrowBg,
              }}
              onMouseEnter={() => setHoverPrev(true)}
              onMouseLeave={() => setHoverPrev(false)}
              aria-label="Previous testimonial"
            >
              <FaArrowLeft size={16} color={colorArrowFg} />
            </button>
            <button
              type="button"
              className="arrow-button flex h-11 w-11 items-center justify-center rounded-2xl shadow-md transition-all active:scale-90"
              onClick={handleNext}
              style={{
                backgroundColor: hoverNext ? colorArrowHoverBg : colorArrowBg,
              }}
              onMouseEnter={() => setHoverNext(true)}
              onMouseLeave={() => setHoverNext(false)}
              aria-label="Next testimonial"
            >
              <FaArrowRight size={16} color={colorArrowFg} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CircularTestimonials
