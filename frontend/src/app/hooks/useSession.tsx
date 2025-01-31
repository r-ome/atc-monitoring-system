import { useState, useEffect } from "react";

const useSession = <T,>(key: string, initialValue: T) => {
  const [value, setValue] = useState<T>(() => {
    const sessionValue = sessionStorage.getItem(key);
    return sessionValue ? JSON.parse(sessionValue) : initialValue;
  });

  useEffect(() => {
    const sessionValue = sessionStorage.getItem(key);

    // Only update sessionStorage if the value is different from what's already stored
    if (value !== sessionValue) {
      if (value !== undefined && value !== null) {
        sessionStorage.setItem(key, JSON.stringify(value));
      } else {
        sessionStorage.removeItem(key);
      }
    }
  }, [key, value]); // Now this is only triggered when the value actually changes

  return [value, setValue] as const;
};

export default useSession;
