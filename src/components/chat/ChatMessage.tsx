import React from "react";
import { Typography, Paper, Box } from "@mui/material";

interface ChatMessageProps {
  content: string;
  role: "user" | "assistant";
}

const ChatMessage: React.FC<ChatMessageProps> = ({ content, role }) => {
  const isRequest = role === "user";

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: isRequest ? "flex-end" : "flex-start",
        mb: 1,
      }}
    >
      <Paper
        sx={{
          backgroundColor: isRequest ? "#2196f3" : "#e0e0e0",
          color: isRequest ? "#fff" : "#000",
          padding: 2,
          borderRadius: 2,
          maxWidth: "100%",
          borderTopRightRadius: isRequest ? 0 : 4,
          borderBottomLeftRadius: isRequest ? 4 : 0,
          wordBreak: "break-word",  // Ensures long words break to fit within the container
          overflowWrap: "break-word", // Allows text to wrap to the next line
        }}
        elevation={5}
      >
        <Typography variant="body1">{content}</Typography>
      </Paper>
    </Box>
  );
};

export default ChatMessage;