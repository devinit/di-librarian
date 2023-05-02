import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { SlackAPIClient } from "deno-slack-sdk/types.ts";

export const def = DefineFunction({
  callback_id: "reply-to-book",
  title: "Replies in a thread to messages with book emojis",
  source_file: "functions/reply_to_book.ts",
  input_parameters: {
    properties: {
      channel_id: { type: Schema.types.string },
      message_ts: { type: Schema.types.string },
      user_id: { type: Schema.types.string },
      reaction: { type: Schema.types.string },
    },
    required: ["channel_id", "message_ts", "user_id", "reaction"],
  },
  output_parameters: {
    properties: {
      channel_id: { type: Schema.types.string },
      message_ts: { type: Schema.types.string },
      user_id: { type: Schema.types.string },
    },
    required: [],
  },
});

export default SlackFunction(def, async ({ inputs, client }) => {
  const emptyOutputs = { outputs: {} };
  const response =
    `Thanks <@${inputs.user_id}>, I'll save the contents of this message in the library :${inputs.reaction}:!`;
  const replies = await client.conversations.replies({
    channel: inputs.channel_id,
    ts: inputs.message_ts,
  });
  if (isAlreadyPosted(replies.messages, response)) {
    return emptyOutputs;
  }
  await sayInThread(
    client,
    inputs.channel_id,
    inputs.message_ts,
    response,
  );
  return {
    outputs: {
      channel_id: inputs.channel_id,
      message_ts: inputs.message_ts,
      user_id: inputs.user_id,
    },
  };
});

// ---------------------------
// Internal functions
// ---------------------------

function isAlreadyPosted(
  // deno-lint-ignore no-explicit-any
  replies: Record<string, any>[],
  translatedText: string,
): boolean {
  if (!replies) {
    return false;
  }
  for (const messageInThread of replies) {
    if (messageInThread.text && messageInThread.text === translatedText) {
      return true;
    }
  }
  return false;
}

async function sayInThread(
  client: SlackAPIClient,
  channelId: string,
  threadTs: string,
  text: string,
) {
  return await client.chat.postMessage({
    channel: channelId,
    text,
    thread_ts: threadTs,
  });
}
