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
  Typography,
  Checkbox,
} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import Avatar from "@mui/material/Avatar";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
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
import Chip from "@mui/material/Chip";
import DinnerDiningIcon from "@mui/icons-material/DinnerDining";
import BackspaceIcon from "@mui/icons-material/Backspace";

import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import { green, red } from "@mui/material/colors";
import { CheckBox, Description, LocalDining } from "@mui/icons-material";

const label = { inputProps: { "aria-label": "Checkbox demo" } };

const displayOptionSoup = ["Beef Dumplings","Egg Drop Soup", "Hot And Sour Soup", "Thai Chicken Noodle Soup", "Tofu Vegetable Soup"];

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

const KEY_CHAT_CUSTOMER = "CHAT_CUSTOMER";
const KEY_SELECT_PRODUCT = "SELECT_PRODUCT";
const KEY_ASK_AMOUNT = "ASK_AMOUNT";
const KEY_ANSWER_AMOUNT = "ANSWER_AMOUNT";
const KEY_ADD_CART = "ADD_CART";
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

  const [selectedChunk, setSelectedChunk] = useState<string | null>("ALL");
  const [chunkDataHistory, setChunkDataHistory] = useState<ChunkOption[][]>([]);

  const [nameListData, setNameListData] = useState<ChunkOption[]>([]);
  const [nameListDataHistory, setNameListDataHistory] = useState<ChunkOption[][]>([]);


  const [selectedOptionListData, setSelectedOptionListData] = useState<string[]>([]);

  // const [showSpecialOptions, setShowSpecialOptions] = useState(false);
  // const [specialOptions, setSpecialOptions] = useState<string[]>([]);
  // const [selectedSpecialOption, setSelectedSpecialOption] = useState("Pint"); // Default to "Pint"
  // const [specialItemCount, setSpecialItemCount] = useState(1);

  const API_URL = "http://3.99.185.93:4002/chat";
  const API_GET_FROM_DB_URL = "http://3.99.185.93:4002/get_db_data";
  const API_CHAT_VIA_INPUT_URL = "http://3.99.185.93:4002/chat_via_input";

  // const API_URL = process.env.REACT_APP_API_URL;

  const [messages, setMessages] = useState<MessageInterface[]>([
    { content: GREETING_WORD, role: "assistant" },
  ]);

  const initial_data = [
    { type: "appetizers" },
    { type: "soups" },
    { type: "traditional_side_dishes" },
    { type: "chinese_dishes" },
    { type: "thai_food" },
    { type: "chef's_specialities" },
    { type: "sushi_appetizers" },
    { type: "regular_rolls" },
    { type: "vegetable_rolls" },
    { type: "tempura_rolls" },
    { type: "specialty_rolls" },
    { type: "sushi_platters" },
    { type: "poke_and_salads" },
    { type: "sushi_or_sashimi" },
    { type: "others" },
  ];

  const menuList = [
    "ALL",
    "Appetizers",
    "Soups",
    "Traditional_side_dishes",
    "Chinese_dishes",
    "Thai_food",
    "Chef's_specialities",
    "sushi_appetizers",
    "Regular_rolls",
    "Vegetable_rolls",
    "Tempura_rolls",
    "Specialty_rolls",
    "Sushi_platters",
    "Poke_and_salads",
    "Sushi_or_sashimi",
    "Others",
  ];

  const [chunkData, setChunkData] = useState<ChunkOption[]>([]);

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
      optionList: string[];
    }[]
  >([]);

  const [oneOrderData, setOneOrderData] = useState("");

  const [typeData, setTypeData] = useState("");
  const [nameData, setNameData] = useState("");

  const [cartCount, setCartCount] = useState(0);

  const [selectedItemCount, setSelectedItemCount] = useState(1);

  const [flag, setFlag] = useState(KEY_SELECT_PRODUCT);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const ItemCart: React.FC<{
    title: string;
    price: string;
    count: number;
    optionList: string[];
  }> = ({ title, price, count, optionList }) => {
    const handleIncrement = () => {
      setCartData((prevData) =>
        prevData.map((item) =>
          item.name + item.option_name === title
            ? { ...item, count: item.count + 1 }
            : item
        )
      );
      setCartCount((prevCount) => prevCount + 1);
    };

    const handleDecrement = () => {
      setCartData((prevData) =>
        prevData.map((item) =>
          item.name + item.option_name === title && item.count > 1
            ? { ...item, count: item.count - 1 }
            : item
        )
      );
      setCartCount((prevCount) => (count > 1 ? prevCount - 1 : prevCount));
    };

    const handleRemove = () => {
      setCartData((prevData) =>
        prevData.filter((item) => item.name + item.option_name !== title)
      );
      setCartCount((prevCount) => prevCount - count);
    };

    function chunkArray<T>(array: T[], chunkSize: number): T[][] {
      const chunks: T[][] = [];
      for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize));
      }
      return chunks;
    }

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
              color="success"
              onClick={handleIncrement}
            >
              <AddIcon fontSize="small" />
            </IconButton>
            <Typography>{count}</Typography>
            <IconButton
              size="small"
              onClick={handleDecrement}
            >
              <RemoveIcon fontSize="small" />
            </IconButton>
          </Box>
        }
      >
        <ListItemButton>
          <ListItemText primary={title} 
            secondary={
              <Box>
                <Typography variant="body2" color="text.secondary" component="span">
                  ${price}
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", marginTop: 1 }}>
                  {chunkArray(optionList, 3).map((row, rowIndex) => (
                    <Box key={rowIndex} sx={{ display: "flex", flexDirection: "row", marginBottom: "4px" }}>
                      {row.map((option, index) => (
                        <Chip
                          key={index}
                          color="success"
                          label={option}
                          size="small"
                          sx={{
                            marginLeft: index === 0 ? 0 : "2px", // Add spacing only for chips after the first one
                          }}
                        />
                      ))}
                    </Box>
                  ))}
                </Box>
              </Box>
            } />
        </ListItemButton>
      </ListItem>
    );
  };

  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [chunkTotalPrice, setChunkTotalPrice] = useState(0);

  const AmountItemButton: React.FC<{
    text: string;
    type: string;
    value: string;
    price: string;
    description: string;
    onClick: () => void;
    style?: React.CSSProperties;
  }> = ({ text, type, value, price, description, onClick }) => {
    const [itemCount, setItemCount] = useState<{ [key: string]: number }>({});
    const [selectedOption, setSelectedOption] = useState<string | null>("Option 1");
    const [generalCount, setGeneralCount] = useState<number>(1);

    const handleIncrease = (optionKey: string) => { 
      if (displayOptionSoup.includes(text)) {
        setItemCount((prev) => ({
          ...prev,
          [optionKey]: (prev[optionKey] || 0) + 1,
        }));
      } else {
        setGeneralCount((prev) => prev + 1); // Increment count for non-displayOptionSoup
      }
    };
  
    const handleDecrease = (optionKey: string) => {
      if (displayOptionSoup.includes(text)) {
        setItemCount((prev) => ({
          ...prev,
          [optionKey]: Math.max(0, (prev[optionKey] || 0) - 1),
        }));
      } else {
        setGeneralCount((prev) => Math.max(1, prev - 1)); // Decrement count for non-displayOptionSoup
      }
    };
  
    const handleSelectOption = (optionKey: string) => {
      setSelectedOption(optionKey);
    };

    const handleOnClick = () => {
      if (itemCount) {
        if (displayOptionSoup.includes(text)) {
          const optionToAdd = selectedOption === "Option 1" ? (text === "Beef Dumplings" ? "Steamed" : "Pint") : (text === "Beef Dumplings" ? "Fried" : "Quart");
          console.log(optionToAdd)
          setCartData((prevCartData) => [
            ...prevCartData,
            {
              type,
              name: text,
              description,
              price,
              option_keyword: "",
              option_name: optionToAdd,
              option_price: price,
              count: itemCount[selectedOption || "Option 1"] || 1,
              optionList: [optionToAdd], // Add Pint or Quart to optionList
            },
          ]);
          setCartCount((prevCount) => prevCount + (itemCount[selectedOption || "Option 1"] || 1));
        }
        setSelectedItemCount(itemCount[selectedOption || "Option 1"] || 1);
      } else {
        setSelectedItemCount(itemCount[""] || 1);
        setCartCount((prevCount) => prevCount + generalCount);
        onClick()
      }
    }

    return (
      <ImageListItem key={text} className="image-list-item">
        <Card
          sx={{
            width: 280,
            margin: "5px",
            cursor: "pointer",
            backgroundColor: selectedOptionListData.includes(text) ? "grey.400" : "inherit",
            transition: "background-color 0.3s ease-in-out",
          }}
        >
          <CardContent
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              alignItems: "flex-start",
              height: "auto",
              position: "relative",
              transition: "transform 0.3s ease-in-out",
              "&:hover": {
                transform: "scale(1.05)",
              },
            }}
            onClick={() => {
              if (type === "option_name") {
                setSelectedOptionListData((prevOptions) => {
                  if (prevOptions.includes(text)) {
                    return prevOptions.filter((option) => option !== text);
                  } else {
                    return [...prevOptions, text];
                  }
                });
              } else if (!displayOptionSoup.includes(text)) {
                onClick();
              }
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: "bold",
                color: "green",
                fontSize: "20px",
                marginBottom: "5px",
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 1,
                WebkitBoxOrient: "vertical",
              }}
            >
              {text}
            </Typography>
            {type !== "option_name" ? (
              <Typography
                variant="body2"
                sx={{
                  color: "gray",
                  fontSize: "14px",
                  marginBottom: "10px",
                  height: "40px",
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                }}
              >
                {description}
              </Typography>
            ) : null}
          </CardContent>
          <CardActions
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
            disableSpacing
          >
            <Box sx={{ display: "flex", gap: 1 }}>
              {displayOptionSoup.includes(text) ? (
                <div>
                  {/* Badge for Option 1 */}
                  <Badge
                    badgeContent={itemCount["Option 1"] || 0} // Dynamically display the count for Option 1
                    color="success"
                    sx={{ marginRight: "2px" }}
                  >
                    <Chip
                      color="success"
                      size="small"
                      label={text === "Beef Dumplings" ? "Steamed" : "Pint $5"}
                      variant={selectedOption === "Option 1" ? "filled" : "outlined"}
                      onClick={() => handleSelectOption("Option 1")}
                    />
                  </Badge>

                  {/* Badge for Option 2 */}
                  <Badge
                    badgeContent={itemCount["Option 2"] || 0} // Dynamically display the count for Option 2
                    color="success"
                  >
                    <Chip
                      color="success"
                      size="small"
                      label={text === "Beef Dumplings" ? "Fried" : "Quart $10"}
                      variant={selectedOption === "Option 2" ? "filled" : "outlined"}
                      onClick={() => handleSelectOption("Option 2")}
                    />
                  </Badge>
                </div>
              ) : (
                <Typography variant="body2" style={{ color: "green", marginLeft: "10px" }}>
                  {"$" + parseFloat(price)}
                </Typography>
              )}
            </Box>
            {type === "name" && (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <IconButton
                  size="small"
                  onClick={() =>
                    displayOptionSoup.includes(text)
                      ? handleDecrease(selectedOption || "Option 1")
                      : handleDecrease("")
                  }
                >
                  <RemoveIcon fontSize="small" />
                </IconButton>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Typography>
                    {displayOptionSoup.includes(text)
                      ? itemCount[selectedOption || "Option 1"] || 0
                      : generalCount}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() =>
                      displayOptionSoup.includes(text)
                        ? handleIncrease(selectedOption || "Option 1")
                        : handleIncrease("")
                    }
                  >
                    <AddIcon fontSize="small" />
                  </IconButton>
                </Box>
                <IconButton
                  size="small"
                  color="success"
                  sx={{ marginLeft: "10px" }}
                  onClick={handleOnClick}
                >
                  <AddShoppingCartIcon fontSize="small" />
                </IconButton>
              </Box>
            )}
          </CardActions>
        </Card>
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
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    // Calculate total price based on selected options
    const total = chunkData
      .filter((item) => selectedOptionListData.includes(getItemOptionName(item.value)))
      .reduce((sum, item) => {
        const optionPriceMatch = item.value.match(/'option_price':\s*([\d.]+)/);
        const optionPrice = optionPriceMatch ? parseFloat(optionPriceMatch[1]) : 0;
        return sum + optionPrice; // Add only the option_price
      }, 0);
  
    setChunkTotalPrice(total); // Update the total price
  }, [selectedOptionListData, chunkData]);


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

  const handleGetResponseFromDB = async (
    keyword: string,
    type: string,
    name: string
  ) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_GET_FROM_DB_URL}?keyword=${keyword}&type=${type}&name=${name}`,
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
            if (data.includes("ChunkData:")) {
              try {
                const jsonData = JSON.parse(data.split("ChunkData:")[1]);
                let firstData = null;
                if (chunkData.length > 0) {
                  setChunkDataHistory((prevHistory) => [
                    ...prevHistory,
                    chunkData,
                  ]);
                }

                const parsedData: ChunkOption[] = jsonData.map((item: any) => {
                  const key = Object.keys(item)[0]; // Get the first key of the object
                  const key_description = Object.keys(item)[1];
                  const key_price = Object.keys(item)[2];
                  const key_type = Object.keys(item)[3];

                  if (key === "name") {
                    setNameListData([]);
                  }
                  return {
                    type: key,
                    value: item[key],
                    description: item[key_description],
                    price: item[key_price],
                    keyword: item[key_type],
                  };
                });

                if (
                  jsonData.length > 0 &&
                  Object.keys(jsonData[0])[0] === "name"
                ) {
                  // Set nameListData if the key is "name"
                  setChunkData(parsedData);
                } else if (Object.keys(jsonData[0])[0] === "option_keyword") {
                  firstData = {
                    type: "ALL",
                    value: "ALL",
                    description: "",
                    price: "",
                    keyword: "",
                  };
                  const updatedData =
                    jsonData.length > 1
                      ? firstData
                        ? [firstData, ...parsedData]
                        : parsedData
                      : parsedData;
                  console.log(updatedData)
                  setNameListData(updatedData);
                } else if (Object.keys(jsonData[0])[0] === "option_name") {
                  if (parsedData.length === 1) {
                    console.log(parsedData);

                    const cartDataString = parsedData[0].value

                    const typeMatch = cartDataString.match(/'type':\s*'([^']+)'/);
                    const nameMatch = cartDataString.match(/'name':\s*'([^']+)'/);
                    const descriptionMatch = cartDataString.match(
                      /'description':\s*'([^']*)'/
                    );
                    const priceMatch = cartDataString.match(/'price':\s*([\d.]+)/);
                    const optionKeywordMatch = cartDataString.match(
                      /'option_keyword':\s*'([^']+)'/
                    );
                    const optionNameMatch = cartDataString.match(
                      /'option_name':\s*'([^']+)'/
                    );
                    const optionPriceMatch = cartDataString.match(
                      /'option_price':\s*'([^']+)'/
                    );

                    // Construct the object manually
                    const parsedCartData = {
                      type: typeMatch ? typeMatch[1] : "",
                      name: nameMatch ? nameMatch[1] : "",
                      description: descriptionMatch ? descriptionMatch[1] : "",
                      price: priceMatch ? priceMatch[1] : "",
                      option_keyword: optionKeywordMatch
                        ? optionKeywordMatch[1]
                        : "",
                      option_name: optionNameMatch ? optionNameMatch[1] : "",
                      option_price: optionPriceMatch ? optionPriceMatch[1] : "",
                    };

                    // Update the cartData state
                    setCartCount(cartCount + 1);
                    setCartData((prevCartData) => [
                      ...prevCartData,
                      {
                        ...parsedCartData,
                        count: selectedItemCount, // Default count for new cart items
                        optionList: []
                      },
                    ]);
                    setSelectedOptions((prevOptions) => [
                      ...prevOptions,
                      parsedData[0].value,
                    ]);

                    setSelectedItemCount(1);
                  } else {
                    setChunkData(parsedData);
                  }
                } else {
                  setChunkData(parsedData);
                }
              } catch (e) {
                console.error(e);
              }
            } else {
              newMessageContent += data;
              setMessages((prev) => {
                const newMessages = [...prev];
                const lastMessageIndex = newMessages.length - 1;
                if (
                    lastMessageIndex >= 0 &&
                    newMessages[lastMessageIndex].role === "assistant"
                ) {
                    newMessages[lastMessageIndex].content = newMessageContent;
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
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (
    message: MessageInterface,
    flag: string,
    showInChat: boolean = true,
    isInput: boolean = false
  ) => {
    setCurrentAmount(1);
    setShowAmountSelector(false);
    if (showInChat) {
      setMessages((prevMessages) => [...prevMessages, message]);
    }
    setLoading(true);

    try {
      const response = await fetch(
        `${isInput ? API_CHAT_VIA_INPUT_URL : API_URL}?message=${
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

        // eslint-disable-next-line no-loop-func
        lines.forEach((line) => {
          if (line.startsWith("data: ")) {
            const data = line.slice(6).trim();
            newMessageContent += data;
            if (data.includes("ChunkData:")) {
              try {
                const jsonData = JSON.parse(data.split("ChunkData:")[1]);
                console.log(jsonData);
                let firstData = null;
                if (chunkData.length > 0) {
                  setChunkDataHistory((prevHistory) => [
                    ...prevHistory,
                    chunkData,
                  ]);
                }

                const parsedData: ChunkOption[] = jsonData.map((item: any) => {
                  const key = Object.keys(item)[0]; // Get the first key of the object
                  const key_description = Object.keys(item)[1];
                  const key_price = Object.keys(item)[2];
                  if (key === "name") {
                    setNameListData([]);
                  }

                  return {
                    type: key,
                    value: item[key],
                    description: item[key_description],
                    price: item[key_price],
                  };
                });

                if (
                  jsonData.length > 0 &&
                  Object.keys(jsonData[0])[0] === "name"
                ) {
                  // Set nameListData if the key is "name"
                  setChunkData(parsedData);
                } else if (Object.keys(jsonData[0])[0] === "option_keyword") {
                  firstData = {
                    type: "ALL",
                    value: "ALL",
                    description: "",
                    price: "",
                    keyword: "",
                  };
                  const updatedData =
                    jsonData.length > 1
                      ? firstData
                        ? [firstData, ...parsedData]
                        : parsedData
                      : parsedData;
                  setNameListData(updatedData);
                } else {
                  if (parsedData.length === 1) {
                    console.log(parsedData)    
                  } else {
                    setChunkData(parsedData);
                  }
                }
              } catch (e) {
                console.error(e);
              }
            } else if (data.includes("TYPE:")) {
              try {
                const detectData = data.split("TYPE:")[1];
                if (detectData.split("@")[0] === "type") {
                  setTypeData(detectData.split("@")[1]);
                } else if (detectData.split("@")[0] === "name")
                  setNameData(detectData.split("@")[1]);
              } catch (e) {
                console.error(e);
              }
            } else if (data.includes(KEY_ASK_AMOUNT)) {
              try {
                const cleanData = data.split(`${KEY_ASK_AMOUNT}:`)[1];
                newMessageContent = cleanData;
                setShowAmountSelector(true);
              } catch (e) {
                console.error(e);
              }
            } else if (data.includes(KEY_ANSWER_AMOUNT)) {
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
            } else if (data.includes(KEY_ADD_CART)) {
              try {
                setOneOrderData("");
                const cartDataString = data.split(`${KEY_ADD_CART}:`)[1]; // Extract the cart data string
                console.log(cartDataString);

                // Use regex to extract specific fields from the string
                const typeMatch = cartDataString.match(/'type':\s*'([^']+)'/);
                const nameMatch = cartDataString.match(/'name':\s*'([^']+)'/);
                const descriptionMatch = cartDataString.match(
                  /'description':\s*'([^']*)'/
                );
                const priceMatch = cartDataString.match(/'price':\s*'([^']+)'/);
                const optionKeywordMatch = cartDataString.match(
                  /'option_keyword':\s*'([^']+)'/
                );
                const optionNameMatch = cartDataString.match(
                  /'option_name':\s*'([^']+)'/
                );
                const optionPriceMatch = cartDataString.match(
                  /'option_price':\s*'([^']+)'/
                );

                // Construct the object manually
                const parsedCartData = {
                  type: typeMatch ? typeMatch[1] : "",
                  name: nameMatch ? nameMatch[1] : "",
                  description: descriptionMatch ? descriptionMatch[1] : "",
                  price: priceMatch ? priceMatch[1] : "",
                  option_keyword: optionKeywordMatch
                    ? optionKeywordMatch[1]
                    : "",
                  option_name: optionNameMatch ? optionNameMatch[1] : "",
                  option_price: optionPriceMatch ? optionPriceMatch[1] : "",
                };

                // Update the cartData state
                setCartCount(cartCount + 1);
                setCartData((prevCartData) => [
                  ...prevCartData,
                  {
                    ...parsedCartData,
                    count: 1, // Default count for new cart items
                    optionList: []
                  },
                ]);

                console.log("Cart updated:", parsedCartData);
              } catch (e) {
                console.error(e);
              }
            } else {
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
    setOneOrderData((prev) => prev + text);
    const backMessage: MessageInterface = {
      content: `I want to order ${oneOrderData}  ${text}`, //content: "I want to order" + typeData ? `type: ${typeData}` : "" + nameData ? `name: ${nameData}` : ""  + `, ${text}`,
      role: "user",
    };
    if (flag === KEY_ASK_AMOUNT)
      handleSendMessage(message, KEY_ANSWER_AMOUNT, true, true);
    else {
      // setChunkData([]);
      setOrderDetailDialogOpen(false);
      setFlag(KEY_SELECT_PRODUCT);
      handleSendMessage(backMessage, KEY_SELECT_PRODUCT, false, false);
      setFlag(KEY_SELECT_PRODUCT);
      setMessages((prevMessage) => [...prevMessage, message]);
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
      { ...orderData[0], count: currentAmount, optionList: [] },
    ]);

    setOrderData([]);
    setOrderDetailDialogOpen(false);
    setFlag(KEY_SELECT_PRODUCT);

    const messageText: MessageInterface = {
      content: "Added to cart successfully!",
      role: "assistant",
    };

    setMessages((prevMessages) => [...prevMessages, messageText]);
  };

  const handleContinueOrder = async () => {
    // setOneOrderData("");
    setOrderDetailDialogOpen(false);
    const displayMessage: MessageInterface = {
      content: " I want to order again.",
      role: "user",
    };

    setChunkData([]);
    handleSendMessage(displayMessage, KEY_CHAT_CUSTOMER, true);
    setFlag(KEY_SELECT_PRODUCT);
  };

  const getItemName = (item: string): string => {
    const match = item.match(/'name':\s*'([^']*)'/);

    if (match) {
      const name = match[1];
      return name;
    } else {
      return "";
    }
  };

  const getItemText = (item: ChunkOption): string => {
    if (!item?.value) {
      return "";
    }
    if (item.type === "option_name") {
      const regex = /'option_name': '([^']*)'/;
      const match =
        typeof item.value === "string" ? item.value.match(regex) : null;
      return match?.[1] || "";
    }

    return item.value;
  };

  const getItemPriceFromTest = (item: string): string => {
    const match = item.match(/'price':\s*([\d.]+)/);

    if (match) {
      const price = match[1];
      return price;
    } else {
      return "0";
    }
  };

  const getItemPrice = (item: ChunkOption): string => {
    if (!item?.value) {
      return "";
    }

    if (item.type === "option_name") {
      const regex = /'price':\s*([\d.]+)/;
      const match =
        typeof item.value === "string" ? item.value.match(regex) : null;
      console.log(match?.[1]);
      return match?.[1] || "";
    }

    return item.value;
  };

  const getItemOptionName = (item: string): string => {
    const match = item.match(/'option_name':\s*'([^']*)'/);
                            
    if (match) {
      const option_name = match[1];
      return option_name;
    } else {
      return ""
    }
  }

  const [detailDialog, setDetailDialog] = useState(false);
  const [selectedItemData, setSelectedItemData] = useState<any>(null);
  const [selectedChip, setSelectedChip] = useState<string | null>("ALL");
  const [selectedNameChip, setSelectedNameChip] = useState<string | null>(
    "ALL"
  );

  const handleBackButton = () => {
    setSelectedOptionListData([]);
    setNameListData([]);

    if (chunkDataHistory.length > 0) {
      // Restore the last chunkData from the history stack
      const previousChunkData = chunkDataHistory[chunkDataHistory.length - 1];
      setChunkData(previousChunkData);

      // Update the chunkDataHistory stack by removing the last entry
      setChunkDataHistory((prevHistory) => prevHistory.slice(0, -1));
    }
  };

  const handleDetailDialogOpen = () => {
    setDetailDialog(true);
  };

  const handleDetailDialogClose = () => {
    setDetailDialog(false);
  };

  useEffect(() => {
    if (nameListData.length > 0) {
      setNameListDataHistory((prevHistory) => [...prevHistory, nameListData]); // Save current nameListData to history
      setSelectedNameChip("ALL");
  
      handleGetResponseFromDB("all_option_name", typeData, nameData);
    }
  
    if (nameListData.length === 1) {
      const singleItemData = nameListData[0];
      setSelectedNameChip(singleItemData.value);
      handleGetResponseFromDB("all_option_name", typeData, nameData);
    }
  }, [nameListData]);

  const groupedData: Record<string, ChunkOption[]> = chunkData.reduce(
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

  const drawer = (
    <div>
      <Divider />
      <Paper
        sx={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          listStyle: "none",
          p: 0.5,
          m: 0,
        }}
      >
        {menuList.map((title, index) => {
          return (
            <Chip
              sx={{
                margin: "5px",
              }}
              label={title}
              clickable
              color="success"
              icon={<DinnerDiningIcon />}
              variant={selectedChip === title ? "filled" : "outlined"} // Change variant when selected
              key={index}
              onClick={() => {
                setSelectedOptionListData([]);
                if (title === "ALL") {
                  setSelectedChip(title); // Set the selected chip
                  setTypeData(title); // set one type data
                  setNameData("");
                  setSelectedChunk("ALL");
                  handleGetResponseFromDB("all_option_keyword", "", "");
                } else {
                  setSelectedChip(title); // Set the selected chip
                  setTypeData(title); // set one type data
                  setNameData("");
                  const userMessage: MessageInterface = {
                    content: title, // Send the text of the item as the user's message
                    role: "user",
                  };
                  const backMessage: MessageInterface = {
                    content: "I want to find new type." + "type: " + title, // Send the text of the item as the user's message
                    role: "user",
                  };
                  handleSendMessage(backMessage, flag, false, false);
                  setMessages((prevMessage) => [...prevMessage, userMessage]);
                }
              }}
            />
          );
        })}
      </Paper>
      { selectedOptionListData.length !== 0 ? (
        <Box
        sx={{
          display: "flex", // Use flexbox for layout
          flexDirection: "vertically", // Stack items vertically
          marginTop: "20px", // Space above the button
          marginLeft: "20px", // Align with the parent container
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
            width: "1200px", // Ensure it doesn't overflow its container
          }}
        >
          {selectedOptionListData.map((text, index) => {
            return (
              <Chip
                sx={{
                  margin: "2px",
                }}
                label={text}
                clickable
                color="success"
                variant="outlined" // Change variant when selected
                key={index}
              />
            );
          })}
        </Paper>
      </Box>
      ) : null}
      <Box
        sx={{
          display: "flex", // Use flexbox for layout
          flexDirection: "vertically", // Stack items vertically
          marginTop: "20px", // Space above the button
          marginLeft: "20px", // Align with the parent container
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
            width: "1200px", // Ensure it doesn't overflow its container
          }}
        >
          <Button
            color="success"
            variant="outlined"
            startIcon={<BackspaceIcon />}
            sx={{
              marginRight: "20px",
              width: "100px",
            }}
            onClick={handleBackButton}
            disabled={chunkDataHistory.length === 0}
          >
            Back
          </Button>
          {nameListData.map((item, index) => {
            return (
              <Chip
                sx={{
                  margin: "5px",
                }}
                label={item.value}
                clickable
                color="success"
                variant={
                  selectedNameChip === item.value ? "filled" : "outlined"
                } // Change variant when selected
                key={index}
                onClick={() => {
                  if (item.value === "ALL") {
                    setSelectedNameChip(item.value);
                    // setSelectedChunk("ALL");
                    handleGetResponseFromDB(
                      "all_option_name",
                      typeData,
                      nameData
                    );
                  } else {
                    setSelectedNameChip(item.value);
                    // setSelectedChunk(item.value)
                    const userMessage: MessageInterface = {
                      content: item.value, // Send the text of the item as the user's message
                      role: "user",
                    };
                    const backMessage: MessageInterface = {
                      content:
                        `type: ${typeData} + name: ${nameData} + ` + item.value, // Send the text of the item as the user's message
                      role: "user",
                    };
                    handleSendMessage(backMessage, flag, false, false);
                    setMessages((prevMessage) => [...prevMessage, userMessage]);
                  }
                }}
              />
            );
          })}
        </Paper>
        <Typography
          sx={{
            textAlign: "center",
            backgroundColor: "#f5f5f5",           
            padding: "10px",
            borderRadius: "5px",
            color: "green",
          }}
        >
          <Button
            variant="outlined"
            color="success"
            startIcon={<AddShoppingCartIcon />}
            disabled={selectedOptionListData.length === 0} // Disable button if nothing is selected
            onClick={() => {
              const itemsToAdd = chunkData.filter((item) =>
                selectedOptionListData.includes(getItemOptionName(item.value))
              );

              const cartDataString = itemsToAdd[0].value;
              console.log(cartDataString)

              // Use regex to extract specific fields from the string
              const typeMatch = cartDataString.match(/'type':\s*'([^']+)'/);
              const nameMatch = cartDataString.match(/'name':\s*(['"])(.*?)\1/);
              const descriptionMatch = cartDataString.match(
                /'description':\s*'([^']*)'/
              );
              const priceMatch = cartDataString.match(/'price':\s*([\d.]+)/);
              const optionKeywordMatch = cartDataString.match(
                /'option_keyword':\s*'([^']+)'/
              );
              const optionNameMatch = cartDataString.match(
                /'option_name':\s*'([^']+)'/
              );
              const optionPriceMatch = cartDataString.match(
                /'option_price':\s*'([^']+)'/
              );

              // Construct the object manually
              const parsedCartData = {
                type: typeMatch ? typeMatch[1] : "",
                name: nameMatch ? nameMatch[2] : "",
                description: descriptionMatch ? descriptionMatch[1] : "",
                price: priceMatch ? priceMatch[1] : "",
                option_keyword: optionKeywordMatch
                  ? optionKeywordMatch[1]
                  : "",
                option_name: optionNameMatch ? optionNameMatch[1] : "",
                option_price: optionPriceMatch ? optionPriceMatch[1] : "",
              };

              console.log(parsedCartData)

              setCartCount(cartCount + 1);
              setCartData((prevCartData) => [
                ...prevCartData,
                {
                  ...parsedCartData,
                  count: selectedItemCount, // Default count for new cart items
                  optionList: selectedOptionListData
                },
              ]);

              console.log("Cart updated:", parsedCartData);
              setSelectedOptions([]);

              const messageText: MessageInterface = {
                content: "Added to cart successfully! Would you like to add more items or options?",
                role: "assistant",
              };
          
              setMessages((prevMessages) => [...prevMessages, messageText]);
              
              setOneOrderData("")
            }}
          >
            ${chunkTotalPrice.toFixed(2)}
          </Button>
        </Typography>
      </Box>
      {Object.entries(groupedData).map(([groupKey, groupItems]) => (
        <Box key={groupKey} sx={{ marginBottom: "20px" }}>
          {(groupKey !== "undefined") && (nameListData.length > 1) ? (
            <Typography
              variant="h6"
              sx={{
                marginBottom: "10px",
                backgroundColor: "#f5f5f5",
                padding: "10px",
                borderRadius: "5px",
              }}
            >
              <Chip
                icon={<LocalDining />}
                label={groupKey}
                size="medium"
                variant="outlined"
                color="success"
              ></Chip>
            </Typography>
          ) : (
            <div></div>
          )}
          <ImageList cols={4} style={{ padding: "8px" }}>
            {groupItems.map((item, index) => {
              const isSelected = selectedChunk === item.value; // Check if the name is selected
              return (
                <AmountItemButton
                  key={index}
                  text={getItemText(item)}
                  type={item.type}
                  value={item.value}
                  price={item.price}
                  description={item.description}
                  style={{
                    border: isSelected ? "2px solid #1976d2" : "none", // Highlight selected border
                    backgroundColor: isSelected ? "#e3f2fd" : "transparent", // Highlight selected background
                  }}
                  onClick={() => {
                    if (item.type === "option_name") {
                      let jsonString = item.value
                        .replace(/'/g, '"') // Naively replace all single quotes with double quotes
                        .replace(/(\bNone\b)/g, "null"); // Replace Python-style None with null
                      // Add additional validation for keys (ensure double quotes around keys)
                      jsonString = jsonString.replace(
                        /"(\w+)":/g,
                        (match, p1) => `"${p1}":`
                      );
                      // Parse JSON string
                      const itemData = JSON.parse(jsonString);
                      // Set the parsed data
                      setSelectedItemData(itemData);

                      handleDetailDialogOpen();
                    } else {
                      setSelectedChunk(item.value);
                      if (item.type === "name") {
                        setNameData(item.value);
                      }
                      const userMessage: MessageInterface = {
                        content: item.value, // Send the text of the item as the user's message
                        role: "user",
                      };
                      const backMessage: MessageInterface = {
                        content:
                          "type:" + typeData + "," + "name:" + item.value, // Send the text of the item as the user's message
                        role: "user",
                      };
                      handleSendMessage(backMessage, flag, false, false);
                      setMessages((prevMessage) => [
                        ...prevMessage,
                        userMessage,
                      ]);
                    }
                  }}
                />
              );
            })}
          </ImageList>
        </Box>
      ))}
      <Dialog fullWidth open={detailDialog} onClose={handleDetailDialogClose}>
        <DialogTitle
          style={{
            textAlign: "center",
            whiteSpace: "normal",
            wordBreak: "break-word",
            maxWidth: "fit-content",
          }}
        >
          Details
        </DialogTitle>
        <DialogContent>
          {selectedItemData ? (
            <div>
              <p>Type: {selectedItemData.type}</p>
              <p>Name: {selectedItemData.name}</p>
              <p>Price: {selectedItemData.price}</p>
              <p>Option Price: {selectedItemData.option_price}</p>
              <p>Option: {selectedItemData.option_keyword}</p>
              <p>Option Name: {selectedItemData.option_name}</p>
              <p>Description: {selectedItemData.description}</p>
            </div>
          ) : (
            <div></div>
          )}
        </DialogContent>
      </Dialog>
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
              <Button variant="contained" sx={{ margin: "10px" }}>
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
                color="success"
              >
                Change Amount
              </Button>
              <Button
                startIcon={<LoupeIcon />}
                onClick={handleContinueOrder}
                color="success"
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
            right: "50px",
          }}
        >
          <Fab color="success" aria-label="add" onClick={handleCartOpen}>
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
                title={item.name}
                price={item.price}
                count={item.count}
                optionList={item.optionList}
              />
            ))}
          </List>

          <AppBar
            position="absolute"
            color="success"
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
