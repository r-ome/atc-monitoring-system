import { useState } from "react";
const base_url = process.env.REACT_APP_API_URL;

interface PutOptions {
  headers?: HeadersInit;
  body?: any;
}

interface UsePutResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
  put: (url: string, options?: PutOptions) => Promise<void>;
}

const usePutDataHook = <T = any,>(): UsePutResponse<T> => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const put = async (url: string, options?: PutOptions) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(base_url + url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
        body: JSON.stringify(options?.body),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const result: T = await response.json();
      setData(result);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return { data, error, loading, put };
};

export default usePutDataHook;
