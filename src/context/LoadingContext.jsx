import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";

const DEFAULT_MESSAGES = ["Thinking…", "Working on it…", "Almost there…"];

const LoadingContext = createContext({
  showLoading: () => {},
  hideLoading: () => {},
  setMessages: () => {},
  withLoading: async (fn) => fn(),
  state: { open: false, messages: DEFAULT_MESSAGES, intervalMs: 2500, label: "" },
});

export function LoadingProvider({ children }) {
  const [state, setState] = useState({
    open: false,
    messages: DEFAULT_MESSAGES,
    intervalMs: 2500,
    label: "",
  });

  // Stack of concurrent loaders so nested callers don't hide each other prematurely.
  const stackRef = useRef([]);

  const apply = useCallback(() => {
    const top = stackRef.current[stackRef.current.length - 1];
    if (top) {
      setState({ open: true, ...top });
    } else {
      setState((s) => ({ ...s, open: false }));
    }
  }, []);

  const showLoading = useCallback(
    (messages = DEFAULT_MESSAGES, options = {}) => {
      const id = Symbol("loader");
      const list = Array.isArray(messages) ? messages : [String(messages || "")];
      stackRef.current.push({
        id,
        messages: list.length ? list : DEFAULT_MESSAGES,
        intervalMs: options.intervalMs ?? 2500,
        label: options.label || "",
      });
      apply();
      return id;
    },
    [apply]
  );

  const hideLoading = useCallback(
    (id) => {
      if (id) {
        stackRef.current = stackRef.current.filter((x) => x.id !== id);
      } else {
        stackRef.current.pop();
      }
      apply();
    },
    [apply]
  );

  const setMessages = useCallback(
    (messages) => {
      const top = stackRef.current[stackRef.current.length - 1];
      if (!top) return;
      top.messages = Array.isArray(messages) ? messages : [String(messages || "")];
      apply();
    },
    [apply]
  );

  const withLoading = useCallback(
    async (fn, messages, options) => {
      const id = showLoading(messages, options);
      try {
        return await fn();
      } finally {
        hideLoading(id);
      }
    },
    [showLoading, hideLoading]
  );

  const value = useMemo(
    () => ({ showLoading, hideLoading, setMessages, withLoading, state }),
    [showLoading, hideLoading, setMessages, withLoading, state]
  );

  return <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>;
}

LoadingProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useLoading() {
  return useContext(LoadingContext);
}
