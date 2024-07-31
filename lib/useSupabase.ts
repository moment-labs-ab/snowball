import { Alert } from "react-native";
import { useEffect, useState } from "react";

// Define a generic type for the async function
type AsyncFunction<T> = () => Promise<T>;

export const useSupabase = async(fn: Promise)=>{
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fn();
      setData(res);
    } catch (error) {
      Alert.alert("There was an error fetching data using", String(fn));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const refetch = () => fetchData();

  return { data, loading, refetch };
};

export default useSupabase;
