import { Manifest } from "deno-slack-sdk/mod.ts";

import ReplyToReactionWorkflow from "./workflows/reply_to_reaction.ts";
import { def as replyToBook } from "./functions/reply_to_book.ts";

/**
 * The app manifest contains the app's configuration. This
 * file defines attributes like app name and description.
 * https://api.slack.com/future/manifest
 */
export default Manifest({
  name: "di-librarian",
  description: "A bot to archive DI knowledge",
  icon: "assets/default_new_app_icon.png",
  functions: [
    replyToBook,
  ],
  workflows: [
    ReplyToReactionWorkflow,
  ],
  outgoingDomains: [],
  datastores: [],
  botScopes: [
    "commands",
    "chat:write",
    "chat:write.public",
    "channels:history",
    "groups:history",
    "groups:read",
    "reactions:read",
  ],
});
