import React, { useState, useRef, useEffect } from "react";
import ChatInput from "./ChatInput";
import ChatMessage from "./ChatMessage";

import {
  CircularProgress,
  Button,
  Box,
  Typography,
} from "@mui/material";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";

import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

interface MessageInterface {
  content: string;
  imageUrl?: string; // Optional imageUrl property
  role: "user" | "assistant";
}

interface ChunkOption {
  type: string;
  value: string;
  description: string;
  price: string;
  keyword: string;
}

const GREETING_WORD =
  "I'm Limb lengthening Assistant, What would you like to order today?";

const drawerWidth = "73%";

const ChatWindow: React.FC = () => {
  const [nameListData, setNameListData] = useState<ChunkOption[]>([]);


  const [selectedOptionListData, setSelectedOptionListData] = useState<string[]>([]);

  // const API_URL = process.env.REACT_APP_API_URL;

  const [messages, setMessages] = useState<MessageInterface[]>([
    { content: GREETING_WORD, role: "assistant" },
  ]);
  const menuList = [
    "Home",
    "Surgery",
    "Pictures",
    "Videos",
    "Team",
    "Schedule",
    "Contact Us"
  ];

  const [chunkData, setChunkData] = useState<ChunkOption[]>([]);

  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const [snackbarOpen, setSnackbarOpen] = useState(false);  

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

    .card-content {
      opacity: 0.3
      position: relative;
      overflow: hidden; /* Ensure the overlay is confined to the CardContent */
    }

    .card-content .overlay {
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
      opacity: 0; /* Initially hidden */
      transition: opacity 0.3s ease; /* Smooth transition */
      pointer-events: none; /* Prevent overlay from blocking hover on the content */
    }

    .card-content:hover .overlay {
      opacity: 0.3; /* Show the overlay on hover */
      pointer-events: auto; /* Enable interaction with the overlay */
    }  
  `;

  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);

  useEffect(() => {
    if (containerRef.current) {
      // Scroll to the bottom of the container
      const scrollHeight = containerRef.current.scrollHeight;
      const height = containerRef.current.clientHeight;
      containerRef.current.scrollTop = scrollHeight - height;
    }
  }, [messages]);

  const handleSendMessageViaInput = (text: string) => {

  };

  const [chatScreenMode, setChatScreenMode] = useState(false);
  const [selectedChip, setSelectedChip] = useState<string | null>("ALL");
  const [selectedNameChip, setSelectedNameChip] = useState<string | null>(
    "ALL"
  );

  let groupedData: Record<string, ChunkOption[]> = chunkData.reduce(
    (acc: Record<string, ChunkOption[]>, item) => {
      const groupKey =
        selectedChip === "ALL" || selectedNameChip === "ALL"
          ? item.keyword
          : "";
      if (!acc[groupKey]) {
        acc[groupKey] = [];
      }
      acc[groupKey].push(item);
      return acc;
    },
    {}
  );
  
  // Reorder groupedData based on nameListData's order
  if (nameListData.length > 1) {
    groupedData = Object.fromEntries(
      nameListData
        .map((nameItem) => nameItem.value)
        .filter((key) => groupedData[key]) // Ensure only existing keys are included
        .map((key) => [key, groupedData[key]])
    );
  }

  const MenuIcon = ({ color }: { color: string }) => {
    return (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="26" height="26" fill="white" fillOpacity="0.01"/>
        <path d="M16.7406 14.8375H6.37188C6.74688 14.6172 7.14063 14.3969 7.60001 14.2844C7.90938 14.2094 8.27501 14.2047 8.66407 14.2C8.95938 14.1953 9.26407 14.1906 9.57813 14.1578C9.86407 14.1297 10.1453 14.0688 10.4172 14.0125C10.8063 13.9281 11.1766 13.8531 11.5469 13.8531C11.9172 13.8531 12.2875 13.9328 12.6813 14.0125C12.9531 14.0688 13.2391 14.1297 13.5203 14.1578C13.8344 14.1906 14.1391 14.1953 14.4344 14.2C14.8234 14.2047 15.1938 14.2094 15.4984 14.2844C15.9719 14.4016 16.3656 14.6219 16.7406 14.8375ZM4.84844 17.2891H18.2641C18.0203 20.6781 15.1047 23.3594 11.5563 23.3594C8.01251 23.3594 5.09688 20.6781 4.84844 17.2891ZM19.2625 16.0516V16.075C19.2625 16.2297 19.1359 16.3516 18.9859 16.3516H4.12657C3.97188 16.3516 3.85001 16.225 3.85001 16.075V16.0516C3.85001 15.8969 3.97657 15.775 4.12657 15.775H18.9859C19.1406 15.775 19.2625 15.9016 19.2625 16.0516ZM22.15 7.46875C22.1406 7.21562 22.0094 6.99531 21.7891 6.87344L14.4203 2.73438C14.3078 2.67344 14.1906 2.64062 14.0734 2.64062C13.9563 2.64062 13.8438 2.66875 13.7359 2.72969C13.5156 2.84688 13.3797 3.05781 13.3609 3.30625L12.6578 13.0516C12.7328 13.0656 12.8078 13.0844 12.8828 13.0984C13.1453 13.1547 13.3938 13.2062 13.6281 13.2297C13.7406 13.2391 13.8578 13.2484 13.9703 13.2531L21.8266 8.0875C22.0422 7.95156 22.1594 7.72656 22.15 7.46875ZM14.1719 12.2828C14.0922 12.3344 14.0031 12.3578 13.9141 12.3578C13.7641 12.3578 13.6141 12.2828 13.525 12.1469C13.3844 11.9313 13.4406 11.6406 13.6609 11.5C13.8766 11.3594 14.1672 11.4156 14.3078 11.6359C14.4438 11.8516 14.3875 12.1422 14.1719 12.2828ZM14.5656 9.32969C14.5469 9.57812 14.3406 9.76562 14.0969 9.76562H14.0641C13.8063 9.74687 13.6141 9.52188 13.6328 9.26406C13.6516 9.00625 13.8766 8.81406 14.1344 8.83281C14.3922 8.85156 14.5844 9.07187 14.5656 9.32969ZM14.7531 6.7375C14.7344 6.98594 14.5281 7.17344 14.2844 7.17344H14.2516C13.9938 7.15469 13.8016 6.92969 13.8203 6.67188C13.8391 6.41406 14.0641 6.22188 14.3219 6.24063C14.5797 6.25469 14.7719 6.47969 14.7531 6.7375ZM14.8844 4.3375C14.8 4.49219 14.6406 4.57656 14.4766 4.57656C14.3969 4.57656 14.3219 4.55781 14.2469 4.51562C14.0219 4.38906 13.9422 4.10313 14.0688 3.87813C14.1953 3.65313 14.4813 3.57344 14.7063 3.7C14.9313 3.82656 15.0109 4.1125 14.8844 4.3375ZM16.3844 10.8297C16.3047 10.8812 16.2156 10.9047 16.1266 10.9047C15.9766 10.9047 15.8266 10.8297 15.7375 10.6938C15.5969 10.4781 15.6531 10.1875 15.8734 10.0469C16.0891 9.90625 16.3797 9.9625 16.5203 10.1828C16.6609 10.3937 16.6 10.6844 16.3844 10.8297ZM16.5156 8.07344C16.4359 8.125 16.3469 8.14844 16.2578 8.14844C16.1078 8.14844 15.9578 8.07344 15.8641 7.9375C15.7234 7.72188 15.7844 7.43125 16 7.29062C16.2156 7.15 16.5063 7.21094 16.6469 7.42656C16.7922 7.64219 16.7313 7.93281 16.5156 8.07344ZM16.9094 5.47656C16.825 5.63125 16.6656 5.71562 16.5016 5.71562C16.4219 5.71562 16.3469 5.69688 16.2719 5.65469C16.0469 5.52813 15.9672 5.24219 16.0938 5.01719C16.2203 4.79219 16.5063 4.7125 16.7313 4.83906C16.9563 4.96563 17.0359 5.25156 16.9094 5.47656ZM18.6016 9.37188C18.5219 9.42344 18.4328 9.44687 18.3438 9.44687C18.1938 9.44687 18.0438 9.37187 17.95 9.23594C17.8094 9.02031 17.8703 8.72969 18.0859 8.58906C18.3016 8.44844 18.5922 8.50938 18.7328 8.725C18.8734 8.94063 18.8172 9.23125 18.6016 9.37188ZM18.9391 6.61563C18.8547 6.77031 18.6953 6.85469 18.5313 6.85469C18.4516 6.85469 18.3766 6.83594 18.3016 6.79375C18.0766 6.66719 17.9969 6.38125 18.1234 6.15625C18.25 5.93125 18.5359 5.85156 18.7609 5.97812C18.9859 6.10469 19.0656 6.39063 18.9391 6.61563ZM20.9641 7.75469C20.8797 7.90938 20.7203 7.99375 20.5563 7.99375C20.4766 7.99375 20.4016 7.975 20.3266 7.93281C20.1016 7.80625 20.0219 7.52031 20.1484 7.29531C20.275 7.07031 20.5609 6.99062 20.7859 7.11719C21.0109 7.24375 21.0906 7.52969 20.9641 7.75469Z" fill={color}/>
      </svg>
    )
  }

  const drawer = (
    <div>
      <Divider />
      <Box
        sx={{
          display: "flex", // Use flexbox for layout
          flexDirection: "vertically", // Stack items vertically
        }}
      >
        <Paper
          sx={{
            display: "flex",
            alignItems: "center",
            flexWrap: "nowrap", // Prevent wrapping to ensure chips stay in one line
            overflowX: "auto", // Enable horizontal scrolling
            listStyle: "none",
            height: "auto",
            p: 0.5,
            m: 0,
            width: "100%", // Ensure it doesn't overflow its container
          }}
        >
            <Button
              color="success"
              sx={{
                marginLeft: "30px",
                marginTop: "10px",
                marginBottom: "10px",
                width: "100px",
                color: "black"
              }}
              onClick={()=>{setChatScreenMode(true)}}
            >
              Menu
            </Button>
            <Button
              color="success"
              sx={{
                marginLeft: "30px",
                marginTop: "10px",
                marginBottom: "10px",
                width: "200px",
                color: "black"
              }}
              onClick={()=>{setChatScreenMode(false)}}
            >
              Customer Support
            </Button>
        </Paper>
      </Box>
      
      { selectedOptionListData.length !== 0 ? (
        <Box
          sx={{
            display: "flex", // Use flexbox for layout
            flexDirection: "vertically", // Stack items vertically
          }}
        >
          <Paper
            sx={{
              display: "flex",
              flexWrap: "nowrap", // Prevent wrapping to ensure chips stay in one line
              overflowX: "auto", // Enable horizontal scrolling
              listStyle: "none",
              p: 0.5,
              m: 0,
              padding: "10px",
              paddingLeft: "45px",
              width: "100%", // Ensure it doesn't overflow its container
            }}
          >
            {selectedOptionListData.map((text, index) => {
              return (
                <Chip
                  sx={{
                    margin: "2px",
                    paddingLeft: "10px",
                    paddingRight: "10px",
                    color: "#BABABA"
                  }}
                  label={text}
                  clickable
                  variant="outlined" // Change variant when selected
                  key={index}
                />
              );
            })}
          </Paper>
        </Box>
      ) : null}
      {chatScreenMode ? (
        <Box sx={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0,
          marginTop: '150px',
          width: '73%', 
          height: '85%',
          bgcolor: 'white',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
            <Paper
                sx={{
                  height: "auto",
                  display: "flex",
                  backgroundColor: 'white',
                  justifyContent: "start",
                  flexWrap: "wrap",
                  listStyle: "none",
                  p: 2,
                  m: 0,
                }}
              >
                {menuList.map((title, index) => {
                  return (
                    <Chip
                      sx={{
                        margin: "5px",
                        color: `${selectedChip === title ? "#FFFFFF" : "#BABABA"}`,
                        backgroundColor: `${selectedChip === title ? "#73AD21" : "#FFFFFF"}`,
                        fontWeight: `${selectedChip === title ? "bold" : "normal"}`,
                        fontSize: "14px",
                        '& .MuiChip-label': {
                          paddingLeft: '4px',  // Reduce default padding between icon and label
                        },
                        '& svg': {
                          marginLeft: '2px',
                          marginRight: '-4px',  // Pull the label closer to the icon
                        }
                      }}
                      icon={
                        <MenuIcon
                          color={selectedChip === title ? "#FFFFFF" : "#BABABA"}
                        />
                      }
                      variant={selectedChip === title ? "filled" : "outlined"} // Change variant when selected
                      key={index}
                      label={title.replace(/_/g, "\u2009")}
                    />
                  );
                })}
              </Paper>
          </Box>
        </Box>
      ) : (
        <Box sx={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0,
          marginTop: '260px',
          width: '73%', 
          height: 'auto',
          bgcolor: 'white',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'auto'
        }}>
          {Object.entries(groupedData).map(([groupKey, groupItems]) => (
            <Box key={groupKey} sx={{marginLeft: "20px", marginTop: "20px", height: "auto" }}>
              {(groupKey !== "undefined") && (nameListData.length > 1) ? (
                <Typography
                  sx={{
                    display: "flex",
                    marginLeft: "30px",
                    color: "#73AD21",
                    fontSize: "18px"
                  }}
                >
                  <KeyboardDoubleArrowRightIcon />{groupKey}
                </Typography>
              ) : (
                <div></div>
              )}
            </Box>
          ))}
        </Box>
      )}
    </div>
  );

  // Add this function
  return (
    <div style={{ overflow: "hidden" }}>
      {loading && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            bgcolor: "rgba(0,0,0,0.18)",
            zIndex: 2000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress size={70} color="success" />
        </Box>
      )}
      <Box sx={{ display: "flex", height: "auto", overflow: "hidden" }}>
        <img
          src="/limblengthening/Header.png"
          alt="Header"
          style={{
            width: "100vw",
            height: "auto", // or set a fixed height if you want
          }} 
        />
      </Box>
      <Box sx={{ display: "flex", height: "auto", overflow: "hidden" }}>
        <Box
          component="main"
          sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
          aria-label="mailbox folders"
        >
          {drawer}
        </Box>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 1, md: 3 }, // Responsive padding
            width: { xs: `calc(100% - ${drawerWidth})` }, // Remaining width for chatting area
            minWidth: "300px", // Minimum width to ensure usability
            overflow: "hidden", // Prevent page-level scrolling
            display: "flex",
            flexDirection: "column", // Stack children vertically
          }}
        >
          <div
            style={{
              maxWidth: "100%",
              overflowX: "hidden",
              flex: 1, // Take up remaining space
              marginBottom: "80px", // Add space for the input box
              display: "flex",
              flexDirection: "column-reverse", // Reverse the flex direction
              minHeight: "100%", // Ensure container takes full height
            }}
            ref={containerRef}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              {messages.map((message, index) => (
                <ChatMessage key={index} {...message} />
              ))}
            </div>
            
            <ChatInput
              onSendMessage={(message) =>
                handleSendMessageViaInput(message.content)
              }
            />
          </div>

        </Box>
      </Box>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <MuiAlert
          onClose={() => setSnackbarOpen(false)}
          severity="warning"
          elevation={6}
          variant="filled"
          sx={{ width: '100%' }}
        >
          please add product into cart
        </MuiAlert>
      </Snackbar>
    </div>
  );
};

export default ChatWindow;