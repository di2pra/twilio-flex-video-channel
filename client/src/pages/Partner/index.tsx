import { Button, Heading, Spinner, Stack } from '@twilio-paste/core';
import { Box } from '@twilio-paste/core/box';
import { ChatIcon } from "@twilio-paste/icons/esm/ChatIcon";
import { VideoOnIcon } from "@twilio-paste/icons/esm/VideoOnIcon";
import { Client as TwilioChatClient, Conversation } from '@twilio/conversations';
import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { parseJwt } from '../../Helpers';
import useApi from '../../hooks/useApi';
import useTwilioRoom from '../../hooks/useTwilioRoom';
import { IParsedToken, IPartner } from '../../Types';
import { ChatComponent } from './ChatComponent';

export const Partner: React.FC = () => {

  const { state } = useLocation();

  const { createTask } = useApi();
  const [parsedToken, setParsedToken] = useState<IParsedToken>();
  const [partner, setPartner] = useState<IPartner>();

  const [currentChatClient, setCurrentChatClient] = useState<TwilioChatClient>();
  const [currentConversation, setCurrentConversation] = useState<Conversation>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const localMediaContainer = React.useRef<HTMLElement>(null);
  const remoteMediaContainer = React.useRef<HTMLElement>(null);
  const interactionContainer = React.useRef<HTMLElement>(null);
  const menuContainer = React.useRef<HTMLElement>(null);
  const loadingContainer = React.useRef<HTMLElement>(null);

  let { room, agentTracks, customerTracks, connectRoom } = useTwilioRoom();

  useEffect(() => {
    setPartner(state as IPartner)
  }, [state]);

  useEffect(() => {

    currentChatClient?.on('conversationAdded', (conversation) => {
      setCurrentConversation(conversation);
      setIsLoading(false);
    });

    return () => {
      currentChatClient?.removeAllListeners('conversationAdded');
    }

  }, [currentChatClient])

  const startInteractionWithVideo = useCallback(async () => {

    if (partner) {
      setIsLoading(true);

      const { token } = await createTask(partner, true);

      const parsedToken = parseJwt(token) as IParsedToken;
      setParsedToken(parsedToken)

      await connectRoom(token, parsedToken.grants.video.room);

      const chatClient = new TwilioChatClient(token);
      setCurrentChatClient(chatClient);

      setIsLoading(false);
    }


  }, [createTask, partner, connectRoom]);

  const startInteractionWithoutVideo = useCallback(async () => {

    if (partner) {
      setIsLoading(true);

      const { token } = await createTask(partner, false);

      const parsedToken = parseJwt(token) as IParsedToken;
      setParsedToken(parsedToken)

      const chatClient = new TwilioChatClient(token);
      setCurrentChatClient(chatClient);

    }

  }, [createTask, partner]);

  useEffect(() => {

    // @ts-ignore
    localMediaContainer.current?.replaceChildren();

    if (customerTracks.video) localMediaContainer.current?.appendChild(customerTracks.video.attach());

  }, [customerTracks.video]);

  useEffect(() => {

    if (customerTracks.audio) {
      localMediaContainer.current?.appendChild(customerTracks.audio.attach());
    }

  }, [customerTracks.audio])

  useEffect(() => {

    if (agentTracks.video) {

      remoteMediaContainer.current?.appendChild(agentTracks.video.attach());
      if (remoteMediaContainer.current) remoteMediaContainer.current.style.display = 'block';

    } else {

      // @ts-ignore
      remoteMediaContainer.current?.replaceChildren();
      if (remoteMediaContainer.current) remoteMediaContainer.current.style.display = 'none';

    }

  }, [agentTracks.video]);

  useEffect(() => {

    if (agentTracks.audio) remoteMediaContainer.current?.appendChild(agentTracks.audio.attach());

  }, [agentTracks.audio]);


  useEffect(() => {

    if (isLoading) {
      if (loadingContainer.current) loadingContainer.current.style.display = "flex";
      if (menuContainer.current) menuContainer.current.style.display = "none";
    } else {
      if (room || currentChatClient) {
        if (loadingContainer.current) loadingContainer.current.style.display = "none";
        if (interactionContainer.current) interactionContainer.current.style.display = 'flex';
      }
    }

  }, [isLoading, room, currentChatClient]);

  return (
    <Box>
      <Heading as="h1" variant='heading10'>Sourdline - {partner?.name || ''}</Heading>
      <Box ref={menuContainer} >
        <Stack orientation="horizontal" spacing="space30">
          <Button variant="primary" disabled={isLoading} onClick={() => { startInteractionWithVideo(); }}><VideoOnIcon decorative={false} title="Description of icon" /> Vidéo + <ChatIcon decorative={false} title="Description of icon" /> Chat</Button>
          <Button variant="primary" disabled={isLoading} onClick={() => { startInteractionWithoutVideo(); }} ><ChatIcon decorative={false} title="Description of icon" /> Chat</Button>
        </Stack>
      </Box>
      <Box ref={loadingContainer} marginTop='space100' display='none' justifyContent='center' alignItems='center'>
        <Spinner decorative={false} title="Loading" size="sizeIcon80" />
      </Box>
      <Box ref={interactionContainer} marginTop='space100' display='none' justifyContent='center' alignItems='center'>
        <Stack orientation="horizontal" spacing="space10">
          {
            currentChatClient ? (
              <Box height="480px" width="450px" position="relative" >
                <Box zIndex="zIndex10" position="absolute" height="100%" width='100%' display='flex' backgroundColor='colorBackground' justifyContent='center' alignItems='center' >
                  <Heading as="h3" variant="heading30">En attente de l'ouverture du chat</Heading>
                </Box>
                <Box backgroundColor="colorBackgroundBody" zIndex="zIndex20" position="absolute" height="480px" width="450px" padding="space20">
                  {(currentConversation) ? <ChatComponent identity={parsedToken?.grants.identity || ''} conversation={currentConversation} /> : null}
                </Box>
              </Box>
            ) : null
          }
          {
            room ? (
              <Box margin="space40" height="480px" width='640px' position="relative" >
                <Box zIndex="zIndex10" position="absolute" height="100%" width='100%' display='flex' backgroundColor='colorBackground' justifyContent='center' alignItems='center' >
                  <Heading as="h3" variant="heading30">En attente de la connexion de l'agent Sourdline</Heading>
                </Box>
                <Box ref={remoteMediaContainer} zIndex="zIndex20" position="absolute" id="remoteMediaContainer" height="100%" width='100%' display='none'></Box>
                <Box ref={localMediaContainer} zIndex="zIndex30" id="localMediaContainer" bottom="10px" right="10px" width="133px" height="100px" position="absolute">
                </Box>
              </Box>
            ) : null
          }
        </Stack >
      </Box>
    </Box >
  );
};