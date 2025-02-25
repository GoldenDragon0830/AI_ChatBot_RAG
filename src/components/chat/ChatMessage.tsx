import React, { useState } from "react";
import { Typography, Paper, Box, Dialog, DialogContent, DialogActions, DialogTitle } from "@mui/material";
import Badge from '@mui/joy/Badge';

interface ChatMessageProps {
  content: string;
  role: "user" | "assistant";
  imageUrl?: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ content, role, imageUrl }) => {
  const isRequest = role === "user";
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: isRequest ? "flex-end" : "flex-start",
        mb: { xs: 0.5, md: 1 }, // Responsive margin-bottom
        flexDirection: "column",
        alignItems: isRequest ? "flex-end" : "flex-start",
      }}
    >
      {imageUrl && (
        <Box
          component="img"
          src={imageUrl}
          alt="Chat message visual"
          sx={{
            maxWidth: { xs: "40vw", md: "25vw" }, // Responsive image width
            maxHeight: "20vh", // Relative height
            borderRadius: 2,
            mb: 0.5, // Responsive margin
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
          flexDirection: isRequest ? "row-reverse" : "row",
          alignItems: "flex-start",
          marginBottom: "0.5vh", // Relative margin
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            margin: isRequest ? "0 0 0 0.5vw" : "0 0.5vw 0 0",
          }}
        >
          <Badge
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            badgeInset="14%"
            color="success"
          >
            {isRequest ? (
              <img
                src="/user.png"
                alt="logo"
                style={{ width: "3vw", height: "3vw", maxWidth: "40px", minWidth: "30px" }}
              />
            ) : (
              <img
                src="/assistant.png"
                alt="logo"
                style={{ width: "3vw", height: "3vw", maxWidth: "40px", minWidth: "30px" }}
              />
            )}
          </Badge>
        </div>
        <Paper
          sx={{
            backgroundColor: isRequest ? "#DCF4BB" : "#e0e0e0",
            color: "#000",
            padding: { xs: 1, md: 2 }, // Responsive padding
            borderRadius: 2,
            maxWidth: { xs: "70vw", md: "50vw" }, // Responsive max width
            borderTopRightRadius: isRequest ? 0 : 4,
            borderBottomLeftRadius: isRequest ? 4 : 0,
            wordBreak: "break-word",
            overflowWrap: "break-word",
          }}
          elevation={5}
        >
          <Typography variant="body1">{content.replace(/_/g, " ")}</Typography>
        </Paper>
      </div>
    </Box>
  );
};

export default ChatMessage;