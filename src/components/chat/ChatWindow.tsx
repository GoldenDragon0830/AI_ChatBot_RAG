import React, { useState, useRef, useEffect } from "react";
import ChatInput from "./ChatInput";
import ChatMessage from "./ChatMessage";
import {
  CircularProgress,
  useMediaQuery,
  useTheme,
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
} from "@mui/material";
import IconButton from '@mui/material/IconButton';
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import ImageListItemBar from "@mui/material/ImageListItemBar";
import VisibilityIcon from '@mui/icons-material/Visibility';
import DoneOutlineIcon from '@mui/icons-material/DoneOutline';

interface MessageInterface {
  content: string;
  imageUrl?: string; // Optional imageUrl property
  role: "user" | "assistant";
}

const ChatWindow: React.FC = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isMediumScreen = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const isLargeScreen = useMediaQuery(theme.breakpoints.up("md"));

  const API_URL = "http://52.221.236.58:80/chat";

  const [messages, setMessages] = useState<MessageInterface[]>([]);
  const [chunkData, setChunkData] = useState<
    { title: string; imageUrl: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const ItemButton: React.FC<{
    text: string;
    url: string;
    onClick: () => void;
  }> = ({ text, url, onClick }) => {
    const [open, setOpen] = useState(false);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    return (
      <ImageListItem key={text} className="image-list-item">
      <img src={url} alt={text} loading="lazy" onClick={handleOpen} />
      <div className="overlay">
        <IconButton color="primary" onClick={handleOpen} style={{ color: "white" }}>
          <VisibilityIcon />
        </IconButton >
        <IconButton color="primary" onClick={onClick} style={{ color: "white" }}>
          <DoneOutlineIcon />
        </IconButton >
      </div>
      <ImageListItemBar
        title={
          <div className="marquee-container">
            <span className="marquee">{text}</span>
          </div>
        }
      />
      
      <Dialog open={open} onClose={handleClose}>
        <DialogActions>
          <DialogTitle style={{ textAlign: "center" }}>{text}</DialogTitle>
        </DialogActions>
        <DialogContent>
          <img src={url} alt={text} style={{ width: "100%" }} />
        </DialogContent>
      </Dialog>
    </ImageListItem>
    );
  };

  const styles = `
    @keyframes marquee {
      0% {
        transform: translateX(100%);
      }
      100% {
        transform: translateX(-100%);
      }
    }

    .marquee-container {
      overflow: hidden;
      white-space: nowrap;
      width: 100%;
    }

    .marquee {
      display: inline-block;
      padding-left: 100%;
      animation: marquee 10s linear infinite;
    }

    .image-list-item {
      position: relative;
      overflow: hidden;
    }

    .overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.2);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: none; /* Prevents overlay from blocking hover on the image */
    }

    .image-list-item:hover .overlay {
      opacity: 1;
      pointer-events: auto; /* Allows clicking on the overlay */
    }`;

  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
  
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleButtonClick = (text: string, url: string) => {
    const message: MessageInterface = {
      content: text,
      role: "user",
      imageUrl: url, // Include the image URL
    };
    handleSendMessage(message);
  };

  const handleGetImageUrl = async (message: MessageInterface) => {};

  const handleSendMessage = async (message: MessageInterface) => {
    setMessages((prevMessages) => [...prevMessages, message]);
    setChunkData([]);
    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}?prefix=You+are+an+AI+assistant&message=${
          message.content
        }&history=${JSON.stringify(messages)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "text/event-stream",
          },
        }
      );

      if (!response.ok) throw new Error("Network response was not ok");
      if (!response.body) throw new Error("Response body is null");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let newMessageContent = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        buffer += chunk;

        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        lines.forEach((line) => {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            // if(data.split("SummaryTitle"))
            if (data.includes("ChunkData:")) {
              try {
                const jsonData = JSON.parse(data.split("ChunkData:")[1]);
                setChunkData(jsonData);
                console.log(chunkData);
              } catch (e) {
                console.error(e);
              }
            }
            // if (data.includes("ImageUrl:")){
            //   console.log(line)
            //   setImageUrl(data.slice(10));
            // }
            newMessageContent += data;
            setMessages((prev) => {
              const newMessages = [...prev];
              const lastMessageIndex = newMessages.length - 1;

              if (
                lastMessageIndex >= 0 &&
                newMessages[lastMessageIndex].role === "assistant"
              ) {
                newMessages[lastMessageIndex].content =
                  newMessageContent.split("ChunkData:")[0] || "";
              } else {
                newMessages.push({ content: data, role: "assistant" });
              }
              return newMessages;
            });
          }
        });
      }

      // console.log(newMessageContent)
      // const summaryStart = newMessageContent.indexOf("SummaryTitle:") + "SummaryTitle:".length;
      // const imageUrlStart = newMessageContent.indexOf("ImageUrl:");
      // const summaryContent = newMessageContent.slice(summaryStart, imageUrlStart).trim().slice(1);

      // setSummary(summaryContent);
      // setImageUrl((prev) => {

      //   return newMessageContent.split("ImageUrl:@")[1];
      // });
      // console.log("@@@@@@@@@"+ newMessageContent);
    } catch (error) {
      console.error(
        "Chat Error:",
        error instanceof Error ? error.message : error
      );
      setMessages((prev) => {
        const newMessages = [...prev];
        const lastMessageIndex = newMessages.length - 1;
        if (
          lastMessageIndex >= 0 &&
          newMessages[lastMessageIndex].role === "assistant"
        ) {
          newMessages[lastMessageIndex].content =
            "Sorry, there was an error. Please try again.";
        } else {
          newMessages.push({
            content: "Sorry, there was an error. Please try again.",
            role: "assistant",
          });
        }
        return newMessages;
      });
    } finally {
      setLoading(false);
    }
  };

  const uniqueChunkData = chunkData.filter(
    (item, index, self) =>
      index === self.findIndex((t) => t.title === item.title)
  );

  return (
    <div style={{ padding: "1rem" }}>
      <div
        style={{
          height: "80vh",
          maxHeight: "650px",
          overflowY: "auto",
          padding: "50px",
          position: "relative",
        }}
        ref={containerRef}
      >
        {messages.map((message, index) => (
          <ChatMessage key={index} {...message} />
        ))}
        {/* <Grid container spacing={2} style={{ marginTop: "20px" }}> */}
        <ImageList
          cols={isSmallScreen ? 2 : isMediumScreen ? 4 : 6}
          style={{ padding: "10px" }}
        >
          {uniqueChunkData.map((item, index) => (
            <ItemButton
              key={index}
              text={item.title}
              url={item.imageUrl}
              onClick={() => handleButtonClick(item.title, item.imageUrl)}
            />
          ))}
        </ImageList>
        <div></div>
        {loading && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <CircularProgress />
          </div>
        )}
        <ChatInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
};

export default ChatWindow;
