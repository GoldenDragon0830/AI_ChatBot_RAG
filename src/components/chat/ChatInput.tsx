import { Button, TextField } from "@mui/material";
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
        label="Type message"
        variant="outlined"
        color="success"
        fullWidth
        value={message.content}
        onChange={handleInputChange}
        onKeyDown={handleKeyPress}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: "30px",
          },
          maxWidth: { xs: "40vw", md: "30vw" }, // Responsive input width
        }}
      />
      <Button
        variant="contained"
        endIcon={<SendIcon />}
        onClick={handleSendMessage}
        sx={{
          marginLeft: "1vw",
          backgroundColor: "#73AD21",
          borderRadius: "30px",
          padding: { xs: "6px 12px", md: "8px 16px" }, // Responsive padding
        }}
      >
        {"Send"}
      </Button>
    </div>
  );
};

export default ChatInput;
