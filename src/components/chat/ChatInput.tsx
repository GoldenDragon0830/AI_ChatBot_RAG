import { Button, TextField,InputAdornment, IconButton } from "@mui/material";
import React, { useState } from "react";
import SendIcon from '@mui/icons-material/Send';

interface ChatInputProps {
  onSendMessage: (message: {
    content: string;
    role: "user" | "assistant";
  }) => void;
}

const drawerWidth = "70%";

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
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && message.content.length > 0) {
      handleSendMessage();
    }
  };

  return (
    <div
      style={{
        display: "flex",
        position: "fixed",
        bottom: 0,
        right: 0,
        left: drawerWidth, // Align with chatting area
        padding: "1vw", // Relative padding
        backgroundColor: "#F4F7FD",
        borderRadius: "30px",
      }}
    >
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
    </div>
  );
};

export default ChatInput;