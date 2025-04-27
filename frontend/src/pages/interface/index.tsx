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
}: EditInteractionCardProps) {
  return (
    <Card className="bg-black text-white w-3xl h-full border border-gray-800">
      {!renaming && (
        <div className="font-semibold w-3xl p-25 text-zinc-500 text-base font-light tracking-wide text-center min-h-full justify-center flex items-center">
          Drag to reorder the execution of instructions, or click to inspect
          each interaction individually
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
            <div className="w-full md:w-1/2 aspect-video bg-white rounded-lg flex items-center justify-center text-black">
              <span className="text-sm text-gray-500">Preview GIF</span>
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
                      results[renaming.node.id].error
                        ? "bg-red-500"
                        : "bg-green-500"
                    }`}
                  ></div>
                )}
                {results[renaming.node.id] && (
                  <span>
                    {results[renaming.node.id].error
                      ? "Error detected"
                      : "No errors"}
                  </span>
                )}
              </div>
            </div>
            {results[renaming.node.id] && (
              <div className="text-sm pt-3 font-light leading-relaxed">
                {results[renaming.node.id].observation}
              </div>
            )}

            <div className="flex h-full w-full items-end">
              <div className="flex w-full space-x-2.5 ">
                <Button
                  size="sm"
                  className="cursor-pointer bg-black text-red-600 hover:bg-zinc-800/50 flex-1 border border-gray-800"
                >
                  This should be an error
                </Button>
                <Button
                  size="sm"
                  className="cursor-pointer bg-black text-green-600 hover:bg-zinc-800/50 flex-1 border border-gray-800"
                >
                  This is the expected response
                </Button>
              </div>
            </div>
          </CardFooter>
        </>
      )}
    </Card>
  );
}

export interface result {
  id: string;
  observation: string;
  error: boolean;
}

export interface results {
  [key: string]: result;
}

export default function InterfacePage({ currPage, domain }) {
  if (!currPage)
    //this should change to be our massive interactions payload todo @euan
    return (
      <div className="h-screen w-screen flex flex-col space-y-45 justify-center items-center relative !z-10">
        <JellyTriangle size="120" speed="1.5" color="white" />
        <LoadingStrings />
      </div>
    );

  const [data, controller] = useSimpleTree(currPage.interactions); //this is all the data for a Page
  const [results, setResults] = useState<results>({});
  const [routes, setRoutes] = useState([]);
  const [renaming, setRenaming] = useState<RenameNode | null>(null);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(""); //for the page selection???
  const [loadingCurrNode, setLoadingCurrNode] = useState<string | null>(null);

  useEffect(() => {
    function processUrls(urls, domain) {
      return urls.map((url) => {
        return {
          value: url,
          label: url.replace(domain, ""),
        };
      });
    }
    setRoutes(processUrls(currPage.urls, domain));
  }, [currPage]);

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
    setLoadingCurrNode(interaction.id);
    await sleep(1000); // wait 1 second before proceeding
    const result = {
      id: interaction.id,
      error: Math.random() < 0.5,
      observation: "cb dog",
    };
    setResults((prevResults) => ({
      ...prevResults,
      [interaction.id]: result,
    }));
    return result;
  }
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  async function triggerFullTest() {
    const processedInteractions = processInteractions(data);
    setRenaming(null);
    setResults({});

    for (const interaction of processedInteractions) {
      await runInteraction(interaction);
    }

    setLoadingCurrNode(null);
  }

  async function triggerTest(id) {
    const interaction = processSingleInteraction(data, id);
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
                  className="w-[250px] justify-between border border-gray-800 hover:bg-zinc-800/50 hover:text-white  cursor-pointer"
                >
                  {value
                    ? routes.find((route) => route.value === value)?.label
                    : "Select a page..."}
                  {/* todo @euan fix this */}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0">
                <Command className="border bg-black border-black">
                  <CommandInput
                    placeholder="Search for a page..."
                    className="text-white"
                  />
                  <CommandList className="w-full">
                    <CommandEmpty>No route found.</CommandEmpty>
                    <CommandGroup>
                      {routes.map((route) => (
                        <CommandItem
                          key={route.value}
                          value={route.value}
                          onSelect={(currentValue) => {
                            setValue(
                              currentValue === value ? "" : currentValue
                            );
                            setOpen(false);
                          }}
                          className="cursor-pointer w-full"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              value === route.value
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {route.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <div
            onClick={triggerFullTest}
            className="font-extrabold inline-flex h-12 items-center rounded-lg border-2 border-white px-6 text-sm text-white shadow-lg cursor-pointer hover:text-black hover:bg-white"
          >
            RUN TESTS
          </div>
        </div>

        <Separator className="h-[1px] bg-gray-800 my-5" />
        <div className="flex ">
          <Tree
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
            />
          </div>
        </div>
      </div>
    </div>
  );
}
