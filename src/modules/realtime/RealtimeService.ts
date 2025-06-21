import type { VovkBody, VovkQuery } from "vovk";
import type RealtimeController from "./RealtimeController";

export default class RealtimeService {
  static getRealtimes = (
    search: VovkQuery<typeof RealtimeController.getRealtimes>["search"],
  ) => {
    return { results: [], search };
  };

  static updateRealtime = (
    id: string,
    q: VovkQuery<typeof RealtimeController.updateRealtime>["q"],
    body: VovkBody<typeof RealtimeController.updateRealtime>,
  ) => {
    return { id, q, body };
  };

  // ...
}
