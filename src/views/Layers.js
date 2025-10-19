import React, { useContext, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { useGSAP } from "@gsap/react";

import TransitionContext from "../context/TransitionContext";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

export default function Layers() {
  const main = useRef();
  const { completed } = useContext(TransitionContext);
  const scrollTween = useRef();
  const snapTriggers = useRef([]);

  const { contextSafe } = useGSAP(
    () => {
      if (!completed) return;

      // Отложим запуск на один кадр после layout
      requestAnimationFrame(() => {
        let panels = gsap.utils.toArray(".panel");
        if (!panels.length) return;

        let scrollStarts = [0];
        let snapScroll = (value) => value;

        // Очистка старых триггеров перед пересозданием
        ScrollTrigger.getAll().forEach((t) => t.kill());

        panels.forEach((panel, i) => {
          snapTriggers.current[i] = ScrollTrigger.create({
            trigger: panel,
            start: "top top",
          });
        });

        ScrollTrigger.addEventListener("refresh", () => {
          scrollStarts = snapTriggers.current.map((trigger) => trigger.start);
          snapScroll = ScrollTrigger.snapDirectional(scrollStarts);
        });

        ScrollTrigger.observe({
          type: "wheel,touch",
          onChangeY(self) {
            if (!scrollTween.current) {
              let scroll = snapScroll(
                self.scrollY() + self.deltaY,
                self.deltaY > 0 ? 1 : -1
              );
              goToSection(scrollStarts.indexOf(scroll));
            }
          },
        });

        ScrollTrigger.refresh();
      });
    },
    { dependencies: [completed], scope: main, revertOnUpdate: true }
  );

  const goToSection = contextSafe((i) => {
    if (i < 0 || !snapTriggers.current[i]) return;
    scrollTween.current = gsap.to(window, {
      scrollTo: { y: snapTriggers.current[i].start, autoKill: false },
      duration: 1,
      ease: "power2.inOut",
      onComplete: () => (scrollTween.current = null),
      overwrite: true,
    });
  });

  // 🔹 Дополнительно: после монтирования перезапусти refresh для мобильных
  useEffect(() => {
    const timeout = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 300);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <main ref={main}>
      <section className="description panel light">
        <div>
          <h1>Layered pinning</h1>
          <p>Use pinning to layer panels on top of each other as you scroll.</p>
          <div className="scroll-down">
            Scroll down<div className="arrow"></div>
          </div>
        </div>
      </section>
      <section className="panel dark">ONE</section>
      <section className="panel purple">TWO</section>
      <section className="panel orange">THREE</section>
      <section className="panel red">FOUR</section>
    </main>
  );
}
