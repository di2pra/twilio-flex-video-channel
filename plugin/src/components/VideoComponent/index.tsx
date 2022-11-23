
import { Box, Button, Heading, Stack, Text } from '@twilio-paste/core';
import * as Flex from "@twilio/flex-ui";
import { TaskContext } from '@twilio/flex-ui';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { removeElementByTagName } from '../../Helpers';
import useApi from '../../hooks/useApi';
import useTwilioRoom from '../../hooks/useTwilioRoom';
import { IPartner } from '../../Types';
import "./index.css";


const VideoComponent = ({ manager }: { manager: Flex.Manager }) => {

  let taskContext = useContext(TaskContext);
  const { getToken, connectPartner, disconnectPartner } = useApi({ token: manager.store.getState().flex.session.ssoTokenPayload.token });
  const [taskStatus, setTaskStatus] = useState<string>();
  const [roomName, setRoomName] = useState<string>();
  const [partner, setPartner] = useState<IPartner>();
  const [isConnectingWithPartner, setIsConnectingWithParter] = useState<boolean>(false);
  const [isDisconnectingWithPartner, setIsDisconnectingWithParter] = useState<boolean>(false);

  const localMediaContainer = useRef<HTMLElement>(null);
  const remoteMediaContainer = useRef<HTMLElement>(null);
  const partnerMediaContainer = useRef<HTMLElement>(null);
  const partnerContainer = useRef<HTMLElement>(null);

  const { agentTracks, customerTracks, partnerParticipant, partnerAudioTrack, connectRoom, room } = useTwilioRoom();

  const initVideo = useCallback(async (videoRoomName: string) => {

    const { token } = await getToken();

    await connectRoom(token, videoRoomName);

  }, []);

  const connectToPartner = useCallback(() => {

    if (partner && room) {
      setIsConnectingWithParter(true);
      connectPartner({ number: partner.numero, roomName: room.name, partnerId: partner.id })
    }

  }, [partner, room, connectPartner]);

  const removePartner = useCallback(() => {

    if (room) {
      setIsDisconnectingWithParter(true);
      disconnectPartner({ roomName: room.name })
    }

  }, [room, disconnectPartner]);

  useEffect(() => {

    setTaskStatus(prev => {
      if (prev === taskContext.task?.status) {
        return prev
      }
      return taskContext.task?.status;
    });

    setRoomName(taskContext.task?.taskSid)

    setPartner(prev => {
      if (prev === taskContext.task?.attributes.partner) {
        return prev
      }
      return taskContext.task?.attributes.partner;
    })

  }, [taskContext.task?.status, taskContext.task?.attributes.conversationSid, taskContext.task?.attributes.partner])


  useEffect(() => {

    if (taskStatus === "accepted" && roomName) {
      console.log(`video initialiased`)
      initVideo(roomName)
    }

  }, [taskStatus, roomName]);


  useEffect(() => {


    if (agentTracks.video) {

      localMediaContainer.current?.appendChild(agentTracks.video.attach());

    } else {

      removeElementByTagName(localMediaContainer.current, 'video');

    }

  }, [agentTracks.video]);


  useEffect(() => {

    if (agentTracks.audio) {
      localMediaContainer.current?.appendChild(agentTracks.audio.attach());
    } else {
      removeElementByTagName(localMediaContainer.current, 'audio');
    }

  }, [agentTracks.audio]);


  useEffect(() => {

    if (customerTracks.video) {

      if (remoteMediaContainer.current) remoteMediaContainer.current.style.display = 'block';
      remoteMediaContainer.current?.appendChild(customerTracks.video.attach());

    } else {

      if (remoteMediaContainer.current) remoteMediaContainer.current.style.display = 'none';
      removeElementByTagName(remoteMediaContainer.current, 'video');

    }

  }, [customerTracks.video]);

  useEffect(() => {

    if (customerTracks.audio) {

      remoteMediaContainer.current?.appendChild(customerTracks.audio.attach());

    } else {

      removeElementByTagName(remoteMediaContainer.current, 'audio');

    }

  }, [customerTracks.audio]);

  useEffect(() => {

    if (partnerAudioTrack) {
      partnerMediaContainer.current?.replaceChildren(partnerAudioTrack.attach());
      setIsConnectingWithParter(false);
    } else {
      if (partnerContainer.current) partnerContainer.current.style.display = 'none';
      setIsDisconnectingWithParter(false);
    }

  }, [partnerAudioTrack]);

  useEffect(() => {

    if (isConnectingWithPartner) {
      if (partnerContainer.current) partnerContainer.current.style.display = 'flex';
    }

  }, [isConnectingWithPartner]);


  return (
    <Box display='flex' justifyContent='center' alignItems='center' padding="space50" width="100%">
      <Stack orientation="vertical" spacing="space30">
        <Box height="480px" width="640px" position="relative">
          <Box position="absolute" zIndex="zIndex10" height="100%" width="100%" display='flex' backgroundColor='colorBackgroundDestructiveWeakest' justifyContent='center' alignItems='center' >
            <Heading as="h5" variant="heading50">En attente de l'établissement de la connexion avec le client</Heading>
          </Box>
          <Box position="absolute" zIndex="zIndex20" height="100%" width="100%" display='none' id="remoteMediaContainer" ref={remoteMediaContainer}></Box>
          <Box zIndex="zIndex30" bottom="10px" right="10px" height="100px" width="133px" position="absolute" id="localMediaContainer" ref={localMediaContainer}></Box>
          <Box zIndex="zIndex30" id="partnerContainer" ref={partnerContainer} bottom="10px" right="154px" height="100px" width="250px" display='none' backgroundColor="colorBackgroundBrandStronger" justifyContent='center' alignItems='center' position="absolute">
            <Stack orientation="vertical" spacing="space30">
              <Box>
                <Text as="p" textAlign="center" color="colorTextBrandHighlight" >{isConnectingWithPartner ? 'En cours de connexion avec le partenaire' : `En ligne avec ${partner?.name}`}</Text>
              </Box>
              {
                isConnectingWithPartner ? null : (
                  <Box display='flex' justifyContent='center' alignItems='center'>
                    <Button variant="destructive" onClick={() => { removePartner() }} size="icon_small" loading={isDisconnectingWithPartner} >Clôre la communication</Button>
                  </Box>
                )
              }
            </Stack>
            <Box id="partnerMediaContainer" ref={partnerMediaContainer}></Box>
          </Box>
        </Box>
        <Box>
          {
            partnerParticipant ? null : (
              isConnectingWithPartner ? null : (
                <Button variant='primary' onClick={() => { connectToPartner() }}>Contacter le partenaire {partner?.name}</Button>
              )
            )
          }
        </Box>
      </Stack>
    </Box>
  );
};

VideoComponent.displayName = 'videoComponent';

export default VideoComponent;
