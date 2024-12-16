import React, { useState, useRef, useEffect } from "react";
import ChatInput from "./ChatInput";
import ChatMessage from "./ChatMessage";
import DOMPurify from "dompurify";

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
  Typography,
} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import Avatar from "@mui/material/Avatar";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import DoubleArrowTwoToneIcon from "@mui/icons-material/DoubleArrowTwoTone";
import ButtonGroup from "@mui/material/ButtonGroup";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ChangeCircleIcon from "@mui/icons-material/ChangeCircle";
import LoupeIcon from "@mui/icons-material/Loupe";
import Snackbar from "@mui/material/Snackbar";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";

interface MessageInterface {
  content: string;
  imageUrl?: string; // Optional imageUrl property
  role: "user" | "assistant";
}

interface ChunkOption {
  type: string;
  value: string;
}

const KEY_CHAT_CUSTOMER = "CHAT_CUSTOMER";
const KEY_SELECT_PRODUCT = "SELECT_PRODUCT";
const KEY_ASK_AMOUNT = "ASK_AMOUNT";
const KEY_ANSWER_AMOUNT = "ANSWER_AMOUNT";
const INITIAL_AMOUNT = 1;
const GREETING_WORD =
  "I'm West Side Wok Order Assistant, What would you like to order today?";

const drawerWidth = 1200;

const ChatWindow: React.FC = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isMediumScreen = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const [showAmountSelector, setShowAmountSelector] = useState(false);
  const [orderDetailDialogOpen, setOrderDetailDialogOpen] = useState(false);
  const [totalPrice, setTotalPrice] = useState("");
  const [currentAmount, setCurrentAmount] = useState(INITIAL_AMOUNT);

  const API_URL = "http://3.99.185.93:4002/chat";
  // const API_URL = process.env.REACT_APP_API_URL;

  const [messages, setMessages] = useState<MessageInterface[]>([
    { content: GREETING_WORD, role: "assistant" },
  ]);

  const initial_data = [
    {"type":"appetizers"},
    {"type":"soups"},
    {"type":"traditional_side_dishes"},
    {"type":"chinese_dishes"},
    {"type":"thai_food"},
    {"type":"chef's_specialities"},
    {"type":"sushi_appetizers"},
    {"type":"regular_rolls"},
    {"type":"vegetable_rolls"},
    {"type":"tempura_rolls"},
    {"type":"specialty_rolls"},
    {"type":"sushi_platters"},
    {"type":"poke_and_salads"},
    {"type":"sushi_or_sashimi"},
    {"type":"others"}
  ]

  const [chunkData, setChunkData] = useState<ChunkOption[]>(
    initial_data.map(item => ({...item, value: item.type}))
  );

  const [orderData, setOrderData] = useState<
    {
      type: string;
      name: string;
      description: string;
      price: string;
      option_keyword: string;
      option_name: string;
      option_price: string;
    }[]
  >([]);

  const [cartData, setCartData] = useState<
    {
      type: string;
      name: string;
      description: string;
      price: string;
      option_keyword: string;
      option_name: string;
      option_price: string;
      count: number;
    }[]
  >([]);

  const [oneOrderData, setOneOrderData] = useState("");

  const [cartCount, setCartCount] = useState(0);
  const [flag, setFlag] = useState(KEY_SELECT_PRODUCT);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const ItemCart: React.FC<{
    title: string;
    price: string;
    count: number;
  }> = ({ title, price, count }) => {
    return (
      <ListItem
        secondaryAction={
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <IconButton
              size="small"
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                // Logic for incrementing item count
              }}
            >
              <AddIcon fontSize="small" />
            </IconButton>
            <Typography>{count}</Typography>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                // Logic for decrementing item count
              }}
            >
              <RemoveIcon fontSize="small" />
            </IconButton>
          </Box>
        }
      >
        <ListItemButton>
          <ListItemText
            primary={title}
            secondary={"$" + price}
          />
          <IconButton
            edge="end"
            aria-label="delete"
            // Logic for deleting item from cart
          >
            <DeleteForeverIcon color="secondary" />
          </IconButton>
        </ListItemButton>
      </ListItem>
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

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (orderData.length > 0) {
      const singlePrice = parseFloat(orderData[0].price);

      if (!isNaN(singlePrice)) {
        const totalPrice = singlePrice * currentAmount;
        setTotalPrice(`$${totalPrice.toFixed(2)}`);
      } else {
        console.error("Failed to parse single_price from orderData");
        setTotalPrice("");
      }
    }
  }, [currentAmount, orderData]);

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
          if (line.startsWith("data: ")) {
            const data = line.slice(6).trim();
            newMessageContent += data;
            if (data.includes("ChunkData:")) {
              try {
                const jsonData = JSON.parse(data.split("ChunkData:")[1]);
                const parsedData: ChunkOption[] = jsonData.map((item: any) => {
                  const key = Object.keys(item)[0]; // Get the first key of the object
                  if (key === "name") {
                    setChunkData([]);
                    setOneOrderData("")
                  }
                  return {
                    type: key,
                    value: item[key],
                  };
                });
                setChunkData(parsedData);
              } catch (e) {
                console.error(e);
              }
            }
            if (data.includes("TYPE:")) {
              try {
                const detectData = data.split("TYPE:")[1];
                setOneOrderData((prev) => (prev ? `${prev}, ${detectData.split("@")[0]}: ${detectData.split("@")[1]}` : `${detectData.split("@")[0]}: ${detectData.split("@")[1]}`));
              } catch (e){
                console.error(e)
              }
            }
            if (data.includes(KEY_ASK_AMOUNT)) {
              try {
                const cleanData = data.split(`${KEY_ASK_AMOUNT}:`)[1];
                newMessageContent = cleanData;
                setShowAmountSelector(true);
              } catch (e) {
                console.error(e);
              }
            }
            if (data.includes(KEY_ANSWER_AMOUNT)) {
              try {
                const amountString = data.split(`${KEY_ANSWER_AMOUNT}:`)[1];
                const amount = parseInt(amountString, 10);
                if (
                  amount <= 0 ||
                  amountString.length > 4 ||
                  Number.isNaN(amount)
                ) {
                  const invalidInputMessage: MessageInterface = {
                    content: "Please input amount of product correctly.",
                    role: "assistant",
                  };
                  setMessages((prevMessages) => [
                    ...prevMessages,
                    invalidInputMessage,
                  ]);
                  setShowAmountSelector(true);
                  return;
                }

                handleSetCurrentAmount(amount);
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
                newMessages[lastMessageIndex].content = 
                  newMessageContent.split("TYPE:")[0] || "";
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

  const handleSetCurrentAmount = (amount: number) => {
    setCurrentAmount(amount);
  };

  const handleAmountClick = (flag: boolean, amount: number) => {
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

      const singlePrice = parseFloat(orderData[0].price); // Directly access the price
      const totalPrice = singlePrice * newAmount; // Calculate the total price
      if (!isNaN(singlePrice)) {
        setMessages((prevMessages) => {
          const lastIndex = prevMessages.length - 1;
          const lastMessage = prevMessages[lastIndex];

          if (lastMessage && lastMessage.content.includes("Total Price:")) {
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
    const backMessage: MessageInterface = {
      content: "I want to order " + oneOrderData + text,
      role: "user"
    }
    if (flag === KEY_ASK_AMOUNT)
      handleSendMessage(message, KEY_ANSWER_AMOUNT, true);
    else {
      // setChunkData([]);
      setOrderDetailDialogOpen(false);
      setFlag(KEY_SELECT_PRODUCT);
      handleSendMessage(backMessage, KEY_SELECT_PRODUCT, false);
      setFlag(KEY_SELECT_PRODUCT);
      setMessages((prevMessage) => [...prevMessage, message])
    }
  };

  const [open, setOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const handleCartOpen = () => setCartOpen(true);
  const handleCartClose = () => setCartOpen(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleAddCart = async () => {
    setCartCount(cartCount + 1);
    setCartData((previousData) => [
      ...previousData,
      { ...orderData[0], count: currentAmount },
    ]);

    setOrderData([]);
    setOrderDetailDialogOpen(false);
    setFlag(KEY_SELECT_PRODUCT);

    const messageText: MessageInterface = {
      content: "Added to cart successfully!",
      role: "assistant",
    };
    <Snackbar
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      open={true}
      autoHideDuration={5000}
      message="Add Cart successfully!"
    />;

    setMessages((prevMessages) => [...prevMessages, messageText]);
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
  };

  const getItemText = (item: ChunkOption) : string  => {
    if (item.type === "option_name") {
      let jsonString = item.value
        .replace(/'/g, '"')  // Replace all single quotes with double quotes
        .replace(/None/g, 'null');  // Replace None with null
      const itemData = JSON.parse(jsonString);
      return itemData.option_name
    } else {
      return item.value
    }
  }

  const drawer = (
    <div>
      <Divider />
      {chunkData.length > 0 && (
        <Box sx={{ marginTop: "20px", marginLeft: "10px" }}>
          <Fab variant="extended" size="medium" color="primary">
            <DoubleArrowTwoToneIcon sx={{ mr: 1 }} />
            Options
          </Fab>
          <ImageList
            cols={isSmallScreen ? 2 : isMediumScreen ? 4 : 5}
            style={{ padding: "10px" }}
          >
            {chunkData.map((item, index) => (
              <AmountItemButton
                key={index}
                text={getItemText(item)}
                onClick={() => {
                  // Handle option selection logic here
                  if (item.type === "option_name"){
                    let jsonString = item.value
                      .replace(/'/g, '"')  // Replace all single quotes with double quotes
                      .replace(/None/g, 'null');  // Replace None with null
                    const itemData = JSON.parse(jsonString);
                    console.log(itemData);

                    setFlag(KEY_ASK_AMOUNT);
                    setOrderData([itemData])
                    const userMessage: MessageInterface = {
                      content: itemData.option_name,
                      role: "user"
                    }
                    const backMessage: MessageInterface = {
                      content: itemData.name + "=>" + itemData.option_keyword + "=>" + itemData.option_name + ": " + `$${itemData.price}`,
                      role: "user",
                    }
                    handleSendMessage(backMessage, KEY_ASK_AMOUNT, false)
                    setMessages((prevMessage) => [...prevMessage, userMessage])
                  } else {
                    setOneOrderData((prev) => (prev ? `${prev}, ${item.type}: ${item.value}` : `${item.type}: ${item.value}`));
                    const userMessage: MessageInterface = {
                      content: item.value, // Send the text of the item as the user's message
                      role: "user",
                    };
                    const backMessage: MessageInterface = {
                      content: oneOrderData ? oneOrderData + "," + item.type + ": " + item.value : item.type + ": " + item.value, // Send the text of the item as the user's message
                      role: "user"
                    }
                    handleSendMessage(backMessage, flag, false);
                    setMessages((prevMessage) => [...prevMessage, userMessage])
                  }
                }}
              />
            ))}
          </ImageList>
        </Box>
      )}
    </div>
  );

  return (
    <Box sx={{ display: "flex" }} style={{ padding: "1rem" }}>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          ModalProps={{
            keepMounted: true,
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
                flexDirection: "column",
              }}
            >
              <Button variant="contained" sx={{ margin: "10px"}}>
                {orderData[0].name + orderData[0].option_name}
              </Button>
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
                <Button>{currentAmount}</Button>
                <Button
                  variant="contained"
                  onClick={() => setCurrentAmount(currentAmount + 1)}
                >
                  <AddIcon />
                </Button>
                <Button
                  style={{ width: "200px" }}
                  onClick={() => handleAmountClick(true, 0)}
                >
                  <AddShoppingCartIcon />
                </Button>
              </ButtonGroup>
              <Dialog open={open} onClose={handleClose}>
                <DialogActions>
                  <DialogTitle
                    style={{
                      textAlign: "center",
                      whiteSpace: "normal",
                      wordBreak: "break-word",
                      maxWidth: "fit-content",
                    }}
                  >
                    {orderData[0].name + orderData[0].option_name}
                  </DialogTitle>
                </DialogActions>
                <DialogContent></DialogContent>
              </Dialog>
            </Box>
          )}
          <Dialog open={orderDetailDialogOpen}>
            {orderData.length > 0 && (
              <>
                <DialogTitle>
                  <p>{orderData[0].name + orderData[0].option_name}</p>
                </DialogTitle>
                <DialogContent>
                  <p>Total Price: {totalPrice}</p>
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
          }}
        >
          <div style={{ padding: "16px", textAlign: "center" }}>
            <img
              src="/cart.svg"
              alt="Cart"
              style={{ maxWidth: "100%", height: "200px" }}
            />
          </div>
          <List
            sx={{
              position: "relative",
              overflow: "auto",
              marginBottom: "50px",
            }}
          >
            {cartData.map((item, index) => (
              <ItemCart
                key={index}
                title={item.name + item.option_name}
                price={item.price}
                count={item.count}
              />
            ))}
          </List>

          <AppBar
            position="absolute"
            color="primary"
            sx={{
              display: "flex",
              top: "auto",
              height: "50px",
              bottom: 0,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Paper
              elevation={0}
              sx={{ bgcolor: "transparent", color: "white", padding: 1 }}
            >
              <h4>
                Total Items:{" "}
                {cartData.reduce((sum, item) => sum + item.count, 0)} || Total
                Price: $
                {cartData
                  .reduce((sum, item) => {
                    const priceMatch = item.price;
                    const price = priceMatch ? parseFloat(priceMatch) : 0;
                    return sum + price * item.count;
                  }, 0)
                  .toFixed(2)}
              </h4>
            </Paper>
          </AppBar>
        </Drawer>
      </Box>
    </Box>
  );
};

export default ChatWindow;
