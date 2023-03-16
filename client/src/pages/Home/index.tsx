import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button, Stack } from '@twilio-paste/core';
import { Box } from '@twilio-paste/core/box';
import { ChatIcon } from '@twilio-paste/icons/esm/ChatIcon';
import { VideoOnIcon } from '@twilio-paste/icons/esm/VideoOnIcon';

import { CreateInteractionModal } from './CreateInteractionModal';

type Props = {
  startInteraction?: boolean;
  isWithVideo?: boolean;
};

export const Home: React.FC<Props> = ({
  startInteraction,
  isWithVideo,
}: Props) => {
  let navigate = useNavigate();

  const [startInteractionState, setStartInteractionState] = useState<boolean>(
    startInteraction || false
  );
  const [isWithVideoState, setIsWithVideoState] = useState<boolean>(
    isWithVideo || false
  );

  const startInteractionHandler = useCallback(
    async (withVideo: boolean) => {
      const path = withVideo ? "interaction/new/withVideo" : "interaction/new";
      navigate(path, { replace: false });
      setStartInteractionState(true);
      setIsWithVideoState(withVideo);
    },
    [navigate]
  );

  const cancelStartInteractionHandler = useCallback(async () => {
    navigate("/", { replace: false });
    setStartInteractionState(false);
  }, [navigate]);

  if (startInteractionState === true) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center">
        <CreateInteractionModal
          isWithVideoState={isWithVideoState}
          isOpen={startInteractionState}
          cancel={cancelStartInteractionHandler}
        />
      </Box>
    );
  }

  return (
    <Box display="flex" justifyContent="center" alignItems="center">
      <Stack orientation="horizontal" spacing="space30">
        <Button
          variant="primary"
          onClick={() => {
            startInteractionHandler(true);
          }}
        >
          <VideoOnIcon decorative={false} title="Description of icon" /> Vidéo +{" "}
          <ChatIcon decorative={false} title="Description of icon" /> Chat
        </Button>
        <Button
          variant="primary"
          onClick={() => {
            startInteractionHandler(false);
          }}
        >
          <ChatIcon decorative={false} title="Description of icon" /> Chat
        </Button>
      </Stack>
    </Box>
  );
};
