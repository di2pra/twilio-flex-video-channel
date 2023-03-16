import React, { useEffect, useRef } from 'react';
import { LocalAudioTrack, LocalVideoTrack, RemoteAudioTrack, RemoteVideoTrack } from 'twilio-video';

import { Box, Heading } from '@twilio-paste/core';

import { removeElementByTagName } from '../../Helpers';

type Props = {
  agentTracks: {
    video?: RemoteVideoTrack | undefined;
    audio?: RemoteAudioTrack | undefined;
  };
  customerTracks: {
    video?: LocalVideoTrack | undefined;
    audio?: LocalAudioTrack | undefined;
  };
};

export const VideoComponent: React.FC<Props> = ({
  agentTracks,
  customerTracks,
}) => {
  const localMediaContainer = useRef<HTMLElement>(null);
  const remoteMediaContainer = useRef<HTMLElement>(null);

  useEffect(() => {
    removeElementByTagName(localMediaContainer.current, "video");

    if (customerTracks.video) {
      localMediaContainer.current?.appendChild(customerTracks.video.attach());
    }
  }, [localMediaContainer, customerTracks.video]);

  useEffect(() => {
    removeElementByTagName(localMediaContainer.current, "audio");

    if (customerTracks.audio) {
      localMediaContainer.current?.appendChild(customerTracks.audio.attach());
    }
  }, [localMediaContainer, customerTracks.audio]);

  useEffect(() => {
    removeElementByTagName(remoteMediaContainer.current, "video");

    if (agentTracks.video) {
      remoteMediaContainer.current?.appendChild(agentTracks.video.attach());
    }
  }, [agentTracks.video]);

  useEffect(() => {
    removeElementByTagName(remoteMediaContainer.current, "audio");

    if (agentTracks.audio) {
      remoteMediaContainer.current?.appendChild(agentTracks.audio.attach());
    }
  }, [agentTracks.audio]);

  return (
    <Box margin="space40" height="480px" width="640px" position="relative">
      <Box
        zIndex="zIndex10"
        position="absolute"
        height="100%"
        width="100%"
        display="flex"
        backgroundColor="colorBackground"
        justifyContent="center"
        alignItems="center"
      >
        <Heading as="h3" variant="heading30">
          Waiting the agent to connect to the video room
        </Heading>
      </Box>
      <Box
        ref={remoteMediaContainer}
        zIndex="zIndex20"
        position="absolute"
        id="remoteMediaContainer"
        height="100%"
        width="100%"
      ></Box>
      <Box
        ref={localMediaContainer}
        zIndex="zIndex30"
        id="localMediaContainer"
        bottom="10px"
        right="10px"
        width="133px"
        height="100px"
        position="absolute"
      ></Box>
    </Box>
  );
};
