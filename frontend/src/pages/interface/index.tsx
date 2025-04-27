"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import {
  Tree,
  useSimpleTree,
  type NodeApi,
  type TreeApi,
} from "react-arborist";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Inter } from "next/font/google";
import { Separator } from "@/components/ui/separator";
import { Check, ChevronsRight, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { JellyTriangle } from "ldrs/react";
import "ldrs/react/JellyTriangle.css";
import LoadingStrings from "@/components/loading/loadingStrings";
import {
  processInteractions,
  processSingleInteraction,
} from "../../utils/processInteractions";
import { LineSpinner } from "ldrs/react";
import "ldrs/react/LineSpinner.css";
import Feedback from "@/components/feedback/Feedback";
import axios from "axios";
import VideoPlayer from "@/components/video/videoPlayer";

// Default values shown
<LineSpinner size="40" stroke="3" speed="1" color="black" />;

const inter = Inter({ subsets: ["latin"] });

type RenameNode = { node: NodeApi; tempName: string };

function NodeRenderer({
  node,
  style,
  dragHandle,
  onRenameRequest,
  results,
  loadingCurrNode,
}: {
  node: NodeApi;
  tree: TreeApi;
  style: React.CSSProperties;
  dragHandle: React.Ref<HTMLDivElement>;
  onRenameRequest: (n: NodeApi) => void;
  results: results;
  loadingCurrNode: string;
}) {
  // Hardcoded boolean for error status - in a real app, this would come from your data
  const [status, setStatus] = useState("");
  useEffect(() => {
    if (loadingCurrNode) {
      if (loadingCurrNode == node.id) {
        setStatus("LOADING");
      } else {
        setStatus("DISABLED");
      }
    }
  });

  return (
    <div
      style={style}
      ref={dragHandle}
      className="flex items-center justify-between gap-3 px-3 py-2 rounded-md cursor-pointer hover:bg-zinc-800/50 transition-colors duration-200 text-sm"
    >
      <div className="flex items-center">
        {/* collapse/expand */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            node.toggle();
          }}
          className={`flex items-center justify-center w-6 h-6 rounded-sm hover:bg-zinc-700/80 transition-colors ${
            loadingCurrNode && loadingCurrNode != node.id
              ? " text-gray-800"
              : "text-white"
          }`}
        >
          {node.children.length > 0 ? (
            node.isOpen ? (
              <span className="text-xl">▾</span>
            ) : (
              <span className="text-xl">▸</span>
            )
          ) : (
            <span className="text-xl">•</span>
          )}
        </div>

        {/* label - with truncation */}
        <div
          className={`flex-1 cursor-pointer py-1 text-base font-medium truncate max-w-[270px] ${
            loadingCurrNode && loadingCurrNode != node.id
              ? " text-gray-800"
              : "text-white"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onRenameRequest(node);
          }}
          title={node.data.name} // Show full name on hover
        >
          {node.data.name}
        </div>
      </div>

      {/* Status indicator */}

      <div className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold">
        {status == "LOADING" ? (
          <LineSpinner size="20" stroke="2" speed="1" color="white" />
        ) : null}
        {loadingCurrNode != node.id &&
        results &&
        results[node.id] &&
        results[node.id].error ? (
          <div className="text-red-500">ERR</div>
        ) : null}
        {loadingCurrNode != node.id &&
        results &&
        results[node.id] &&
        !results[node.id].error ? (
          <div className="text-green-500">OK</div>
        ) : null}
      </div>
    </div>
  );
}

interface EditInteractionCardProps {
  renaming: RenameNode | null;
  setRenaming: (callback: (r: any) => any) => void;
  saveRename: () => void;
  results: results;
  triggerTest: any;
}

function EditInteractionCard({
  renaming, //node that is currently being renamed
  setRenaming,
  saveRename,
  results,
  triggerTest,
  video,
  nestedVideo,
}: EditInteractionCardProps) {
  return (
    <Card className="bg-black text-white w-3xl h-full border border-gray-800">
      {!renaming && (
        <div className="w-3xl px-4 text-zinc-500 text-base font-light tracking-wide text-center min-h-full justify-center flex items-center">
          {video && <VideoPlayer src={video} />}
          {!video &&
            "Drag & drop to reorder your interactions or click to inspect each interaction individually"}
        </div>
      )}
      {renaming && (
        <>
          <CardHeader>
            <CardTitle className="text-xl font-semibold tracking-tight">
              Edit interaction
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row gap-6 h-full">
            {/* Left side - Placeholder for GIF */}
            <div className="w-full md:w-1/2 aspect-video bg-black border border-gray-800 rounded-lg flex items-center justify-center text-black">
              {nestedVideo && <VideoPlayer src={nestedVideo} />}
              {!nestedVideo && (
                <span className="text-sm text-gray-500">
                  Your preview will appear here
                </span>
              )}
            </div>

            {/* Right side - Content */}
            <div className="w-full md:w-2/3 h-full flex flex-col justify-between">
              <Textarea
                value={renaming.tempName}
                onChange={(e) =>
                  setRenaming((r) =>
                    r ? { ...r, tempName: e.target.value } : r
                  )
                }
                className="bg-black text-white border-gray-700 text-base font-normal leading-relaxed h-2/3 max-w-90"
              />
              <div className="flex w-full gap-x-2">
                <Button
                  size="sm"
                  className="cursor-pointer bg-white text-black hover:bg-gray-300 flex-1"
                  onClick={saveRename}
                >
                  Download Logs
                </Button>
                <Button
                  size="sm"
                  className="cursor-pointer bg-white text-black hover:bg-gray-300 flex-1"
                  onClick={() => {
                    saveRename();
                    triggerTest(renaming.node.id);
                  }}
                >
                  Preview interaction
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex-col items-start pt-2 h-full">
            <div className="flex text-sm">
              {/* Observed response */}
              <p className="font-medium">Observed response:</p>
              {/* Error status indicator */}
              <div className="flex items-center gap-2 pl-3">
                {results[renaming.node.id] && (
                  <div
                    className={`w-3 h-3 rounded-full ${
                      !results[renaming.node.id].test_passed
                        ? "bg-red-500"
                        : "bg-green-500"
                    }`}
                  ></div>
                )}
                {results[renaming.node.id] && (
                  <span>
                    {!results[renaming.node.id].test_passed
                      ? "Error detected"
                      : "No errors"}
                  </span>
                )}
              </div>
            </div>
            {results[renaming.node.id] && (
              <div className="text-sm pt-3 font-light leading-relaxed">
                {results[renaming.node.id].test_report}
              </div>
            )}

            <Feedback />
          </CardFooter>
        </>
      )}
    </Card>
  );
}

export interface result {
  id: string;
  test_report: string;
  test_passed: boolean;
}

export interface results {
  [key: string]: result;
}

export default function InterfacePage({
  currRouteNodes,
  domain,
  routes,
  currRoute,
  setCurrRoute,
}) {
  if (!currRouteNodes)
    //this should change to be our massive interactions payload todo @euan
    return (
      <div className="h-screen w-screen flex flex-col space-y-45 justify-center items-center relative !z-10">
        <JellyTriangle size="100" speed="1.5" color="white" />
        <LoadingStrings />
      </div>
    );

  const [data, controller] = useSimpleTree([...currRouteNodes]); //this is all the data for a Page
  const [results, setResults] = useState<results>({});
  const [renaming, setRenaming] = useState<RenameNode | null>(null);
  const [open, setOpen] = useState(false);
  const [loadingCurrNode, setLoadingCurrNode] = useState<string | null>(null);
  const [video, setVideo] = useState(null);
  const [nestedVideo, setNestedVideo] = useState(null);

  function handleRenameRequest(node: NodeApi) {
    setRenaming({ node, tempName: node.data.name });
    node.deselect();
  }

  function saveRename() {
    if (renaming) {
      renaming.node.submit(renaming.tempName);
    }
  }

  async function runInteraction(interaction) {
    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "http://64.23.190.48:3001/test-interaction",
      headers: {
        "Content-Type": "application/json",
      },
      data: interaction,
    };

    try {
      // Send the request and wait for the response
      const response = await axios.request(config);
      const result = response.data;
      setResults((prevResults) => ({
        ...prevResults,
        [interaction.id]: result,
      }));
      console.log(response);
      return result;
    } catch (error) {
      console.error("Error fetching test data:", error);
      throw error; // Propagate the error for further handling if needed
    }
  }

  const fetchFfmpeg = async () => {
    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "http://64.23.190.48:3001/test-interaction",
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        command: "start",
      },
    };

    try {
      // Send the request and wait for the response
      const response = await axios.request(config);
      console.log(response);
      return response.data; // Return the API response data
    } catch (error) {
      console.error("Error fetching test data:", error);
      throw error; // Propagate the error for further handling if needed
    }
  };
  async function triggerFullTest() {
    const processedInteractions = processInteractions(data);
    setRenaming(null);
    setResults({});
    const res = await fetchFfmpeg();
    const sessionId = res.session_id.slice(0, 8);
    setVideo(
      `http://64.23.190.48:8008/videos/session_${sessionId}/recording.mp4/stream.m3u8`
    );
    console.log(
      `http://64.23.190.48:8008/videos/session_${sessionId}/recording.mp4/stream.m3u8`
    );
    for (const interaction of processedInteractions) {
      setLoadingCurrNode(interaction.id);
      await runInteraction(interaction);
    }

    setLoadingCurrNode(null);
  }

  async function triggerTest(id) {
    setLoadingCurrNode(id);
    const interaction = processSingleInteraction(data, id);
    const res = await fetchFfmpeg();
    const sessionId = res.session_id.slice(0, 8);
    setNestedVideo(
      `http://64.23.190.48:8008/videos/session_${sessionId}/recording.mp4/stream.m3u8`
    );
    console.log(
      `http://64.23.190.48:8008/videos/session_${sessionId}/recording.mp4/stream.m3u8`
    );
    await runInteraction(interaction);
    setLoadingCurrNode(null);
  }

  return (
    <div className="relative flex h-screen w-screen items-center justify-center z-10">
      <div className="flex p-10 justify-center bg-black space-x-5 border border-gray-800 rounded-2xl flex-col shadow-2xl shadow-gray-900">
        <div className="flex justify-between align-middle space-x-2.5">
          <div className="flex items-center justify-center">
            <div className="flex items-center pr-2">
              <ChevronsRight className="h-4 w-4" />
            </div>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-[400px] justify-between border border-gray-800 hover:bg-zinc-800/50 hover:text-white  cursor-pointer"
                >
                  {currRoute
                    ? routes
                        .find((route) => route === currRoute)
                        .replace(domain, "")
                    : "Select a page..."}
                  {/* todo @euan fix this */}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[500px] p-0">
                <Command className="border bg-black border-black overflow-auto">
                  <CommandInput
                    placeholder="Search for a page..."
                    className="text-white"
                  />
                  <CommandList className="w-full">
                    <CommandEmpty>No route found.</CommandEmpty>
                    <CommandGroup>
                      {routes.map((route) => (
                        <CommandItem
                          key={route}
                          value={route}
                          onSelect={(currentValue) => {
                            setCurrRoute(currentValue);
                            setOpen(false);
                          }}
                          className="cursor-pointer w-full"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              currRoute === route ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {route.replace(domain, "")}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <a
            onClick={triggerFullTest}
            className="cursor-pointer relative inline-flex items-center justify-start px-5 py-3 overflow-hidden font-bold rounded-lg group"
          >
            <span className="w-32 h-32 rotate-45 translate-x-12 -translate-y-2 absolute left-0 top-0 bg-white opacity-[3%]"></span>
            <span className="absolute top-0 left-0 w-48 h-48 -mt-1 transition-all duration-500 ease-in-out rotate-45 -translate-x-56 -translate-y-24 bg-white opacity-100 group-hover:-translate-x-8"></span>
            <span className="relative w-full text-left text-white transition-colors duration-100 ease-in-out group-hover:text-gray-900">
              RUN IRONHYDE
            </span>
            <span className="absolute inset-0 border-2 border-white rounded-lg"></span>
          </a>
        </div>

        <Separator className="h-[1px] bg-gray-800 my-5" />
        <div className="flex ">
          <Tree
            key={JSON.stringify(currRouteNodes)}
            {...controller}
            data={data}
            width={400}
            indent={20}
            rowHeight={36}
            overscanCount={1}
            padding={8}
          >
            {(props) => (
              <NodeRenderer
                {...props}
                results={results}
                onRenameRequest={handleRenameRequest}
                loadingCurrNode={loadingCurrNode}
              />
            )}
          </Tree>
          <div className="min-h-full pl-5">
            <EditInteractionCard
              renaming={renaming}
              setRenaming={setRenaming}
              saveRename={saveRename}
              triggerTest={triggerTest}
              results={results}
              video={video}
              nestedVideo={nestedVideo}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
