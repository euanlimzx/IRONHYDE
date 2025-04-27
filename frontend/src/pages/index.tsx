"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import InterfacePage from "./interface";
import axios from "axios";

function generateUUID() {
  return crypto.randomUUID(); // This method generates a unique UUID.
}

export default function IronhideLanding() {
  const [running, setRunning] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const [transformedData, setTransformedData] = useState(null);
  const [currRouteNodes, setCurrRouteNodes] = useState(null);
  const [domain, setDomain] = useState<string>("");
  const [routes, setRoutes] = useState<string[]>([]);
  const [currRoute, setCurrRoute] = useState(null);

  const fetchTestData = async () => {
    if (!domain) {
      return;
    }
    let data = JSON.stringify({
      targetUrl: domain,
    });

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "http://64.23.190.48:3001/crawl-and-get-tests",
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };

    try {
      // Send the request and wait for the response
      const response = await axios.request(config);
      return response.data; // Return the API response data
    } catch (error) {
      console.error("Error fetching test data:", error);
      throw error; // Propagate the error for further handling if needed
    }
  };

  const runTests = async () => {
    setRunning(true); // trigger the InterfacePage display
    // Add the page_url to the Set of URLs
    setTimeout(() => setFadeIn(true), 50); // delay fade-in effect for smooth transition
    const prevUrls = new Set();
    const initialData = await fetchTestData();
    if (!initialData) {
      setRunning(false);
      return;
    }
    const transformedData = initialData.flatMap((page) =>
      page.interactions.map((interaction) => {
        // Add the page_url to the Set of URLs
        prevUrls.add(page.page_url);
        return {
          id: generateUUID(),
          name: interaction.interaction_description,
          children: [],
          page_url: page.page_url,
          expected_result: interaction.expected_result,
        };
      })
    );
    const routeArr = Array.from(prevUrls);
    setRoutes(routeArr);
    setTransformedData(transformedData);
  };

  useEffect(() => {
    if (routes.length > 0) {
      setCurrRoute(routes[0]);
    }
  }, [routes]);

  useEffect(() => {
    if (transformedData) {
      const filteredData = transformedData.filter(
        (item) => item.page_url === currRoute
      );
      setCurrRouteNodes(filteredData);
    }
  }, [currRoute]);

  return (
    <>
      {running ? (
        <div
          className={`transition-opacity duration-3000 ${
            fadeIn ? "opacity-100" : "opacity-0"
          }`}
        >
          <InterfacePage
            key={JSON.stringify(currRouteNodes)}
            currRouteNodes={currRouteNodes}
            domain={domain}
            routes={routes}
            currRoute={currRoute}
            setCurrRoute={setCurrRoute}
          />
        </div>
      ) : (
        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4">
          <div className="max-w-3xl text-center">
            <h1 className="mb-6 text-5xl font-bold tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl">
              <div className="flex justify-center items-center">
                <span className="bg-gradient-to-r from-slate-200 via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  IRONHYDE
                </span>
              </div>
            </h1>

            <div className="mx-auto max-w-xl">
              <p className="animate-pulse text-slate-400 md:text-2xl bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 bg-clip-text text-transparent">
                End-to-end blackbox testing powered by AI agents
              </p>
            </div>
            <div className="flex items-center justify-center space-x-4 pt-5">
              <Input
                className="h-12 border border-gray-800 bg-black"
                placeholder="Enter your website URL"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
              />{" "}
              {/* Make sure Input has a fixed height */}
              <div
                onClick={runTests}
                className="flex font-extrabold w-1/2 justify-center h-12 items-center rounded bg-gradient-to-r from-slate-700 via-slate-800 to-slate-700 px-6 text-sm text-white shadow-lg cursor-pointer hover:text-slate-400"
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
