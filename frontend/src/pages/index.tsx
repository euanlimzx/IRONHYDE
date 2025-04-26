"use client";

import { useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";

export default function IronhideLanding() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const setCanvasDimensions = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    setCanvasDimensions();
    window.addEventListener("resize", setCanvasDimensions);

    const drawGrid = () => {
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const gridSize = 50;
      ctx.strokeStyle = "#444444"; // darker grid lines
      ctx.lineWidth = 1;

      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
    };

    const animate = () => {
      drawGrid();
      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", setCanvasDimensions);
    };
  }, []);

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden bg-black text-white"
      style={{
        backgroundImage: `
      linear-gradient(to right, rgba(30, 30, 30, 0.2), rgba(0, 0, 0, 0.1)),
      linear-gradient(to bottom, rgba(20, 20, 20, 0.2), rgba(0, 0, 0, 0.1)),
      linear-gradient(rgba(30, 30, 30, 0.4) 1px, transparent 1px),
      linear-gradient(90deg, rgba(30, 30, 30, 0.4) 1px, transparent 1px)
    `,
        backgroundSize: "100% 100%, 100% 100%, 50px 50px, 50px 50px",
      }}
    >
      {/* Vignette overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-10 bg-black opacity-40 mix-blend-multiply"
        style={{
          maskImage:
            "radial-gradient(ellipse at center, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 80%)",
        }}
      />

      {/* Bottom gradient overlay */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-[25vh] bg-gradient-to-t from-black to-transparent" />

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0"
        style={{ filter: "contrast(1.1)" }}
      />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4">
        <div className="max-w-3xl text-center">
          <h1 className="mb-6 text-5xl font-bold tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl">
            <span className="bg-gradient-to-r from-slate-200 via-slate-100 to-slate-300 bg-clip-text text-transparent">
              IRONHYDE.AI
            </span>
          </h1>

          <div className="mx-auto max-w-xl">
            <p className="text-sm text-slate-400 sm:text-base md:text-lg">
              End-to-end blackbox testing powered by AI agents
            </p>
          </div>
          <div className="flex items-center justify-center space-x-4 pt-5">
            <Input
              className="h-12 border border-gray-800 bg-black"
              placeholder="Enter your website URL"
            />{" "}
            {/* Make sure Input has a fixed height */}
            <div className="font-extrabold inline-flex h-12 animate-pulse items-center rounded bg-gradient-to-r from-slate-700 via-slate-800 to-slate-700 px-6 text-sm text-white shadow-lg">
              RUN TESTS
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
