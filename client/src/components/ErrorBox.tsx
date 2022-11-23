import { Alert, Box, Text } from "@twilio-paste/core";
import React from "react";

type Props = {
  error?: string;
}

const ErrorBox: React.FC<Props> = ({ error }) => {

  if (error === undefined) {
    return null
  }

  return (
    <Box>
      <Alert variant='error'>
        <Text as="p">{error}</Text>
      </Alert>
    </Box>
  )

}

export default ErrorBox;