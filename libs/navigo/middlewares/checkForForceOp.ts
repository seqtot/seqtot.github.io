import { QContext } from "../types";

export default function checkForForceOp(context: QContext, done) {
  if (context.navigateOptions.force === true) {
    context.instance._setCurrent([
      context.instance._pathToMatchObject(context.to),
    ]);
    done(false);
  } else {
    done();
  }
}
