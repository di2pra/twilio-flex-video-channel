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
    getTaskList,
    getTokenSupervisor
  };
}




export default useApi;