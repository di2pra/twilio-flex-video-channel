import { useCallback } from "react";
import { IVideoTask } from "../Types";

const HOST = `https://twilio-serverless-video-channel-2436-dev.twil.io`;

const useApi = ({ token }: { token: string }) => {

  const getToken: () => Promise<{
    token: string;
  }> = useCallback(async () => {

    const result = await fetch(`${HOST}/tokenAgent`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        Token: token
      })
    });

    const data = await result.json();

    if (result.ok) {
      return data;
    } else {
      throw new Error("Error");
    }

  }, []);

  const getTokenSupervisor: () => Promise<{
    token: string;
  }> = useCallback(async () => {

    const result = await fetch(`${HOST}/tokenSupervisor`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        Token: token
      })
    });

    const data = await result.json();

    if (result.ok) {
      return data;
    } else {
      throw new Error("Error");
    }

  }, []);

  const connectPartner: ({
    number,
    roomName,
    partnerId
  }: {
    number: string;
    roomName: string;
    partnerId: string;
  }) => Promise<object> = useCallback(async ({ number, roomName, partnerId }) => {

    const result = await fetch(`${HOST}/connectPartner`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        Token: token,
        number,
        roomName,
        partnerId
      })
    });

    const data = await result.json();

    if (result.ok) {
      return data;
    } else {
      throw new Error("Error");
    }

  }, []);


  const disconnectPartner: ({
    roomName
  }: {
    roomName: string;
  }) => Promise<object> = useCallback(async ({ roomName }) => {

    const result = await fetch(`${HOST}/disconnectPartner`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        Token: token,
        roomName
      })
    });

    const data = await result.json();

    if (result.ok) {
      return data;
    } else {
      throw new Error("Error");
    }

  }, []);

  const getTaskList: () => Promise<IVideoTask[]> = useCallback(async () => {

    const result = await fetch(`${HOST}/taskList`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await result.json();

    if (result.ok) {
      return data;
    } else {
      throw new Error("Error");
    }

  }, []);

  return {
    getToken,
    connectPartner,
    disconnectPartner,
    getTaskList,
    getTokenSupervisor
  };
}




export default useApi;