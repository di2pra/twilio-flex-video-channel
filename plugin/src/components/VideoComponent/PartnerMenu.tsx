
import { Box, Button, Spinner } from '@twilio-paste/core';
import { useCallback, useState } from 'react';
import { RemoteParticipant, Room } from "twilio-video";
import useApi from '../../hooks/useApi';
import { IPartner } from '../../Types';
import "./index.css";

type Props = {
  token: string;
  partner?: IPartner;
  room?: Room;
  partnerParticipant?: RemoteParticipant
}

const PartnerMenu = ({ token, partner, room, partnerParticipant }: Props) => {

  const { connectPartner, disconnectPartner } = useApi({ token: token });
  const [isConnectingWithPartner, setIsConnectingWithParter] = useState<boolean>(false);
  const [isDisconnectingWithPartner, setIsDisconnectingWithParter] = useState<boolean>(false);

  const connectToPartner = useCallback(() => {

    if (partner && room) {
      setIsConnectingWithParter(true);
      connectPartner({ number: partner.numero, roomName: room.name, partnerId: partner.id })
      //.finally(() => setIsConnectingWithParter(false));
    }

  }, [partner, room, connectPartner]);

  const removePartner = useCallback(() => {

    if (room) {
      setIsDisconnectingWithParter(true);
      disconnectPartner({ roomName: room.name })
        .finally(() => setIsDisconnectingWithParter(false));
    }

  }, [partner, room, disconnectPartner]);

  if (isConnectingWithPartner) {
    return (
      <Box>
        <Spinner decorative={false} title="Loading" size="sizeIcon80" />
        En cours de connexion avec le partenaire
      </Box>
    );
  }

  if (isDisconnectingWithPartner) {
    return (
      <Box>
        <Spinner decorative={false} title="Loading" size="sizeIcon80" />
        En cours de déconnexion avec le partenaire
      </Box>
    );
  }

  return (
    <Box>
      {
        partnerParticipant ? <Button variant='destructive_secondary' onClick={() => { removePartner() }}>Terminel l'appel avec le partenaire {partner?.name}</Button> : <Button variant='primary' onClick={() => { connectToPartner() }}>Contacter le partenaire {partner?.name}</Button>
      }
    </Box>
  );
};

export default PartnerMenu;
