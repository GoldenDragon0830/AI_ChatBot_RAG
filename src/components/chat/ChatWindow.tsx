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
  Button,
  Box,
  Fab, 
  Badge,
  Drawer,
  ListItemButton
} from "@mui/material";
import IconButton from '@mui/material/IconButton';
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import ImageListItemBar from "@mui/material/ImageListItemBar";
import VisibilityIcon from '@mui/icons-material/Visibility';
import DoneOutlineIcon from '@mui/icons-material/DoneOutline';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import Avatar from '@mui/material/Avatar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import CloseIcon from '@mui/icons-material/Close';
import ButtonGroup from '@mui/material/ButtonGroup';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';
import LoupeIcon from '@mui/icons-material/Loupe';

interface MessageInterface {
  content: string;
  imageUrl?: string; // Optional imageUrl property
  role: "user" | "assistant";
}

const KEY_SELECT_PRODUCT = "SELECT_PRODUCT";
const KEY_ASK_AMOUNT = "ASK_AMOUNT";
const KEY_RETURN_PRICE = "RETURN_PRICE"
const INITIAL_AMOUNT = 1;

const ChatWindow: React.FC = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isMediumScreen = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const [showAmountSelector, setShowAmountSelector] = useState(false);
  const [orderDetailDialogOpen, setOrderDetailDialogOpen] = useState(false);
  const [totalPrice, setTotalPrice] = useState("");
  const [currentAmount, setCurrentAmount] = useState(INITIAL_AMOUNT);

  const API_URL = "http://13.208.253.225:4000/chat";

  const [messages, setMessages] = useState<MessageInterface[]>([]);
  const [chunkData, setChunkData] = useState<
    { title: string; imageUrl: string }[]
  >([]);
  const [orderData, setOrderData] = useState<
    { 
      title: string;
      image_urls: string;
      category: string;
      subtitle: string;
      single_price: string;
      additional_price: string;
      single_quantities: string;
      additional_quantities: string;
      details: string;
    }[]
  >([]);

  const [cartData, setCartData] = useState<
    { 
      title: string;
      image_urls: string;
      category: string;
      subtitle: string;
      single_price: string;
      additional_price: string;
      single_quantities: string;
      additional_quantities: string;
      details: string;
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
  }> = ({title, imageUrl, price}) => {
    return(
      <ListItemButton>
        <ListItemAvatar>
          <Avatar>
            <img src={imageUrl} width="100%"/>
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary={title} secondary={price} />
      </ListItemButton>
    )
  }

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
          <div>
            <span>{text}</span>
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

  const AmountItemButton: React.FC<{
    text: string;
    onClick: () => void;
  }> = ({ text, onClick }) => (
    <ImageListItem key={text} className="image-list-item">
      <Button variant="contained" onClick={onClick}>{text}</Button>
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
    setOrderDetailDialogOpen(false)
    const message: MessageInterface = {
      content: text,
      role: "user",
      imageUrl: url, // Include the image URL
    };
    setFlag(KEY_ASK_AMOUNT);
    handleSendMessage(message, KEY_ASK_AMOUNT);
  };



  const handleSendMessage = async (message: MessageInterface, flag: string, showInChat: boolean = true) => {
    setCurrentAmount(1);
    setShowAmountSelector(false);
    if (showInChat) {
      setMessages((prevMessages) => [...prevMessages, message]);
    }
    setChunkData([]);
    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}?message=${
          message.content
        }&history=${JSON.stringify(messages)}&flag=${flag}`,
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
            newMessageContent += data;

            if (data.includes("ChunkData:")) {
              try {
                const jsonData = JSON.parse(data.split("ChunkData:")[1]);
                setChunkData(jsonData);
              } catch (e) {
                console.error(e);
              }
            }
            if (data.includes(KEY_ASK_AMOUNT)){
              try {                 
                const chunkData = JSON.parse(data.split("ASK_AMOUNT:")[1]);
                setOrderData(chunkData);
                setShowAmountSelector(true);
              } catch (e){
                console.error(e)
              }
            } 
            if (newMessageContent.includes("@:")){
              try {
                const amountIndex = newMessageContent.indexOf("@:") + "@:".length;
                const endIndex = newMessageContent.indexOf("\n", amountIndex);
                const amount = newMessageContent.slice(amountIndex, endIndex).trim().slice(2);
                // amount.replace("@AMOUNT:@AMOUNT:", "");
                setTotalPrice(amount); 
                setOrderDetailDialogOpen(true);
                
                newMessageContent = "Total Price: "+amount;

              } catch (e){
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
                newMessages[lastMessageIndex].content = newMessageContent.split("ChunkData:")[0] || "";
                if (data.includes(KEY_ASK_AMOUNT)){
                  newMessages[lastMessageIndex].content = newMessageContent.split(KEY_ASK_AMOUNT+":")[0] || "";
                }
              } else {
                newMessages.push({ content: data, role: "assistant" });
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
  
  const handleAmountClick = () => {
    // Add logic here to handle what should happen when the current amount is clicked

    if (orderData.length > 0) {
      const displayMessage: MessageInterface = {
          content: `I need ${currentAmount}`,
          role: "user",
      };

      const backendMessage: MessageInterface = {
          content: `I need ${currentAmount} for "${orderData[0].title}"`,
          role: "user",
      };

      // Send to backend without showing extended text
      handleSendMessage(backendMessage, KEY_RETURN_PRICE, false);

      // Show only the display message
      setMessages((prevMessages) => [...prevMessages, displayMessage]);
    }
  };

  const handleSendMessageViaInput = (text: string, flag: string) => {
      setOrderDetailDialogOpen(false)
      const displayMessage: MessageInterface = {
        content: text,
        role: "user"
      };
    
      // Message to be sent to the backend
      const backendMessage: MessageInterface = {
        content: `I want ${text}`,
        role: "user"
      };

      handleSendMessage(backendMessage, KEY_SELECT_PRODUCT, false);
      setFlag(KEY_SELECT_PRODUCT);

      setMessages((prevMessage) => [...prevMessage, displayMessage]);
  }

  const uniqueChunkData = chunkData.filter(
    (item, index, self) =>
      index === self.findIndex((t) => t.title === item.title)
  );
  const [open, setOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const handleCartOpen = () => setCartOpen(true);
  const handleCartClose = () => setCartOpen(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleAddCart = async () => {
    setCartData((previousData) => [...previousData, orderData[0]]);
    setCartCount(cartCount + 1);
    setOrderData([]);
    setOrderDetailDialogOpen(false)
  }
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
            item.imageUrl == "" ? (
              <AmountItemButton
                key={index}
                text={item.title}
                onClick={() => handleButtonClick(item.title, "")}
              />
            ) : (
              <ItemButton
                key={index}
                text={item.title}
                url={item.imageUrl}
                onClick={() => handleButtonClick(item.title, item.imageUrl)}
              />
            )
          ))}
        </ImageList>
        {loading && (
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <CircularProgress />
          </div>
        )}
        <ChatInput onSendMessage={(message) => handleSendMessageViaInput(message.content, flag)} />
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
              <Button variant="outlined" color="secondary" onClick={() => currentAmount > 1 ? setCurrentAmount(currentAmount - 1) : setCurrentAmount(1)}><RemoveIcon /></Button>
              <Button style={{width: "150px"}} onClick={handleAmountClick}>{currentAmount}</Button>
              <Button variant="contained" onClick={() => setCurrentAmount(currentAmount + 1)}><AddIcon /></Button>
            </ButtonGroup>
            <Dialog open={open} onClose={handleClose}>
              <DialogActions>
                <DialogTitle style={{ textAlign: "center" }}>{orderData[0].title}</DialogTitle>
              </DialogActions>
              <DialogContent>
                <img src={orderData[0].image_urls.split(", ")[0]} alt={orderData[0].title} style={{ width: "100%" }} />
              </DialogContent>
            </Dialog>
          </Box>
        )}
        <Dialog open={orderDetailDialogOpen} onClose={() => setOrderDetailDialogOpen(false)}>
          {orderData.length > 0 && (
            <>
              <DialogTitle><p>{orderData[0].title}</p></DialogTitle>
              <DialogContent>
                <p>Total Price: {totalPrice}</p>
                <img src={orderData[0].image_urls.split(", ")[0]} alt={orderData[0].title} style={{ width: "100%" }} />
                <p>Category: {orderData[0].category}</p>
                <p>Subtitle: {orderData[0].subtitle}</p>
                <p>Single Price: {orderData[0].single_price}</p>
                <p>Additional Price: {orderData[0].additional_price}</p>
                <p>Single Quantities: {orderData[0].single_quantities}</p>
                <p>Additional Quantities: {orderData[0].additional_quantities}</p>
                <p>Details: {orderData[0].details}</p>
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
              onClick={() => handleButtonClick(orderData[0].title, orderData[0].image_urls.split(", ")[0])} 
              color="primary"
              >
              Change Amount
            </Button>
            <Button 
              startIcon={<LoupeIcon />}
              onClick={() => handleSendMessageViaInput("I want to make new Order", KEY_SELECT_PRODUCT)} 
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
          position: 'fixed',
          bottom: '150px',
          right: '50px'
        }}
        >
        <Fab
          color="primary"
          aria-label="add"
          onClick={handleCartOpen}
        >
          <AddShoppingCartIcon />
        </Fab>
      </Badge>

      <Drawer
        anchor="right"
        open={cartOpen}
        onClose={handleCartClose}
      >
        <div style={{ padding: '16px', textAlign: 'center' }}>
          <img src="/cart.svg" alt="Cart" style={{ maxWidth: '100%', height: '200px' }} />
        </div>
        <List>
          {cartData.map((item, index) => (
            <ItemCart key={index} title={item.title} imageUrl={item.image_urls.split(", ")[0]} price={item.single_price}/>
          ))}
        </List>
      </Drawer>

    </div>
  );
};

export default ChatWindow;
