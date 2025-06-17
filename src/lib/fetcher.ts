import { useRegistry } from "@/registry";
import { createFetcher } from "vovk";

export const fetcher = createFetcher({
  transformResponse: (resp) => {
    useRegistry.getState().parse(resp);
    return resp;
  },
});
