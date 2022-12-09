import { CustomizationProvider } from '@twilio-paste/core/customization';
import { FlexPlugin } from '@twilio/flex-plugin';
import * as Flex from '@twilio/flex-ui';
import BtnVideoComponent from './components/BtnVideoComponent';

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

    /* ==================
    Voice with Video Channel
    =================== */

    const voiceWithVideoChannel = flex.DefaultTaskChannels.createCallTaskChannel("voice-with-video", (task) => task.taskChannelUniqueName === "voice" && task.attributes.isWithVideo != undefined && task.attributes.isWithVideo === true);

    voiceWithVideoChannel.addedComponents = [
      {
        target: "CRMContainer",
        component: <VideoComponent manager={manager} key="IncomingVideoComponent" />,
        options: {
          sortOrder: -1,
          align: 'start'
        }
      }
    ];

    flex.TaskChannels.register(voiceWithVideoChannel);

    /* ==================
    =================== */


    /* ==================
    Voice without Video Channel
    =================== */

    const voiceWithoutVideoChannel = flex.DefaultTaskChannels.createCallTaskChannel("voice-without-video", (task) => task.taskChannelUniqueName === "voice" && task.attributes.isWithVideo === undefined);

    voiceWithoutVideoChannel.addedComponents = [
      ...voiceWithoutVideoChannel.addedComponents || [],
      {
        target: "TaskCanvasHeader",
        component: <BtnVideoComponent manager={manager} key="btnVideoComponent" />,
        options: {
          if: (props: any) => {
            return props.task.taskStatus === "assigned"
          }
        }
      }
    ];

    flex.TaskChannels.register(voiceWithoutVideoChannel);


    /* ==================
    =================== */

    flex.Supervisor.TaskCanvasHeader.Content.add(
      <VideoMonitor manager={manager} key="video-monitor" />,
      {
        sortOrder: -1
      }
    );

  }
}
