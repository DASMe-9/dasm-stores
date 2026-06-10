"use client";

import { useState, useEffect, useCallback } from "react";
import { Grid, ChevronRight, ChevronLeft, X } from "lucide-react";
import { proxiedProductImageSrc } from "@/lib/image-proxy";

export function ProductGallery({
  images,
  alt,
}: {
  images: { url: string; alt_text?: string | null }[];
  alt: string;
}) {
  const list = images?.length ? images : [];
  const [idx, setIdx] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Auto-slide for mobile carousel or arrow keys
  const handlePrev = useCallback(() => {
    setIdx((prev) => (prev === 0 ? list.length - 1 : prev - 1));
  }, [list.length]);

  const handleNext = useCallback(() => {
    setIdx((prev) => (prev === list.length - 1 ? 0 : prev + 1));
  }, [list.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isModalOpen) return;
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "Escape") setIsModalOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen, handlePrev, handleNext]);

  if (!list.length) {
    return (
      <div className="flex aspect-square md:h-[500px] items-center justify-center rounded-3xl border border-border bg-muted/50 text-sm text-muted-foreground">
        لا توجد صور
      </div>
    );
  }

  const mainSrc = proxiedProductImageSrc(list[idx].url) ?? list[idx].url;
  const desktopMainSrc = proxiedProductImageSrc(list[0].url) ?? list[0].url;

  return (
    <>
      {/* Mobile Layout: Carousel with Dots */}
      <div className="md:hidden space-y-4">
        <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-muted border border-border">
          <div 
            className="absolute inset-0 opacity-40 blur-3xl scale-110"
            style={{ backgroundImage: `url(${mainSrc})`, backgroundPosition: 'center', backgroundSize: 'cover' }}
          />
          <img
            src={mainSrc}
            alt={list[idx].alt_text || alt}
            className="absolute inset-0 w-full h-full object-contain drop-shadow-xl"
          />
          {list.length > 1 && (
            <>
              <button onClick={handleNext} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg text-foreground">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={handlePrev} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg text-foreground">
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
        
        {/* Pagination Dots */}
        {list.length > 1 && (
          <div className="flex justify-center items-center gap-2 pb-2">
            {list.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`transition-all duration-300 rounded-full ${
                  i === idx ? "w-6 h-2 bg-primary" : "w-2 h-2 bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Desktop Layout: Asymmetric Masonry Grid */}
      <div className="hidden md:grid grid-cols-12 gap-4 h-[500px] relative">
        {/* Right column (RTL layout) - 2 Stacked Squares */}
        {list.length > 1 && (
          <div className="col-span-4 flex flex-col gap-4 h-full">
            {list.slice(1, 3).map((im, i) => {
              const src = proxiedProductImageSrc(im.url) ?? im.url;
              return (
                <div key={i} className="relative w-full h-[calc(50%-0.5rem)] rounded-3xl overflow-hidden bg-muted border border-border group cursor-pointer" onClick={() => { setIdx(i + 1); setIsModalOpen(true); }}>
                  <img src={src} alt={im.alt_text || alt} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                </div>
              );
            })}
            {/* If only 2 images total, fill the bottom slot with the main image again or keep it empty. 
                Actually, let's just make the first one take full height if only 2 images. */}
            {list.length === 2 && (
              <div className="relative w-full h-[calc(50%-0.5rem)] rounded-3xl overflow-hidden bg-muted/50 border border-dashed border-border flex items-center justify-center">
                <Grid className="w-8 h-8 text-muted-foreground/50" />
              </div>
            )}
          </div>
        )}

        {/* Left column (Main Image) */}
        <div className={`relative h-full overflow-hidden rounded-3xl border border-border bg-muted group cursor-pointer ${list.length > 1 ? 'col-span-8' : 'col-span-12'}`} onClick={() => { setIdx(0); setIsModalOpen(true); }}>
          <div 
            className="absolute inset-0 opacity-40 blur-3xl scale-110"
            style={{ backgroundImage: `url(${desktopMainSrc})`, backgroundPosition: 'center', backgroundSize: 'cover' }}
          />
          <img
            src={desktopMainSrc}
            alt={list[0].alt_text || alt}
            className="absolute inset-0 w-full h-full object-contain p-4 drop-shadow-2xl transition-transform duration-700 group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
        </div>

        {/* "Show all photos" Button */}
        {list.length > 0 && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="absolute bottom-6 left-6 z-10 flex items-center gap-2 bg-background/90 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-lg border border-border/50 hover:bg-background hover:scale-105 transition-all text-sm font-bold text-foreground"
          >
            <Grid className="w-4 h-4" />
            عرض كل الصور ({list.length})
          </button>
        )}
      </div>

      {/* Lightbox Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl">
          <button 
            onClick={() => setIsModalOpen(false)}
            className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-50"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="relative w-full max-w-6xl aspect-[4/3] md:aspect-[16/9] flex items-center justify-center px-4 md:px-20">
            <img
              src={proxiedProductImageSrc(list[idx].url) ?? list[idx].url}
              alt={list[idx].alt_text || alt}
              className="max-w-full max-h-full object-contain drop-shadow-2xl select-none"
            />
          </div>

          {list.length > 1 && (
            <>
              <button 
                onClick={(e) => { e.stopPropagation(); handleNext(); }}
                className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
              
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3">
                {list.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setIdx(i)}
                    className={`transition-all duration-300 rounded-full ${
                      i === idx ? "w-10 h-2 bg-white" : "w-2 h-2 bg-white/30 hover:bg-white/60"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
