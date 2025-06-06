import React, { useState } from "react";
import { Typography, Paper, Box, Dialog, DialogContent, DialogActions, DialogTitle } from "@mui/material";
import Badge from '@mui/joy/Badge';

interface ChatMessageProps {
  content: string;
  role: "user" | "assistant";
  imageUrl?: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ content, role, imageUrl }) => {
  const isUser = role === "user";
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        mb: { xs: 0.5, md: 1 },
        flexDirection: "column",
        alignItems: isUser ? "flex-end" : "flex-start",
      }}
    >
      {imageUrl && (
        <Box
          component="img"
          src={imageUrl}
          alt="Chat message visual"
          sx={{
            maxWidth: { xs: "40vw", md: "25vw" },
            maxHeight: "20vh",
            borderRadius: 2,
            mb: 0.5,
            boxShadow: 3,
          }}
          onClick={handleOpen}
        />
      )}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        <DialogActions>
          <DialogTitle sx={{ textAlign: "center", wordBreak: "break-word" }}>
            {content.replace(/_/g, " ")}
          </DialogTitle>
        </DialogActions>
        <DialogContent>
          <img src={imageUrl} alt={content} style={{ width: "100%" }} />
        </DialogContent>
      </Dialog>
      <div
        style={{
          display: "flex",
          flexDirection: isUser ? "row-reverse" : "row",
          alignItems: "flex-start",
          marginBottom: "0.5vh",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            margin: isUser ? "0 0 0 0.5vw" : "0 0.5vw 0 0",
          }}
        >
          <Badge
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            badgeInset="14%"
            color="success"
          >
            {isUser ? (
              <img
                src="/limblengthening/user.png"
                alt="logo"
                style={{ width: "40px", height: "40px", maxWidth: "40px", minWidth: "40px" }}
              />
            ) : (
              <img
                src="/limblengthening/assistant.png"
                alt="logo"
                style={{ width: "40px", height: "40px", maxWidth: "40px", minWidth: "40px" }}
              />
            )}
          </Badge>
        </div>
        <Paper
          sx={{
            backgroundColor: isUser ? "#DCF4BB" : "#e0e0e0",
            color: "#000",
            padding: { xs: 1, md: 2 },
            borderRadius: 2,
            maxWidth: { xs: "70vw", md: "50vw" },
            borderTopLeftRadius: isUser ? 4 : 0,
            borderTopRightRadius: isUser ? 0 : 4,
            borderBottomLeftRadius: isUser ? 4 : 0,
            borderBottomRightRadius: isUser ? 0 : 4,
            wordBreak: "break-word",
            overflowWrap: "break-word",
          }}
          elevation={5}
        >
          <Typography variant="body1">
            {content.split('\n').map((line, idx) => (
              <React.Fragment key={idx}>
                {line}
                <br />
              </React.Fragment>
            ))}
          </Typography>
        </Paper>
      </div>
    </Box>
  );
};

export default ChatMessage;