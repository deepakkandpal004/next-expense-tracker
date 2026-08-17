"use client";

export function RainbowStyles() {
  return (
    <style>{`
      .rainbow::before {
        content: '';
        position: absolute;
        z-index: -2;
        left: -50%;
        top: -50%;
        width: 200%;
        height: 200%;
        background-position: 100% 50%;
        background-repeat: no-repeat;
        background-size: 50% 30%;
        background-image: linear-gradient(
          90deg,
          #22D3EE,
          #38BDF8,
          #A78BFA,
          #22D3EE
        );
      }
    `}</style>
  );
}
