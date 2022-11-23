import { Text } from '@twilio-paste/core';
import { Box } from '@twilio-paste/core/box';
import * as React from 'react';
import { Outlet } from 'react-router-dom';
import { TwilioLogo } from './Icons';

const HEADER_HEIGHT = '60px';

export const PageLayout: React.FC = () => {

  return (
    <>
      <Box as="header" width="100%" display="flex" backgroundColor="colorBackgroundBodyInverse" alignItems="center" height={HEADER_HEIGHT}>
        <Box marginLeft="space30" width="40px" height="40px">
          <TwilioLogo />
        </Box>
        <Box flexGrow={1}>
          <Text marginTop="space10" as="p" display="inline-block" fontSize="fontSize60" color="colorTextBrandInverse">{process.env.REACT_APP_CUSTOMER_NAME}</Text>
        </Box>
      </Box>
      <Box >
        <Box padding="space50" marginX="space120">
          <Outlet />
        </Box>
      </Box>
    </>
  );
};
