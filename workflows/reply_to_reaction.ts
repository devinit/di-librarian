import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { def as replyToBook } from "../functions/reply_to_book.ts";

const workflow = DefineWorkflow({
  callback_id: "reply-to-reaction-workflow",
  title: "Reply to Reaction Workflow",
  input_parameters: {
    properties: {
      // All the possible inputs from the "reaction_added" event trigger
      channel_id: { type: Schema.slack.types.channel_id },
      user_id: { type: Schema.slack.types.user_id },
      message_ts: { type: Schema.types.string },
      reaction: { type: Schema.types.string },
    },
    required: ["channel_id", "user_id", "message_ts", "reaction"],
  },
});

workflow.addStep(replyToBook, workflow.inputs);

export default workflow;
