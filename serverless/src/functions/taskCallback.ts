import '@twilio-labs/serverless-runtime-types';
import { Context, ServerlessCallback, ServerlessFunctionSignature } from '@twilio-labs/serverless-runtime-types/types';

type MyEvent = {
  EventType: string;
  TaskSid: string;
  TaskAttributes: string;
}

type MyContext = {
  ACCOUNT_SID: string;
  AUTH_TOKEN: string;
  TWILIO_API_KEY_SID: string;
  TWILIO_API_KEY_SECRET: string;
  TWILIO_CONVERSATION_SERVICE_SID: string;
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

    if (event.EventType === "task.wrapup") {

      const roomName = event.TaskSid;

      let client = context.getTwilioClient();

      await client.video.rooms(roomName).update({ status: 'completed' });

    }

    response.setBody({});

    return callback(null, response);

  } catch (err) {

    if (err instanceof Error) {
      response.setStatusCode(500);
      response.setBody({ error: err.message })
    } else {
      response.setStatusCode(500);
      response.setBody({ error: 'Unknown Error' })
    }

  }


  return callback(null, response);
};