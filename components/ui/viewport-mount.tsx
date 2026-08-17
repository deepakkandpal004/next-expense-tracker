"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface ViewportMountProps {
  children: ReactNode;
  fallback?: ReactNode;
  rootMargin?: string;
  className?: string;
}

/** Delays expensive client-only content until it is close to the viewport. */
export function ViewportMount({
  children,
  fallback = null,
  rootMargin = "240px",
  className,
}: ViewportMountProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || mounted) return;
    if (!("IntersectionObserver" in window)) {
      setMounted(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setMounted(true);
        observer.disconnect();
      },
      { rootMargin },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [mounted, rootMargin]);

  return <div className={className} ref={ref}>{mounted ? children : fallback}</div>;
}
