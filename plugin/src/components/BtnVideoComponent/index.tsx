import { useCallback, useContext, useState } from 'react';

import { Box, Button } from '@twilio-paste/core';
import { VideoOnIcon } from '@twilio-paste/icons/esm/VideoOnIcon';
import * as Flex from '@twilio/flex-ui';

import useApi from '../../hooks/useApi';

const BtnVideoComponent = ({ manager }: { manager: Flex.Manager }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  let taskContext = useContext(Flex.TaskContext);

  const { startVideo } = useApi({
    token: manager.store.getState().flex.session.ssoTokenPayload.token,
  });

  const onClick = useCallback(() => {
    if (taskContext.task) {
      setIsLoading(true);

      startVideo(taskContext.task.taskSid).finally(() => setIsLoading(false));
    }
  }, [startVideo, taskContext]);

  return (
    <Box
      whiteSpace="nowrap"
      marginX="space30"
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      <Button
        loading={isLoading}
        onClick={onClick}
        variant="primary"
        size="small"
      >
        <VideoOnIcon decorative={false} title="Start Video" />
        Start Video
      </Button>
    </Box>
  );
};

BtnVideoComponent.displayName = "btnVideoComponent";

export default BtnVideoComponent;
