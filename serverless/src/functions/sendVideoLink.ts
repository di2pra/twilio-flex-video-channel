import '@twilio-labs/serverless-runtime-types';
import { Context, ServerlessCallback, ServerlessFunctionSignature } from '@twilio-labs/serverless-runtime-types/types';

import { functionValidator as FunctionTokenValidator } from 'twilio-flex-token-validator';

type MyEvent = {
  sid: string;
  To: string;
}

type MyContext = {
  TWILIO_WORKSPACE_SID: string;
  TWILIO_FROM_NUMBER: string;
  SERVICE_SID: string;
  DOMAIN_NAME: string;
  CUSTOM_DOMAIN_NAME: string;
  CLIENT_APP_URL: string;
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
      sid,
      To
    } = event;

    let client = context.getTwilioClient();

    await client.messages.create({ body: `Hey, open the video chat here : https://${context.CLIENT_APP_URL}/video/${sid}`, from: context.TWILIO_FROM_NUMBER, to: To })

    const task = await client.taskrouter.v1.workspaces(context.TWILIO_WORKSPACE_SID).tasks(sid).fetch();

    const attributes = JSON.parse(task.attributes);

    await client.taskrouter.v1.workspaces(context.TWILIO_WORKSPACE_SID).tasks(sid).update({
      attributes: JSON.stringify(
        {
          ...attributes,
          isWithVideo: true
        }
      )
    });

    response.setBody(task);

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