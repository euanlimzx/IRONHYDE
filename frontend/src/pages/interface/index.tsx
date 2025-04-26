import { useState, useEffect } from "react";
import { Tree, useSimpleTree, NodeApi, TreeApi } from "react-arborist";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@radix-ui/react-separator";
import { AnimatePresence, motion } from "framer-motion";

type RenameNode = { node: NodeApi; tempName: string };

function NodeRenderer({
  node,
  style,
  dragHandle,
  onRenameRequest,
}: {
  node: NodeApi;
  tree: TreeApi;
  style: React.CSSProperties;
  dragHandle: React.Ref<HTMLDivElement>;
  onRenameRequest: (n: NodeApi) => void;
}) {
  // Hardcoded boolean for error status - in a real app, this would come from your data
  const hasError = node.id.startsWith("d"); // Just for demo: Direct Messages have errors
  console.log(node);

  return (
    <div
      style={style}
      ref={dragHandle}
      className="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer hover:bg-zinc-800/50 transition-colors duration-200 text-sm"
    >
      {/* collapse/expand */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          node.toggle();
        }}
        className="flex items-center justify-center w-6 h-6 rounded-sm hover:bg-zinc-700/80 transition-colors"
      >
        {node.isInternal ? (
          node.isOpen ? (
            <span className="text-xl">▾</span>
          ) : (
            <span className="text-xl">▸</span>
          )
        ) : (
          <div className="w-4" />
        )}
      </div>

      {/* label - with truncation */}
      <div
        className="flex-1 cursor-pointer py-1 text-xl font-medium truncate max-w-[200px]"
        onClick={(e) => {
          e.stopPropagation();
          onRenameRequest(node);
        }}
        title={node.data.name} // Show full name on hover
      >
        {node.data.name}
      </div>

      {/* Status indicator */}
      <div
        className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${
          hasError ? " text-red-500" : " text-green-500"
        }`}
      >
        {hasError ? "ERR" : "OK"}
      </div>
    </div>
  );
}

export default function InterfacePage() {
  const initialData = [
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
  ];

  const [data, controller] = useSimpleTree(initialData);
  const [renaming, setRenaming] = useState<RenameNode | null>(null);

  // whenever the user double‐clicks a node
  function handleRenameRequest(node: NodeApi) {
    setRenaming({ node, tempName: node.data.name });
    // immediately deselect if you’d like:
    node.deselect();
  }

  function saveRename() {
    if (renaming) {
      renaming.node.submit(renaming.tempName);
    }
  }

  return (
    <div className="relative flex h-screen w-screen items-center justify-center">
      <div className="flex w-full justify-center ">
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
            <NodeRenderer {...props} onRenameRequest={handleRenameRequest} />
          )}
        </Tree>
        <div className="min-h-full">
          {renaming && (
            <EditInteractionCard
              renaming={renaming}
              setRenaming={setRenaming}
              saveRename={saveRename}
            />
          )}
          {!renaming && (
            <div className="w-3xl text-3xl min-h-full justify-center flex items-center">
              {"<-"} Click on on interaction to inspect its behaviour, or drag
              and drop to change the order of execution!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface EditInteractionCardProps {
  renaming: RenameNode;
  setRenaming: (callback: (r: any) => any) => void;
  saveRename: () => void;
}

function EditInteractionCard({
  renaming,
  setRenaming,
  saveRename,
}: EditInteractionCardProps) {
  const hasError = false; // Toggle between true/false to see different states
  const observedResponse =
    "The model responded with a detailed explanation about the topic as expected.";

  return (
    <Card className="bg-black text-white w-3xl h-full border border-gray-800">
      <CardHeader>
        <CardTitle>Edit interaction</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col md:flex-row gap-6">
        {/* Left side - Placeholder for GIF */}
        <div className="w-full md:w-1/2 aspect-video bg-white rounded-lg flex items-center justify-center text-black">
          <span className="text-sm text-gray-500">Preview GIF</span>
        </div>

        {/* Right side - Content */}
        <div className="w-full md:w-2/3 space-y-4">
          <Input
            value={renaming.tempName}
            onChange={(e) =>
              setRenaming((r) => (r ? { ...r, tempName: e.target.value } : r))
            }
            className="bg-black text-white border-gray-700 text-xl"
          />

          {/* Error status indicator */}
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                hasError ? "bg-red-500" : "bg-green-500"
              }`}
            ></div>
            <span>{hasError ? "Error detected" : "No errors"}</span>
          </div>

          {/* Observed response */}
          <div className="space-y-1">
            <p className="text-sm text-gray-400">Observed response:</p>
            <div className="p-3 bg-gray-900 rounded-md text-sm">
              {observedResponse}
            </div>
          </div>
        </div>
      </CardContent>

      <Separator className="bg-gray-800" />

      <CardFooter className="flex justify-end space-x-2 pt-4">
        <Button
          size="sm"
          className="cursor-pointer bg-white text-black hover:bg-gray-300"
          onClick={saveRename}
        >
          Generate preview
        </Button>
      </CardFooter>
    </Card>
  );
}
