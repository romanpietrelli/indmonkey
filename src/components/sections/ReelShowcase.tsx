"use client";

import React, { useRef } from "react";
import Link from "next/link";

const reels = [
  { id: 1, video: '/reel-1.mp4', link: 'https://instagram.com/p/...' },
  { id: 2, video: '/reel-2.mp4', link: 'https://instagram.com/p/...' },
  { id: 3, video: '/reel-3.mp4', link: 'https://instagram.com/p/...' }
];

export function ReelShowcase() {
  return (
    <section className="w-full bg-[#000000] py-16 md:py-24 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-white text-sm md:text-base font-bold tracking-widest uppercase font-sans">
            INSTAGRAM DROPS • -&gt;
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {reels.map((reel) => (
            <ReelCard key={reel.id} reel={reel} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ReelCard({ reel }: { reel: typeof reels[0] }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current.play().catch((err) => {
        console.warn("Video autoplay failed:", err);
      });
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      // Optional: reset to beginning when hover ends
      // videoRef.current.currentTime = 0;
    }
  };

  return (
    <Link 
      href={reel.link} 
      target="_blank" 
      rel="noopener noreferrer"
      className="relative block w-full aspect-[9/16] rounded-2xl border border-white/10 shadow-2xl overflow-hidden group bg-neutral-900 cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleMouseEnter} // For mobile interaction
    >
      <video
        ref={videoRef}
        src={reel.video}
        loop
        playsInline
        preload="metadata"
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      
      {/* Overlay to subtly indicate it's a video/link */}
      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-500" />
      
      {/* Play Icon Indicator */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-white translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
