import React, { useState, useRef, useEffect } from "react";
import ChatInput from "./ChatInput";
import ChatMessage from "./ChatMessage";
import ChatBubble from "./ChatBubble";

import ImageIcon from '@mui/icons-material/Image';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';

import {
  CircularProgress,
  Button,
  Box,
  Typography,
  Avatar,
  Card,
  CardContent,
  CardActions,
  Stack,
  Chip,
  Paper,
  Divider,
  Dialog,
  DialogContent,
  iconButtonClasses,
  MenuItem,
  Select
} from "@mui/material";

import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import HomeOutlined from "@mui/icons-material/HomeOutlined";
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import BurstModeIcon from '@mui/icons-material/BurstMode';
import MovieIcon from '@mui/icons-material/Movie';
import Groups3Icon from '@mui/icons-material/Groups3';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import CloseIcon from '@mui/icons-material/Close'
import IconButton from "@mui/material/IconButton";
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

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

const GREETING_WORD = `
  <div style="font-size: 1.3em; font-weight: bold; color: #73AD21;">
    <span role="img" aria-label="robot">🤖</span>
    I'm <span style="color:#3a3a3a;">Limb Lengthening Assistant</span>,<br/>
    <span style="font-weight: normal;">How can I help you today?</span>
  </div>
`;

const drawerWidth = "73%";

const ChatWindow: React.FC = () => {
  const [nameListData, setNameListData] = useState<ChunkOption[]>([]);


  const [selectedOptionListData, setSelectedOptionListData] = useState<string[]>([]);

  const [assistantMedia, setAssistantMedia] = useState<{ images: string[]; videos: string[] }[]>([{ images: [], videos: [] }]);



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

  // Place these hooks at the top of your component if not already present:
  const [selectedTime, setSelectedTime] = useState("2:00 PM - 3:00 PM");

  // Static calendar for April 2025
  const days = [
    [null, 1, 2, 3, 4, 5, 6],
    [7, 8, 9, 10, 11, 12, 13],
    [14, 15, 16, 17, 18, 19, 20],
    [21, 22, 23, 24, 25, 26, 27],
    [28, 29, 30, null, null, null, null]
  ];

  const timeSlots = [
    "2:00 PM - 3:00 PM",
    "3:00 PM - 4:00 PM",
    "4:00 PM - 5:00 PM",
    "5:00 PM - 6:00 PM"
  ];

  // Example team data (replace avatar paths with your actual images)
  const teamData = [
    {
      name: "S. Robert Rozbruch, MD, Chief",
      avatar: "/limblengthening/images/rozbruch.jpg",
      tags: ["Reconstruction", "Bone Repair", "ComplexFractures", "KnockKnees"],
      desc: "Dr. Rozbruch is the Chief of the Limb Lengthening and Complex Reconstruction Service and Director of the Osseointegration Limb Replacement Center at Hospital for Special Surgery. He is a Professor of Clinical Orthopaedic Surgery at Weill Cornell Medical College, and...",
    },
    {
      name: "Austin T. Fragomen, M.D.",
      avatar: "/limblengthening/images/fragomen.jpg",
      tags: ["Orthopedics", "Bone Correction", "Complex Reconstruction", "Bow Legs"],
      desc: "A Professor of Clinical Orthopedic surgery at Weill Cornell Medical School and HSS, Dr. Fragomen has excelled as an educator. He is the director of the LLCRS fellowship program which includes recruitment and year-long training of exceptional young surgeons interested in p...",
    },
    {
      name: "Taylor Reif, M.D.",
      avatar: "/limblengthening/images/reif.jpg",
      tags: ["Tumor Reconstruction", "Bone Preservation", "Bone Cancer Care", "Joint Preservation"],
      desc: "Dr. Taylor Reif is a member of the Limb Lengthening and Complex Reconstruction Service at Hospital for Special Surgery. He specializes in the comprehensive surgical care of musculoskeletal tumors as well as the reconstruction of limbs affected by primary bone tumors, met...",
    },
    {
      name: "Jason Shih Hoellwarth, M.D.",
      avatar: "/limblengthening/images/hoellwarth.jpg",
      tags: ["Limb Fixing", "Bone Repair", "Hip Disorders", "Child Bone Care", "Clubfoot Treatment"],
      desc: "A Chicago-native, Dr. Hoellwarth graduated from Case Western Reserve University with a B.S. in biochemistry and psychology. He attended the Keck School of Medicine at the University of Southern California, leading the student-run free clinic, two high school mento...",
    },
  ];

  const [chunkData, setChunkData] = useState<ChunkOption[]>([]);

  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const [selectedButton, setSelectedButton] = useState("Home");

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null); // Only for text
  const [dbImages, setDbImages] = useState<any[]>([]);
  const [dbVideos, setDbVideos] = useState<any[]>([]);
  const [dbTexts, setDbTexts] = useState<any[]>([]);
  const [openBookingDialog, setOpenBookingDialog] = useState(false);


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

  useEffect(() => {
    // Cleanup function to close EventSource when component unmounts
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  // Helper to fetch and store DB responses
  const fetchDbResponses = async (category: string, subcategory: string | null = null) => {
    setLoading(true)
    // Fetch images
    const imageRes = await fetch(
      `https://soundglide.com/backend/api/limb/get_db_response?category=${category}&type=image`
    );
    setDbImages(await imageRes.json());

    // Fetch videos
    const videoRes = await fetch(
      `https://soundglide.com/backend/api/limb/get_db_response?category=${category}&type=video`
    );
    setDbVideos(await videoRes.json());

    // Fetch texts (with subcategory if provided)
    let textUrl = `https://soundglide.com/backend/api/limb/get_db_response?category=${category}&type=text`;
    if (subcategory) textUrl += `&subcategory=${subcategory}`;
    const textRes = await fetch(textUrl);
    setDbTexts(await textRes.json());
    setLoading(false)
  };

  // Handle category selection in Home tab
  const handleCategorySelect = async (category: string) => {
    setSelectedCategory(category);
    if (category === "Bone Tumors") category = "bone_tumors"
    else if (category === "Bowlegs") category = "bowlegs"
    else if (category === "Femoral Anteversion") category = "femoral_anteversion"
    else if (category === "Femoral Retroversion") category = "femoral_retroversion"
    else if (category === "Knock Knees") category = "knock_knees"
    else if (category === "Limb Lengthening") category = "limb_lengthening"
    else if (category === "Osseointegration") category = "osseointegration"
    else if (category === "Stature Lengthening") category = "stature_lengthening"
    else if (category === "About Us") category = "about_us"
    else if (category === "FAQs") category = "faqs"

    setSelectedChip("Surgery"); // Switch tab to Surgery
    await fetchDbResponses(category);
  };

  // Handle subcategory selection (for text type)
  const handleSubcategorySelect = async (subcategory: string) => {
    setSelectedSubcategory(subcategory);
    if (selectedCategory) {
      await fetchDbResponses(selectedCategory, subcategory);
    }
  };

  const handleGetDBResponse = async (category: string, type: string, subcategory: string) => {
    try {
      const response = await fetch(
        `https://soundglide.com/backend/api/limb/get_db_response?category=${category}&type=${type}&subcategory=${subcategory}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          }
        }
      )

      console.log(response)
    } catch (error) {

    }
  }

  const handleSendMessageViaInput = async (text: string) => {
    if (!text.trim()) return;

    // Add user message to chat
    setMessages(prev => [...prev, { content: text, role: "user" }]);

    // Set loading state
    setLoading(true);

    try {
      const response = await fetch(
        `https://soundglide.com/backend/api/limb/chat?message=${encodeURIComponent(text)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      console.log(response)

      if (!response.ok) throw new Error("Network response was not ok");
      if (!response.body) throw new Error("Response body is null");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let newMessageContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        if (chunk.startsWith("data: ")) {
          const newMessageContent = chunk.slice(6).trim();
          console.log(newMessageContent)
          setMessages((prev) => {
            const newMessages = [...prev];
            const lastMessageIndex = newMessages.length - 1;

            if (
              lastMessageIndex >= 0 &&
              newMessages[lastMessageIndex].role === "assistant"
            ) {
              // Update existing assistant message
              newMessages[lastMessageIndex].content = newMessageContent;
            } else {
              // Create new assistant message
              newMessages.push({ content: newMessageContent, role: "assistant" });
            }
            return newMessages;
          });
        }
      }
    } catch (error) {
      console.error("Chat Error:", error instanceof Error ? error.message : error);
      setMessages((prev) => {
        const newMessages = [...prev];
        const lastMessageIndex = newMessages.length - 1;
        if (
          lastMessageIndex >= 0 &&
          newMessages[lastMessageIndex].role === "assistant"
        ) {
          newMessages[lastMessageIndex].content = "Sorry, there was an error. Please try again.";
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

  const [chatScreenMode, setChatScreenMode] = useState(false);
  const [selectedChip, setSelectedChip] = useState<string | null>();
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
        <rect width="26" height="26" fill="white" fillOpacity="0.01" />
        <path d="M16.7406 14.8375H6.37188C6.74688 14.6172 7.14063 14.3969 7.60001 14.2844C7.90938 14.2094 8.27501 14.2047 8.66407 14.2C8.95938 14.1953 9.26407 14.1906 9.57813 14.1578C9.86407 14.1297 10.1453 14.0688 10.4172 14.0125C10.8063 13.9281 11.1766 13.8531 11.5469 13.8531C11.9172 13.8531 12.2875 13.9328 12.6813 14.0125C12.9531 14.0688 13.2391 14.1297 13.5203 14.1578C13.8344 14.1906 14.1391 14.1953 14.4344 14.2C14.8234 14.2047 15.1938 14.2094 15.4984 14.2844C15.9719 14.4016 16.3656 14.6219 16.7406 14.8375ZM4.84844 17.2891H18.2641C18.0203 20.6781 15.1047 23.3594 11.5563 23.3594C8.01251 23.3594 5.09688 20.6781 4.84844 17.2891ZM19.2625 16.0516V16.075C19.2625 16.2297 19.1359 16.3516 18.9859 16.3516H4.12657C3.97188 16.3516 3.85001 16.225 3.85001 16.075V16.0516C3.85001 15.8969 3.97657 15.775 4.12657 15.775H18.9859C19.1406 15.775 19.2625 15.9016 19.2625 16.0516ZM22.15 7.46875C22.1406 7.21562 22.0094 6.99531 21.7891 6.87344L14.4203 2.73438C14.3078 2.67344 14.1906 2.64062 14.0734 2.64062C13.9563 2.64062 13.8438 2.66875 13.7359 2.72969C13.5156 2.84688 13.3797 3.05781 13.3609 3.30625L12.6578 13.0516C12.7328 13.0656 12.8078 13.0844 12.8828 13.0984C13.1453 13.1547 13.3938 13.2062 13.6281 13.2297C13.7406 13.2391 13.8578 13.2484 13.9703 13.2531L21.8266 8.0875C22.0422 7.95156 22.1594 7.72656 22.15 7.46875ZM14.1719 12.2828C14.0922 12.3344 14.0031 12.3578 13.9141 12.3578C13.7641 12.3578 13.6141 12.2828 13.525 12.1469C13.3844 11.9313 13.4406 11.6406 13.6609 11.5C13.8766 11.3594 14.1672 11.4156 14.3078 11.6359C14.4438 11.8516 14.3875 12.1422 14.1719 12.2828ZM14.5656 9.32969C14.5469 9.57812 14.3406 9.76562 14.0969 9.76562H14.0641C13.8063 9.74687 13.6141 9.52188 13.6328 9.26406C13.6516 9.00625 13.8766 8.81406 14.1344 8.83281C14.3922 8.85156 14.5844 9.07187 14.5656 9.32969ZM14.7531 6.7375C14.7344 6.98594 14.5281 7.17344 14.2844 7.17344H14.2516C13.9938 7.15469 13.8016 6.92969 13.8203 6.67188C13.8391 6.41406 14.0641 6.22188 14.3219 6.24063C14.5797 6.25469 14.7719 6.47969 14.7531 6.7375ZM14.8844 4.3375C14.8 4.49219 14.6406 4.57656 14.4766 4.57656C14.3969 4.57656 14.3219 4.55781 14.2469 4.51562C14.0219 4.38906 13.9422 4.10313 14.0688 3.87813C14.1953 3.65313 14.4813 3.57344 14.7063 3.7C14.9313 3.82656 15.0109 4.1125 14.8844 4.3375ZM16.3844 10.8297C16.3047 10.8812 16.2156 10.9047 16.1266 10.9047C15.9766 10.9047 15.8266 10.8297 15.7375 10.6938C15.5969 10.4781 15.6531 10.1875 15.8734 10.0469C16.0891 9.90625 16.3797 9.9625 16.5203 10.1828C16.6609 10.3937 16.6 10.6844 16.3844 10.8297ZM16.5156 8.07344C16.4359 8.125 16.3469 8.14844 16.2578 8.14844C16.1078 8.14844 15.9578 8.07344 15.8641 7.9375C15.7234 7.72188 15.7844 7.43125 16 7.29062C16.2156 7.15 16.5063 7.21094 16.6469 7.42656C16.7922 7.64219 16.7313 7.93281 16.5156 8.07344ZM16.9094 5.47656C16.825 5.63125 16.6656 5.71562 16.5016 5.71562C16.4219 5.71562 16.3469 5.69688 16.2719 5.65469C16.0469 5.52813 15.9672 5.24219 16.0938 5.01719C16.2203 4.79219 16.5063 4.7125 16.7313 4.83906C16.9563 4.96563 17.0359 5.25156 16.9094 5.47656ZM18.6016 9.37188C18.5219 9.42344 18.4328 9.44687 18.3438 9.44687C18.1938 9.44687 18.0438 9.37187 17.95 9.23594C17.8094 9.02031 17.8703 8.72969 18.0859 8.58906C18.3016 8.44844 18.5922 8.50938 18.7328 8.725C18.8734 8.94063 18.8172 9.23125 18.6016 9.37188ZM18.9391 6.61563C18.8547 6.77031 18.6953 6.85469 18.5313 6.85469C18.4516 6.85469 18.3766 6.83594 18.3016 6.79375C18.0766 6.66719 17.9969 6.38125 18.1234 6.15625C18.25 5.93125 18.5359 5.85156 18.7609 5.97812C18.9859 6.10469 19.0656 6.39063 18.9391 6.61563ZM20.9641 7.75469C20.8797 7.90938 20.7203 7.99375 20.5563 7.99375C20.4766 7.99375 20.4016 7.975 20.3266 7.93281C20.1016 7.80625 20.0219 7.52031 20.1484 7.29531C20.275 7.07031 20.5609 6.99062 20.7859 7.11719C21.0109 7.24375 21.0906 7.52969 20.9641 7.75469Z" fill={color} />
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
          <Box
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
            <BottomNavigation
              showLabels
              value={selectedChip}
              onChange={(event, newValue) => {
                setSelectedChip(newValue);
              }}
            >
              <BottomNavigationAction label="Home" value="Home" icon={<HomeOutlined />} onClick={() => {
                setSelectedButton("menu");
                setChatScreenMode(true);
              }} />
              <BottomNavigationAction label="Surgery" value="Surgery" icon={<HealthAndSafetyIcon />} />
              <BottomNavigationAction label="Pictures" value="Pictures" icon={<BurstModeIcon />} />
              <BottomNavigationAction label="Videos" value="Videos" icon={<MovieIcon />} />
              <BottomNavigationAction label="Team" value="Team" icon={<Groups3Icon />} />
              <BottomNavigationAction label="Schedule" value="Schedule" icon={<EventAvailableIcon />} />
              <BottomNavigationAction label="Contact" value="Contact" icon={<ContactMailIcon />} />
            </BottomNavigation>
          </Box>
          <Button
            sx={{
              marginLeft: "30px",
              marginTop: "10px",
              marginBottom: "10px",
              width: "200px",
              backgroundColor: selectedButton === "customerSupport" ? "#73AD21" : "transparent",
              color: selectedButton === "customerSupport" ? "white" : "black",
              border: selectedButton === "customerSupport" ? "none" : "1px solid #73AD21"
            }}
            onClick={() => {
              setSelectedButton("customerSupport");
              setChatScreenMode(false);
            }}
            startIcon={<SupportAgentIcon />}
            value="CustomerSupport"
          >
            Customer Support
          </Button>
        </Paper>
      </Box>

      {selectedOptionListData.length !== 0 ? (
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
          marginTop: '180px',
          width: '73%',
          height: '85%',
          bgcolor: 'white',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Dialog
            open={openBookingDialog}
            onClose={() => setOpenBookingDialog(false)}
            maxWidth="md"
            fullWidth
            PaperProps={{ sx: { borderRadius: 4 } }}
          >
            <DialogContent sx={{ p: 0 }}>
              {/* Place your booking UI here */}
              {/* For demo, you can use an <img> of your attached UI, or build the calendar/time picker as needed */}
              <Box sx={{ display: 'flex', flexDirection: 'row', minHeight: 550 }}>
                {/* Left panel */}
                <Box sx={{ width: 240, bgcolor: '#FAD7B6', p: 3, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <EventAvailableIcon sx={{ mr: 1 }} />
                      <Box>
                        <Typography fontWeight={600}>Date & Time</Typography>
                        <Typography fontSize={14}>April 14, 2025 - 2:00 PM</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ContactMailIcon sx={{ mr: 1 }} />
                      <Typography fontWeight={600}>Your Information</Typography>
                    </Box>
                  </Box>
                  <Box>
                    <Typography fontWeight={700} mb={1}>Get in Touch</Typography>
                    <Typography fontSize={14}>+1 774 515 4207</Typography>
                    <Typography fontSize={14}>intake@nexumhc.com</Typography>
                  </Box>
                </Box>
                {/* Right panel */}
                <Box sx={{ flex: 1, p: 4, position: 'relative' }}>
                  <IconButton
                    onClick={() => setOpenBookingDialog(false)}
                    sx={{ position: 'absolute', top: 8, right: 8 }}
                  >
                    <CloseIcon />
                  </IconButton>
                  <Typography variant="h5" fontWeight={700} mb={2}>Book your session</Typography>
                  <Box sx={{ width: "100%", maxWidth: 400, mx: "auto" }}>
                    <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                      <Select value="April" size="small" sx={{ minWidth: 100 }}>
                        <MenuItem value="April">April</MenuItem>
                      </Select>
                      <Select value="2025" size="small" sx={{ minWidth: 80 }}>
                        <MenuItem value="2025">2025</MenuItem>
                      </Select>
                      <IconButton size="small"><ChevronLeftIcon /></IconButton>
                      <IconButton size="small"><ChevronRightIcon /></IconButton>
                    </Box>
                    <Box>
                      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", mb: 1 }}>
                        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                          <Typography key={d} align="center" fontWeight={600} fontSize={14}>{d}</Typography>
                        ))}
                      </Box>
                      {days.map((week, i) => (
                        <Box key={i} sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", mb: 0.5 }}>
                          {week.map((day, j) => {
                            const isSelected = day === 14;
                            const isAvailable = isSelected;
                            return (
                              <Box
                                key={j}
                                sx={{
                                  height: 36,
                                  m: 0.5,
                                  borderRadius: 1,
                                  bgcolor: day
                                    ? isSelected
                                      ? "#4BB543"
                                      : isAvailable
                                      ? "#E6F4E6"
                                      : "#FDE7E7"
                                    : "transparent",
                                  color: isSelected ? "white" : "#222",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontWeight: isSelected ? 700 : 400,
                                  border: day && isSelected ? "2px solid #4BB543" : "1px solid #eee",
                                  cursor: day && isAvailable ? "pointer" : "default",
                                  opacity: day ? 1 : 0
                                }}
                              >
                                {day ? day : ""}
                              </Box>
                            );
                          })}
                        </Box>
                      ))}
                    </Box>
                    <Typography sx={{ mt: 2, mb: 1 }}>April 14, 2025 – 2:00 PM</Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                      {timeSlots.map((slot) => (
                        <Button
                          key={slot}
                          variant={selectedTime === slot ? "contained" : "outlined"}
                          sx={{
                            minWidth: 160,
                            background: selectedTime === slot ? "#4BB543" : "white",
                            color: selectedTime === slot ? "white" : "#4BB543",
                            borderColor: "#4BB543",
                            fontWeight: 600,
                            mb: 1,
                            '&:hover': {
                              background: selectedTime === slot ? "#388e3c" : "#E6F4E6"
                            }
                          }}
                          onClick={() => setSelectedTime(slot)}
                        >
                          {slot}
                        </Button>
                      ))}
                    </Box>
                  </Box>
                  <Button
                    variant="contained"
                    sx={{
                      background: "#F2B94B",
                      color: "white",
                      fontWeight: 600,
                      borderRadius: 8,
                      px: 4,
                      position: 'absolute',
                      bottom: 32,
                      right: 32,
                      '&:hover': { background: "#d39e36" }
                    }}
                  >
                    Continue
                  </Button>
                </Box>
              </Box>
            </DialogContent>
          </Dialog>
          <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
            {selectedChip === "Home" && (
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)', // 3 columns
                gap: 2, // Space between buttons
                p: 2,
                marginTop: '20px' // Ensure some space from the top
              }}>
                {["All", "Bone Tumors", "Bowlegs", "Femoral Anteversion", "Femoral Retroversion", "Knock Knees", "Limb Lengthening", "Osseointegration", "Stature Lengthening", "About Us", "FAQs"].map((cat) => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? "contained" : "outlined"}
                    sx={{
                      m: 1,
                      height: '100px',
                      fontSize: '16px',
                      padding: '20px',
                      color: selectedCategory === cat ? "white" : "black",
                      backgroundColor: selectedCategory === cat ? "#73AD21" : "white",
                      borderColor: '#73AD21',
                      borderRadius: '10px',
                      '&:hover': {
                        backgroundColor: selectedCategory === cat ? "#5e8e1a" : "#f5f5f5"
                      }
                    }}
                    onClick={() => handleCategorySelect(cat)}
                  >
                    {cat}
                  </Button>
                ))}
              </Box>
            )}
            {selectedChip === "Surgery" && (
              <Box sx={{ p: 2, margin: '10px' }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <HealthAndSafetyIcon sx={{ color: "#4BB543", fontSize: 32, mr: 1 }} />
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 800,
                      letterSpacing: 1,
                      color: "#222",
                      background: "linear-gradient(90deg, #E6F4E6 60%, #F2B94B 100%)",
                      borderRadius: 2,
                      px: 2,
                      py: 0.5,
                      boxShadow: "0 2px 8px rgba(80,80,80,0.06)"
                    }}
                  >
                    Surgery Info
                  </Typography>
                </Box>
                {dbTexts.length === 0 ? (
                  <Typography>No text data available.</Typography>
                ) : (
                  dbTexts.map((item, idx) => (
                    <Box key={idx} sx={{ mb: 2 }}>
                      <Typography
                        variant="body1"
                        component="div"
                        dangerouslySetInnerHTML={{ __html: item.content }}
                      />
                      {/* If you want subcategory selection, add buttons here */}
                    </Box>
                  ))
                )}
              </Box>
            )}

            {selectedChip === "Pictures" && (
              <Box sx={{ p: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <ImageIcon sx={{ color: "#4BB543", fontSize: 32, mr: 1 }} />
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 800,
                      letterSpacing: 1,
                      color: "#222",
                      background: "linear-gradient(90deg, #E6F4E6 60%, #F2B94B 100%)",
                      borderRadius: 2,
                      px: 2,
                      py: 0.5,
                      boxShadow: "0 2px 8px rgba(80,80,80,0.06)"
                    }}
                  >
                    Pictures
                  </Typography>
                </Box>
                {dbImages.length === 0 ? (
                  <Typography>No images available.</Typography>
                ) : (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    {dbImages.map((img, idx) => (
                      <img key={idx} src={img.content} alt={img.category} style={{ width: 150, height: 150, objectFit: 'cover' }} />
                    ))}
                  </Box>
                )}
              </Box>
            )}

            {selectedChip === "Videos" && (
              <Box sx={{ p: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <PlayCircleFilledIcon sx={{ color: "#4BB543", fontSize: 32, mr: 1 }} />
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 800,
                      letterSpacing: 1,
                      color: "#222",
                      background: "linear-gradient(90deg, #E6F4E6 60%, #F2B94B 100%)",
                      borderRadius: 2,
                      px: 2,
                      py: 0.5,
                      boxShadow: "0 2px 8px rgba(80,80,80,0.06)"
                    }}
                  >
                    Videos
                  </Typography>
                </Box>
                {dbVideos.length === 0 ? (
                  <Typography>No videos available.</Typography>
                ) : (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    {dbVideos.map((vid, idx) => (
                      <video key={idx} src={vid.content} controls style={{ width: 250 }} />
                    ))}
                  </Box>
                )}
              </Box>
            )}

            {selectedChip === "Team" && (
              <Box sx={{ p: 2 }}>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {teamData.map((member, idx) => (
                    <Card
                      key={idx}
                      sx={{
                        width: 600,
                        minHeight: 320,
                        border: '1.5px solid #F2B94B',
                        borderRadius: 4,
                        boxShadow: 'none',
                        marginTop: '30px',
                        marginLeft: '30px',
                        mb: 3,
                        mr: 3,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <CardContent>
                        <Stack direction="row" spacing={2} alignItems="center" mb={1}>
                          <Avatar src={member.avatar} sx={{ width: 56, height: 56 }} />
                          <Typography variant="h6" fontWeight="bold">{member.name}</Typography>
                        </Stack>
                        <Stack direction="row" spacing={1} flexWrap="wrap" mb={1}>
                          {member.tags.map((tag, i) => (
                            <Chip
                              key={i}
                              label={tag}
                              sx={{
                                background: "#F7F3F0",
                                color: "#A97B3B",
                                fontWeight: 500,
                                fontSize: 14,
                                mb: 0.5,
                              }}
                            />
                          ))}
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                          {member.desc}
                        </Typography>
                      </CardContent>
                      <CardActions sx={{ justifyContent: 'flex-start', px: 2, pb: 2 }}>
                        <Button
                          variant="contained"
                          sx={{
                            background: "#4BB543",
                            color: "white",
                            fontWeight: 600,
                            borderRadius: 8,
                            mr: 2,
                            px: 3,
                            '&:hover': { background: "#388e3c" }
                          }}
                        >
                          View Profile
                        </Button>
                        <Button
                          variant="contained"
                          sx={{
                            background: "#F2B94B",
                            color: "white",
                            fontWeight: 600,
                            borderRadius: 8,
                            px: 3,
                            '&:hover': { background: "#d39e36" }
                          }}
                          onClick={()=> setOpenBookingDialog(true)}
                        >
                          Book Appointment
                        </Button>
                      </CardActions>
                    </Card>
                  ))}
                </Stack>
              </Box>
            )}
          </Box>
        </Box>
      ) : (
        <Box sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          marginTop: '200px',
          width: '73%',
          height: 'auto',
          bgcolor: 'white',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'auto'
        }}
        >
          <Box sx={{ flex: 1, overflowY: "auto", pt: 2, marginLeft: "40px" }} ref={containerRef}>
            {messages
              .filter((msg) => msg.role === "assistant")
              .map((msg, idx) => (
                <React.Fragment key={idx}>
                  <ChatBubble message={msg.content} align="left" />
                </React.Fragment>
              ))}
          </Box>
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
            margin: "10px",
            boxShadow: "0 8px 8px rgba(80,80,80,0.6)",
          }}
        >
          <div
            style={{
              maxWidth: "100%",
              overflowX: "hidden",
              flex: 1,
              marginBottom: "80px",
              display: "flex",
              flexDirection: "column-reverse",
              minHeight: "100%",
            }}
            ref={containerRef}
          >
            <div style={{ display: "flex", flexDirection: "column", height: "650px", boxShadow: "0 8px 8px rgba(80,80,80,0.6)", }}>
              {messages
                .filter((msg) => msg.role === "user")
                .map((msg, idx) => (
                  <ChatBubble key={idx} message={msg.content} align="right" />
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