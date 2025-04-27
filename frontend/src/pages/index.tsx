"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import InterfacePage from "./interface";

function generateUUID() {
  return crypto.randomUUID(); // This method generates a unique UUID.
}

export default function IronhideLanding() {
  const [running, setRunning] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const [transformedData, setTransformedData] = useState(null);
  const [currRouteNodes, setCurrRouteNodes] = useState(null);
  const [domain, setDomain] = useState(null);
  const [routes, setRoutes] = useState<string[]>([]);
  const [currRoute, setCurrRoute] = useState(null);

  const initialData = [
    {
      interactions: [
        {
          expected_result:
            "The page title should correctly reflect the content or purpose of the page, usually matching the A/B test label or description.",
          interaction_description:
            "Verify page title is displayed correctly: Open the webpage and check the title displayed in the browser tab.",
        },
        {
          expected_result:
            "The heading should be visible and should match the expected text related to the A/B Test.",
          interaction_description:
            "Check presence of heading text: Inspect the main heading or title within the page body to confirm its presence and ensure it matches expected text.",
        },
        {
          expected_result:
            "Text content should be coherent, correctly formatted, and free of spelling or grammatical errors.",
          interaction_description:
            "Verify text content: Read through the main content paragraphs of the page to ensure they are displayed correctly.",
        },
        {
          expected_result:
            "Footer should be present with any expected links or information, such as privacy policy or contact details.",
          interaction_description:
            "Check for the presence of a footer: Scroll to the bottom of the page and check for footer content.",
        },
        {
          expected_result:
            "All links should navigate to the correct page with no errors, and URLs should be valid.",
          interaction_description:
            "Inspect page for broken links: Click on each link present on the page to verify they navigate to the correct URL without error.",
        },
        {
          expected_result:
            "The page should remain usable and visually appealing across various screen sizes, without elements overlapping or misaligning.",
          interaction_description:
            "Test responsiveness of the page: Resize the browser window to different screen sizes and check if the layout adapts properly.",
        },
      ],
      page_url: "https://the-internet.herokuapp.com/abtest",
    },
    {
      interactions: [
        {
          expected_result:
            "The 'Add Element' button should be visible on the page.",
          interaction_description:
            "Verify presence of 'Add Element' button: Check if the 'Add Element' button is present on the page upon loading.",
        },
        {
          expected_result:
            "Clicking the 'Add Element' button should add a new 'Delete' button to the page.",
          interaction_description:
            "Test 'Add Element' button functionality: Click the 'Add Element' button and observe if a new element (e.g., 'Delete' button) is added to the DOM.",
        },
        {
          expected_result:
            "Each click should add one new 'Delete' button, and multiple clicks should add multiple 'Delete' buttons without any overlap or error.",
          interaction_description:
            "Verify multiple additions of elements: Click the 'Add Element' button multiple times and count the number of 'Delete' buttons added.",
        },
        {
          expected_result:
            "Clicking the 'Delete' button should remove the respective element from the page.",
          interaction_description:
            "Test 'Delete' button functionality: After adding an element, click on the 'Delete' button to remove it.",
        },
        {
          expected_result:
            "The page should remain responsive and elements should be displayed correctly irrespective of the number of 'Delete' buttons added.",
          interaction_description:
            "Check page responsiveness with many elements: Add a large number of elements to the page and observe the overall responsiveness and layout.",
        },
        {
          expected_result:
            "Upon reloading, all added elements should disappear, returning the page to its original state with only the 'Add Element' button visible.",
          interaction_description:
            "Test UI consistency on reload: Add several elements, reload the page, and check the state of the page.",
        },
      ],
      page_url: "https://the-internet.herokuapp.com/add_remove_elements/",
    },
  ];

  const runTests = async () => {
    setRunning(true); // trigger the InterfacePage display
    setDomain("https://the-internet.herokuapp.com");
    // Add the page_url to the Set of URLs
    setTimeout(() => setFadeIn(true), 50); // delay fade-in effect for smooth transition
    const prevUrls = new Set();
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
