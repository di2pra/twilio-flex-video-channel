import React, { useCallback, useEffect, useRef, useState } from 'react';

import {
    Avatar, Button, ChatBubble, ChatEvent, ChatLog, ChatMessage, ChatMessageMeta,
    ChatMessageMetaItem, Heading, Label, MessageVariants, TextArea
} from '@twilio-paste/core';
import { Box } from '@twilio-paste/core/box';
import { Conversation, Message, Participant } from '@twilio/conversations';

type Props = {
  identity: string;
  conversation: Conversation;
};

export const ChatComponent: React.FC<Props> = ({ identity, conversation }) => {
  const [messageList, setMessageList] = useState<Message[]>([]);
  const [agentParticipant, setAgentParticipant] = useState<Participant>();
  const [messageToSend, setMessageToSend] = useState<string>("");

  const messageTextArea = useRef<HTMLTextAreaElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messageList, scrollToBottom]);

  const keyUpHandler = useCallback(
    (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        conversation.sendMessage(messageToSend);
        setMessageToSend("");
      }
    },
    [conversation, messageToSend]
  );

  useEffect(() => {
    let element = messageTextArea.current;

    if (element) {
      element.addEventListener("keydown", keyUpHandler);
    }

    return () => {
      if (element) {
        element.removeEventListener("keydown", keyUpHandler);
      }
    };
  }, [keyUpHandler]);

  useEffect(() => {
    conversation.getMessages().then((data) => {
      setMessageList(data.items);
    });
  }, [conversation]);

  useEffect(() => {
    conversation.getParticipants().then((data) => {
      setAgentParticipant(data.find((item) => item.identity !== "customer"));
    });
  }, [conversation]);

  useEffect(() => {
    conversation.on("messageAdded", (message: Message) => {
      setMessageList((prevState) => {
        return [...prevState, message];
      });
    });

    conversation.on("participantJoined", (participant) => {
      if (participant.identity !== "customer") setAgentParticipant(participant);
    });

    conversation.on("participantLeft", (participant) => {
      if (participant.identity !== "customer") setAgentParticipant(participant);
    });

    return () => {
      conversation.removeAllListeners("messageAdded");
      conversation.removeAllListeners("participantJoined");
      conversation.removeAllListeners("participantLeft");
    };
  }, [conversation]);

  const addMessage = useCallback(
    (messageToSend) => {
      conversation.sendMessage(messageToSend);
      setMessageToSend("");
    },
    [conversation]
  );

  return (
    <Box height="480px" width="450px" position="relative">
      <Box
        zIndex="zIndex10"
        position="absolute"
        height="100%"
        width="100%"
        display="flex"
        backgroundColor="colorBackground"
        justifyContent="center"
        alignItems="center"
      >
        <Heading as="h3" variant="heading30">
          Waiting the chat to load
        </Heading>
      </Box>
      <Box
        backgroundColor="colorBackgroundBody"
        zIndex="zIndex20"
        position="absolute"
        height="480px"
        width="450px"
        padding="space20"
      >
        <Box
          height="100%"
          display="flex"
          flexDirection="column"
          padding="space40"
          borderColor="colorBorderDestructiveStronger"
          borderStyle="solid"
          borderRadius="borderRadius30"
        >
          <Box flexGrow={2} overflow="scroll">
            <ChatLog>
              {agentParticipant ? (
                <ChatEvent>
                  <strong>The agent has joined the chat</strong>
                </ChatEvent>
              ) : (
                <ChatEvent>
                  <strong>Waiting the agent to join the chat</strong>
                </ChatEvent>
              )}
              {messageList.map((item, key) => {
                let variant: MessageVariants = "inbound";

                if (item.author === identity) {
                  variant = "outbound";
                }

                return (
                  <ChatMessage key={key} variant={variant}>
                    <ChatBubble>{item.body}</ChatBubble>
                    {variant === "inbound" ? (
                      <ChatMessageMeta
                        aria-label={`agent ${process.env.REACT_APP_CUSTOMER_NAME} at 3:35 PM`}
                      >
                        <ChatMessageMetaItem>
                          <Avatar name={"Agent"} size="sizeIcon20" />
                          Agent ・ {item.dateCreated?.toLocaleTimeString()}
                        </ChatMessageMetaItem>
                      </ChatMessageMeta>
                    ) : (
                      <ChatMessageMeta aria-label="said by you at 3:35 PM">
                        <ChatMessageMetaItem>
                          {item.dateCreated?.toLocaleTimeString() || ""}
                        </ChatMessageMetaItem>
                      </ChatMessageMeta>
                    )}
                  </ChatMessage>
                );
              })}
              <div ref={messagesEndRef} />
            </ChatLog>
          </Box>
          <Box flexGrow={0}>
            <Label htmlFor="message" required>
              Message
            </Label>
            <TextArea
              ref={messageTextArea}
              value={messageToSend}
              onChange={(e) => {
                setMessageToSend(e.target.value);
              }}
              aria-describedby="message_help_text"
              placeholder="Write your message here..."
              id="message"
              name="message"
              required
            />
            <Box marginTop="space50">
              <Button
                onClick={() => {
                  addMessage(messageToSend);
                }}
                disabled={messageToSend === ""}
                variant="primary"
              >
                Send
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
