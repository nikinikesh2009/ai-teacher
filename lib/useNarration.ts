"use client";

import { useRef, useCallback, useEffect } from "react";

/** Prioritize natural-sounding, human-like voices (free, built-in). */
function pickBestVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const lang = "en-US";
  const preferred = [
    "Google US English",
    "Microsoft Zira",
    "Samantha",
    "Karen",
    "Daniel",
    "Google UK English",
    "Microsoft Aria",
    "Siri",
  ];
  const fallback = voices.find((v) => v.lang.startsWith("en") && v.localService);
  for (const name of preferred) {
    const found = voices.find(
      (v) =>
        v.name.includes(name) && (v.lang.startsWith("en") || v.lang === lang)
    );
    if (found) return found;
  }
  return fallback ?? voices.find((v) => v.lang.startsWith("en")) ?? voices[0] ?? null;
}

export function useNarration() {
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const synth = window.speechSynthesis;
    synthRef.current = synth;

    const loadVoices = () => {
      const voices = synth.getVoices();
      voiceRef.current = pickBestVoice(voices);
    };

    loadVoices();
    synth.onvoiceschanged = loadVoices;

    return () => {
      synth.cancel();
      abortRef.current?.abort();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  const speakWithFallback = useCallback((text: string) => {
    if (!text?.trim()) return;

    const trimmed = text.trim();

    // Stop any current playback
    synthRef.current?.cancel();
    abortRef.current?.abort();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }

    const controller = new AbortController();
    abortRef.current = controller;

    fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: trimmed }),
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 503) throw new Error("ELEVENLABS_DISABLED");
          throw new Error(`TTS failed: ${res.status}`);
        }
        return res.blob();
      })
      .then((blob) => {
        if (controller.signal.aborted) return;
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.onended = () => {
          URL.revokeObjectURL(url);
          audioRef.current = null;
        };
        audio.onerror = () => {
          URL.revokeObjectURL(url);
          audioRef.current = null;
        };
        audio.play().catch(() => {
          URL.revokeObjectURL(url);
          fallbackSpeak(trimmed);
        });
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        fallbackSpeak(trimmed);
      });
  }, []);

  const fallbackSpeak = useCallback((text: string) => {
    const synth = synthRef.current;
    if (!synth || !text?.trim()) return;

    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text.trim());
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    utterance.pitch = 0.98;
    utterance.volume = 1;
    if (voiceRef.current) utterance.voice = voiceRef.current;
    synth.speak(utterance);
  }, []);

  const speak = useCallback((text: string) => {
    if (!text?.trim()) return;
    speakWithFallback(text.trim());
  }, [speakWithFallback]);

  const stop = useCallback(() => {
    synthRef.current?.cancel();
    abortRef.current?.abort();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
  }, []);

  return { speak, stop };
}
