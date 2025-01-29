import { useState, useEffect } from "react";

const useSession = <T,>(key: string, initialValue: T) => {
  const [value, setValue] = useState<T>(() => {
    const sessionValue = sessionStorage.getItem(key);
    return sessionValue ? JSON.parse(sessionValue) : initialValue;
  });

  useEffect(() => {
    if (value !== undefined && value !== null) {
      sessionStorage.setItem(key, JSON.stringify(value));
    } else {
      sessionStorage.removeItem(key);
    }
  }, [key, value]);

  return [value, setValue] as const;
};

export default useSession;
