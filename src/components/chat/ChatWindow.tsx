import React, { useState, useRef, useEffect } from "react";
import ChatInput from "./ChatInput";
import ChatMessage from "./ChatMessage";
import CheckoutModal from "./CheckoutModal";
import DOMPurify from 'dompurify';

import {
  Modal,
  Chip,
  Card,
  CardMedia,
  CardContent,
  CircularProgress,
  useMediaQuery,
  useTheme,
  Button,
  Box,
  Fab,
  Badge,
  Drawer,
  Typography,
  TextField,
  Checkbox,
  FormControlLabel,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import ImageListItemBar from "@mui/material/ImageListItemBar";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DoneOutlineIcon from "@mui/icons-material/DoneOutline";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import Avatar from "@mui/material/Avatar";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import DoubleArrowTwoToneIcon from '@mui/icons-material/DoubleArrowTwoTone';
import ButtonGroup from "@mui/material/ButtonGroup";
import ChangeCircleIcon from "@mui/icons-material/ChangeCircle";
import LoupeIcon from "@mui/icons-material/Loupe";
import Snackbar from "@mui/material/Snackbar";
import Divider from "@mui/material/Divider";
import Paper from '@mui/material/Paper';
import LinkIcon from '@mui/icons-material/Link';
import { Details } from "@mui/icons-material";
import { title } from "process";
import { group } from "console";
import { set } from "firebase/database";

interface MessageInterface {
  content: string;
  imageUrl?: string; // Optional imageUrl property
  role: "user" | "assistant";
}

const KEY_CHAT_CUSTOMER = "CHAT_CUSTOMER";
// const KEY_FINISH_ORDER = "FINISH_ORDER";
const KEY_SELECT_PRODUCT = "SELECT_PRODUCT";
const KEY_ASK_AMOUNT = "ASK_AMOUNT";
const KEY_ANSWER_AMOUNT = "ANSWER_AMOUNT";
const INITIAL_AMOUNT = 1;
const GREETING_WORD = "Hi {displayName}, What would you like to order today?";
const GREETING_WORD_LOGIN = "I'm Drip Drop Deals Order Assistant, Please enter your email address before getting started.";
const INVALID_EMAIL = "The email address is invalid. Please re-enter your email address.";

const CATEGORY_LIST = ["Clothing", "Womens", "Toys", "Shoes", "Electronics", "Computers", "Specials Under $10", "Specials Under $20"];

const drawerWidth = 1400;

const ChatWindow: React.FC = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isMediumScreen = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const [showAmountSelector, setShowAmountSelector] = useState(false);
  // const [showContinueSelector, setShowContinueSelector] = useState(false);
  const [orderDetailDialogOpen, setOrderDetailDialogOpen] = useState(false);
  const [totalPrice, setTotalPrice] = useState("");
  const [currentAmount, setCurrentAmount] = useState(INITIAL_AMOUNT);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [loginFlag, setLoginFlag] = useState<boolean>(false);

  const [visibleCheckoutModal, setVisibleCheckoutModal] = useState<boolean>(false);
  // const [visibleLoginModal, setVisibleLoginModal] = useState<boolean>(true);

  const [userDataFlag, setUserDataFlag] = useState<boolean>(false);
  const [userData, setUserData] = useState({
    id: String,
    email: String,
    displayName: String,
    type:  String,
    group_id: String,
    company: String
  });

  // const API_URL = "http://13.208.253.225:4000/chat";
  // const API_URL = "http://52.221.236.58:80/chat";
  const API_URL = "https://soundglide.com/backend/api/v2/chat";
  // const API_URL = process.env.REACT_APP_API_URL;

  const [messages, setMessages] = useState<MessageInterface[]>([
    { content: GREETING_WORD_LOGIN, role: "assistant" },
  ]);

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  interface ChunkData {
    keyword: string;
    data: {
      title: string;
      image_urls: string;
      category: string;
      subtitle: string;
      single_price: string;
      directions: string;
      details: string;
    }[];
  }
  
  const [chunkData, setChunkData] = useState<ChunkData[]>([]);
  const [orderData, setOrderData] = useState<
    {
      title: string;
      image_urls: string;
      category: string;
      subtitle: string;
      single_price: string;
      details: string;
      directions: string;
    }[]
  >([]);


  const [cartData, setCartData] = useState<
    {
      title: string;
      image_urls: string;
      category: string;
      subtitle: string;
      single_price: string;
      details: string;
      directions: string;
      count: number;
    }[]
  >([]);

  const [cartCount, setCartCount] = useState(0);
  const [flag, setFlag] = useState(KEY_SELECT_PRODUCT);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFirst, setFirst] = useState(false);

  const style = {
    position: "absolute" as "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 500,
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
  };
  
  interface CheckoutModalProps {
    open: boolean;
    handleClose: () => void;
  }

  const ItemCart: React.FC<{
    title: string;
    imageUrl: string;
    price: string;
    count: number;
  }> = ({ title, imageUrl, price, count }) => {
    return (
      <Box
      key={title}
      display="flex"
      alignItems="center"
      padding="10px"
      borderBottom="1px solid #ddd"
    >
      <img
        src={imageUrl.split(", ")[0]}
        alt={title}
        style={{ width: "50px", height: "50px", marginRight: "10px" }}
      />
      <Box>
        <Typography variant="body1">{title}</Typography>
        <Typography variant="body2" color="green">
          {price || "$0.00"}
        </Typography>
        <Typography variant="body2">Count: {count}</Typography>
      </Box>
    </Box>
    );
  };

  const ItemButton: React.FC<{
    text: string;
    url: string;
    category: string;
    price: string;
    subtitle: string;
    details: string;
    features: string;
    onClick: () => void;
  }> = ({ text, url, price, category, subtitle, details, features, onClick }) => {
    const [open, setOpen] = useState(false);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const [itemCount, setItemCount] = useState(1);

    const handleIncrease = (e: React.MouseEvent) => {
      e.stopPropagation();
      setItemCount(itemCount + 1);
    };

    const handleDecrease = (e: React.MouseEvent) => {
      e.stopPropagation();
      setItemCount(Math.max(1, itemCount - 1));
    };

    const handleAddToCart = (e: React.MouseEvent) => {

      setCurrentAmount(itemCount);

      let flag = false;
      const temp_data = [];
      cartData.map((cartItem) => {
        if(cartItem.title === text){
          cartItem.count += itemCount;
          flag = true;
        }
        temp_data.push(cartItem);
      });

      if(!flag){
        setCartCount(cartCount + 1);
        temp_data.push({
          "title": text,
          "image_urls": url,
          "category": category,
          "single_price": price,
          "subtitle": subtitle,
          "details": details,
          "directions": features,
          "count": itemCount
        })
      }

      setCartData(temp_data);

      // setCartData((previousData) => [...previousData, { 
      //     ...{
      //       "title": text,
      //       "image_urls": url,
      //       "category": category,
      //       "single_price": price,
      //       "subtitle": subtitle,
      //       "details": details,
      //       "directions": features
      //     }, count: itemCount }]
      //   );
    
      setOrderData([]);
      setItemCount(1); // Reset the item count after adding to cart
    };

    const handleLinkClick = () => {
      const productData = {
        title: text,
        image: url,
        category: category,
        price: price,
        subtitle: subtitle || '',
        details: details || '',
        directions: features || ''
      };
      
      // Format URL with hyphens instead of spaces
      const formattedTitle = text.replace(/\s+/g, '-');
      
      // Store data in localStorage
      localStorage.setItem('productDetailData', JSON.stringify(productData));
      
      // Open in new tab
      window.open(`/drip-drop-deals/details/${formattedTitle}`, '_blank');
    };

    return (
      <ImageListItem key={text} className="image-list-item" style={{ margin: "8px", width:"240px", border: "solid 1px #73AD21", borderRadius: "15px"}} >
        <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 2, backgroundColor: '#73AD21', padding: '4px 8px', borderRadius: 4 }}>
          <Typography variant="body2" style={{ color: 'white'  }}>
            {price !== "N/A" ? "$"+price : "$0.00"}
          </Typography>
        </div>
        {
          subtitle == "" 
          || subtitle == null? 
            (<div></div>)
            :
            (
              <div style={{ position: 'absolute', top: 8, left: 8, zIndex: 2, backgroundColor: 'rgba(0,0,0,0.7)', padding: '4px 8px', borderRadius: 4 }}>
                <Typography variant="body2" style={{ color: 'white'  }}>
                  {subtitle.match(/\b(\d+(?:\.\d+)?)\s*(lb|oz|each|count|fl|oz|ct|gal|g|bunch|case)\b|per lb/g)?.[0]}
                </Typography>
              </div>
            )
          }
        <img src={url || "/Apple.png"} alt={text} loading="lazy" onClick={handleOpen} style={{ maxHeight: "300px"}}/>
        <div className="overlay">
          <IconButton
            color="primary"
            style={{ color: "white", zIndex: 3 }}
            onClick={handleLinkClick}
          >
            <LinkIcon />
          </IconButton>
          <IconButton
            color="primary"
            onClick={handleOpen}
            style={{ color: "white", zIndex: 3 }}
          >
            <VisibilityIcon />
          </IconButton>
          {/* <IconButton
            color="primary"
            onClick={onClick}
            style={{ color: "white", zIndex: 3 }}
          >
            <DoneOutlineIcon />
          </IconButton> */}
        </div>
        <ImageListItemBar
          className="image-list-item-bar"
          style={{backgroundColor: '#73AD21'}}
          title={
            <div className="item-bar-title"  >
              <span className="item-text" style={{width: "100%"}} >{text}</span>
              <div className="item-button" >
                <div
                  className="item-button-group"
                  style={{
                    height: '25px',
                    display: 'flex',
                    alignItems: 'center', // Vertically center
                    justifyContent: 'space-between', // Space out the elements evenly
                  }}
                >
                  <ButtonGroup variant="outlined" size="small" style={{ zIndex: 3 }}>
                    <IconButton
                      style={{ color: 'white', zIndex: 3 }}
                      onClick={handleDecrease}
                    >
                      <RemoveIcon fontSize="small" />
                    </IconButton>
                    <span style={{ display: 'flex', alignItems: 'center', color: 'white' }}>
                      {itemCount}
                    </span>
                    <IconButton
                      style={{ color: 'white', zIndex: 3 }}
                      onClick={handleIncrease}
                    >
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </ButtonGroup>
                  <IconButton
                    color="primary"
                    onClick={handleAddToCart}
                    style={{ color: 'white', width: '40px' }} // Adjust width as needed
                  >
                    <AddShoppingCartIcon />
                  </IconButton>
                </div>
              </div>
            </div>
          }
        />

      <Modal open={open} onClose={handleClose}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100vh"
          bgcolor="rgba(0, 0, 0, 0.5)"
          sx={{flexDirection: "column"}}
        >
          {/* Modal Card */}
          <Card sx={{ width: '90%', maxWidth: 600, p: 3, position: 'relative' }}>
            {/* Image and Chip */}
            <CardMedia
              component="img"
              height="350"
              image={url}
              alt={text}
              sx={{ borderRadius: 2 }}
            />
            <Chip
              label={price !== 'N/A' ? "$"+price : "$0.00"}
              sx={{
                fontWeight: 'bold',
                backgroundColor: "#73AD21",
                color: "white",
                position: 'absolute',
                top: 16,
                right: 16,
                borderRadius: 1
              }}
            />

            {/* Title and Details */}
            <Typography
              variant="h5"
              fontWeight="bold"
              color="#73AD21"
              textAlign="center"
              mt={2}
            >
              {text}
            </Typography>

            <CardContent>
              <Typography variant="h6" fontWeight="bold">Details:</Typography>
              <Typography
                variant="body2"
                component="div"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(details || 'No details provided.'),
                }}
              />
            </CardContent>
          </Card>

          {/* Close Button Outside */}
          <IconButton
            onClick={handleClose}
            sx={{
              marginTop: "30px",
              backgroundColor: '#fff',
              boxShadow: 3,
              '&:hover': { backgroundColor: '#f0f0f0' },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </Modal>
      </ImageListItem>
    );
  };

  const AmountItemButton: React.FC<{
    text: string;
    onClick: () => void;
  }> = ({ text, onClick }) => (
    <ImageListItem key={text} className="image-list-item">
      <Button variant="contained" onClick={onClick}>
        {text}
      </Button>
    </ImageListItem>
  );

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

    /* Hide text and show the button on hover */
    .image-list-item:hover .item-text {
      display: none; /* Hide the text inside ImageListItemBar on hover */
    }
    .image-list-item .item-text,
    .image-list-item .item-button {
      transition: opacity 0.3s ease, transform 0.3s ease; /* Smooth fade and movement */
    }

    .image-list-item:hover .item-button {
      display: inline-block; /* Show the button instead */
    }

    .item-button {
      display: none; /* Button is initially hidden */
    }

    .item-bar-title {
      display: flex;
      align-items: center;
      justify-content: center;
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

  // useEffect(() => {
  //   if (!visibleLoginModal) {
  //     if(!userDataFlag){
  //       setVisibleLoginModal(true);
  //     }
  //   }
  // }, [visibleLoginModal]);

  // Define the ref outside useEffect to persist across renders
  const hasInitialized = React.useRef(false);
  
  useEffect(() => {
    if (!hasInitialized.current) {
      const message: MessageInterface = {
        content: CATEGORY_LIST.join(", "),
        role: "user",
      };
      handleSendMessage(message, KEY_SELECT_PRODUCT);
      
      // Mark as initialized so it won't run again
      hasInitialized.current = true;
    }
  }, []);
  
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (orderData.length > 0) {
      const regex = /\$?(\d+\.\d+)/;
      const match = orderData[0].single_price.match(regex);

      if (match) {
        const single_price = parseFloat(match[1]);
        const totalPrice = single_price * currentAmount;
        setTotalPrice(`$${totalPrice.toFixed(2)}`);
      } else {
        console.error("Failed to parse single_price from orderData");
        setTotalPrice("");
      }
    }
  }, [currentAmount, orderData]);

  const handleButtonClick = (text: string, url: string) => {
    // setShowContinueSelector(false);
    setOrderDetailDialogOpen(false);
    const message: MessageInterface = {
      content: text,
      role: "user",
      imageUrl: url, // Include the image URL
    };
    setFlag(KEY_ASK_AMOUNT);
    handleSendMessage(message, KEY_ASK_AMOUNT);
  };
  
  const handleSendMessage = async (
    message: MessageInterface,
    flag: string,
    showInChat: boolean = true
  ) => {
    setFirst(true)
    setCurrentAmount(1);
    setShowAmountSelector(false);
    if (showInChat && isFirst) {
      setMessages((prevMessages) => [...prevMessages, message]);
    }
    setLoading(true);

    try {
      // await sendMessageToAdmin(
      //   "BJr1VG8fdGlrcTEApHOp",
      //   Date.now(),
      //   message.content,
      //   {
      //     _id: "BJr1VG8fdGlrcTEApHOp",
      //     name: "James",
      //   },
      //   "Zyu5DWwkmWA4f335T4Z6",
      //   "qxBI110QaIiaQIffistj"
      // );

      const response = await fetch(
        `${API_URL}?id=${userData.id}&username=${userData.displayName}&group_id=${userData.group_id}&message=${message.content}&history=${JSON.stringify(messages)}&flag=${flag}`,
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
        
        // eslint-disable-next-line no-loop-func
        lines.forEach((line) => {
          if (line.startsWith("data: ")){
            const data = line.slice(6);
            newMessageContent += data;

            const temp = newMessageContent.split("ChunkData:")[0] || "";
            // sendMessageToAdmin(
            //   "BJr1VG8fdGlrcTEApHOp",
            //   Date.now(),
            //   temp,
            //   {
            //     _id: "BJr1VG8fdGlrcTEApHOp",
            //     name: "James",
            //   },
            //   "Zyu5DWwkmWA4f335T4Z6",
            //   "qxBI110QaIiaQIffistj"
            // );
            
            if (data.includes("ChunkData:")) {
              try {
                const jsonData = JSON.parse(data.split("ChunkData:")[1]);
                const parsedData = Object.entries(jsonData).map(([keyword, dataArray]) => {
                  const limitedData = !isFirst ? (dataArray as ChunkData['data']).slice(0, 4) : (dataArray as ChunkData['data']);

                  return {
                    keyword,
                    data: limitedData,
                  }
                });

                setChunkData(prevChunkData => {
                  const updatedChunkData = [...prevChunkData];
                  parsedData.forEach(newCategory => {
                    const existingCategoryIndex = updatedChunkData.findIndex(
                      category => category.keyword === newCategory.keyword
                    );
            
                    if (existingCategoryIndex !== -1) {
                      // Merge data if the category already exists
                      updatedChunkData[existingCategoryIndex].data = [
                        ...updatedChunkData[existingCategoryIndex].data,
                        ...newCategory.data
                      ];
                    } else {
                      // Add new category if it doesn't exist
                      updatedChunkData.push(newCategory);
                    }
                  });
                  return updatedChunkData;
                });
              } catch (e) {
                console.error(e);
              }
            }
            if (data.includes(KEY_ASK_AMOUNT)) {
              try {
                const cleanData = data.split(`${KEY_ASK_AMOUNT}:`)[1];
                newMessageContent = cleanData; // Append the cleaned data
                console.log("newMessageContent-------->", newMessageContent);

                setShowAmountSelector(true);
              } catch (e) {
                console.error(e);
              }
            }
            if (data.includes(KEY_ANSWER_AMOUNT)) {
              try {
                const amountString = data.split(`${KEY_ANSWER_AMOUNT}:`)[1];
                console.log(amountString)
                const amount = parseInt(amountString, 10);
                console.log(amount)
                if (amount <= 0 || amountString.length > 4 || Number.isNaN(amount)) {
                  // Invalid input detected, prompt the user again
                  const invalidInputMessage: MessageInterface = {
                    content: "Please input amount of product correctly.",
                    role: "assistant",
                  };
                  setMessages((prevMessages) => [...prevMessages, invalidInputMessage]);
                  setShowAmountSelector(true);
                  return; // Exit early since we're asking for input again
                }

                handleSetCurrentAmount(amount);
                // setCurrentAmount(amount);
                console.log(currentAmount)
                handleAmountClick(false, amount);
                return;
              } catch (e) {
                console.error(e);
              }
            }
            if (isFirst) {
              setMessages((prev) => {
                const newMessages = [...prev];
                const lastMessageIndex = newMessages.length - 1;
                if (
                  lastMessageIndex >= 0 &&
                  newMessages[lastMessageIndex].role === "assistant"
                ) {
                  newMessages[lastMessageIndex].content =
                    newMessageContent.split("ChunkData:")[0] || "";
                  if (data.includes(KEY_ASK_AMOUNT)) {
                    newMessages[lastMessageIndex].content =
                      newMessageContent.split(KEY_ASK_AMOUNT + ":")[0] || "";
                  }
                } else {
                  newMessages.push({
                    content: newMessageContent,
                    role: "assistant",
                  });
                }
                return newMessages;
              });
            }
          }
        });
      }
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

  // Add category button list component
  const CategoryButtonList: React.FC = () => {
    const handleCategoryClick = (category: string) => {
      setFirst(true);
      // Deselect if already selected, otherwise select new category
      if (selectedCategory === category) {
        setSelectedCategory(null);
      } else {
        setSelectedCategory(category);
        handleSendMessageViaInput(category, KEY_SELECT_PRODUCT);
      }
    };

    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2, mt: 1 }}>
        {CATEGORY_LIST.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "contained" : "outlined"}
            color="primary"
            size="medium"
            onClick={() => handleCategoryClick(category)}
            sx={{ 
              bgcolor: selectedCategory === category ? '#73AD21' : 'transparent',
              borderColor: '#73AD21',
              color: selectedCategory === category ? 'white' : '#73AD21',
              '&:hover': { bgcolor: selectedCategory === category ? '#73AD21' : 'rgba(115, 173, 33, 0.1)' }
            }}
          >
            {category}
          </Button>
        ))}
      </Box>
    );
  };

  const handleSetCurrentAmount = (amount: Number) => {
    setCurrentAmount(amount.valueOf())
  }

  const handleAmountClick = (flag: boolean, amount: number) => {
    // Add logic here to handle what should happen when the current amount is clicked

    if (orderData.length > 0) {
      
      const newAmount = flag ? currentAmount : amount;

    if (flag) {
      setShowAmountSelector(false);
      const displayMessage: MessageInterface = {
        content: `I need ${newAmount}`,
        role: "user",
      };
      setMessages((prevMessages) => [...prevMessages, displayMessage]);
    }

    // Calculate total price
    const regex = /\$?(\d+\.\d+)/;
    const match1 = orderData[0].single_price.match(regex);
    console.log(orderData[0].single_price)
    if (match1) {
      const single_price = parseFloat(match1[1]);
      const totalPrice = single_price * newAmount;
      
      // Ensure the total price message is added only once
      setMessages((prevMessages) => {
        const lastIndex = prevMessages.length - 1;
        const lastMessage = prevMessages[lastIndex];
        
        // Check if the last message already contains the total price
        if (lastMessage && lastMessage.content.includes('Total Price:')) {
          return prevMessages;
        }

        const totalPriceText: MessageInterface = {
          content: `Total Price: $${totalPrice.toFixed(2)}`,
          role: "assistant",
        };
        return [...prevMessages, totalPriceText];
      });

      setTotalPrice(`$${totalPrice.toFixed(2)}`);
    } else {
      console.error("Failed to parse single_price from orderData");
      setTotalPrice("");
    }

    setCurrentAmount(newAmount);
    setOrderDetailDialogOpen(true);
    }
  };

  const handleSendMessageViaInput = async(text: string, flag: string) => {
    const message: MessageInterface = {
      content: text,
      role: "user",
    };

    if(loginFlag){
      // setMessages((prevMessages) => [...prevMessages, message]);
      if (flag === KEY_ASK_AMOUNT){
        handleSendMessage(message, KEY_ANSWER_AMOUNT, true);    
      }
      else {

        console.log("handleSendMessageViaInput--->", loginFlag);

        setChunkData([]);
        // setShowContinueSelector(false);
        setOrderDetailDialogOpen(false);
        
        setFlag(KEY_SELECT_PRODUCT);
        handleSendMessage(message, KEY_SELECT_PRODUCT, true);
        setFlag(KEY_SELECT_PRODUCT);
      }
    } else {
      console.log("loginFlag--->", loginFlag, text);
      setMessages((prevMessages) => [...prevMessages, message]);
      if(isValidEmail(text)){

        setLoading(true);
        
        const response = await fetch(`${API_URL}/auth/signin`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: text }), // Replace with actual form data
        });
    
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
    
        const data = await response.json();
        console.log("Success:", data);
        setUserData(data.data);
        setUserDataFlag(true);
        
        setLoading(false);

        const message: MessageInterface = {
          content: `Hi ${data.data.displayName}, What would you like to order today?`,
          role: "assistant",
        };
        setMessages((prevMessages) => [...prevMessages, message]);
        setLoginFlag(true);

      } else {
        const message: MessageInterface = {
          content: INVALID_EMAIL,
          role: "assistant",
        };
        setMessages((prevMessages) => [...prevMessages, message]);
      }
    }
  };

  const uniqueChunkData = chunkData.map(category => {
    const seenImageUrls = new Set<string>();
    return {
      keyword: category.keyword,
      data: category.data.filter(item => {
        if (seenImageUrls.has(item.image_urls)) {
          return false; // Skip this item if its image URL has already been seen
        }
        seenImageUrls.add(item.image_urls);
        return true; // Include this item if its image URL is unique
      })
    };
  }).filter(Category => Category.data.length > 0);

  const [open, setOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const handleCartOpen = () => setCartOpen(true);
  const handleCartClose = () => setCartOpen(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const getTotalPrice = () => {    
    // Checkout: ${cartData.reduce((sum, item) => {
    //   const priceMatch = item.single_price.match(/\$?(\d+\.\d+)/);
    //   const price = priceMatch ? parseFloat(priceMatch[1]) : 0;
    //   return sum + (price * item.count);
    // }, 0).toFixed(2)}

    const total_price = cartData.reduce((sum: number, item) => {
      return sum + (Number(item.count) * Number(item.single_price));
    }, 0).toFixed(2);
    return total_price;
  }

  const handleAddCart = async () => {
    setCartCount(cartCount + 1);
    setCartData((previousData) => [...previousData, { ...orderData[0], count: currentAmount }]);
    
    setOrderData([]);
    setOrderDetailDialogOpen(false);
    setFlag(KEY_SELECT_PRODUCT);

    const messageText: MessageInterface = {
      content:
        "Added to cart successfully!",
      role: "assistant",
    };
    <Snackbar
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      open={true}
      autoHideDuration={5000}
      message="Add Cart successfully!"
    />;

    setMessages((prevMessages) => [...prevMessages, messageText]);
    // setShowContinueSelector(true);
  };

  const handleContinueOrder = async () => {
    setOrderDetailDialogOpen(false);
    const displayMessage: MessageInterface = {
      content: " I want to order again.",
      role: "user",
    };
    
    setChunkData([]);
    handleSendMessage(displayMessage, KEY_CHAT_CUSTOMER, true);
    setFlag(KEY_SELECT_PRODUCT);
    // setShowContinueSelector(false);
  };
  // const handleFinishOrder = async () => {
  //   setOrderDetailDialogOpen(false);
  //   const displayMessage: MessageInterface = {
  //     content: "That's all. I want to finish order",
  //     role: "user",
  //   };
  //   handleSendMessage(displayMessage, KEY_FINISH_ORDER, true);
  //   // setShowContinueSelector(false);
  // };

  const getTotalItems = () => cartData.reduce((sum, item) => sum + item.count, 0);

  const drawer = (
    <div>
      {/* <div style={{ padding: "16px", textAlign: "center", display: "flex", alignItems: "center" }}>
        <img
          src="/cart.svg"
          alt="Cart"
          style={{ width: "100px", height: "auto" }}
        />
        <span>The photos related to conversation will be displayed in the below list.</span>
      </div> */}
      <Box sx={{ padding: "16px", backgroundColor: "#f5f5f5", borderRadius: "8px", margin: "10px" }}>
        <CategoryButtonList />
      </Box>

      <Divider />
      {loading && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "85%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <CircularProgress />
        </div>
      )}
      {uniqueChunkData.map((category) => (
        <Box key={category.keyword} sx={{ marginTop: '20px', marginLeft: '10px' }}>
          <Fab variant="extended" size="medium" color="primary" sx={{ marginLeft: "10px", backgroundColor: "#73AD21", color: "white", '&:hover': { backgroundColor: "#f5f5f5" }, borderRadius: "15px", padding: "10px 20px 10px 20px"}} >
            <DoubleArrowTwoToneIcon sx={{ mr: 1 }} />
            {category.keyword}
          </Fab>
          <ImageList cols={isSmallScreen ? 2 : isMediumScreen ? 4 : 5} style={{display: "flex", flexWrap:"wrap" }}>
            {category.data.map((item, index) => (
              item.image_urls != "" ? (
                <ItemButton
                  key={index}
                  text={item.title}
                  url={item.image_urls.split(",")[0]}
                  category={item.category}
                  price={item.single_price}
                  subtitle={item.subtitle}
                  details={item.details}
                  features={item.directions}
                  onClick={() => {
                    setOrderData([item]);
                    handleButtonClick(item.title, item.image_urls.split(",")[0]);
                  }}
                />
              ) : null
            ))}
          </ImageList>
        </Box>
      ))}
    </div>
  );

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              maxWidth: "900px",
              minWidth: "400px",
              marginTop: "60px", // Add space for the category buttons
            },
          }}
          open
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          position: "relative",
          // flexGrow: 1,
          // p: { xs: 1, md: 3 }, // Responsive padding
          // width: { xs: `calc(100% - ${drawerWidth})` }, // Remaining width for chatting area
          minWidth: "250px", // Minimum width to ensure usability
          // border: "solid 1px red",
          borderRadius: "20px",
          boxShadow: 5,
          margin: "4px 10px",
        }}
      >
          <div
            style={{
              height: "calc(100vh - 150px)", // Responsive height minus input area
              maxHeight: "none", // Remove fixed maxHeight
              overflowY: "auto",
              padding: "1vw", // Relative padding
              position: "relative",
            }}
            ref={containerRef}
          >
            {messages.map((message, index) => (
              <ChatMessage key={index} {...message} />
            ))}
            

          </div>
        <div
          style={{
            display: "flex",
            position: "absolute",
            width: "100%",
            bottom: 0,
            // right: 0,
            // left: drawerWidth, // Align with chatting area
            // padding: "1vw", // Relative padding
            backgroundColor: "#F4F7FD",
            borderRadius: "20px",
          }}
        >
          <Badge
            badgeContent={cartCount}
            sx={{
              "& .MuiBadge-badge": {
                backgroundColor: "#FF3B30",
                color: "white",
                border: "2px solid #FF3B30",
              },
              position: "absolute",
              bottom: "16vh", // Relative positioning
              right: "36px",
            }}
          >
            <Fab
              sx={{ backgroundColor: "#73AD21", width: "70px", height: "70px" }}
              aria-label="add"
              onClick={handleCartOpen}
            >
              <AddShoppingCartIcon sx={{ color: "white", fontSize: "35px" }} />
            </Fab>
          </Badge>

          <ChatInput
              onSendMessage={(message) =>
                handleSendMessageViaInput(message.content, flag)
              }
            />
        </div>
        <Drawer
            anchor="right"
            open={cartOpen}
            onClose={handleCartClose}
            sx={{
              '& .MuiDrawer-paper': {
                width: '540px',
                padding: '20px',
              },
            }}
          >
            <Box sx={{ position: 'relative', padding: "16px", textAlign: "center" }}>
              <IconButton
                onClick={handleCartClose}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: 8,
                  color: '#73AD21',
                  '&:hover': {
                    backgroundColor: 'rgba(115, 173, 33, 0.1)'
                  }
                }}
              >
                <CloseIcon />
              </IconButton>
              <img
                src="/drip-drop-deals/cart.svg"
                alt="Cart"
                style={{ maxWidth: "100%", height: "200px" }}
              />
            </Box>

            <List>
              {cartData.map((item, index) => (
                <ListItem key={index} divider>
                  <ListItemAvatar>
                    <Avatar src={item.image_urls} variant="square" />
                  </ListItemAvatar>
                  <ListItemText
                    primary={item.title}
                    secondary={
                      <div style={{display:"flex", justifyContent: "space-between", alignItems: "center"}} >
                        <div style={{fontSize: "16px"}} >
                          ${item.single_price}
                        </div>
                        <div style={{display: "flex", height: "32px"}} >
                          <Box
                              display="flex"
                              alignItems="center"
                              border="2px solid #7ac142"
                              borderRadius="5px"
                              padding="2px 8px"
                              gap={1}
                            >
                              <IconButton size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCartData(prev => prev.map(cartItem => 
                                    cartItem.title === item.title ? {...cartItem, count: cartItem.count + 1} : cartItem
                                  ));
                                }} 
                                sx={{ color: '#7ac142' }}
                              >
                                <AddIcon fontSize="small" />
                              </IconButton>

                              <Typography variant="body1" fontWeight="bold" color="#7ac142">
                                {item.count}
                              </Typography>

                              <IconButton size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCartData(prev => prev.map(cartItem => 
                                    cartItem.title === item.title ? {...cartItem, count: Math.max(1, cartItem.count - 1)} : cartItem
                                  ));
                                }} 
                                sx={{ color: '#7ac142' }}
                              >
                                <RemoveIcon fontSize="small" />
                              </IconButton>
                            </Box>
                            <IconButton size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCartData(prev => prev.filter(cartItem => cartItem.title !== item.title));
                                setCartCount(prev => prev - 1);
                              }} 
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                        </div>
                      </div>
                    } 
                    // primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: '600' }}
                    secondaryTypographyProps={{ fontSize: '0.8rem', color: '#7ac142' }}
                  />

                </ListItem>
              ))}
            </List>

            <div
              style={{
                top: 'auto',
                bottom: 0,
                padding: '10px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  display: 'flex',
                  padding: '10px 20px',
                }}
              >
                <Typography>Total Items: {cartData.reduce((sum, item) => sum + item.count, 0)} |
                  Total Price: ${getTotalPrice()}</Typography>
              </Paper>
            </div>
            <div style={{display: "flex"}}>
              <Button
                  variant="contained"
                  color="success"
                  size="large"
                  onClick={()=>{setVisibleCheckoutModal(true)}}
                  sx={{
                    bgcolor: '#7ac142',
                    width: '300px',
                    margin: '10px auto',
                    fontWeight: 'bold',
                  }}
                >
                  Checkout: ${getTotalPrice()}
                </Button>
              <CheckoutModal open={visibleCheckoutModal} onClose={()=> setVisibleCheckoutModal(false)} />
            </div>
        </Drawer>
      </Box>
      {/* <LoginModal setUserDataFlag={setUserDataFlag} setUserData={setUserData} open={visibleLoginModal} onClose={()=> setVisibleLoginModal(false)} /> */}
    </Box>
  );
};

export default ChatWindow;
