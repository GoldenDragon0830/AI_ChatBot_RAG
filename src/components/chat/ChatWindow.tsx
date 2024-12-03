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
import CloseIcon from "@mui/icons-material/Close";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";
import ButtonGroup from "@mui/material/ButtonGroup";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ChangeCircleIcon from "@mui/icons-material/ChangeCircle";
import LoupeIcon from "@mui/icons-material/Loupe";
import Snackbar from "@mui/material/Snackbar";
import { title } from "process";
import { moveMessagePortToContext } from "worker_threads";
import Toolbar from "@mui/material/Toolbar";
import Divider from "@mui/material/Divider";
import ListItemIcon from "@mui/material/ListItemIcon";
import MailIcon from "@mui/icons-material/Mail";
import MenuIcon from "@mui/icons-material/Menu";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import Paper from '@mui/material/Paper';

interface MessageInterface {
  content: string;
  imageUrl?: string; // Optional imageUrl property
  role: "user" | "assistant";
}

const KEY_CHAT_CUSTOMER = "CHAT_CUSTOMER";
const KEY_FINISH_ORDER = "FINISH_ORDER";
const KEY_SELECT_PRODUCT = "SELECT_PRODUCT";
const KEY_ASK_AMOUNT = "ASK_AMOUNT";
const INITIAL_AMOUNT = 1;
const GREETING_WORD =
  "I'm Instacart Order Assistant, What would you like to order today?";

const drawerWidth = 560;

const ChatWindow: React.FC = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isMediumScreen = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const [showAmountSelector, setShowAmountSelector] = useState(false);
  const [showContinueSelector, setShowContinueSelector] = useState(false);
  const [orderDetailDialogOpen, setOrderDetailDialogOpen] = useState(false);
  const [totalPrice, setTotalPrice] = useState("");
  const [currentAmount, setCurrentAmount] = useState(INITIAL_AMOUNT);

  // const API_URL = "http://13.208.253.225:4000/chat";
  const API_URL = "http://52.221.236.58:80/chat";

  const [messages, setMessages] = useState<MessageInterface[]>([
    { content: GREETING_WORD, role: "assistant" },
  ]);

  const [chunkData, setChunkData] = useState<
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
            <img src={imageUrl} width="100%" />
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary={title} secondary={price} />
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
    onClick: () => void;
  }> = ({ text, url, onClick }) => {
    const [open, setOpen] = useState(false);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    return (
      <ImageListItem key={text} className="image-list-item">
        <img src={url} alt={text} loading="lazy" onClick={handleOpen} />
        <div className="overlay">
          <IconButton
            color="primary"
            onClick={handleOpen}
            style={{ color: "white" }}
          >
            <VisibilityIcon />
          </IconButton>
          <IconButton
            color="primary"
            onClick={onClick}
            style={{ color: "white" }}
          >
            <DoneOutlineIcon />
          </IconButton>
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
    setShowContinueSelector(false);
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
            if (data.includes(KEY_ASK_AMOUNT)) {
              try {
                const cleanData = data.split(`${KEY_ASK_AMOUNT}:`)[1];
                newMessageContent = cleanData; // Append the cleaned data
                setShowAmountSelector(true);
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

  const handleAmountClick = () => {
    // Add logic here to handle what should happen when the current amount is clicked

    if (orderData.length > 0) {
      setShowAmountSelector(false);
      const displayMessage: MessageInterface = {
        content: `I need ${currentAmount}`,
        role: "user",
      };

      // Show only the display message
      setMessages((prevMessages) => [...prevMessages, displayMessage]);

      const regex = /\$(\d+\.\d+)/;

      // Use the regular expression to extract the values
      const match1 = orderData[0].single_price.match(regex);

      // Ensure match1 is not null and calculate the total price
      if (match1) {
        const single_price = parseFloat(match1[1]);
        const totalPrice = single_price * currentAmount;
        const totalPriceText: MessageInterface = {
          content: `$${totalPrice.toFixed(2)}`,
          role: "assistant",
        };
        // Format totalPrice to two decimal places and set it
        setMessages((prevMessages) => [...prevMessages, totalPriceText]);
        setTotalPrice(totalPriceText.content);
      } else {
        console.error("Failed to parse single_price from orderData");
        setTotalPrice(""); // Set a fallback value or handle the error as needed
      }
      setOrderDetailDialogOpen(true);
    }
  };

  const handleSendMessageViaInput = (text: string, flag: string) => {
    setChunkData([]);
    setShowContinueSelector(false);
    setOrderDetailDialogOpen(false);
    const displayMessage: MessageInterface = {
      content: text,
      role: "user",
    };

    // Message to be sent to the backend
    const backendMessage: MessageInterface = {
      content: `I want ${text}`,
      role: "user",
    };

    handleSendMessage(backendMessage, KEY_SELECT_PRODUCT, false);
    setFlag(KEY_SELECT_PRODUCT);

    setMessages((prevMessage) => [...prevMessage, displayMessage]);
  };

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
    setCartCount(cartCount + 1);
    setCartData((previousData) => [...previousData, { ...orderData[0], count: currentAmount }]);
    
    setOrderData([]);
    setOrderDetailDialogOpen(false);

    const messageText: MessageInterface = {
      content:
        "Add Cart successfully! Would you like to order more products or complete your order?",
      role: "assistant",
    };
    <Snackbar
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      open={true}
      autoHideDuration={5000}
      message="Add Cart successfully!"
    />;

    setMessages((prevMessages) => [...prevMessages, messageText]);
    setShowContinueSelector(true);
  };

  const handleContinueOrder = async () => {
    setOrderDetailDialogOpen(false);
    const displayMessage: MessageInterface = {
      content: " I want to order again.",
      role: "user",
    };
    
    setChunkData([]);
    handleSendMessage(displayMessage, KEY_CHAT_CUSTOMER, true);
    setShowContinueSelector(false);
  };
  const handleFinishOrder = async () => {
    setOrderDetailDialogOpen(false);
    const displayMessage: MessageInterface = {
      content: "That's all. I want to finish order",
      role: "user",
    };
    handleSendMessage(displayMessage, KEY_FINISH_ORDER, true);
    setShowContinueSelector(false);
  };

  const drawer = (
    <div>
      <div style={{ padding: "16px", textAlign: "center", display: "flex", alignItems: "center" }}>
        <img
          src="/cart.svg"
          alt="Cart"
          style={{ width: "100px", height: "auto" }}
        />
        <span>The photos related to conversation will be displayed in the below list.</span>
      </div>

      <Divider />
      <ImageList
          cols={2}
          style={{ padding: "10px" }}
        >
        {uniqueChunkData.map((item, index) =>
                item.image_urls == "" ? (
                  <></>
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
      </ImageList>
    </div>
  );

  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);

  const handleDrawerClose = () => {
    setIsClosing(true);
    setMobileOpen(false);
  };

  const handleDrawerTransitionEnd = () => {
    setIsClosing(false);
  };

  const handleDrawerToggle = () => {
    if (!isClosing) {
      setMobileOpen(!mobileOpen);
    }
  };
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
          open={mobileOpen}
          onTransitionEnd={handleDrawerTransitionEnd}
          onClose={handleDrawerClose}
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
            padding: "50px",
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
                left: "62%",
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
                <Button style={{ width: "150px" }} onClick={handleAmountClick}>
                  {currentAmount}
                </Button>
                <Button
                  variant="contained"
                  onClick={() => setCurrentAmount(currentAmount + 1)}
                >
                  <AddIcon />
                </Button>
              </ButtonGroup>
              <Dialog open={open} onClose={handleClose}>
                <DialogActions>
                  <DialogTitle style={{ textAlign: "center" }}>
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
          {showContinueSelector && (
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
          )}
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
                  <p>Single Price: {orderData[0].single_price}</p>
                  <p>Additional Price: {orderData[0].additional_price}</p>
                  <p>Single Quantities: {orderData[0].single_quantities}</p>
                  <p>
                    Additional Quantities: {orderData[0].additional_quantities}
                  </p>
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
                const priceMatch = item.single_price.match(/\$(\d+\.\d+)/);
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
