import { useEffect, useRef } from "react";

const usePreviousValue: any = (value: any) => {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

export default usePreviousValue;
