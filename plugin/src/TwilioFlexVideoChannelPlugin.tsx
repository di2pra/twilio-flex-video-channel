import { Heading } from '@twilio-paste/core';
import { CustomizationProvider } from '@twilio-paste/core/customization';
import { FlexPlugin } from '@twilio/flex-plugin';
import * as Flex from '@twilio/flex-ui';

import BtnVideoComponent from './components/BtnVideoComponent';
import VideoComponent from './components/VideoComponent';
import VideoMonitor from './components/VideoMonitor';

const PLUGIN_NAME = "TwilioFlexVideoChannelPlugin";

export default class TwilioFlexVideoChannelPlugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
  }

  /**
   * This code is run when your plugin is being started
   * Use this to modify any UI components or attach to the actions framework
   *
   * @param flex { typeof Flex }
   */
  async init(flex: typeof Flex, manager: Flex.Manager): Promise<void> {
    flex.setProviders({
      PasteThemeProvider: CustomizationProvider,
    });

    /* ==================
    Chat with Video Channel
    =================== */

    const chatWithVideoChannel = flex.DefaultTaskChannels.createChatTaskChannel(
      "chat-with-video",
      (task) =>
        task.taskChannelUniqueName === "chat-with-video" &&
        task.attributes.isWithVideo != undefined &&
        task.attributes.isWithVideo === true
    );
    chatWithVideoChannel.icons = {
      active: "Video",
      list: {
        Assigned: "Video",
        Canceled: "Video",
        Completed: "Video",
        Pending: "Video",
        Reserved: "Video",
        Wrapping: "Video",
      },
      main: "Video",
    };

    flex.TaskChannels.register(chatWithVideoChannel);

    /* ==================
    =================== */

    /* ==================
    Chat without Video Channel
    =================== */

    const chatWithoutVideoChannel =
      flex.DefaultTaskChannels.createChatTaskChannel(
        "chat-without-video",
        (task) =>
          task.taskChannelUniqueName === "chat-with-video" &&
          task.attributes.isWithVideo != undefined &&
          task.attributes.isWithVideo === false
      );

    chatWithoutVideoChannel.addedComponents = [
      {
        target: "TaskCanvasHeader",
        component: (
          <BtnVideoComponent manager={manager} key="btnVideoComponent" />
        ),
        options: {
          if: (props: any) => {
            return props.task.taskStatus === "assigned";
          },
        },
      },
    ];

    flex.TaskChannels.register(chatWithoutVideoChannel);

    /* ==================
    =================== */

    flex.AgentDesktopView.Panel2.Content.add(
      <VideoComponent manager={manager} key="IncomingVideoComponent" />,
      {
        sortOrder: -1,
        if: (props) => {
          if (props.selectedTaskSid) {
            const task: Flex.ITask<Record<string, any>> = props.tasks.get(
              props.selectedTaskSid
            );

            return (
              task &&
              task.taskChannelUniqueName === "chat-with-video" &&
              task.attributes.isWithVideo === true &&
              task.status === "accepted"
            );
          } else {
            return false;
          }
        },
      }
    );

    /* ==================
    Video Supervisor
    =================== */

    flex.Supervisor.TaskCanvasHeader.Content.add(
      <VideoMonitor manager={manager} key="video-monitor" />,
      {
        sortOrder: -1,
      }
    );

    /* ==================
    =================== */

    flex.AgentDesktopView.Panel2.Content.add(
      <Heading as="h1" variant="heading10" key="myComponent">
        Hello World
      </Heading>
    );
  }
}
