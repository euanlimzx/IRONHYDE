"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import InterfacePage from "./interface";

export default function IronhideLanding() {
  const [running, setRunning] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const [data, setData] = useState(null);
  const [domain, setDomain] = useState(null);

  const initialData = {
    urls: [
      "https://www.example.com/services/web-development",
      "https://www.example.com/about/team",
      "https://www.example.com/contact/customer-support",
      "https://www.example.com/store/clothing/menswear",
      "https://www.example.com/resources/tutorials/react",
    ],
    interactions: [
      { id: "1", name: "Click the blue button on the top right", children: [] },
      { id: "2", name: "Scroll down to reveal more options", children: [] },
      {
        id: "3",
        name: "Hover over the menu to expand it",
        children: [
          {
            id: "c1",
            name: "Drag the slider to adjust brightness",
            children: [],
          },
          {
            id: "c2",
            name: "Double-click the icon to open settings",
            children: [],
          },
          { id: "c3", name: "Tap and hold to see quick actions", children: [] },
        ],
      },
      {
        id: "4",
        name: "Click on a user to open their profile",
        children: [
          {
            id: "d1",
            name: "Send a message by clicking the chat icon",
            children: [],
          },
          {
            id: "d2",
            name: "Mute notifications using the bell icon",
            children: [],
          },
          {
            id: "d3",
            name: "Start a video call from the top menu",
            children: [],
          },
        ],
      },
    ],
  };

  const runTests = () => {
    setRunning(true); // trigger the InterfacePage display
    setDomain("https://www.example.com");
    setTimeout(() => setFadeIn(true), 50); // delay fade-in effect for smooth transition
    const timer = setTimeout(() => {
      setData(initialData);
    }, 1000); // 5 seconds delay
  };

  return (
    <>
      {running ? (
        <div
          className={`transition-opacity duration-3000 ${
            fadeIn ? "opacity-100" : "opacity-0"
          }`}
        >
          <InterfacePage payload={data} domain={domain} />
        </div>
      ) : (
        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4">
          <div className="max-w-3xl text-center">
            <h1 className="mb-6 text-5xl font-bold tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl">
              <span className="bg-gradient-to-r from-slate-200 via-slate-100 to-slate-300 bg-clip-text text-transparent">
                IRONHYDE
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
              <div
                onClick={runTests}
                className="font-extrabold inline-flex h-12 items-center rounded bg-gradient-to-r from-slate-700 via-slate-800 to-slate-700 px-6 text-sm text-white shadow-lg cursor-pointer"
              >
                RUN TESTS
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
