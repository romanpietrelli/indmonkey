"use client";

import { useState, useRef } from "react";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { motion } from "framer-motion";

export interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  secondaryImageUrl?: string;
  videoUrl?: string;
  slug: string;
  active?: boolean;
}

export function ProductCard({
  name,
  price,
  imageUrl,
  secondaryImageUrl,
  videoUrl,
  slug,
  active = true,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current && videoUrl) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current && videoUrl) {
      videoRef.current.pause();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full"
      style={{ height: "480px" }}
    >
      <Link
        href={`/producto/${slug}`}
        className="group relative flex flex-col w-full h-full overflow-hidden cursor-pointer"
        style={{ background: "var(--color-card)" }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* BADGE COMING SOON */}
        {!active && (
          <div className="absolute top-4 left-4 z-20 uppercase tracking-widest text-xs px-3 py-1 font-bold shadow"
            style={{ background: "var(--color-primary)", color: "var(--color-primary-foreground)" }}
          >
            Coming Soon
          </div>
        )}

        {/* MEDIA CONTAINER */}
        <div className="relative flex-grow overflow-hidden"
          style={{ background: "hsl(0 0% 12%)" }}
        >
          {/* VIDEO on hover */}
          {videoUrl && (
            <video
              ref={videoRef}
              src={videoUrl}
              muted
              loop
              playsInline
              className={cn(
                "absolute inset-0 w-full h-full object-cover z-10 transition-opacity duration-500",
                isHovered ? "opacity-100" : "opacity-0"
              )}
            />
          )}

          {/* SECOND IMAGE on hover */}
          {secondaryImageUrl && !videoUrl && (
            <img
              src={secondaryImageUrl}
              alt={`${name} hover`}
              className={cn(
                "absolute inset-0 w-full h-full object-cover z-10 transition-opacity duration-700",
                isHovered ? "opacity-100" : "opacity-0"
              )}
            />
          )}

          {/* IMAGE */}
          <img
            src={imageUrl}
            alt={name}
            className={cn(
              "absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-110",
              isHovered && (videoUrl || secondaryImageUrl) ? "opacity-0" : "opacity-100"
            )}
          />

          {/* PLAY ICON indicator */}
          {videoUrl && !isHovered && (
            <div className="absolute bottom-3 right-3 z-20 p-2 rounded-full backdrop-blur-sm"
              style={{ background: "rgba(0,0,0,0.5)" }}
            >
              <Play className="w-4 h-4 text-white fill-white" />
            </div>
          )}
        </div>

        {/* PRODUCT INFO */}
        <div className="p-5 flex flex-col gap-1 z-20 relative border-t"
          style={{ borderColor: "var(--color-border)", background: "var(--color-card)" }}
        >
          <h3 className="text-sm font-medium uppercase tracking-wider truncate"
            style={{ color: "var(--color-muted-foreground)" }}
          >
            {name}
          </h3>
          <p className="text-2xl font-black tracking-tight"
            style={{ color: "var(--color-foreground)" }}
          >
            ${price.toLocaleString("es-AR")}
          </p>
        </div>

        {/* HOVER BORDER EFFECT */}
        <div
          className="absolute inset-0 pointer-events-none border-2 border-transparent group-hover:border-white transition-colors duration-300 z-30"
        />
      </Link>
    </motion.div>
  );
}
