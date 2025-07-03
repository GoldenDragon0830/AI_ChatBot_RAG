import React, { useState } from "react";
import { Typography, Paper, Box, Dialog, DialogContent, DialogActions, DialogTitle } from "@mui/material";
import Badge from '@mui/joy/Badge';

interface ChatMessageProps {
  // content: string;
  // role: "user" | "assistant";
  // imageUrl?: string;
  text: string;
  sender: any;
  storedUserId:string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ text, sender, storedUserId }) => {
  // const isRequest = role === "user";
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Box
      sx={{
        padding: "5px",
        display: "flex",
        justifyContent: storedUserId !== sender ? "flex-end" : "flex-start",
        mb: { xs: 0.5, md: 1 }, // Responsive margin-bottom
        flexDirection: "column",
        alignItems: storedUserId !== sender ? "flex-end" : "flex-start",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: storedUserId !== sender ? "row-reverse" : "row",
          alignItems: "flex-start",
          marginBottom: "0.5vh", // Relative margin
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            margin: storedUserId !== sender ? "0 0 0 0.5vw" : "0 0.5vw 0 0",
          }}
        >
          <Badge
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            badgeInset="14%"
            color="success"
          >
            {storedUserId === sender ? (
              <img
                src="/west-side-wok/user.png"
                alt="logo"
                style={{ width: "40px", height: "40px", maxWidth: "40px", minWidth: "40px" }}
              />
            ) : (
              <img
                src="/west-side-wok/assistant.png"
                alt="logo"
                style={{ width: "40px", height: "40px", maxWidth: "40px", minWidth: "40px" }}
              />
            )}
          </Badge>
        </div>
        <Paper
          sx={{
            backgroundColor: storedUserId !== sender ? "#DCF4BB" : "#e0e0e0",
            color: "#000",
            padding: { xs: 1, md: 2 }, // Responsive padding
            borderRadius: 2,
            maxWidth: { xs: "70vw", md: "50vw" }, // Responsive max width
            borderTopRightRadius: storedUserId !== sender ? 0 : 4,
            borderBottomLeftRadius: storedUserId !== sender ? 4 : 0,
            wordBreak: "break-word",
            overflowWrap: "break-word",
          }}
          elevation={5}
        >
           <Typography variant="body1">
              <React.Fragment>
                {text}
              </React.Fragment>
          </Typography>
          {/* <Typography variant="body1">
            {text.split('\n').map((line, idx) => (
              <React.Fragment key={idx}>
                {line}
                <br />
              </React.Fragment>
            ))}
          </Typography> */}
        </Paper>
      </div>
    </Box>
  );
};

export default ChatMessage;