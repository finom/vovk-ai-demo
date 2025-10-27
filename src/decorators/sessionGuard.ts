import { isLoggedIn } from "@/lib/dal";
import { createDecorator, HttpException, HttpStatus } from "vovk";

export const sessionGuard = createDecorator(async (_req, next) => {
  if (!(await isLoggedIn())) {
    throw new HttpException(HttpStatus.UNAUTHORIZED, "Unauthorized");
  }
  return next();
});
