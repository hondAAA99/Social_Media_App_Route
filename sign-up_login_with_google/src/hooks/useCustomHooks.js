import { useCallback } from "react";
import { useToast } from "@components/common/Toast";
export const useAsync = (asyncFunction, immediate = true) => {
    const [status, setStatus] = React.useState("idle");
    const [value, setValue] = React.useState(null);
    const [error, setError] = React.useState(null);
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
        }
        catch (err) {
            const errorMsg = err.response?.data?.message || err.message || "An error occurred";
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
export const useDebounce = (value, delay = 500) => {
    const [debouncedValue, setDebouncedValue] = React.useState(value);
    React.useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
};
export const useLocalStorage = (key, initialValue) => {
    const [storedValue, setStoredValue] = React.useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        }
        catch {
            return initialValue;
        }
    });
    const setValue = useCallback((value) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
        catch (error) {
            console.error(error);
        }
    }, [key, storedValue]);
    return [storedValue, setValue];
};
export const usePrevious = (value) => {
    const ref = React.useRef();
    React.useEffect(() => {
        ref.current = value;
    }, [value]);
    return ref.current;
};
export const useIsMounted = () => {
    const [isMounted, setIsMounted] = React.useState(false);
    React.useEffect(() => {
        setIsMounted(true);
    }, []);
    return isMounted;
};
import React from "react";
