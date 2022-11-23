import { useCallback, useEffect, useRef, useState } from "react";
import Video, { RemoteAudioTrack, RemoteParticipant, RemoteVideoTrack, Room } from "twilio-video";


const useTwilioRoomSupervisor = () => {

  const [room, setRoom] = useState<Room>();
  const [customerParticipant, setCustomerParticipant] = useState<RemoteParticipant>();
  const [partnerParticipant, setPartnerParticipant] = useState<RemoteParticipant>();
  const [agentParticipant, setAgentParticipant] = useState<RemoteParticipant>();
  const [customerTracks, setCustomerTracks] = useState<{
    video?: RemoteVideoTrack,
    audio?: RemoteAudioTrack
  }>({});
  const [agentTracks, setAgentTracks] = useState<{
    video?: RemoteVideoTrack,
    audio?: RemoteAudioTrack
  }>({});
  const [partnerAudioTrack, setPartnerAudioTrack] = useState<RemoteAudioTrack>();

  const isUnmounting = useRef(false);

  useEffect(() => {
    return () => {
      console.log(`is unmounting`);
      isUnmounting.current = true
    }
  }, []);

  useEffect(() => {

    return () => {
      if (isUnmounting.current) {
        room?.disconnect();
      }
    }

  }, [room])

  const connectRoom = useCallback(async (token: string, name: string) => {
    const room = await Video.connect(token, {
      name,
      audio: false,
      video: false
    });


    setCustomerParticipant(Array.from(room.participants.values()).find(participant => {
      return participant.identity === 'customer';
    }));
    setPartnerParticipant(Array.from(room.participants.values()).find(participant => {
      return participant.identity === 'partner';
    }));
    setAgentParticipant(Array.from(room.participants.values()).find(participant => {
      return participant.identity.includes('agent:');
    }));

    setRoom(room);

  }, []);

  const disconnectRoom = useCallback(() => {
    room?.disconnect();
  }, [room])

  useEffect(() => {

    if (room) {

      room.on('participantConnected', participant => {
        if (participant.identity === 'customer') (
          setCustomerParticipant(participant)
        )

        if (participant.identity === 'partner') (
          setPartnerParticipant(participant)
        )

        if (participant.identity.includes('agent:')) (
          setAgentParticipant(participant)
        )

      });

      room.on('participantDisconnected', participant => {
        if (participant.identity === 'customer') (
          setCustomerParticipant(undefined)
        )

        if (participant.identity === 'partner') (
          setPartnerParticipant(undefined)
        )

        if (participant.identity.includes('agent:')) (
          setAgentParticipant(undefined)
        )
      });

    }

    return () => {
      room?.removeAllListeners('participantConnected');
      room?.removeAllListeners('participantDisconnected');
    }

  }, [room]);

  useEffect(() => {
    if (agentParticipant) {

      agentParticipant.on('trackSubscribed', track => {

        if (track && track.kind === "video") {
          setAgentTracks(prev => { return { ...prev, video: track } });
        }

        if (track && track.kind === "audio") {
          setAgentTracks(prev => { return { ...prev, audio: track } });
        }
      })

      agentParticipant.on('trackUnsubscribed', track => {
        if (track.kind === "video") {
          setAgentTracks(prev => { return { ...prev, video: undefined } });
        }

        if (track.kind === "audio") {
          setAgentTracks(prev => { return { ...prev, audio: undefined } });
        }
      });

    }

    return () => {
      agentParticipant?.removeAllListeners('trackSubscribed');
      agentParticipant?.removeAllListeners('trackUnsubscribed');
    }

  }, [agentParticipant])

  useEffect(() => {

    if (customerParticipant) {

      customerParticipant.on('trackSubscribed', track => {

        if (track && track.kind === "video") {
          setCustomerTracks(prev => { return { ...prev, video: track } });
        }

        if (track && track.kind === "audio") {
          setCustomerTracks(prev => { return { ...prev, audio: track } });
        }
      })

      customerParticipant.on('trackUnsubscribed', track => {
        if (track.kind === "video") {
          setCustomerTracks(prev => { return { ...prev, video: undefined } });
        }

        if (track.kind === "audio") {
          setCustomerTracks(prev => { return { ...prev, audio: undefined } });
        }
      });

    }

    return () => {
      customerParticipant?.removeAllListeners('trackSubscribed');
      customerParticipant?.removeAllListeners('trackUnsubscribed');
    }

  }, [customerParticipant]);

  useEffect(() => {

    if (partnerParticipant) {

      partnerParticipant.on('trackSubscribed', track => {

        if (track && track.kind === "audio") {
          setPartnerAudioTrack(track);
        }
      })

      partnerParticipant.on('trackUnsubscribed', track => {
        if (track.kind === "audio") {
          setPartnerAudioTrack(undefined);
        }
      });

    }

    return () => {
      partnerParticipant?.removeAllListeners('trackSubscribed');
      partnerParticipant?.removeAllListeners('trackUnsubscribed');
    }

  }, [partnerParticipant]);

  return {
    room,
    connectRoom,
    disconnectRoom,
    customerParticipant,
    partnerParticipant,
    partnerAudioTrack,
    agentParticipant,
    agentTracks,
    customerTracks
  };
}




export default useTwilioRoomSupervisor;