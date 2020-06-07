import { useMemo } from "react";

interface ReturnValue {
  byteLength: number;
  isLargeFile: boolean;
}

// One megabyte in bytes.
const ONE_MEGABYTE = 1024 * 1024;

export default function useStringByteLength(str: string): ReturnValue {
  const byteLength: number = useMemo(() => {
    // Use native features instead of buffer here.
    return new TextEncoder().encode(str).length
  }, [str]);

  return {
    byteLength,
    isLargeFile: byteLength >= ONE_MEGABYTE
  }
}