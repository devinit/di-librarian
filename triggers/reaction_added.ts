import { Trigger } from "deno-slack-sdk/types.ts";
import {
  TriggerContextData,
  TriggerEventTypes,
  TriggerTypes,
} from "deno-slack-api/mod.ts";
import workflow from "../workflows/reply_to_reaction.ts";

const trigger: Trigger<typeof workflow.definition> = {
  type: TriggerTypes.Event,
  name: "Trigger the reply_to_reaction workflow",
  workflow: `#/workflows/${workflow.definition.callback_id}`,
  event: {
    event_type: TriggerEventTypes.ReactionAdded,
    channel_ids: ["C055WR30JF5"],
    filter: {
      version: 1,
      root: {
        statement: "{{data.reaction}} == book",
      },
    },
  },
  inputs: {
    channelId: { value: TriggerContextData.Event.ReactionAdded.channel_id },
    messageTs: { value: TriggerContextData.Event.ReactionAdded.message_ts },
    reaction: { value: TriggerContextData.Event.ReactionAdded.reaction },
  },
};
export default trigger;
