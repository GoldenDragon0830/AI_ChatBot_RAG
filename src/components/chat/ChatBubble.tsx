import React from "react";
import { Box, Paper, Typography } from "@mui/material";

interface ChatBubbleProps {
  message: string;
  align: "left" | "right";
}

function isImage(url: string) {
  return /\.(jpeg|jpg|gif|png|webp|svg)$/i.test(url);
}

function isYouTube(url: string) {
  return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/.test(url);
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, align }) => {
  // Simple check for a single link in message
  // if (isImage(message)) {
  //   return (
  //     <Box
  //       sx={{
  //         display: "flex",
  //         justifyContent: align === "right" ? "flex-end" : "flex-start",
  //         mb: 1,
  //         px: 2,
  //       }}
  //     >
  //       <Paper elevation={3} sx={{ maxWidth: "75%", p: 1.2, backgroundColor: align === "right" ? "#c2f0c2" : "#f2f2f2", color: "#222" }}>
  //         <img src={message} alt="chat-img" style={{ maxWidth: 200, borderRadius: 6 }} />
  //       </Paper>
  //     </Box>
  //   );
  // }
  // if (isYouTube(message)) {
  //   const videoId = message.match(/(?:\?v=|\/embed\/|\.be\/)([a-zA-Z0-9_-]{11})/)?.[1];
  //   return (
  //     <Box
  //       sx={{
  //         display: "flex",
  //         justifyContent: align === "right" ? "flex-end" : "flex-start",
  //         mb: 1,
  //         px: 2,
  //       }}
  //     >
  //       <Paper elevation={3} sx={{ maxWidth: "75%", p: 1.2, backgroundColor: align === "right" ? "#c2f0c2" : "#f2f2f2", color: "#222" }}>
  //         {videoId ? (
  //           <iframe
  //             width="200"
  //             height="120"
  //             src={`https://www.youtube.com/embed/${videoId}`}
  //             frameBorder="0"
  //             allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  //             allowFullScreen
  //             title="YouTube video"
  //           />
  //         ) : message}
  //       </Paper>
  //     </Box>
  //   );
  // }
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: align === "right" ? "flex-end" : "flex-start",
        mb: 1,
        px: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          maxWidth: "95%",
          p: 1.2,
          backgroundColor: align === "right" ? "#c2f0c2" : "#f2f2f2",
          color: "#222",
        }}
      >
        <Typography
          variant="body1"
          component="div"
          dangerouslySetInnerHTML={{ __html: message }}
        />
      </Paper>
    </Box>
  );
};

export default ChatBubble;
