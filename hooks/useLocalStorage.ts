import { Dispatch, SetStateAction, useEffect, useState } from "react";

const LOCAL_STORAGE_CHANGE_EVENT = "lazy-teamup-local-storage-change";

export function useLocalStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(defaultValue);

  useEffect(() => {
    function readValue() {
      const saved = localStorage.getItem(key);
      setValue(saved ? JSON.parse(saved) : defaultValue);
    }

    readValue();

    window.addEventListener("storage", readValue);
    window.addEventListener(LOCAL_STORAGE_CHANGE_EVENT, readValue);

    return () => {
      window.removeEventListener("storage", readValue);
      window.removeEventListener(LOCAL_STORAGE_CHANGE_EVENT, readValue);
    };
  }, [key]);

  const setStoredValue: Dispatch<SetStateAction<T>> = (nextValue) => {
    setValue((current) => {
      const resolvedValue =
        typeof nextValue === "function"
          ? (nextValue as (current: T) => T)(current)
          : nextValue;
      localStorage.setItem(key, JSON.stringify(resolvedValue));
      window.dispatchEvent(new Event(LOCAL_STORAGE_CHANGE_EVENT));

      return resolvedValue;
    });
  };

  return [value, setStoredValue] as const;
}
