import { useState, useEffect, useRef } from "react";

export default function useThrottle<T>(value: T, limit: number): T {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastRan = useRef(Date.now());

  useEffect(() => {
    function update() {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }
    
    const time = limit - (Date.now() - lastRan.current)
    if (time <= 0) {
      update();
      return;
    }

    const handler = setTimeout(update, time);

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);

  return throttledValue;
};
