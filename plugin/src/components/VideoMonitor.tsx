import { useCallback, useEffect, useRef, useState } from 'react';

import {
    Box, Button, Heading, Modal, ModalBody, ModalHeader, ModalHeading, Stack
} from '@twilio-paste/core';
import * as Flex from '@twilio/flex-ui';

import { removeElementByTagName } from '../Helpers';
import useApi from '../hooks/useApi';
import useTwilioRoomSupervisor from '../hooks/useTwilioRoomSupervisor';

type Props = {
  manager: Flex.Manager;
};

const VideoMonitor = ({ manager, ...props }: Props) => {
  const { getTokenSupervisor } = useApi({
    token: manager.store.getState().flex.session.ssoTokenPayload.token,
  });

  const {
    agentTracks,
    customerTracks,
    partnerAudioTrack,
    connectRoom,
    disconnectRoom,
  } = useTwilioRoomSupervisor();

  const customerMediaContainer = useRef<HTMLElement>(null);
  const agentMediaContainer = useRef<HTMLElement>(null);
  const partnerAudioContainer = useRef<HTMLElement>(null);

  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = useCallback(async () => {
    setIsOpen(true);

    const { token } = await getTokenSupervisor();
    // @ts-ignore
    connectRoom(token, props.task.taskSid);
  }, [getTokenSupervisor, connectRoom]);

  const handleClose = useCallback(async () => {
    setIsOpen(false);

    disconnectRoom();
  }, [disconnectRoom]);

  useEffect(() => {
    if (agentTracks.video) {
      if (agentMediaContainer.current) {
        agentMediaContainer.current.style.display = "block";
        agentMediaContainer.current?.appendChild(agentTracks.video.attach());
      }
    } else {
      if (agentMediaContainer.current) {
        agentMediaContainer.current.style.display = "none";
        removeElementByTagName(agentMediaContainer.current, "video");
      }
    }
  }, [agentTracks.video]);

  useEffect(() => {
    if (agentTracks.audio) {
      agentMediaContainer.current?.appendChild(agentTracks.audio.attach());
    } else {
      removeElementByTagName(agentMediaContainer.current, "audio");
    }
  }, [agentTracks.audio]);

  useEffect(() => {
    if (customerTracks.video) {
      if (customerMediaContainer.current)
        customerMediaContainer.current.style.display = "block";
      customerMediaContainer.current?.appendChild(
        customerTracks.video.attach()
      );
    } else {
      if (customerMediaContainer.current)
        customerMediaContainer.current.style.display = "none";
      removeElementByTagName(customerMediaContainer.current, "video");
    }
  }, [customerTracks.video]);

  useEffect(() => {
    if (customerTracks.audio) {
      customerMediaContainer.current?.appendChild(
        customerTracks.audio.attach()
      );
    } else {
      removeElementByTagName(customerMediaContainer.current, "audio");
    }
  }, [customerTracks.audio]);

  useEffect(() => {
    if (partnerAudioTrack) {
      if (partnerAudioContainer.current)
        partnerAudioContainer.current.style.display = "block";
      partnerAudioContainer.current?.appendChild(partnerAudioTrack.attach());
    } else {
      if (partnerAudioContainer.current)
        partnerAudioContainer.current.style.display = "none";
      removeElementByTagName(partnerAudioContainer.current, "audio");
    }
  }, [partnerAudioTrack]);

  const modalHeadingID = "videoMonitorModal";

  // @ts-ignore
  console.log(props.task);

  // @ts-ignore
  if (props.task.attributes.isWithVideo) {
    return (
      <>
        <Box
          marginTop="space10"
          marginBottom="space40"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Button onClick={handleOpen} variant="primary">
            Monitor the Video Call
          </Button>
        </Box>
        <Modal
          ariaLabelledby={modalHeadingID}
          isOpen={isOpen}
          onDismiss={handleClose}
          size="wide"
        >
          <ModalHeader>
            <ModalHeading as="h3" id={modalHeadingID}>
              Video Call
            </ModalHeading>
          </ModalHeader>
          <ModalBody>
            <Box display="flex" alignItems="center" justifyContent="center">
              <Stack orientation="horizontal" spacing="space60">
                <Box height="285px" width="380px" position="relative">
                  <Box
                    textAlign="center"
                    position="absolute"
                    zIndex="zIndex10"
                    height="100%"
                    width="100%"
                    display="flex"
                    backgroundColor="colorBackgroundDestructiveWeakest"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Heading as="h6" variant="heading60">
                      Waiting to connect with the customer
                    </Heading>
                  </Box>
                  <Box
                    position="absolute"
                    zIndex="zIndex20"
                    height="100%"
                    width="100%"
                    display="none"
                    id="customerMediaContainer"
                    ref={customerMediaContainer}
                  ></Box>
                </Box>
                <Box height="285px" width="380px" position="relative">
                  <Box
                    textAlign="center"
                    position="absolute"
                    zIndex="zIndex10"
                    height="100%"
                    width="100%"
                    display="flex"
                    backgroundColor="colorBackgroundDestructiveWeakest"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Heading as="h6" variant="heading60">
                      Waiting to connect with the agent
                    </Heading>
                  </Box>
                  <Box
                    position="absolute"
                    zIndex="zIndex20"
                    height="100%"
                    width="100%"
                    display="none"
                    id="agentMediaContainer"
                    ref={agentMediaContainer}
                  ></Box>
                </Box>
              </Stack>
            </Box>
          </ModalBody>
        </Modal>
      </>
    );
  }

  return null;
};

VideoMonitor.displayName = "VideoMonitor";

export default VideoMonitor;
