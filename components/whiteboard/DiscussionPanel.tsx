"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { BoardElement } from "@/lib/boardTypes";

const DiscussionWhiteboardPreview = dynamic(
  () => import("./DiscussionWhiteboardPreview"),
  { ssr: false }
);

export type DiscussionMessage = { role: "student" | "teacher"; content: string };

interface DiscussionPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSendMessage?: (message: string) => Promise<void>;
  messages?: DiscussionMessage[];
  discussionElements?: BoardElement[];
}

export default function DiscussionPanel({
  isOpen,
  onClose,
  onSendMessage,
  messages = [],
  discussionElements = [],
}: DiscussionPanelProps) {
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewSplit, setPreviewSplit] = useState(0.5); // 0..1, width of whiteboard on desktop
  const [listening, setListening] = useState(false);
  const [callActive, setCallActive] = useState(false);

  const dragActiveRef = useRef(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const callStreamRef = useRef<MediaStream | null>(null);

  const handleSend = async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text || !onSendMessage) return;
    setSending(true);
    setError(null);
    if (!overrideText) {
      setInput("");
    }
    try {
      await onSendMessage(text);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send");
    } finally {
      setSending(false);
    }
  };

  const startResizeDrag = () => {
    dragActiveRef.current = true;
  };

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!dragActiveRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      const ratio = relativeX / rect.width;
      // Chat is on the left, whiteboard on the right; we control whiteboard width.
      const clamped = Math.min(0.75, Math.max(0.25, 1 - ratio));
      setPreviewSplit(clamped);
    };

    const handleUp = () => {
      dragActiveRef.current = false;
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, []);

  const handleVoiceInput = () => {
    if (listening) {
      recognitionRef.current?.stop?.();
      return;
    }

    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("Voice input is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript as string;
      // Show transcript briefly and send it as a message
      setInput(transcript);
      handleSend(transcript);
    };
    recognition.onerror = () => {
      setListening(false);
    };
    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  };

  const toggleVoiceCall = async () => {
    if (callActive) {
      callStreamRef.current?.getTracks().forEach((t) => t.stop());
      callStreamRef.current = null;
      setCallActive(false);
      return;
    }

    try {
      if (typeof navigator === "undefined" || !navigator.mediaDevices) {
        setError("Voice call is not available in this environment.");
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      callStreamRef.current = stream;
      setCallActive(true);
    } catch {
      setError("Could not access microphone for voice call.");
    }
  };

  useEffect(
    () => () => {
      // Cleanup on unmount
      recognitionRef.current?.stop?.();
      callStreamRef.current?.getTracks().forEach((t) => t.stop());
    },
    []
  );

  if (!isOpen) return null;

  return (
    <>
      <div
        role="presentation"
        className="fixed inset-0 z-40 bg-black/20"
        onClick={onClose}
        aria-hidden
      />
      <aside
        className="fixed top-0 right-0 bottom-0 z-50 w-full sm:w-[560px] bg-white shadow-[-4px_0_20px_rgba(0,0,0,0.08)] flex flex-col animate-[slideInRight_0.3s_ease-out_forwards]"
        aria-label="Discussion panel"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 flex-shrink-0">
          <h3 className="text-base font-semibold text-gray-800">Discuss</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            title="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div
          ref={containerRef}
          className="flex-1 min-h-0 flex flex-col sm:flex-row overflow-hidden"
        >
          {/* Chat history */}
          <div
            className="flex min-h-0 flex-col border-b sm:border-b-0 sm:border-r border-gray-200"
            style={{ flexBasis: `${(1 - previewSplit) * 100}%` }}
          >
            <div className="px-3 py-2 border-b border-gray-100 text-xs font-medium text-gray-500 uppercase tracking-wide">
              Chat
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {messages.length === 0 && (
                <p className="text-sm text-gray-400 py-4">Ask a question to start the discussion.</p>
              )}
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "student" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                      msg.role === "student"
                        ? "bg-green-600 text-white rounded-br-md"
                        : "bg-gray-100 text-gray-800 rounded-bl-md"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resize handle (desktop only) */}
          <div
            className="hidden sm:flex w-1 cursor-col-resize bg-gray-100 hover:bg-gray-200 transition-colors"
            onMouseDown={startResizeDrag}
          />

          {/* Temporary whiteboard preview */}
          <div
            className="flex min-h-0 flex-col min-w-0"
            style={{ flexBasis: `${previewSplit * 100}%` }}
          >
            <div className="px-3 py-2 border-b border-gray-100 text-xs font-medium text-gray-500 uppercase tracking-wide flex-shrink-0">
              Whiteboard
            </div>
            <div className="flex-1 min-h-[140px] p-3 overflow-hidden">
              {discussionElements.length === 0 ? (
                <div className="w-full h-full min-h-[140px] rounded-lg border border-dashed border-gray-200 flex items-center justify-center bg-gray-50/50">
                  <p className="text-sm text-gray-400">Teacher diagrams will appear here</p>
                </div>
              ) : (
                <DiscussionWhiteboardPreview elements={discussionElements} />
              )}
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 p-4 border-t border-gray-200">
          {error && (
            <p className="mb-2 text-sm text-red-600">{error}</p>
          )}
          <div className="mb-2 flex items-center gap-2 text-xs text-gray-500">
            <button
              type="button"
              onClick={toggleVoiceCall}
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 ${
                callActive
                  ? "border-green-600 bg-green-50 text-green-700"
                  : "border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span className="inline-flex h-2 w-2 rounded-full bg-current" />
              {callActive ? "Voice session active" : "Start voice session"}
            </button>
            {callActive && (
              <span className="text-[11px] text-gray-400">
                Audio is captured locally; connect signaling to reach students.
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder={listening ? "Listening..." : "Ask a question..."}
                disabled={sending || listening}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500 disabled:opacity-60"
              />
              {listening && (
                <div className="pointer-events-none absolute inset-y-1.5 right-3 flex items-center gap-0.5">
                  <span className="h-4 w-1 rounded-full bg-green-500 animate-[pulse_0.8s_ease-in-out_infinite]" />
                  <span className="h-3 w-1 rounded-full bg-green-400 animate-[pulse_0.8s_ease-in-out_infinite_0.15s]" />
                  <span className="h-5 w-1 rounded-full bg-green-600 animate-[pulse_0.8s_ease-in-out_infinite_0.3s]" />
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => handleVoiceInput()}
              disabled={sending}
              className={`px-3 py-2.5 rounded-lg border text-sm font-medium ${
                listening
                  ? "border-red-500 text-red-600 bg-red-50"
                  : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
              } disabled:opacity-60`}
              title={listening ? "Stop voice input" : "Start voice input"}
            >
              {listening ? "Stop" : "Voice"}
            </button>
            <button
              type="button"
              onClick={() => handleSend()}
              disabled={sending || !input.trim()}
              className="px-4 py-2.5 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition-colors disabled:opacity-60 disabled:pointer-events-none"
            >
              {sending ? "..." : "Send"}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
