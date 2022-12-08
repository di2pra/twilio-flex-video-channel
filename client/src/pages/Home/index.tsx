import { Button, Heading, Spinner, Stack } from '@twilio-paste/core';
import { Box } from '@twilio-paste/core/box';
import { ChatIcon } from "@twilio-paste/icons/esm/ChatIcon";
import { VideoOnIcon } from "@twilio-paste/icons/esm/VideoOnIcon";
import { Client as TwilioChatClient, Conversation } from '@twilio/conversations';
import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { parseJwt, removeElementByTagName } from '../../Helpers';
import useApi from '../../hooks/useApi';
import useTwilioRoom from '../../hooks/useTwilioRoom';
import { IParsedToken } from '../../Types';
import { ChatComponent } from './ChatComponent';

export const Home: React.FC = () => {

  const { createTask } = useApi();
  const [parsedToken, setParsedToken] = useState<IParsedToken>();

  const [currentConversation, setCurrentConversation] = useState<Conversation>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const localMediaContainer = React.useRef<HTMLElement>(null);
  const remoteMediaContainer = React.useRef<HTMLElement>(null);

  let { room, agentTracks, customerTracks, connectRoom, disconnectRoom } = useTwilioRoom();

  const startInteractionWithVideo = useCallback(async () => {


    setIsLoading(true);

    const { token, conversationSid } = await createTask(true);

    const parsedToken = parseJwt(token) as IParsedToken;
    setParsedToken(parsedToken)

    await connectRoom(token, parsedToken.grants.video.room);

    const chatClient = new TwilioChatClient(token);
    const conversation = await chatClient.getConversationBySid(conversationSid);

    setCurrentConversation(conversation);
    setIsLoading(false);


  }, [createTask, connectRoom]);

  const startInteractionWithoutVideo = useCallback(async () => {

    setIsLoading(true);

    const { token, conversationSid } = await createTask(false);

    const parsedToken = parseJwt(token) as IParsedToken;
    setParsedToken(parsedToken)

    const chatClient = new TwilioChatClient(token);
    const conversation = await chatClient.getConversationBySid(conversationSid);

    setCurrentConversation(conversation);
    setIsLoading(false);

  }, [createTask]);

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
    setCurrentConversation(undefined);
    disconnectRoom(room)
  }, [room, disconnectRoom]);

  if (isLoading) {
    return (
      <Box>
        <Box marginTop='space100' justifyContent='center' alignItems='center'>
          <Spinner decorative={false} title="Loading" size="sizeIcon80" />
        </Box>
      </Box>
    )
  }

  if (currentConversation) {
    return (
      <Box>
        <Box marginTop='space100' justifyContent='center' alignItems='center'>
          <Stack orientation="horizontal" spacing="space10">
            {
              currentConversation && (
                <Box height="480px" width="450px" position="relative" >
                  <Box zIndex="zIndex10" position="absolute" height="100%" width='100%' display='flex' backgroundColor='colorBackground' justifyContent='center' alignItems='center' >
                    <Heading as="h3" variant="heading30">Waiting the chat to load</Heading>
                  </Box>
                  <Box backgroundColor="colorBackgroundBody" zIndex="zIndex20" position="absolute" height="480px" width="450px" padding="space20">
                    <ChatComponent identity={parsedToken?.grants.identity || ''} conversation={currentConversation} resetInteraction={resetInteraction} />
                  </Box>
                </Box>
              )
            }
            {
              room && (
                <Box margin="space40" height="480px" width='640px' position="relative" >
                  <Box zIndex="zIndex10" position="absolute" height="100%" width='100%' display='flex' backgroundColor='colorBackground' justifyContent='center' alignItems='center' >
                    <Heading as="h3" variant="heading30">Waiting the agent to connect to the video room</Heading>
                  </Box>
                  <Box ref={remoteMediaContainer} zIndex="zIndex20" position="absolute" id="remoteMediaContainer" height="100%" width='100%'></Box>
                  <Box ref={localMediaContainer} zIndex="zIndex30" id="localMediaContainer" bottom="10px" right="10px" width="133px" height="100px" position="absolute">
                  </Box>
                </Box>
              )
            }
          </Stack >
        </Box>
      </Box>
    )
  }

  return (
    <Box>
      <Box >
        <Stack orientation="horizontal" spacing="space30">
          <Button variant="primary" disabled={isLoading} onClick={() => { startInteractionWithVideo(); }}><VideoOnIcon decorative={false} title="Description of icon" /> Vidéo + <ChatIcon decorative={false} title="Description of icon" /> Chat</Button>
          <Button variant="primary" disabled={isLoading} onClick={() => { startInteractionWithoutVideo(); }} ><ChatIcon decorative={false} title="Description of icon" /> Chat</Button>
        </Stack>
      </Box>
    </Box>
  )

};