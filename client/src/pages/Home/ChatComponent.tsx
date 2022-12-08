import { Avatar, Button, ChatBubble, ChatEvent, ChatLog, ChatMessage, ChatMessageMeta, ChatMessageMetaItem, Label, MessageVariants, TextArea } from '@twilio-paste/core';
import { Box } from '@twilio-paste/core/box';
import { Conversation, Message, Participant } from '@twilio/conversations';
import * as React from 'react';

type Props = {
  identity: string;
  conversation: Conversation;
  resetInteraction: () => void;
}

export const ChatComponent: React.FC<Props> = ({ identity, conversation, resetInteraction }) => {

  const [messageList, setMessageList] = React.useState<Message[]>([]);
  const [agentParticipant, setAgentParticipant] = React.useState<Participant>();
  const [messageToSend, setMessageToSend] = React.useState<string>('');

  const messageTextArea = React.useRef<HTMLTextAreaElement>(null);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);


  const scrollToBottom = React.useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, []);

  React.useEffect(() => {
    scrollToBottom();
  }, [messageList, scrollToBottom])

  const keyUpHandler = React.useCallback((event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      conversation.sendMessage(messageToSend);
      setMessageToSend('');
    }
  }, [conversation, messageToSend])

  React.useEffect(() => {

    let element = messageTextArea.current;

    if (element) {
      element.addEventListener("keydown", keyUpHandler);
    }

    return () => {
      if (element) {
        element.removeEventListener("keydown", keyUpHandler)
      }
    }

  }, [keyUpHandler]);

  React.useEffect(() => {
    conversation.getMessages().then((data) => {
      setMessageList(data.items)
    });
  }, [conversation]);

  React.useEffect(() => {
    conversation.getParticipants().then((data) => {
      setAgentParticipant(data.find(item => item.identity !== 'customer'))
    });
  }, [conversation]);

  React.useEffect(() => {

    conversation.on('messageAdded', (message: Message) => {
      setMessageList(prevState => {
        return [...prevState, message];
      })
    })

    conversation.on('participantJoined', (participant) => {
      if (participant.identity !== 'customer') setAgentParticipant(participant)
    });

    conversation.on('participantLeft', (participant) => {
      if (participant.identity !== 'customer') setAgentParticipant(participant)
    });

    conversation.on("removed", (conversation) => {
      resetInteraction();
    });

    return () => {
      conversation.removeAllListeners('messageAdded');
      conversation.removeAllListeners('participantJoined');
      conversation.removeAllListeners('participantLeft');
      conversation.removeAllListeners('removed');
    }

  }, [conversation, resetInteraction]);

  const addMessage = React.useCallback((messageToSend) => {
    conversation.sendMessage(messageToSend);
    setMessageToSend('');
  }, [conversation]);

  return (
    <Box height='100%' display='flex' flexDirection='column' padding='space40' borderColor="colorBorderDestructiveStronger" borderStyle="solid" borderRadius="borderRadius30" >
      <Box flexGrow={2} overflow="scroll" >
        <ChatLog>
          {
            agentParticipant ? (
              <ChatEvent>
                <strong>The agent has joined the chat</strong>
              </ChatEvent>
            ) : <ChatEvent>
              <strong>Waiting the agent to join the chat</strong>
            </ChatEvent>
          }
          {
            messageList.map((item, key) => {

              let variant: MessageVariants = 'inbound';

              if (item.author === identity) {
                variant = 'outbound'
              }

              return (
                <ChatMessage key={key} variant={variant}>
                  <ChatBubble>{item.body}</ChatBubble>
                  {
                    variant === "inbound" ? (
                      <ChatMessageMeta aria-label={`agent ${process.env.REACT_APP_CUSTOMER_NAME} at 3:35 PM`}>
                        <ChatMessageMetaItem>
                          <Avatar name={"Agent"} size="sizeIcon20" />
                          Agent ・ {item.dateCreated?.toLocaleTimeString()}
                        </ChatMessageMetaItem>
                      </ChatMessageMeta>
                    ) : (
                      <ChatMessageMeta aria-label="said by you at 3:35 PM">
                        <ChatMessageMetaItem>{item.dateCreated?.toLocaleTimeString() || ''}</ChatMessageMetaItem>
                      </ChatMessageMeta>
                    )
                  }
                </ChatMessage>
              )
            })
          }
          <div ref={messagesEndRef} />
        </ChatLog>
      </Box>
      <Box flexGrow={0}>
        <Label htmlFor="message" required>Message</Label>
        <TextArea ref={messageTextArea} value={messageToSend} onChange={(e) => { setMessageToSend(e.target.value) }} aria-describedby="message_help_text" id="message" name="message" required />
        <Box marginTop="space50" >
          <Button onClick={() => { addMessage(messageToSend) }} disabled={messageToSend === ''} variant='primary'>Send</Button>
        </Box>
      </Box>
    </Box>
  );
};