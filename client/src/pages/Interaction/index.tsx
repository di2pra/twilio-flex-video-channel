import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Room } from 'twilio-video';

import { Alert, Box, Button, Heading, Spinner, Stack } from '@twilio-paste/core';
import { Client as TwilioChatClient, Conversation } from '@twilio/conversations';

import { parseJwt } from '../../Helpers';
import useApi from '../../hooks/useApi';
import useTwilioRoom from '../../hooks/useTwilioRoom';
import { IParsedToken } from '../../Types';
import { ChatComponent } from './ChatComponent';
import { VideoComponent } from './VideoComponent';

export type FormData = {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
};

type Props = {};

export const Interaction: React.FC<Props> = () => {
  const [state, setState] = useState<{
    token?: string;
    parsedToken?: IParsedToken;
    currentConversation?: Conversation;
    initVideo?: boolean;
    initVideoIsLoading: boolean;
    isLoading: boolean;
    error?: string;
  }>({
    initVideoIsLoading: false,
    isLoading: true,
  });

  const { conversationSid } = useParams();

  let navigate = useNavigate();

  const { updateTokenCustomer } = useApi();

  let { room, agentTracks, customerTracks, connectRoom, disconnectRoom } =
    useTwilioRoom();

  useEffect(() => {
    let connectedRoom: Room;

    async function load() {
      if (conversationSid) {
        const token = localStorage.getItem(conversationSid);

        if (token) {
          const parsedToken = parseJwt(token) as IParsedToken;

          try {
            if (parsedToken.exp * 1000 < Date.now()) {
              throw Error("Your token is expired!");
            }

            if (parsedToken.grants.video) {
              connectedRoom = await connectRoom(
                token,
                parsedToken.grants.video.room
              );
            }

            const chatClient = new TwilioChatClient(token);
            const conversation = await chatClient.getConversationBySid(
              conversationSid
            );

            if (conversation.state?.current === "closed") {
              localStorage.removeItem(conversationSid);
              navigate("/");
            } else {
              setState((prevState) => {
                return {
                  ...prevState,
                  token: token,
                  parsedToken: parsedToken,
                  currentConversation: conversation,
                  isLoading: false,
                };
              });
            }
          } catch (error: any) {
            setState((prevState) => {
              return {
                ...prevState,
                error: error.message,
                isLoading: false,
              };
            });
          }
        }
      }
    }

    load();

    return () => {
      if (connectedRoom) {
        disconnectRoom(connectedRoom);
      }
    };
  }, [conversationSid, navigate, connectRoom, disconnectRoom]);

  useEffect(() => {
    if (state.currentConversation) {
      state.currentConversation.on("updated", (data) => {
        if (data.conversation.state?.current === "closed") {
          localStorage.removeItem(data.conversation.sid);
          navigate("/");
        }

        if (data.updateReasons.includes("attributes")) {
          if (data.conversation.attributes) {
            const attributes = data.conversation.attributes as any;
            if (attributes.room) {
              setState((prevState) => {
                return {
                  ...prevState,
                  initVideo: true,
                };
              });
            }
          }
        }
      });
    }

    return () => {
      if (state.currentConversation) {
        state.currentConversation.removeAllListeners("updated");
      }
    };
  }, [state.currentConversation, navigate]);

  const initiateVideo = useCallback(
    async (currentConversation?: Conversation) => {
      if (currentConversation) {
        setState((prevState) => {
          return {
            ...prevState,
            initVideoIsLoading: true,
          };
        });

        const attributes = currentConversation.attributes as any;

        const data = await updateTokenCustomer(attributes.room);

        const token = data.token;

        const parsedToken = parseJwt(token) as IParsedToken;

        localStorage.setItem(currentConversation.sid, token);

        if (parsedToken.grants.video) {
          await connectRoom(token, parsedToken.grants.video.room);
        }

        setState((prevState) => {
          return {
            ...prevState,
            token: token,
            parsedToken: parsedToken,
            initVideo: false,
            initVideoIsLoading: false,
          };
        });
      }
    },
    [updateTokenCustomer, connectRoom]
  );

  return (
    <Box>
      <Box
        marginTop="space100"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        {state.error && (
          <Box marginBottom="space60">
            <Alert variant="error">{state.error}</Alert>
          </Box>
        )}
        {state.isLoading && (
          <Spinner decorative={false} title="Loading" size="sizeIcon80" />
        )}
        {state.currentConversation && (
          <Stack orientation="horizontal" spacing="space10">
            <ChatComponent
              identity={state.parsedToken?.grants.identity || ""}
              conversation={state.currentConversation}
            />
            {state.initVideo && state.initVideo === true && (
              <Box
                margin="space40"
                height="480px"
                width="640px"
                position="relative"
              >
                <Box
                  zIndex="zIndex10"
                  position="absolute"
                  height="100%"
                  width="100%"
                  display="flex"
                  flexDirection="column"
                  backgroundColor="colorBackground"
                  justifyContent="center"
                  alignItems="center"
                >
                  <Heading as="h4" variant="heading40">
                    The agent is asking you to join a video chat
                  </Heading>
                  <Button
                    loading={state.initVideoIsLoading}
                    onClick={() => initiateVideo(state.currentConversation)}
                    variant="primary"
                  >
                    Start video with the Agent
                  </Button>
                </Box>
              </Box>
            )}
            {room && (
              <VideoComponent
                agentTracks={agentTracks}
                customerTracks={customerTracks}
              />
            )}
          </Stack>
        )}
      </Box>
    </Box>
  );
};
