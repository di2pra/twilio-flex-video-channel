import { useCallback } from "react";
import { IPartner } from "../Types";

const HOST = process.env.REACT_APP_SERVERLESS_HOST;

function useApi() {

  const getPartner: () => Promise<IPartner[]> = useCallback(async () => {

    const result = await fetch(`${HOST}/partner`, {
      method: "GET",
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

  const createTask: (partner: IPartner, isWithVideo: boolean) => Promise<{ token: string }> = useCallback(async (partner, isWithVideo) => {

    const result = await fetch(`${HOST}/createTask`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        partner,
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
    getPartner,
    createTask
  };
}




export default useApi;