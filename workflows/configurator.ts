import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { def as configure } from "../functions/configure.ts";
import { default as replyToReactionWorkflow } from "./reply_to_reaction.ts";

/**
 * A workflow for configuring where to run the reply_to_reaction workflow.
 * End-users can easily update the channel list in the Slack UI.
 */
const workflow = DefineWorkflow({
  callback_id: "configurator",
  title: "Configure DI librarian app in channels",
  input_parameters: {
    properties: { interactivity: { type: Schema.slack.types.interactivity } },
    required: ["interactivity"],
  },
});

// Handle the interaction with the end-user who invoked this workflow
// This app's trigger information will be updated runtime
workflow.addStep(configure, {
  interactivityPointer: workflow.inputs.interactivity.interactivity_pointer,
  replyToReactionWorkflowCallbackId:
    replyToReactionWorkflow.definition.callback_id,
});

export default workflow;
