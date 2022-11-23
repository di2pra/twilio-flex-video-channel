import { CustomizationProvider } from '@twilio-paste/core/customization';
import { FlexPlugin } from '@twilio/flex-plugin';
import * as Flex from '@twilio/flex-ui';
import AudioComponent from './components/AudioComponent';

import VideoComponent from './components/VideoComponent';
import VideoMonitor from './components/VideoMonitor';

const PLUGIN_NAME = 'TwilioFlexVideoChannelPlugin';

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
      PasteThemeProvider: CustomizationProvider
    });

    flex.MainHeader
      .defaultProps
      .logoUrl = "https://www.sourdline.com/images/logo_sourdline.png";



    /* ==================
    Chat with Video Channel
    =================== */

    const chatWithVideoChannel = flex.DefaultTaskChannels.createChatTaskChannel("chat-with-video", (task) => task.taskChannelUniqueName === "chat" && task.attributes.isWithVideo != undefined && task.attributes.isWithVideo === true);
    chatWithVideoChannel.icons = {
      active: 'Video',
      list: {
        Assigned: 'Video',
        Canceled: 'Video',
        Completed: 'Video',
        Pending: 'Video',
        Reserved: 'Video',
        Wrapping: 'Video'
      },
      main: 'Video'
    };

    chatWithVideoChannel.addedComponents = [
      {
        target: "CRMContainer",
        component: <VideoComponent manager={manager} key="IncomingVideoComponent" />,
        options: {
          sortOrder: -1,
          align: 'start',
          if: (props: any) => {
            return props.task.taskStatus === "assigned"
          }
        }
      }
    ];

    flex.TaskChannels.register(chatWithVideoChannel);

    /* ==================
    =================== */


    /* ==================
    Chat without Video Channel
    =================== */

    const chatWithoutVideoChannel = flex.DefaultTaskChannels.createChatTaskChannel("chat-without-video", (task) => task.taskChannelUniqueName === "chat" && task.attributes.isWithVideo != undefined && task.attributes.isWithVideo === false);

    chatWithoutVideoChannel.addedComponents = [
      {
        target: "CRMContainer",
        component: <AudioComponent manager={manager} key="IncomingVideoComponent" />,
        options: {
          sortOrder: -1,
          align: 'start',
          if: (props: any) => {
            return props.task.taskStatus === "assigned"
          }
        }
      }
    ];


    flex.TaskChannels.register(chatWithoutVideoChannel);


    flex.CRMContainer.defaultProps.uriCallback = (task) => {
      return (task && task.taskStatus === "assigned")
        ? `https://form.jotform.com/223015264581046`
        : 'https://eu.jotform.com/tables/223015264581046';
    }

    flex.Supervisor.TaskCanvasHeader.Content.add(
      <VideoMonitor manager={manager} key="video-monitor" />,
      {
        sortOrder: -1
      }
    );

  }
}
