import { useEffect } from "react";

/**
 * Observes all .rk-reveal elements within the current page and adds
 * .in-view as they scroll into the viewport (mirrors the old shared.js
 * rkInitScrollReveal helper from the static prototype). Content is visible
 * by default per the CSS in theme.css — this only adds the entrance stagger.
 */
export function useScrollReveal(deps: React.DependencyList = []) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".rk-reveal");
    if (!els.length) return;

    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("in-view"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
