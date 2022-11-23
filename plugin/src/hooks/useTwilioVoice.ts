import { Device } from '@twilio/voice-sdk';
import { useCallback, useEffect, useRef, useState } from "react";
import { LocalAudioTrack, LocalParticipant, LocalVideoTrack, RemoteAudioTrack, RemoteParticipant, RemoteVideoTrack } from "twilio-video";

const useTwilioVoice = () => {

  const [device, setDevice] = useState<Device>();
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
        device?.destroy();
      }
    }

  }, [device])

  const connectDevice = useCallback(async (token: string) => {
    const device = new Device(token);

    setDevice(device);

  }, []);

  return {
    device,
    connectDevice
  };
}




export default useTwilioVoice;