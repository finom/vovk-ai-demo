import { useRegistry } from "@/registry";
import { createFetcher } from "vovk";

export const fetcher = createFetcher({
  transformResponse: (data) => {
    const state = useRegistry.getState();
    if(Symbol.asyncIterator in data) {
      void (async () => {
        for await (const item of data) {
          state.parse(item); // parse JSONLines data
        }
      })();
    } else {
      state.parse(data); // parse regular JSON data
    }

    return data;
  },
});
