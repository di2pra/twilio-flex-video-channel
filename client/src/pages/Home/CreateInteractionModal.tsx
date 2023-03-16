import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Alert, Box, Button, Card, Heading, Input, Label, Spinner } from '@twilio-paste/core';

import useApi from '../../hooks/useApi';

export type FormData = {
  firstName: string;
  lastName: string;
  phoneNumber: string;
};

type Props = {
  isWithVideoState: boolean;
  isOpen: boolean;
  cancel: () => void;
};

export const CreateInteractionModal: React.FC<Props> = ({
  isWithVideoState,
  isOpen,
  cancel,
}) => {
  const handleClose = () => cancel();
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    phoneNumber: "",
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>();
  const { createTask } = useApi();
  let navigate = useNavigate();

  useEffect(() => {
    setFormData({
      firstName: "",
      lastName: "",
      phoneNumber: "",
    });
    setIsLoading(false);
  }, [isOpen]);

  const formOnChangeHandler = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData((prevState) => {
        return {
          ...prevState,
          [name]: value,
        };
      });
    },
    []
  );

  const submitHandler = useCallback(
    async (formData: FormData) => {
      try {
        setIsLoading(true);
        setError(undefined);

        const { token, conversationSid } = await createTask({
          ...formData,
          isWithVideo: isWithVideoState,
        });

        localStorage.setItem(conversationSid, token);
        navigate(`/interaction/${conversationSid}`);
      } catch (error: any) {
        setError(error.message);
        setIsLoading(false);
      }
    },
    [navigate, createTask, isWithVideoState]
  );

  return (
    <>
      <Box>
        <Card>
          <Heading as="h2" variant="heading20">
            New Interaction {isWithVideoState ? "with Video" : ""}
          </Heading>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitHandler(formData);
            }}
          >
            {error && (
              <Box marginBottom="space60">
                <Alert variant="error">{error}</Alert>
              </Box>
            )}
            {isLoading ? (
              <Box display="flex" justifyContent="center" alignItems="center">
                <Box marginY="space150">
                  <Spinner decorative size="sizeIcon100" />
                </Box>
              </Box>
            ) : (
              <>
                <Box marginBottom="space50">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    onChange={formOnChangeHandler}
                    name="firstName"
                    id="firstName"
                    type="text"
                    placeholder="John"
                    autoComplete="given-name"
                    required
                    value={formData.firstName || ""}
                  />
                </Box>
                <Box marginBottom="space50">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    onChange={formOnChangeHandler}
                    id="lastName"
                    name="lastName"
                    placeholder="Doe"
                    type="text"
                    autoComplete="family-name"
                    required
                    value={formData.lastName || ""}
                  />
                </Box>
                <Box>
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    onChange={formOnChangeHandler}
                    id="phoneNumber"
                    name="phoneNumber"
                    type="text"
                    placeholder="+33609474040"
                    autoComplete="tel"
                    required
                    value={formData.phoneNumber || ""}
                  />
                </Box>
              </>
            )}
            <Box width="size50" display="flex" marginTop="space60">
              <Button
                disabled={isLoading}
                variant="secondary"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Box flexGrow={1}></Box>
              <Button disabled={isLoading} type="submit" variant="primary">
                Start Interaction
              </Button>
            </Box>
          </form>
        </Card>
      </Box>
    </>
  );
};
