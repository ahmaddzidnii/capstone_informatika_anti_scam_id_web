"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function LandingAnimator({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // 1. Hero Entrance (stagger halus saat load)
        gsap.from("[data-animate='hero']", {
          y: 22,
          opacity: 0,
          duration: 0.75,
          stagger: 0.1,
          ease: "power3.out",
          clearProps: "transform",
        });

        // 2. Hero Collage Cards (masuk bertahap + efek parallax halus saat scroll)
        gsap.from("[data-animate='collage-center']", {
          y: 30,
          opacity: 0,
          duration: 0.85,
          delay: 0.25,
          ease: "power3.out",
        });

        gsap.from("[data-animate='collage-side']", {
          y: 40,
          opacity: 0,
          duration: 0.85,
          delay: 0.35,
          stagger: 0.12,
          ease: "power3.out",
        });

        gsap.to("[data-animate='collage-left']", {
          y: -28,
          ease: "none",
          scrollTrigger: {
            trigger: "[data-animate='collage-wrap']",
            start: "top bottom",
            end: "bottom top",
            scrub: 0.6,
          },
        });

        gsap.to("[data-animate='collage-right']", {
          y: 28,
          ease: "none",
          scrollTrigger: {
            trigger: "[data-animate='collage-wrap']",
            start: "top bottom",
            end: "bottom top",
            scrub: 0.6,
          },
        });

        // 3. Scroll Reveal untuk section bawah (Video, Fitur, FAQ)
        const revealEls = gsap.utils.toArray<HTMLElement>(
          "[data-animate='reveal']",
        );

        revealEls.forEach((el) => {
          gsap.from(el, {
            y: 28,
            opacity: 0,
            duration: 0.75,
            ease: "power2.out",
            clearProps: "transform",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              once: true,
            },
          });
        });
      });
    },
    { scope: containerRef },
  );

  return <div ref={containerRef}>{children}</div>;
}
