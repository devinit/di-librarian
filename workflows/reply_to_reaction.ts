import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { def as replyToBook } from "../functions/reply_to_book.ts";

const workflow = DefineWorkflow({
  callback_id: "reply-to-reaction-workflow",
  title: "Reply to Reaction Workflow",
  input_parameters: {
    properties: {
      // All the possible inputs from the "reaction_added" event trigger
      channelId: { type: Schema.slack.types.channel_id },
      userId: { type: Schema.slack.types.user_id },
      messageTs: { type: Schema.types.string },
      reaction: { type: Schema.types.string },
    },
    required: ["channelId", "userId", "messageTs", "reaction"],
  },
});

workflow.addStep(replyToBook, workflow.inputs);

export default workflow;
