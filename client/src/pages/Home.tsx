import { Button, Spinner, Stack } from '@twilio-paste/core';
import { Box } from '@twilio-paste/core/box';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import useApi from '../hooks/useApi';
import { IPartner } from '../Types';

export const Home: React.FC = () => {

  const { getPartner } = useApi();

  let navigate = useNavigate();

  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [partnerList, setPartnerList] = React.useState<IPartner[]>();


  React.useEffect(() => {

    setIsLoading(true);

    getPartner()
      .then(data => setPartnerList(data))
      .finally(() => setIsLoading(false))

  }, [getPartner]);

  const click = React.useCallback((partner: IPartner) => {
    navigate(`/partner/${partner.id}`, {
      state: partner
    })
  }, [navigate]);

  if (isLoading) {
    return (
      <Box>
        <Spinner decorative={false} title="Loading" size="sizeIcon80" />
      </Box >
    );
  }

  return (
    <Box>
      <Stack orientation="horizontal" spacing="space30">
        {
          partnerList?.map((item, key) => {
            return (
              <Button key={key} onClick={() => { click(item) }} variant="primary">{item.name}</Button>
            )
          })
        }
      </Stack>
    </Box >
  );
};