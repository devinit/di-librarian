import { DefineWorkflow } from "deno-slack-sdk/mod.ts";
import { def as maintainMembership } from "../functions/maintain_membership.ts";
import { default as replyToReactionWorkflow } from "./reply_to_reaction.ts";

/**
 * A workflow that maintains the trigger settings for the "reacjilator" workflow.
 * This workflow is supposed to be triggered by either a scheduled trigger or a link trigger.
 */
const workflow = DefineWorkflow({
  callback_id: "maintenance-job",
  title: "Maintain the trigger settings and bot user memberships",
  input_parameters: { properties: {}, required: [] },
});

// Add this app's bot user to all the chnanels set for this app's trigger
workflow.addStep(maintainMembership, {
  replyToReactionWorkflowCallbackId:
    replyToReactionWorkflow.definition.callback_id,
});

export default workflow;
