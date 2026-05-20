"use client";

import { useEffect, useRef, useState } from "react";

interface AutoSaveOptions<T> {
  key: string;
  value: T;
  intervalMs?: number;
  enabled?: boolean;
}

export function useAutoSave<T>({
  key,
  value,
  intervalMs = 15_000,
  enabled = true,
}: AutoSaveOptions<T>) {
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const latest = useRef(value);

  useEffect(() => {
    latest.current = value;
  }, [value]);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;
    const id = window.setInterval(() => {
      try {
        window.localStorage.setItem(key, JSON.stringify(latest.current));
        setSavedAt(new Date());
      } catch {
        // ignore quota errors
      }
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [key, intervalMs, enabled]);

  function clear() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(key);
    setSavedAt(null);
  }

  function load(): T | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  return { savedAt, clear, load };
}
