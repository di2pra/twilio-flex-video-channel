import '@twilio-labs/serverless-runtime-types';
import { Context, ServerlessCallback, ServerlessFunctionSignature } from '@twilio-labs/serverless-runtime-types/types';

type MyEvent = {}

type MyContext = {}

// @ts-ignore
export const handler: ServerlessFunctionSignature<MyContext, MyEvent> = async function (
  _: Context<MyContext>,
  __: MyEvent,
  callback: ServerlessCallback
) {

  try {

    const partnersRaw = Runtime.getAssets()['/partners.json'].open();

    const partners = JSON.parse(partnersRaw);

    const response = new Twilio.Response();
    response.appendHeader('Access-Control-Allow-Origin', '*');
    response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS POST');
    response.appendHeader('Content-Type', 'application/json');
    response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');

    response.setBody(partners);

    return callback(null, response);

  } catch (err) {

    if (err instanceof Error) {
      return callback(err);
    } else {
      return callback(null, new Error('Unknown Error'));
    }

  }
};