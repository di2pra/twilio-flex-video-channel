import { useCallback } from 'react';

//const HOST = `https://twilio-serverless-video-channel-1405-dev.twil.io`;
const HOST = `http://localhost:3001`;

const useApi = ({ token }: { token: string }) => {
  const getToken: () => Promise<{
    token: string;
  }> = useCallback(async () => {
    const result = await fetch(`${HOST}/tokenAgent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Token: token,
      }),
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
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Token: token,
      }),
    });

    const data = await result.json();

    if (result.ok) {
      return data;
    } else {
      throw new Error("Error");
    }
  }, []);

  const sendVideoLink: (sid: string, to: string) => Promise<void> = useCallback(
    async (sid: string, to: string) => {
      const result = await fetch(`${HOST}/sendVideoLink`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Token: token,
          sid: sid,
          To: to,
        }),
      });

      const data = await result.json();

      if (result.ok) {
        return data;
      } else {
        throw new Error("Error");
      }
    },
    []
  );

  const startVideo: (sid: string) => Promise<void> = useCallback(
    async (sid: string) => {
      const result = await fetch(`${HOST}/startVideo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Token: token,
          sid: sid,
        }),
      });

      const data = await result.json();

      if (result.ok) {
        return data;
      } else {
        throw new Error("Error");
      }
    },
    []
  );

  return {
    startVideo,
    getToken,
    getTokenSupervisor,
    sendVideoLink,
  };
};

export default useApi;
