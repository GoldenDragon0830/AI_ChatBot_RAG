import { Button, TextField } from "@mui/material";
import React, { useState } from "react";
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import SendIcon from '@mui/icons-material/Send';

interface ChatInputProps {
  onSendMessage: (message: {
    content: string;
    role: "user" | "assistant";
  }) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState<{
    content: string;
    role: "user" | "assistant";
  }>({
    content: "",
    role: "user",
  });

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMessage({ ...message, content: event.target.value });
  };

  const handleSendMessage = () => {
    if ( message.content.length !== 0) {
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
        left: "1300px",
        padding: "30px",
        backgroundColor: "#F4F7FD",
        borderRadius: "30px"
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
            borderRadius: "30px", // Apply border-radius to the input field
          },
          "& .MuiOutlinedInput-notchedOutline": {
            // Optional: Adjust border thickness
          },
        }}
      />
      <Button
        variant="contained"
        endIcon={<SendIcon />}
        onClick={handleSendMessage}
        sx={{
          marginLeft: "10px",
          backgroundColor: "#73AD21",
          borderRadius: "30px"
        }}
      >
        {"Send"}
      </Button>
    </div>
  );
};

export default ChatInput;
