import { Trigger } from "deno-slack-sdk/types.ts";
import workflow from "../workflows/reply_to_reaction.ts";

const trigger: Trigger<typeof workflow.definition> = {
  type: "event",
  name: "Trigger the example workflow",
  workflow: `#/workflows/${workflow.definition.callback_id}`,
  event: {
    event_type: "slack#/events/reaction_added",
    channel_ids: ["C055WR30JF5"],
    filter: {
      version: 1,
      root: {
        statement: "{{data.reaction}} == book",
      },
    },
  },
  inputs: {
    channel_id: { value: "{{data.channel_id}}" },
    user_id: { value: "{{data.user_id}}" },
    message_ts: { value: "{{data.message_ts}}" },
    reaction: { value: "{{data.reaction}}" },
  },
};
export default trigger;