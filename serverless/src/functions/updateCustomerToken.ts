import '@twilio-labs/serverless-runtime-types';

import { jwt } from 'twilio';

import {
    Context, ServerlessCallback, ServerlessFunctionSignature
} from '@twilio-labs/serverless-runtime-types/types';

type MyEvent = {
  sid: string;
};

type MyContext = {
  TWILIO_VIDEO_WORKFLOW_SID: string;
  TWILIO_WORKSPACE_SID: string;
  ACCOUNT_SID: string;
  TWILIO_API_KEY_SID: string;
  TWILIO_API_KEY_SECRET: string;
  TWILIO_CONVERSATION_SERVICE_SID: string;
};

export const handler: ServerlessFunctionSignature<MyContext, MyEvent> =
  async function (
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
      const customerIdentity = `customer`;

      const token = new jwt.AccessToken(
        context.ACCOUNT_SID,
        context.TWILIO_API_KEY_SID,
        context.TWILIO_API_KEY_SECRET
      );

      token.identity = customerIdentity;

      const videoGrant = new jwt.AccessToken.VideoGrant({
        room: event.sid,
      });

      token.addGrant(videoGrant);

      const chatGrant = new jwt.AccessToken.ChatGrant({
        serviceSid: context.TWILIO_CONVERSATION_SERVICE_SID,
      });

      token.addGrant(chatGrant);

      response.setBody({
        token: token.toJwt(),
      });
    } catch (err) {
      if (err instanceof Error) {
        response.setBody({ error: err.message });
      } else {
        response.setBody({ error: "Unknown Error" });
      }
    } finally {
      return callback(null, response);
    }
  };
