import { post, prefix } from "vovk";
import TelegramService from "./TelegramService";
import { NextRequest } from "next/server";

@prefix("telegram")
export default class TelegramController {
  @post("bot")
  static async handle(request: NextRequest) {
    return TelegramService.handle(request);
  }
}
