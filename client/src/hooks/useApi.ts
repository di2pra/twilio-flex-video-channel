import { useCallback } from "react";

const HOST = process.env.REACT_APP_SERVERLESS_HOST;

function useApi() {


  const createTask: (isWithVideo: boolean) => Promise<{ token: string, conversationSid: string }> = useCallback(async (isWithVideo) => {

    const result = await fetch(`${HOST}/createTask`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        isWithVideo
      })
    });

    const data = await result.json();

    if (result.ok) {
      return data;
    } else {
      throw new Error("Error");
    }

  }, []);


  return {
    createTask
  };
}




export default useApi;