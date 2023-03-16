import { useCallback } from 'react';

const HOST = process.env.REACT_APP_SERVERLESS_HOST || "";

export type InputCreateTask = {
  isWithVideo: boolean;
  firstName: string;
  lastName: string;
  phoneNumber: string;
};

function useApi() {
  const createTask: (
    data: InputCreateTask
  ) => Promise<{ token: string; conversationSid: string }> = useCallback(
    async (param: InputCreateTask) => {
      const result = await fetch(`${HOST}/createTask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(param),
      });

      const data = await result.json();

      if (result.ok) {
        return data;
      } else {
        throw new Error("Undefined Error");
      }
    },
    []
  );

  const updateTokenCustomer: (sid: string) => Promise<{ token: string }> =
    useCallback(async (sid) => {
      const result = await fetch(`${HOST}/updateCustomerToken`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sid,
        }),
      });

      const data = await result.json();

      if (result.ok) {
        return data;
      } else {
        throw new Error("Undefined Error");
      }
    }, []);

  return {
    updateTokenCustomer,
    createTask,
  };
}

export default useApi;
