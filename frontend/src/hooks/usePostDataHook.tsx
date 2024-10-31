import { useState } from "react";
const base_url = process.env.REACT_APP_API_URL;

interface PostOptions {
  headers?: HeadersInit;
  body?: any;
}

interface UsePostResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
  post: (url: string, options?: PostOptions) => Promise<void>;
}

const usePostDataHook = <T = any,>(): UsePostResponse<T> => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const post = async (url: string, options?: PostOptions) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(base_url + url, {
        method: "POST",
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

  return { data, error, loading, post };
};

export default usePostDataHook;
