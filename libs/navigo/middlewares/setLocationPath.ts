import { QContext } from "../types";
import { getCurrentEnvURL } from "../utils";

export default function setLocationPath(context: QContext, done: () => void): void {

  const { currentLocationPath, instance } = context;

  if (typeof currentLocationPath === "undefined") {
    context.currentLocationPath = context.to = getCurrentEnvURL(instance.root); // getCurrentURLPath(instance.root);
  }

  context.currentLocationPath = instance._checkForAHash(currentLocationPath);

  done();
}
