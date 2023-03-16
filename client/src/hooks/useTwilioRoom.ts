import { useCallback, useEffect, useState } from 'react';
import Video, {
    LocalAudioTrack, LocalParticipant, LocalVideoTrack, RemoteAudioTrack, RemoteParticipant,
    RemoteVideoTrack, Room
} from 'twilio-video';

const useTwilioRoom = () => {
  const [room, setRoom] = useState<Room>();
  const [customerParticipant, setCustomerParticipant] =
    useState<LocalParticipant>();
  const [agentParticipant, setAgentParticipant] = useState<RemoteParticipant>();
  const [customerTracks, setCustomerTracks] = useState<{
    video?: LocalVideoTrack;
    audio?: LocalAudioTrack;
  }>({});
  const [agentTracks, setAgentTracks] = useState<{
    video?: RemoteVideoTrack;
    audio?: RemoteAudioTrack;
  }>({});

  const connectRoom = useCallback(async (token: string, name: string) => {
    const room = await Video.connect(token, {
      name,
    });

    setRoom(room);

    return room;
  }, []);

  const disconnectRoom = useCallback(async (room?: Room) => {
    if (room) {
      room.disconnect();
      setRoom(undefined);
    }
  }, []);

  useEffect(() => {
    if (room) {
      room.on("participantConnected", (participant) => {
        if (participant.identity.includes("agent:")) {
          setAgentParticipant((prevParticipant) => {
            if (prevParticipant) {
              return undefined;
            }
            return participant;
          });
        }
      });

      room.on("participantDisconnected", (participant) => {
        if (participant.identity.includes("agent:")) {
          setAgentParticipant(undefined);
        }
      });

      setCustomerParticipant(room.localParticipant);
      setAgentParticipant(
        Array.from(room.participants.values()).find((participant) => {
          return participant.identity.includes("agent:");
        })
      );
    }

    return () => {
      room?.removeAllListeners("participantConnected");
      room?.removeAllListeners("participantDisconnected");
    };
  }, [room]);

  useEffect(() => {
    if (customerParticipant) {
      Array.from(customerParticipant.tracks.values()).forEach((track) => {
        if (track.track && track.track.kind === "video") {
          // @ts-ignore
          setCustomerTracks((prev) => {
            return { ...prev, video: track.track };
          });
        }

        if (track.track && track.track.kind === "audio") {
          // @ts-ignore
          setCustomerTracks((prev) => {
            return { ...prev, audio: track.track };
          });
        }
      });
    }

    return () => {};
  }, [customerParticipant]);

  useEffect(() => {
    if (agentParticipant) {
      agentParticipant.on("trackSubscribed", (track) => {
        if (track && track.kind === "video") {
          setAgentTracks((prev) => {
            if (prev.video) {
              return prev;
            } else {
              return { ...prev, video: track };
            }
          });
        }

        if (track && track.kind === "audio") {
          setAgentTracks((prev) => {
            if (prev.audio) {
              return prev;
            } else {
              return { ...prev, audio: track };
            }
          });
        }
      });

      agentParticipant.on("trackUnsubscribed", (track) => {
        if (track.kind === "video") {
          setAgentTracks((prev) => {
            return { ...prev, video: undefined };
          });
        }

        if (track.kind === "audio") {
          setAgentTracks((prev) => {
            return { ...prev, audio: undefined };
          });
        }
      });
    }

    return () => {
      agentParticipant?.removeAllListeners("trackSubscribed");
      agentParticipant?.removeAllListeners("trackUnsubscribed");
    };
  }, [agentParticipant]);

  return {
    room,
    connectRoom,
    disconnectRoom,
    customerParticipant,
    agentParticipant,
    agentTracks,
    customerTracks,
  };
};

export default useTwilioRoom;
