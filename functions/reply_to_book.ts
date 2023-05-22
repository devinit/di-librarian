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

export default SlackFunction(def, async ({ inputs, client, env }) => {
  const emptyOutputs = { outputs: {} };
  const booksToShelve = Array<string>();
  const replies = await client.conversations.replies({
    channel: inputs.channel_id,
    ts: inputs.message_ts,
  });
  const files = findFiles(replies.messages);
  if (files.length > 0) {
    for (const file of files) {
      booksToShelve.push(file.name);
      const body = new FormData();
      body.append("title", file.name);
      body.append("source", file.url_private);
      body.append("channel", inputs.channel_id);
      await fetch(
        "https://knowledge.devinit.org/api/documents/",
        {
          method: "POST",
          headers: {
            "Authorization": `Basic ${
              btoa(`${env.KNOWLEDGE_USER}:${env.KNOWLEDGE_PASS}`)
            }`,
          },
          body,
        },
      );
    }
  }
  const hyperlinks = findHyperlinks(replies.messages);
  if (hyperlinks.length > 0) {
    for (const hyperlink of hyperlinks) {
      booksToShelve.push(`<${hyperlink.url}|${hyperlink.name}>`);
      const body = new FormData();
      body.append("title", hyperlink.name);
      body.append("source", hyperlink.url);
      body.append("channel", inputs.channel_id);
      await fetch(
        "https://knowledge.devinit.org/api/documents/",
        {
          method: "POST",
          headers: {
            "Authorization": `Basic ${
              btoa(`${env.KNOWLEDGE_USER}:${env.KNOWLEDGE_PASS}`)
            }`,
          },
          body,
        },
      );
    }
  }
  const response = `Thanks <@${inputs.user_id}>, I'll save ${
    joinWithOxfordCommas(booksToShelve)
  } in the library :${inputs.reaction}:!`;
  if (booksToShelve.length === 0) {
    return emptyOutputs;
  }
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

function findFiles(
  // deno-lint-ignore no-explicit-any
  replies: Record<string, any>[],
  // deno-lint-ignore no-explicit-any
): Record<string, any>[] {
  // deno-lint-ignore no-explicit-any
  const files: Record<string, any>[] = [];
  if (!replies) {
    return files;
  }
  for (const messageInThread of replies) {
    if (messageInThread.files) {
      for (const file of messageInThread.files) {
        files.push(file);
      }
    }
  }
  return files;
}

function findHyperlinks(
  // deno-lint-ignore no-explicit-any
  replies: Record<string, any>[],
  // deno-lint-ignore no-explicit-any
): Record<string, any>[] {
  // deno-lint-ignore no-explicit-any
  const hyperlinks: Record<string, any>[] = [];
  const urls: string[] = [];
  if (!replies) {
    return hyperlinks;
  }
  for (const messageInThread of replies) {
    const text = messageInThread.text || "";
    const regex =
      /<(https?:\/\/[\w]+(?:\.[\w]+)+(?:\/[\w-?=%&;@$#_.+]+)*\/?)(?:\|((?:[^>])+))?>/g;
    const matches = text.matchAll(regex);
    for (const match of matches) {
      const url = match[1];
      let name = match[2];
      if (name === undefined) {
        name = url;
      }
      if (!urls.includes(url)) {
        urls.push(url);
        hyperlinks.push({ name: name, url: url });
      }
    }
  }
  return hyperlinks;
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

function joinWithOxfordCommas(strings: string[]): string {
  const length = strings.length;

  if (length === 0) {
    return "";
  }

  if (length === 1) {
    return strings[0];
  }

  if (length === 2) {
    return strings.join(" and ");
  }

  const lastString = strings[length - 1];
  const remainingStrings = strings.slice(0, length - 1);
  const joinedStrings = remainingStrings.join(", ");

  return `${joinedStrings}, and ${lastString}`;
}
