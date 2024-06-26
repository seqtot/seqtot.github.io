import { QContext } from "../types";
import { undefinedOrTrue } from "../utils";

export default function checkForAfterHook(context: QContext, done) {
  if (
    context.match.route.hooks &&
    context.match.route.hooks.after &&
    undefinedOrTrue(context.navigateOptions, "callHooks")
  ) {
    context.match.route.hooks.after.forEach((f) => f(context.match));
  }
  done();
}
