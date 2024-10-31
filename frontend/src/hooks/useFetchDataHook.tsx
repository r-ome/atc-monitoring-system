import { useState, useEffect } from "react";

const useFetchDataHook = (url: string, deps: any[] = []) => {
  const [data, setData] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const base_url = process.env.REACT_APP_API_URL;

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(base_url + url);
      if (!response.ok) {
        throw new Error(`Fetching Error: ${response.statusText}`);
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [...deps]);

  return { data, loading, error, refetch: fetchData };
};

export default useFetchDataHook;
