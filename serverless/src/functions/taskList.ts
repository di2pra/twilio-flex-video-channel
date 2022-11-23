import '@twilio-labs/serverless-runtime-types';
import { Context, ServerlessCallback, ServerlessFunctionSignature } from '@twilio-labs/serverless-runtime-types/types';


type MyEvent = {
  Token: string;
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
export const handler: ServerlessFunctionSignature<MyContext, MyEvent> = /*FunctionTokenValidator(*/async function (
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

    let client = context.getTwilioClient();

    const taskList = await client.taskrouter.v1.workspaces(context.TWILIO_WORKSPACE_SID)
      .tasks
      .list(
        {
          evaluateTaskAttributes: `isWithVideo == true`,
          assignmentStatus: ['assigned']
        }
      );

    let taskListWithReservation: any[] = [];

    for await (const task of taskList) {
      const reservation = await client.taskrouter.v1.workspaces(context.TWILIO_WORKSPACE_SID).tasks(task.sid).reservations.list();

      taskListWithReservation.push({
        workerName: reservation.length > 0 ? reservation[0].workerName : null,
        sid: task.sid,
        assignmentStatus: task.assignmentStatus
      });


    }

    response.setBody(taskListWithReservation);


  } catch (err) {

    if (err instanceof Error) {
      response.setBody({ error: err.message });
    } else {
      response.setBody({ error: 'Unknown Error' });
    }

  } finally {
    return callback(null, response);
  }
}/*)*/;