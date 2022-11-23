import '@twilio-labs/serverless-runtime-types';
import { Context, ServerlessCallback, ServerlessFunctionSignature } from '@twilio-labs/serverless-runtime-types/types';

type MyEvent = {
  StatusCallbackEvent: string;
  ParticipantIdentity?: string;
  RoomSid: string;
  RoomName: string;
}

type MyContext = {
  ACCOUNT_SID: string;
  AUTH_TOKEN: string;
  TWILIO_API_KEY_SID: string;
  TWILIO_API_KEY_SECRET: string;
  TWILIO_CONVERSATION_SERVICE_SID: string;
  TWILIO_WORKSPACE_SID: string;
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
            { "type": "exclude", "publisher": "partner" },
            { "type": "exclude", "publisher": "supervisor" }
          ]
        })
    }

    if (event.StatusCallbackEvent === 'room-ended') {

      /*const roomInsight = await client.insights.v1.rooms(event.RoomSid).fetch();
      const roomInsightParticipant = await roomInsight.participants().list();

      const metrics = {
        conversation_measure_1: roomInsight.durationSec,
        conversation_measure_2: roomInsightParticipant.find(item => item.participantIdentity === "customer")?.durationSec,
        conversation_measure_3: roomInsightParticipant.filter(item => item.participantIdentity.includes('agent:')).map(item => item.durationSec).reduce(function (acc, val) { return acc + val; }, 0)
      }

      const task = await client.taskrouter.v1.workspaces(context.TWILIO_WORKSPACE_SID).tasks(event.RoomName).fetch();

      const taskAttributes = JSON.parse(task.attributes);

      await client.taskrouter.v1.workspaces(context.TWILIO_WORKSPACE_SID).tasks(event.RoomName).update({
        attributes: JSON.stringify({
          ...taskAttributes,
          conversations: {
            ...taskAttributes.conversations,
            ...metrics
          }
        })
      });*/

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