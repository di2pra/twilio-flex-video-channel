import { useCallback, useEffect, useRef, useState } from "react";
import Video, { LocalAudioTrack, LocalParticipant, LocalVideoTrack, RemoteAudioTrack, RemoteParticipant, RemoteVideoTrack, Room } from "twilio-video";


const useTwilioRoom = () => {

  const [room, setRoom] = useState<Room>();
  const [customerParticipant, setCustomerParticipant] = useState<RemoteParticipant>();
  const [partnerParticipant, setPartnerParticipant] = useState<RemoteParticipant>();
  const [agentParticipant, setAgentParticipant] = useState<LocalParticipant>();
  const [customerTracks, setCustomerTracks] = useState<{
    video?: RemoteVideoTrack,
    audio?: RemoteAudioTrack
  }>({});
  const [agentTracks, setAgentTracks] = useState<{
    video?: LocalVideoTrack,
    audio?: LocalAudioTrack
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
      name
    });

    setAgentParticipant(room.localParticipant);
    setCustomerParticipant(Array.from(room.participants.values()).find(participant => {
      return participant.identity === 'customer';
    }));
    setPartnerParticipant(Array.from(room.participants.values()).find(participant => {
      return participant.identity === 'partner';
    }));

    setRoom(room);

  }, []);

  useEffect(() => {

    if (room) {

      room.on('participantConnected', participant => {
        if (participant.identity === 'customer') (
          setCustomerParticipant(participant)
        )

        if (participant.identity === 'partner') (
          setPartnerParticipant(participant)
        )
      });

      room.on('participantDisconnected', participant => {
        if (participant.identity === 'customer') (
          setCustomerParticipant(undefined)
        )

        if (participant.identity === 'partner') (
          setPartnerParticipant(undefined)
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

      Array.from(agentParticipant.tracks.values()).forEach(track => {
        if (track.track && track.track.kind === "video") {
          // @ts-ignore
          setAgentTracks(prev => { return { ...prev, video: track.track } });
        }

        if (track.track && track.track.kind === "audio") {
          // @ts-ignore
          setAgentTracks(prev => { return { ...prev, audio: track.track } });
        }
      });

    }

    return () => { }

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
      customerParticipant?.removeAllListeners('trackSubscribed');
      customerParticipant?.removeAllListeners('trackUnsubscribed');
    }

  }, [partnerParticipant]);

  return {
    room,
    connectRoom,
    customerParticipant,
    partnerParticipant,
    partnerAudioTrack,
    agentParticipant,
    agentTracks,
    customerTracks
  };
}




export default useTwilioRoom;