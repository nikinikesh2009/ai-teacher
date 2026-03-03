"use client";

import { useState } from "react";
import TopBar from "@/components/layout/TopBar";
import BoardCanvas from "./BoardCanvas";
import BottomControls from "./BottomControls";
import RightToolbar from "@/components/toolbar/RightToolbar";
import SlidePanel from "./SlidePanel";

export default function WhiteboardLayout() {
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [toolbarOpen, setToolbarOpen] = useState(true);
  const [bottomControlsVisible, setBottomControlsVisible] = useState(true);

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-[var(--color-bg-app)] w-full min-w-0 min-h-0 h-[100dvh] max-h-[100dvh]">
      {bottomControlsVisible && (
        <header className="flex-shrink-0 z-10">
          <TopBar
            toolbarOpen={toolbarOpen}
            onToolbarToggle={() => {
              setToolbarOpen((v) => {
                if (!v) setBottomControlsVisible(false);
                return !v;
              });
            }}
          />
        </header>
      )}

      <div
        className={`relative flex flex-1 min-h-0 min-w-0 overflow-y-auto transition-[padding] duration-300 ${
          bottomControlsVisible ? "pt-2 pb-[clamp(4rem,12vh,7rem)]" : "pt-4 pb-4"
        }`}
      >
        <BoardCanvas />
        {toolbarOpen && (
          <RightToolbar
            activePanel={activePanel}
            onPanelChange={setActivePanel}
            topBarVisible={bottomControlsVisible}
          />
        )}
      </div>

      <BottomControls
        visible={bottomControlsVisible}
        onToggle={() => {
          const willShow = !bottomControlsVisible;
          setBottomControlsVisible((v) => !v);
          if (willShow) setToolbarOpen(false);
        }}
      />

      <SlidePanel
        activePanel={activePanel}
        onClose={() => setActivePanel(null)}
        onOverlayClick={() => setActivePanel(null)}
      />
    </div>
  );
}
