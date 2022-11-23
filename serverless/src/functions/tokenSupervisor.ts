import '@twilio-labs/serverless-runtime-types';
import { Context, ServerlessCallback, ServerlessFunctionSignature } from '@twilio-labs/serverless-runtime-types/types';
import { jwt } from "twilio";

import { functionValidator as FunctionTokenValidator, validator as TokenValidator } from 'twilio-flex-token-validator';

type MyEvent = {
  Token: string;
}

type MyContext = {
  ACCOUNT_SID: string;
  AUTH_TOKEN: string;
  TWILIO_API_KEY_SID: string;
  TWILIO_API_KEY_SECRET: string;
  TWILIO_CONVERSATION_SERVICE_SID: string;
}

// @ts-ignore
export const handler: ServerlessFunctionSignature<MyContext, MyEvent> = FunctionTokenValidator(async function (
  context: Context<MyContext>,
  event: MyEvent,
  callback: ServerlessCallback
) {

  const response = new Twilio.Response();
  response.appendHeader('Access-Control-Allow-Origin', '*');
  response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS POST');
  response.appendHeader('Content-Type', 'application/json');
  response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');

  try {

    const {
      Token: FlexToken
    } = event;

    const flexTokenInformation = await TokenValidator(FlexToken, context.ACCOUNT_SID || '', context.AUTH_TOKEN || '') as {
      identity: string;
    };

    const token = new jwt.AccessToken(
      context.ACCOUNT_SID,
      context.TWILIO_API_KEY_SID,
      context.TWILIO_API_KEY_SECRET
    );

    token.identity = `supervisor`;

    const videoGrant = new jwt.AccessToken.VideoGrant();

    token.addGrant(videoGrant);

    response.setBody({ token: token.toJwt() });

  } catch (err) {

    if (err instanceof Error) {
      response.setBody({ error: err.message });
    } else {
      response.setBody({ error: 'Unknown Error' });
    }

  } finally {
    return callback(null, response);
  }
});