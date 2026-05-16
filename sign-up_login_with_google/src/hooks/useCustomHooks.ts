import { useCallback } from "react";
import { useToast } from "@components/common/Toast";

/**
 * Hook for handling async operations with automatic error handling
 */
export const useAsync = <T, E = string>(
  asyncFunction: () => Promise<T>,
  immediate = true,
) => {
  const [status, setStatus] = React.useState<
    "idle" | "pending" | "success" | "error"
  >("idle");
  const [value, setValue] = React.useState<T | null>(null);
  const [error, setError] = React.useState<E | null>(null);
  const { addToast } = useToast();

  const execute = useCallback(async () => {
    setStatus("pending");
    setValue(null);
    setError(null);

    try {
      const response = await asyncFunction();
      setValue(response);
      setStatus("success");
      return response;
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message || err.message || "An error occurred";
      setError(errorMsg);
      setStatus("error");
      addToast(errorMsg, "error");
      throw err;
    }
  }, [asyncFunction, addToast]);

  React.useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { execute, status, value, error };
};

/**
 * Hook for debounced values
 */
export const useDebounce = <T>(value: T, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Hook for managing local storage
 */
export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = React.useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error(error);
      }
    },
    [key, storedValue],
  );

  return [storedValue, setValue] as const;
};

/**
 * Hook for previous value
 */
export const usePrevious = <T>(value: T) => {
  const ref = React.useRef<T>();

  React.useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
};

/**
 * Hook for mounted state
 */
export const useIsMounted = () => {
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  return isMounted;
};

import React from "react";
