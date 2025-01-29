import React, { useState, useRef, useEffect } from "react";
import ChatInput from "./ChatInput";
import ChatMessage from "./ChatMessage";
import DOMPurify from 'dompurify';

import {
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
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
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

const drawerWidth = 1200;

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
      <ListItem
        secondaryAction={
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <IconButton 
              size="small" 
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                setCartData(prev => prev.map(item => 
                  item.title === title ? {...item, count: item.count + 1} : item
                ));
              }}
            >
              <AddIcon fontSize="small" />
            </IconButton>
            <Typography>{count}</Typography>
            <IconButton 
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setCartData(prev => prev.map(item => 
                  item.title === title ? {...item, count: Math.max(1, item.count - 1)} : item
                ));
              }}
            >
              <RemoveIcon fontSize="small" />
            </IconButton>
          </Box>
        }
      >
      <ListItemButton>
        <ListItemAvatar>
          <Avatar>
            <img src={imageUrl} alt={title} width="100%" />
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary={title} secondary={"$"+price.match(/\$?(\d+\.\d+)/)?.[1]} />
        <IconButton
          edge="end"
          aria-label="delete"
          onClick={(e) => {
            e.stopPropagation();
            setCartData(prev => prev.filter(item => item.title !== title));
            setCartCount(prev => prev - 1);
          }}
        >
          <DeleteForeverIcon color="secondary" />
        </IconButton>
      </ListItemButton>
      </ListItem>
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
      <ImageListItem key={text} className="image-list-item">
        <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 2, backgroundColor: 'rgba(0,0,0,0.7)', padding: '4px 8px', borderRadius: 4 }}>
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
          title={
            <div className="item-bar-title">
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
          <DialogActions>
            <DialogTitle style={{ textAlign: "center", whiteSpace: "normal", wordBreak: "break-word", maxWidth: "fit-content" }}>
              {text}
            </DialogTitle>
          </DialogActions>
          <DialogContent>
            <img src={url} alt={text} style={{ width: "100%" }} />
            <p>Single Price: {price}</p>
            <p>Details: </p>
            <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(details)}}></div>
            <p>Features: </p>
            <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(features)}}></div>
          </DialogContent>

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
          <Fab variant="extended" size="medium" color="primary">
            <DoubleArrowTwoToneIcon sx={{ mr: 1 }} />
            {category.keyword}
          </Fab>
          <ImageList cols={isSmallScreen ? 2 : isMediumScreen ? 4 : 5} style={{ padding: "10px" }}>
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
    <Box sx={{ display: "flex" }} style={{ padding: "1rem" }}>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
        <Drawer
          variant="temporary"
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
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
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <div
          style={{
            height: "80vh",
            maxHeight: "650px",
            overflowY: "auto",
            padding: "20px",
            position: "relative",
          }}
          ref={containerRef}
        >
          {messages.map((message, index) => (
            <ChatMessage key={index} {...message} />
          ))}
          {/* <Grid container spacing={2} style={{ marginTop: "20px" }}> */}
          {/* <ImageList
            cols={isSmallScreen ? 2 : isMediumScreen ? 4 : 6}
            style={{ padding: "10px" }}
          >
            {uniqueChunkData.map((item, index) =>
              item.image_urls == "" ? (
                <AmountItemButton
                  key={index}
                  text={item.title}
                  onClick={() => handleButtonClick(item.title, "")}
                />
              ) : (
                <ItemButton
                  key={index}
                  text={item.title}
                  url={item.image_urls.split(",")[0]}
                  onClick={() => {
                    setOrderData([item]);
                    handleButtonClick(
                      item.title,
                      item.image_urls.split(",")[0]
                    );
                  }}
                />
              )
            )}
          </ImageList> */}
          {loading && (
            <div
              style={{
                position: "fixed",
                top: "50%",
                left: "80%",
                transform: "translate(-50%, -50%)",
              }}
            >
              <CircularProgress />
            </div>
          )}
          <ChatInput
            onSendMessage={(message) =>
              handleSendMessageViaInput(message.content, flag)
            }
          />
          {showAmountSelector && (
            <Box
              sx={{
                display: "flex",
                mb: 1,
                maxWidth: "200px",
                maxHeight: "200px",
                flexDirection: "column", // Ensure image and text stack vertically
              }}
            >
              <Box // Image container
                component="img"
                src={orderData[0].image_urls.split(", ")[0]}
                alt="Chat message visual"
                sx={{
                  borderRadius: 2,
                  mb: 1, // Margin bottom for spacing between image and text
                  boxShadow: 3, // Optional shadow for better visualization
                }}
                onClick={handleOpen}
              />
              <ButtonGroup variant="outlined">
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() =>
                    currentAmount > 1
                      ? setCurrentAmount(currentAmount - 1)
                      : setCurrentAmount(1)
                  }
                >
                  <RemoveIcon />
                </Button>
                <Button>
                  {currentAmount}
                </Button>
                <Button
                  variant="contained"
                  onClick={() => setCurrentAmount(currentAmount + 1)}
                >
                  <AddIcon />
                </Button>
                <Button style={{ width: "200px" }} onClick={() =>handleAmountClick(true, 0)}>
                  <AddShoppingCartIcon />
                </Button>
              </ButtonGroup>
              <Dialog open={open} onClose={handleClose}>
                <DialogActions>
                  <DialogTitle style={{ textAlign: "center", whiteSpace: "normal", wordBreak: "break-word", maxWidth: "fit-content" }}>
                    {orderData[0].title}
                  </DialogTitle>
                </DialogActions>
                <DialogContent>
                  <img
                    src={orderData[0].image_urls.split(", ")[0]}
                    alt={orderData[0].title}
                    style={{ width: "100%" }}
                  />
                </DialogContent>
              </Dialog>
            </Box>
          )}
          {/* {showContinueSelector && (
            <Box
              sx={{
                display: "flex",
                mb: 1,
                maxWidth: "600px",
                maxHeight: "200px",
                flexDirection: "column", // Ensure image and text stack vertically
              }}
            >
              <ButtonGroup variant="outlined">
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleContinueOrder}
                >
                  <ShoppingCartCheckoutIcon /> I want to order again
                </Button>
                <Button variant="contained" onClick={handleFinishOrder}>
                  <AssignmentTurnedInIcon /> That's all. I want to finish order
                </Button>
              </ButtonGroup>
            </Box>
          )} */}
          <Dialog open={orderDetailDialogOpen}>
            {orderData.length > 0 && (
              <>
                <DialogTitle>
                  <p>{orderData[0].title}</p>
                </DialogTitle>
                <DialogContent>
                  <p>Total Price: {totalPrice}</p>
                  <img
                    src={orderData[0].image_urls.split(", ")[0]}
                    alt={orderData[0].title}
                    style={{ width: "100%" }}
                  />
                  <p>Category: {orderData[0].category}</p>
                  <p>Subtitle: {orderData[0].subtitle}</p>
                  <p>Single Price: {"$"+orderData[0].single_price.match(/\$?(\d+\.\d+)$/)?.[1]}</p>
                  <p>Details: </p>
                  <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(orderData[0].details)}}></div>
                  <p>Features: </p>
                  <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(orderData[0].directions)}}></div>
                </DialogContent>
              </>
            )}
            <DialogActions>
              <Button
                component="label"
                role={undefined}
                variant="contained"
                tabIndex={-1}
                startIcon={<AddShoppingCartIcon />}
                onClick={handleAddCart}
              >
                Add Cart
              </Button>
              <Button
                startIcon={<ChangeCircleIcon />}
                variant="contained"
                onClick={() =>
                  handleButtonClick(
                    orderData[0].title,
                    orderData[0].image_urls.split(", ")[0]
                  )
                }
                color="primary"
              >
                Change Amount
              </Button>
              <Button
                startIcon={<LoupeIcon />}
                onClick={handleContinueOrder}
                color="primary"
              >
                New Order
              </Button>
            </DialogActions>
          </Dialog>
        </div>
        <Badge
          color="secondary"
          badgeContent={cartCount}
          style={{
            position: "fixed",
            bottom: "150px",
            right: "70px",
          }}
        >
          <Fab color="primary" aria-label="add" onClick={handleCartOpen}>
            <AddShoppingCartIcon />
          </Fab>
        </Badge>

        <Drawer 
          anchor="right"
          open={cartOpen} 
          onClose={handleCartClose}
          sx={{
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: "500px",
            },
          }}>
          <div style={{ padding: "16px", textAlign: "center" }}>
            <img
              src="/cart.svg"
              alt="Cart"
              style={{ maxWidth: "100%", height: "200px" }}
            />
          </div>
          <List sx={{ position: 'relative', overflow: 'auto', marginBottom: '50px'}}>
            {cartData.map((item, index) => (
              <ItemCart
                key={index}
                title={item.title}
                imageUrl={item.image_urls.split(", ")[0]}
                price={item.single_price}
                count={item.count}
              />
            ))}
          </List>
          
          <AppBar position="absolute" color="primary" sx={{ display: 'flex', top: 'auto', height: '50px', bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
            <Paper elevation={0} sx={{ bgcolor: 'transparent', color: 'white', padding: 1 }}>
              <h4>Total Items: {cartData.reduce((sum, item) => sum + item.count, 0)} || 
               
              Total Price: ${cartData.reduce((sum, item) => {
                const priceMatch = item.single_price.match(/\$?(\d+\.\d+)/);
                const price = priceMatch ? parseFloat(priceMatch[1]) : 0;
                return sum + (price * item.count);
              }, 0).toFixed(2)}</h4>
            </Paper>
          </AppBar>
        </Drawer>
      </Box>
    </Box>
  );
};

export default ChatWindow;
