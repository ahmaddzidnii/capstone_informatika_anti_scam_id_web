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
        // 1. Hero Entrance: lebih snappy (expo.out), jarak pendek + subtle scale
        gsap.from("[data-animate='hero']", {
          y: 18,
          scale: 0.985,
          opacity: 0,
          duration: 0.85,
          stagger: 0.08,
          ease: "expo.out",
          clearProps: "transform",
        });

        // 2. Hero Showcase Center: muncul dengan depth (scale + perspective)
        gsap.fromTo(
          "[data-animate='collage-center']",
          {
            y: 36,
            scale: 0.94,
            opacity: 0,
          },
          {
            y: 0,
            scale: 1,
            opacity: 1,
            duration: 1,
            delay: 0.2,
            ease: "expo.out",
          },
        );

        // Side card masuk dari samping + sedikit miring biar berasa floating layer
        gsap.from("[data-animate='collage-side']", {
          x: -24,
          y: 28,
          rotation: -3,
          scale: 0.92,
          opacity: 0,
          duration: 1,
          delay: 0.32,
          stagger: 0.1,
          ease: "expo.out",
        });

        // 3. Scroll-linked Depth & Parallax di Showcase
        const showcaseTl = gsap.timeline({
          scrollTrigger: {
            trigger: "[data-animate='collage-wrap']",
            start: "top 75%",
            end: "bottom top",
            scrub: 0.8,
          },
        });

        showcaseTl
          .to(
            "[data-animate='collage-center']",
            {
              y: -18,
              scale: 1.025,
              ease: "none",
            },
            0,
          )
          .to(
            "[data-animate='collage-left']",
            {
              y: -42,
              x: -10,
              rotation: -2,
              ease: "none",
            },
            0,
          )
          .to(
            "[data-animate='collage-right']",
            {
              y: 32,
              x: 10,
              rotation: 2,
              ease: "none",
            },
            0,
          );

        // 4. Scroll Reveal untuk section bawah: crisp scale-up + stagger anak elemen
        const revealEls = gsap.utils.toArray<HTMLElement>(
          "[data-animate='reveal']",
        );

        revealEls.forEach((el) => {
          gsap.from(el, {
            y: 24,
            scale: 0.975,
            opacity: 0,
            duration: 0.85,
            ease: "expo.out",
            clearProps: "transform",
            scrollTrigger: {
              trigger: el,
              start: "top 86%",
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
