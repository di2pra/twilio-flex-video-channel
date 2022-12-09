import '@twilio-labs/serverless-runtime-types';
import { Context, ServerlessCallback, ServerlessFunctionSignature } from '@twilio-labs/serverless-runtime-types/types';
import { jwt } from 'twilio';


type MyEvent = {
  sid: string;
}

type MyContext = {
  ACCOUNT_SID: string;
  TWILIO_API_KEY_SID: string;
  TWILIO_API_KEY_SECRET: string;
}

export const handler: ServerlessFunctionSignature<MyContext, MyEvent> = async function (
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

    const customerIdentity = `customer`;

    const token = new jwt.AccessToken(
      context.ACCOUNT_SID,
      context.TWILIO_API_KEY_SID,
      context.TWILIO_API_KEY_SECRET
    );

    token.identity = customerIdentity;

    const roomName = event.sid;

    const videoGrant = new jwt.AccessToken.VideoGrant({
      room: roomName
    });

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


};