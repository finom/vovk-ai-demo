import { useRegistry } from "@/registry";
import { createFetcher } from "vovk";

export const fetcher = createFetcher({
  transformResponse: (data) => {
    const state = useRegistry.getState();
    if(Symbol.asyncIterator in data) {
      async function* generator() {
        for await (const item of data) {
          state.parse(item); // parse each item in the async iterable
          yield item;
        }
      }
      
      generator[Symbol.dispose] = data[Symbol.dispose];
      generator[Symbol.asyncDispose] = data[Symbol.asyncDispose];

      return generator;
    } 
    
    state.parse(data); // parse regular JSON data
    return data;
  },
});
