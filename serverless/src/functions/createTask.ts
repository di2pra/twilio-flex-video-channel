import '@twilio-labs/serverless-runtime-types';

import { jwt, Twilio as TwilioClient } from 'twilio';
import { InteractionInstance } from 'twilio/lib/rest/flexApi/v1/interaction';

import {
    Context, ServerlessCallback, ServerlessFunctionSignature
} from '@twilio-labs/serverless-runtime-types/types';

const createConversation = async (
  client: TwilioClient,
  customerIdentity: string
) => {
  // Create Channel
  const channel = await client.conversations.conversations.create();

  // Add customer to channel
  await client.conversations.conversations(channel.sid).participants.create({
    identity: customerIdentity,
  });

  return channel;
};

const createInteraction: (
  client: TwilioClient,
  workspace: string,
  workflow: string,
  customerIdentity: string,
  taskAttributes: object
) => Promise<InteractionInstance> = async (
  client,
  workspace,
  workflow,
  customerIdentity,
  taskAttributes
) => {
  const channel = await createConversation(client, customerIdentity);

  return await client.flexApi.v1.interaction.create({
    channel: {
      type: "web",
      initiated_by: "customer",
      properties: {
        media_channel_sid: channel.sid,
      },
    },
    routing: {
      properties: {
        workspace_sid: workspace,
        workflow_sid: workflow,
        task_channel_unique_name: "chat-with-video",
        attributes: {
          ...taskAttributes,
          channelType: "web",
        },
      },
    },
  });
};

type MyEvent = {
  isWithVideo: boolean;
  firstName: string;
  lastName: string;
  phoneNumber: string;
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
      const workspace = context.TWILIO_WORKSPACE_SID;
      const workflow = context.TWILIO_VIDEO_WORKFLOW_SID;

      let client = context.getTwilioClient();

      const customerIdentity = `customer`;

      const interaction = await createInteraction(
        client,
        workspace,
        workflow,
        customerIdentity,
        {
          customerIdentity,
          name: `${event.firstName} ${event.lastName}`,
          customerName: `${event.firstName} ${event.lastName}`,
          phoneNumber: event.phoneNumber,
          isWithVideo: event.isWithVideo,
        }
      );

      const token = new jwt.AccessToken(
        context.ACCOUNT_SID,
        context.TWILIO_API_KEY_SID,
        context.TWILIO_API_KEY_SECRET
      );

      token.identity = customerIdentity;

      if (event.isWithVideo) {
        const roomName = interaction.routing.properties.sid;

        const videoGrant = new jwt.AccessToken.VideoGrant({
          room: roomName,
        });

        token.addGrant(videoGrant);
      }

      const chatGrant = new jwt.AccessToken.ChatGrant({
        serviceSid: context.TWILIO_CONVERSATION_SERVICE_SID,
      });

      token.addGrant(chatGrant);

      response.setBody({
        token: token.toJwt(),
        conversationSid: JSON.parse(interaction.routing.properties.attributes)
          .conversationSid,
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
