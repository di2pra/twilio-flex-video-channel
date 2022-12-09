
import { Box, Button } from '@twilio-paste/core';
import * as Flex from "@twilio/flex-ui";
import { TaskContext } from '@twilio/flex-ui';
import { useCallback, useContext, useState } from 'react';
import useApi from '../../hooks/useApi';

const BtnVideoComponent = ({ manager }: { manager: Flex.Manager }) => {

  const [isLoading, setIsLoading] = useState<boolean>(false);

  let taskContext = useContext(TaskContext);
  const { sendVideoLink } = useApi({ token: manager.store.getState().flex.session.ssoTokenPayload.token });

  const onClick = useCallback(() => {

    if (taskContext.task && taskContext.call) {

      setIsLoading(true);

      sendVideoLink(taskContext.task.taskSid, taskContext.task.attributes.from)
        .finally(() => setIsLoading(false))

    }

  }, [sendVideoLink])

  return (
    <Box marginX="space30" display='flex' justifyContent='center' alignItems='center'>
      <Button loading={isLoading} onClick={onClick} variant='primary' size="small" >Send Video Link</Button>
    </Box>
  );
};

BtnVideoComponent.displayName = 'btnVideoComponent';

export default BtnVideoComponent;
