import { useEffect } from "react";

export const usePageTitle = (title?: string) => {
  useEffect(() => {
    if (title) {
      document.title = `${title} | Codespace`;
    }
  }, [title]);
};
