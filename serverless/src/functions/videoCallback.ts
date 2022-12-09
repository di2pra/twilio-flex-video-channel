import '@twilio-labs/serverless-runtime-types';
import { Context, ServerlessCallback, ServerlessFunctionSignature } from '@twilio-labs/serverless-runtime-types/types';

type MyEvent = {
  StatusCallbackEvent: string;
  ParticipantIdentity?: string;
  RoomSid: string;
  RoomName: string;
}

type MyContext = {
}

// @ts-ignore
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

    let client = context.getTwilioClient();

    if (event.StatusCallbackEvent === 'participant-connected' && event.ParticipantIdentity && event.ParticipantIdentity === 'customer') {

      await client.video.rooms(event.RoomSid).participants.get(event.ParticipantIdentity)
        .subscribeRules.update({
          rules: [
            { "type": "include", "all": true },
            { "type": "exclude", "publisher": "supervisor" }
          ]
        })
    }

    response.setBody({});

  } catch (err) {

    if (err instanceof Error) {
      response.setStatusCode(500);
      response.setBody({ error: err.message })
    } else {
      response.setStatusCode(500);
      response.setBody({ error: 'Unknown Error' })
    }

  } finally {
    return callback(null, response);
  }



};