"use client";

import { useState } from "react";
import TopBar from "./TopBar";
import BoardCanvas from "./BoardCanvas";
import BottomControls from "./BottomControls";
import RightToolbar from "./RightToolbar";
import SidePanel from "./SidePanel";

export default function WhiteboardLayout() {
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[var(--color-bg-app)]">
      <TopBar isPaused={isPaused} onPauseToggle={() => setIsPaused(!isPaused)} />

      <div className="relative flex flex-1 min-h-0">
        <BoardCanvas />
        <RightToolbar activePanel={activePanel} onPanelChange={setActivePanel} />
      </div>

      <BottomControls />

      <SidePanel
        activePanel={activePanel}
        onClose={() => setActivePanel(null)}
        onOverlayClick={() => setActivePanel(null)}
      />
    </div>
  );
}
