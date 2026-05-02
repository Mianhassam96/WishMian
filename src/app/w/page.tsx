"use client";

import dynamic from "next/dynamic";

// Dynamically import to avoid SSR issues (uses window.location)
const WishViewer = dynamic(() => import("@/components/WishViewer"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#05050a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <span
        style={{
          color: "rgba(255,255,255,0.3)",
          fontSize: "0.7rem",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
        }}
      >
        Opening...
      </span>
    </div>
  ),
});

export default function WishPage() {
  return <WishViewer />;
}
