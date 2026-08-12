"use client";

import { motion } from "motion/react";

export function CelebrationEffect({ show }: { show: boolean }) {
  if (!show) return null;

  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 1.5 + Math.random() * 1,
    color: ["#f59e0b", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899"][Math.floor(Math.random() * 5)],
    size: 4 + Math.random() * 6,
  }));

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{ y: -20, x: `${particle.x}vw`, opacity: 1, scale: 0 }}
          animate={{
            y: "100vh",
            opacity: [1, 1, 0],
            scale: [0, 1.5, 0.5],
            rotate: [0, 360],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            ease: "easeOut",
          }}
          className="absolute"
          style={{
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
          }}
        />
      ))}
    </div>
  );
}
