
import { Box, Button } from "@twilio-paste/core";
import * as Flex from "@twilio/flex-ui";
import { TaskContext } from '@twilio/flex-ui';
import { useContext, useEffect, useRef, useState } from 'react';
import useApi from '../../hooks/useApi';
import { IPartner } from '../../Types';


const AudioComponent = ({ manager }: { manager: Flex.Manager }) => {

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


  useEffect(() => {

    setPartner(prev => {
      if (prev === taskContext.task?.attributes.partner) {
        return prev
      }
      return taskContext.task?.attributes.partner;
    })

  }, [taskContext.task?.status, taskContext.task?.attributes.conversationSid, taskContext.task?.attributes.partner])

  return (
    <Box display='flex' justifyContent='center' alignItems='center' padding="space50" width="100%">
      <Button variant='primary'>Contacter le partenaire - {partner?.name}</Button>
    </Box>
  )
};

AudioComponent.displayName = 'audioComponent';

export default AudioComponent;
