import { QContext } from "../types";

export default function waitingList(context: QContext) {
  context.instance.__markAsClean(context);
}
