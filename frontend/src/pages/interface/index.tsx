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
  return (
    <div
      style={style}
      ref={dragHandle}
      className="flex items-center gap-2 px-4 py-2 rounded-md cursor-pointer hover:bg-neutral-800"
    >
      {/* collapse/expand */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          node.toggle();
        }}
        className="flex items-center justify-center w-6 h-6 rounded hover:bg-neutral-700"
      >
        {node.isInternal ? node.isOpen ? "▾" : "▸" : <div className="w-4" />}
      </div>

      {/* label */}
      <div
        className="flex-1 cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          onRenameRequest(node);
        }}
      >
        {node.data.name}
      </div>
    </div>
  );
}

export default function InterfacePage() {
  const initialData = [
    { id: "1", name: "Unread", children: [] },
    { id: "2", name: "Threads", children: [] },
    {
      id: "3",
      name: "Chat Rooms",
      children: [
        { id: "c1", name: "General", children: [] },
        { id: "c2", name: "Random", children: [] },
        { id: "c3", name: "Open Source Projects", children: [] },
      ],
    },
    {
      id: "4",
      name: "Direct Messages",
      children: [
        { id: "d1", name: "Alice", children: [] },
        { id: "d2", name: "Bob", children: [] },
        { id: "d3", name: "Charlie", children: [] },
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
      setRenaming(null);
    }
  }

  return (
    <div className="relative flex">
      <Tree
        {...controller}
        data={data}
        width={400}
        height={800}
        indent={20}
        rowHeight={36}
        overscanCount={1}
        padding={8}
      >
        {(props) => (
          <NodeRenderer {...props} onRenameRequest={handleRenameRequest} />
        )}
      </Tree>

      {renaming && (
        <AnimatePresence>
          {renaming && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed right-4 top-1/4 w-64"
            >
              <Card className="bg-black text-white shadow-lg">
                <CardHeader className="relative">
                  <CardTitle>Rename Node</CardTitle>
                </CardHeader>
                <CardContent>
                  <Input
                    value={renaming.tempName}
                    onChange={(e) =>
                      setRenaming((r) =>
                        r ? { ...r, tempName: e.target.value } : r
                      )
                    }
                    className="bg-black text-white"
                  />
                </CardContent>
                <CardFooter className="flex justify-end space-x-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="cursor-pointer"
                    onClick={() => setRenaming(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="cursor-pointer"
                    onClick={saveRename}
                  >
                    Save
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
