import { useRegistry } from "@/registry";
import { createFetcher } from "vovk";

export const fetcher = createFetcher({
  transformResponse: async (data) => {
    const state = useRegistry.getState();

    console.log("data", data);
    if (
      data &&
      typeof data === "object" &&
      Symbol.asyncIterator in data &&
      "onIterate" in data &&
      typeof data.onIterate === "function"
    ) {
      data.onIterate((item: unknown) => {
        console.log("POLL ITEM", item);
        state.parse(item);
      }); // handle each item in the async iterable
      return data;
    }

    state.parse(data); // parse regular JSON data
    return data;
  },
});
