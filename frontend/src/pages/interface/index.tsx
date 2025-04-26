import { Tree, useSimpleTree } from "react-arborist";
import { useState, useEffect } from "react";

function Node({ node, style, dragHandle }) {
  return (
    <div
      style={style}
      ref={dragHandle}
      className="flex items-center gap-2 px-4 py-2 transition-colors duration-200 rounded-md cursor-pointer"
    >
      {/* Expand/Collapse Button */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          node.toggle();
        }}
        className="flex items-center justify-center w-8 h-8 rounded hover:bg-neutral-800"
      >
        {node.isInternal ? (
          <div className="text-neutral-400 select-none">
            {node.isOpen ? "▾" : "▸"}
          </div>
        ) : (
          <div className="w-4" />
        )}
      </div>

      {/* Node Label */}
      <div
        onDoubleClick={(e) => {
          e.stopPropagation();
          const newName = prompt("Rename node", node.data.name);
          if (newName) {
            node.submit(newName);
          }
        }}
        className="cursor-pointer hover:bg-neutral-900"
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

  useEffect(() => {
    console.log(data);
  }, [data]);
  return (
    <Tree
      {...controller}
      data={data}
      width={400}
      height={1000}
      indent={24}
      rowHeight={40}
      overscanCount={1}
      padding={10}
    >
      {Node}
    </Tree>
  );
}
