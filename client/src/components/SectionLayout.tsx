import { Heading, Stack } from '@twilio-paste/core';
import { Box } from '@twilio-paste/core/box';
import * as React from 'react';
import { Outlet } from 'react-router-dom';

type Props = {
  title: string;
}

export const SectionLayout: React.FC<Props> = ({ title }) => {


  return (
    <Stack orientation="vertical" spacing="space50">
      <Box>
        <Heading variant="heading10" as="h1">{title}</Heading>
      </Box>
      <Outlet />
    </Stack>
  );
};
