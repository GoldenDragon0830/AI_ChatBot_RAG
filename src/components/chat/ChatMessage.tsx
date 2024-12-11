import React, { useState } from "react";
import { Typography, Paper, Box, Dialog,
  DialogContent,
  DialogActions,
  DialogTitle, } from "@mui/material";
import Badge, { badgeClasses } from '@mui/joy/Badge';
import Avatar from '@mui/joy/Avatar';
import PersonIcon from '@mui/icons-material/Person';
import SmartToyIcon from '@mui/icons-material/SmartToy';
  

interface ChatMessageProps {
  content: string;
  role: "user" | "assistant";
  imageUrl?: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  content,
  role,
  imageUrl,
}) => {
  const isRequest = role === "user";
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: isRequest ? "flex-end" : "flex-start",
        mb: 1,
        flexDirection: "column", // Ensure image and text stack vertically
        alignItems: isRequest ? "flex-end" : "flex-start", // Alignment for image and text
      }}
    >
      {imageUrl && (
        <Box // Image container
          component="img"
          src={imageUrl}
          alt="Chat message visual"
          sx={{
            maxWidth: "300px",
            maxHeight: "200px",
            borderRadius: 2,
            mb: 1, // Margin bottom for spacing between image and text
            boxShadow: 3, // Optional shadow for better visualization
          }}
          onClick={handleOpen}
        />
      )}
      <Dialog open={open} onClose={handleClose}>
        <DialogActions>
          <DialogTitle style={{ textAlign: "center" }}>{content}</DialogTitle>
        </DialogActions>
        <DialogContent>
          <img src={imageUrl} alt={content} style={{ width: "100%" }} />
        </DialogContent>
      </Dialog>
      <div style={{display: 'flex', alignItems: 'center', }}>
        <Badge
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          badgeInset="14%"
          color="success"
        >
          { isRequest ? (<PersonIcon fontSize="large" color="primary" />) : (<div style={{display: 'flex', alignItems: 'center'}}><img src="/restaruantlogo.png" alt="logo" style={{width: "40px", height: "40px"}}/></div>)}
        </Badge>
        {
          isRequest ? (<p></p>) : (<p style={{paddingLeft: '5px'}}>Assistant</p>)
        }
      </div>
      <Paper
        sx={{
          backgroundColor: isRequest ? "#2196f3" : "#e0e0e0",
          color: isRequest ? "#fff" : "#000",
          padding: 2,
          borderRadius: 2,
          maxWidth: "100%",
          borderTopRightRadius: isRequest ? 0 : 4,
          borderBottomLeftRadius: isRequest ? 4 : 0,
          wordBreak: "break-word",
          overflowWrap: "break-word",
        }}
        elevation={5}
      >
        <Typography variant="body1">{content}</Typography>
      </Paper>
    </Box>
  );
};

export default ChatMessage;
