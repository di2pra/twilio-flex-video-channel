import { Flex, Stack } from '@twilio-paste/core';
import { Box } from '@twilio-paste/core/box';
import * as React from 'react';
import { NavLink } from 'react-router-dom';

const activeClassName = "nav-link active";
const notActiveClassName = "nav-link not-active";
const NAVBAR_WIDTH = '200px';

type Props = {
  headerHeight: string;
}

export const Navbar: React.FC<Props> = ({ headerHeight }) => {
  return (
    <Flex grow={false} shrink={false} basis={NAVBAR_WIDTH}>
      <Box width="100%" as="aside" display="flex" height={`calc(100vh - ${headerHeight})`} fontSize="fontSize30" borderRightStyle="solid" borderRightWidth="borderWidth10" borderRightColor="colorBorderWeak" backgroundColor="colorBackground">
        <Box as="nav" height="100%" padding="space60">
          <Stack orientation="vertical" spacing="space60">
            <NavLink to="/" className={({ isActive }) =>
              isActive ? activeClassName : notActiveClassName
            } >Accueil</NavLink>
          </Stack>
        </Box>
      </Box>
    </Flex>
  );
};