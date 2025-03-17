import React, { useState, useRef, useEffect } from "react";
import ChatInput from "./ChatInput";
import ChatMessage from "./ChatMessage";
import DOMPurify from 'dompurify';

import {
  Grid,
  Chip,
  Card,
  CardMedia,
  CardContent,
  TextField,
  CircularProgress,
  useMediaQuery,
  useTheme,
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  Button,
  Box,
  Fab,
  Badge,
  Drawer,
  ListItemButton,
  AppBar,
  Typography
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import IconButton from "@mui/material/IconButton";
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
const GREETING_WORD = "I'm Drip Drop Deals Order Assistant, What would you like to order today?";

const drawerWidth = 1350;

const ChatWindow: React.FC = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isMediumScreen = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const [showAmountSelector, setShowAmountSelector] = useState(false);
  // const [showContinueSelector, setShowContinueSelector] = useState(false);
  const [orderDetailDialogOpen, setOrderDetailDialogOpen] = useState(false);
  const [totalPrice, setTotalPrice] = useState("");
  const [currentAmount, setCurrentAmount] = useState(INITIAL_AMOUNT);

  // const API_URL = "http://13.208.253.225:4000/chat";
  // const API_URL = "http://52.221.236.58:80/chat";
  const API_URL = "http://85.209.93.93:4001/chat";
  // const API_URL = process.env.REACT_APP_API_URL;

  const [messages, setMessages] = useState<MessageInterface[]>([
    { content: GREETING_WORD, role: "assistant" },
  ]);

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

      setCartCount(cartCount + 1);
      setCartData(
        (previousData) => [...previousData, { 
          ...{
            "title": text,
            "image_urls": url,
            "category": category,
            "single_price": price,
            "subtitle": subtitle,
            "details": details,
            "directions": features
          }, count: currentAmount }]
        );
    
      setOrderData([]);
      setItemCount(1); // Reset the item count after adding to cart
    };

    const handleLinkClick = () => {
      const itemData = {
        title: text,
        image_urls: url,
        category: category,
        single_price: price,
        subtitle: subtitle,
        details: details,
        directions: features,
      };
      sessionStorage.setItem("itemData", JSON.stringify(itemData));
          // Open a new tab with only the title in the URL
      const newTabUrl = `${window.location.origin}/details/${text}`;

      // Open a new tab with the dynamic URL
      const newTab = window.open(newTabUrl, "_blank");

      // Send the itemData to the new tab using postMessage
      if (newTab) {
        newTab.onload = () => {
          newTab.postMessage(window.location.origin); // Pass data to the new tab
        };
      }
    }

    return (
      <ImageListItem key={text} className="image-list-item" style={{ margin: "8px", width:"240px", border: "solid 1px #73AD21", borderRadius: "15px"}} >
        <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 2, backgroundColor: '#73AD21', padding: '4px 8px', borderRadius: 4 }}>
          <Typography variant="body2" style={{ color: 'white'  }}>
            {"$"+price.match(/\$?(\d+\.\d+)/)?.[1]}
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
        <img src={url} alt={text} loading="lazy" onClick={handleOpen} />
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
              <span className="item-text">{text}</span>
              <div
                className="item-button"
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
          }
        />

        <Dialog open={open} onClose={handleClose}>
          <Grid container justifyContent="center" mt={4}>
            <Card sx={{ boxShadow: 0, padding: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography
                  variant="h5"
                  fontWeight="bold"
                  textAlign="center"
                  flexGrow={1}
                >
                  {text}
                </Typography>
                <Chip
                  label={price !== "N/A" ? price : "Price not available"}
                  color={price !== "N/A" ? "success" : "default"}
                  sx={{ fontWeight: "bold" }}
                />
              </Box>

              <CardMedia
                component="img"
                height="400"
                image={url}
                alt={text}
                sx={{ borderRadius: 2, marginY: 2 }}
              />

              <CardContent>
                <Box mt={2}>
                  <Typography variant="h6" fontWeight="bold">
                    Details:
                  </Typography>
                  <Typography
                    variant="body2"
                    component="div"
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(details || "No details provided."),
                    }}
                  />
                </Box>

                <Box mt={2}>
                  <Typography variant="h6" fontWeight="bold">
                    Features:
                  </Typography>
                  <Typography
                    variant="body2"
                    component="div"
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(features || "No features listed."),
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Dialog>
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
    setCurrentAmount(1);
    setShowAmountSelector(false);
    if (showInChat) {
      setMessages((prevMessages) => [...prevMessages, message]);
    }
    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}?message=${message.content}&history=${JSON.stringify(
          messages
        )}&flag=${flag}`,
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

            if (data.includes("ChunkData:")) {
              try {
                const jsonData = JSON.parse(data.split("ChunkData:")[1]);
                const parsedData = Object.entries(jsonData).map(([keyword, dataArray]) => ({
                  keyword,
                  data: dataArray as ChunkData['data'],
                }));
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

  const handleSendMessageViaInput = (text: string, flag: string) => {
    const message: MessageInterface = {
      content: text,
      role: "user",
    };
    if (flag === KEY_ASK_AMOUNT)
      handleSendMessage(message, KEY_ANSWER_AMOUNT, true);    
    else { 
      setChunkData([]);
      // setShowContinueSelector(false);
      setOrderDetailDialogOpen(false);
      
      setFlag(KEY_SELECT_PRODUCT);
      handleSendMessage(message, KEY_SELECT_PRODUCT, true);
      setFlag(KEY_SELECT_PRODUCT);
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

      <Divider />
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
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="permanent" // Always visible for desktop
          sx={{
            display: { xs: "block" }, // Ensure visibility on desktop
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth, // Percentage-based width
              maxWidth: "900px", // Cap the maximum width for large screens
              minWidth: "400px", // Minimum width for smaller desktop screens
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
          minWidth: "300px", // Minimum width to ensure usability
        }}
      >
          <div
            style={{
              height: "calc(100vh - 100px)", // Responsive height minus input area
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
              bottom: "12vh", // Relative positioning
              right: "30px",
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
                src="/cart.gif"
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
                    secondary={`$${item.single_price}`}
                    primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: '600' }}
                    secondaryTypographyProps={{ fontSize: '0.8rem', color: 'green' }}
                  />
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
                  Total Price: ${cartData.reduce((sum, item) => {
                const priceMatch = item.single_price.match(/\$?(\d+\.\d+)/);
                const price = priceMatch ? parseFloat(priceMatch[1]) : 0;
                return sum + (price * item.count);
              }, 0).toFixed(2)}</Typography>
              </Paper>
            </div>
            <div style={{display: "flex"}}>
              <Button
                  variant="contained"
                  color="success"
                  size="large"
                  sx={{
                    bgcolor: '#7ac142',
                    width: '300px',
                    margin: '10px auto',
                    fontWeight: 'bold',
                  }}
                >
                  Checkout: ${cartData.reduce((sum, item) => {
                  const priceMatch = item.single_price.match(/\$?(\d+\.\d+)/);
                  const price = priceMatch ? parseFloat(priceMatch[1]) : 0;
                  return sum + (price * item.count);
                }, 0).toFixed(2)}
                </Button>
            </div>
        </Drawer>
      </Box>
    </Box>
  );
};

export default ChatWindow;
