import { TextField,InputAdornment, IconButton, Box } from "@mui/material";
import React, { useState } from "react";
import SendIcon from '@mui/icons-material/Send';

// import { sendMessageToAdmin } from "./sendMessage";

interface ChatInputProps {
  onSendMessage: (message: {
    content: string;
    role: "user" | "assistant";
  }) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState<{ content: string; role: "user" | "assistant" }>({
    content: "",
    role: "user",
  });

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMessage({ ...message, content: event.target.value });
  };

  const handleSendMessage = () => {
    if (message.content.length !== 0) {
      onSendMessage(message);
      setMessage({ content: "", role: "user" });
      const inputElement = document.querySelector('input[type="text"]') as HTMLInputElement;
      if (inputElement) {
        inputElement.value = '';
      }
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && message.content.length > 0) {
      handleSendMessage();
    }
  };

  return (
    <Box sx={{width: "100%", padding: "1vw"}}>
      <TextField
        fullWidth
        placeholder="Type message"
        variant="outlined"
        onChange={handleInputChange}
        onKeyDown={handleKeyPress}
        InputProps={{
          sx: {
            borderRadius: '50px',
            backgroundColor: 'white',
          },
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={handleSendMessage}>
                <SendIcon sx={{ color: '#a0a0a0' }} />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
};

export default ChatInput;