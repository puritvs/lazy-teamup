import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
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

  const setStoredValue: Dispatch<SetStateAction<T>> = useCallback(
    (nextValue) => {
      setValue((current) => {
        const resolvedValue =
          typeof nextValue === "function"
            ? (nextValue as (current: T) => T)(current)
            : nextValue;

        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(resolvedValue));
        }

        return resolvedValue;
      });
    },
    [key],
  );

  return [value, setStoredValue] as const;
}
