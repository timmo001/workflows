import { ActionRuntime } from "../../action/ActionRuntime.js";
import { run } from "./workflow.js";

ActionRuntime.runAction(run(), ActionRuntime.platformLayer);
