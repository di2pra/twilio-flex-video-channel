import '@twilio-labs/serverless-runtime-types';

import { functionValidator as FunctionTokenValidator } from 'twilio-flex-token-validator';

import {
    Context, ServerlessCallback, ServerlessFunctionSignature
} from '@twilio-labs/serverless-runtime-types/types';

type MyEvent = {
  sid: string;
  To: string;
};

type MyContext = {
  TWILIO_WORKSPACE_SID: string;
  SERVICE_SID: string;
  DOMAIN_NAME: string;
  CLIENT_APP_URL: string;
};

// @ts-ignore
export const handler: ServerlessFunctionSignature<MyContext, MyEvent> =
  // @ts-ignore
  FunctionTokenValidator(async function (
    context: Context<MyContext>,
    event: MyEvent,
    callback: ServerlessCallback
  ) {
    const response = new Twilio.Response();
    response.appendHeader("Access-Control-Allow-Origin", "*");
    response.appendHeader("Access-Control-Allow-Methods", "OPTIONS POST");
    response.appendHeader("Content-Type", "application/json");
    response.appendHeader("Access-Control-Allow-Headers", "Content-Type");

    try {
      const { sid, To } = event;

      let client = context.getTwilioClient();

      const task = await client.taskrouter.v1
        .workspaces(context.TWILIO_WORKSPACE_SID)
        .tasks(sid)
        .fetch();

      const taskAttributes = JSON.parse(task.attributes);

      const conversation = await client.conversations
        .conversations(taskAttributes.conversationSid)
        .fetch();

      const conversationAttributes = JSON.parse(conversation.attributes);

      client.conversations
        .conversations(taskAttributes.conversationSid)
        .update({
          attributes: JSON.stringify({
            ...conversationAttributes,
            room: task.sid,
          }),
        });

      await client.taskrouter.v1
        .workspaces(context.TWILIO_WORKSPACE_SID)
        .tasks(sid)
        .update({
          attributes: JSON.stringify({
            ...taskAttributes,
            isWithVideo: true,
          }),
        });

      response.setBody(task);
    } catch (err) {
      if (err instanceof Error) {
        response.setBody({ error: err.message });
      } else {
        response.setBody({ error: "Unknown Error" });
      }
    } finally {
      return callback(null, response);
    }
  });
