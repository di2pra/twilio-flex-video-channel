import { Button, Heading, Spinner, Stack } from '@twilio-paste/core';
import { Box } from '@twilio-paste/core/box';
import { VideoOnIcon } from "@twilio-paste/icons/esm/VideoOnIcon";
import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { parseJwt, removeElementByTagName } from '../../Helpers';
import useApi from '../../hooks/useApi';
import useTwilioRoom from '../../hooks/useTwilioRoom';
import { IParsedToken } from '../../Types';

export const VideoCall: React.FC = () => {

  let { sid } = useParams();

  const { tokenCustomer } = useApi();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const localMediaContainer = React.useRef<HTMLElement>(null);
  const remoteMediaContainer = React.useRef<HTMLElement>(null);

  let { room, agentTracks, customerTracks, connectRoom, disconnectRoom } = useTwilioRoom();

  const joinVideoRoom = useCallback(async () => {

    if (sid) {
      setIsLoading(true);
      const { token } = await tokenCustomer(sid);
      const parsedToken = parseJwt(token) as IParsedToken;
      await connectRoom(token, parsedToken.grants.video.room);
      setIsLoading(false);
    }


  }, [tokenCustomer, connectRoom, sid]);

  useEffect(() => {

    removeElementByTagName(localMediaContainer.current, 'video');

    if (customerTracks.video) {
      localMediaContainer.current?.appendChild(customerTracks.video.attach());
    }

  }, [localMediaContainer, customerTracks.video]);

  useEffect(() => {

    removeElementByTagName(localMediaContainer.current, 'audio');

    if (customerTracks.audio) {
      localMediaContainer.current?.appendChild(customerTracks.audio.attach());
    }

  }, [localMediaContainer, customerTracks.audio]);

  useEffect(() => {

    removeElementByTagName(remoteMediaContainer.current, 'video');

    if (agentTracks.video) {
      remoteMediaContainer.current?.appendChild(agentTracks.video.attach());
    }

  }, [agentTracks.video]);

  useEffect(() => {

    removeElementByTagName(remoteMediaContainer.current, 'audio');

    if (agentTracks.audio) {
      remoteMediaContainer.current?.appendChild(agentTracks.audio.attach());
    }

  }, [agentTracks.audio]);

  const resetInteraction = useCallback(() => {
    disconnectRoom(room)
  }, [room, disconnectRoom]);

  if (isLoading) {
    return (
      <Box>
        <Box display='flex' marginTop='space100' justifyContent='center' alignItems='center'>
          <Spinner decorative={false} title="Loading" size="sizeIcon80" />
        </Box>
      </Box>
    )
  }

  if (room) {
    return (
      <Box>
        <Box display="flex" marginTop='space100' justifyContent='center' alignItems='center'>
          <Box margin="space40" height="480px" width='640px' position="relative" >
            <Box textAlign="center" zIndex="zIndex10" position="absolute" height="100%" width='100%' display='flex' backgroundColor='colorBackground' justifyContent='center' alignItems='center' >
              <Heading as="h3" variant="heading30">Waiting the agent to connect to the video room</Heading>
            </Box>
            <Box ref={remoteMediaContainer} zIndex="zIndex20" position="absolute" id="remoteMediaContainer" height="100%" width='100%'></Box>
            <Box ref={localMediaContainer} zIndex="zIndex30" id="localMediaContainer" bottom="10px" right="10px" width="133px" height="100px" position="absolute">
            </Box>
          </Box>
        </Box>
      </Box>
    )
  }

  return (
    <Box>
      <Box display="flex" marginTop='space50' justifyContent='center' alignItems='center'>
        <Stack orientation="horizontal" spacing="space30">
          <Button variant="primary" disabled={isLoading} onClick={() => { joinVideoRoom(); }}><VideoOnIcon decorative={false} title="Description of icon" /> Join the video room</Button>
        </Stack>
      </Box>
    </Box>
  )

};