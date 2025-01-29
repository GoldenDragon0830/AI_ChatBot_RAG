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
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';

import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import { green, red } from "@mui/material/colors";
import { CheckBox, Description, LocalDining } from "@mui/icons-material";

const label = { inputProps: { "aria-label": "Checkbox demo" } };

const displayOptionSoup = ["Beef Dumplings","Egg Drop Soup", "Hot And Sour Soup", "Thai Chicken Noodle Soup", "Tofu Vegetable Soup"];
const displayOptionContinue = ["Subgum Wonton Soup", "Wonton Soup", "Egg Drop Wonton Soup"];
const displayOptionDish = ["Fried Rice", "Lo-mein", "Chow Fun", "Mei Fun", "Thai Fried Rice",  ]; // small, large

const displayOptionChinaDish = ["With Broccoli", "With Eggplants", "With Mixed Vegetables", "Moo Shoo Style", "Steamed Chicken With Mixed Vegetables S", "Pepper Steak S", "Sichuan S", "Hunan Style S", "With String Beans in Garlic Sauce S", "With Mushrooms S",]; // small, large

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

const drawerWidth = 1300;

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

  const API_URL = "http://85.209.93.93:4002/chat";
  const API_GET_FROM_DB_URL = "http://85.209.93.93:4002/get_db_data";
  const API_CHAT_VIA_INPUT_URL = "http://85.209.93.93:4002/chat_via_input";

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
  const [selectedChunkData, setSelectedChunkData] = useState<ChunkOption>()

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
                <Typography variant="body2" color="secondary" component="span" >
                  ${price}
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", marginTop: 1 }}>
                  {chunkArray(optionList, 3).map((row, rowIndex) => (
                    <Box key={rowIndex} sx={{ display: "flex", flexDirection: "row", marginBottom: "4px" }}>
                      {row.map((option, index) => (
                        <Chip
                          key={index}
                          label={option}
                          size="small"
                          sx={{
                            marginLeft: index === 0 ? 0 : "2px", // Add spacing only for chips after the first one
                            color: "#73AD21", // Custom text color
                            borderColor: "#73AD21", // Custom border color
                            "& .MuiChip-label": {
                              fontWeight: "bold", // Optional: Make the label bold
                            },
                            "&:hover": {
                              backgroundColor: "#73AD21", // Optional: Add a hover effect with a lighter green
                            },
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
      if (displayOptionSoup.includes(text) || displayOptionContinue.includes(text) || displayOptionDish.includes(text) || displayOptionChinaDish.includes(text)) {
        setItemCount((prev) => ({
          ...prev,
          [optionKey]: (prev[optionKey] || 0) + 1,
        }));
      } else {
        setGeneralCount((prev) => prev + 1); // Increment count for non-displayOptionSoup
      }
    };
  
    const handleDecrease = (optionKey: string) => {
      if (displayOptionSoup.includes(text) || displayOptionContinue.includes(text) || displayOptionDish.includes(text) || displayOptionChinaDish.includes(text)) {
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
        if (displayOptionSoup.includes(text) || displayOptionContinue.includes(text) || displayOptionDish.includes(text) || displayOptionChinaDish.includes(text)) {
          const optionToAdd = selectedOption === "Option 1" ? (displayOptionDish.includes(text) ? "Small" : text === "Beef Dumplings" ? "Steamed" : "Pint") : (displayOptionDish.includes(text) ? "Large" : text === "Beef Dumplings" ? "Fried" : "Quart");
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
            marginLeft: "20px",
            marginBottom: "20px",
            cursor: "pointer",
            backgroundColor: selectedOptionListData.includes(text) ? "#F1F7E9" : "white",
            transition: "background-color 0.3s ease-in-out",
            border: "1px solid",
            borderColor: "#73AD21",
            borderRadius: "20px"
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
              console.log(text)
              if (type === "option_name") {
                setSelectedOptionListData((prevOptions) => {
                  if (prevOptions.includes(text)) {
                    return prevOptions.filter((option) => option !== text);
                  } else {
                    return [...prevOptions, text];
                  }
                });
              } else if (!displayOptionSoup.includes(text) && !displayOptionContinue.includes(text) && !displayOptionDish.includes(text) && !displayOptionChinaDish.includes(text)) {
                onClick();
              }
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: "bold",
                color: "block",
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
            <Box sx={{ display: "flex", marginBottom: "-20px", gap: 1, height: "30px" }}>
              {displayOptionSoup.includes(text) || displayOptionContinue.includes(text) || displayOptionDish.includes(text) || displayOptionChinaDish.includes(text) ? (
                <div>
                  {/* Badge for Option 1 */}                    
                    <Badge
                      badgeContent={itemCount["Option 1"] || 0} // Dynamically display the count for Option 1
                      sx={{
                        "& .MuiBadge-badge": {
                          backgroundColor: "#FF3B30", // Set the badge background color
                          color: "white", // Set the badge text color (optional)
                          border: "2px solid #FF3B30", // Optional: Add a border matching the color
                        }
                      }}
                    >
                      <Chip
                        sx={{
                          color: `${selectedOption === "Option 1" ? "#73AD21" : "#BABABA"}`, // Custom text color
                          borderColor: `${selectedOption === "Option 1" ? "#73AD21" : "#BABABA"}`, // Custom border color
                          "& .MuiChip-label": {
                            fontWeight: "bold", // Optional: Make the label bold
                          },
                          "&:hover": {
                            backgroundColor: `${selectedOption === "Option 1" ? "#73AD21" : "#BABABA"}`, // Optional: Add a hover effect with a lighter green
                          },
                          marginRight: "5px",
                          fontSize: "14px"
                        }}
                        size="small"
                        label={(displayOptionSoup.includes(text) || displayOptionContinue.includes(text)) ? (text === "Beef Dumplings" ? "Steamed" : "Pint $5") : displayOptionDish.includes(text) ? "Small $9" : displayOptionChinaDish.includes(text) ? "Small $18" : undefined}
                        variant="outlined"
                        onClick={() => handleSelectOption("Option 1")}
                      />
                    </Badge>
                    {/* Badge for Option 2 */}
                    <Badge
                      badgeContent={itemCount["Option 2"] || 0} // Dynamically display the count for Option 2
                      sx={{
                        "& .MuiBadge-badge": {
                          backgroundColor: "#FF3B30", // Set the badge background color
                          color: "white", // Set the badge text color (optional)
                          border: "2px solid #FF3B30", // Optional: Add a border matching the color
                        }
                      }}
                    >
                      <Chip
                        sx={{
                          color: `${selectedOption === "Option 2" ? "#73AD21" : "#BABABA"}`, // Custom text color
                          borderColor: `${selectedOption === "Option 2" ? "#73AD21" : "#BABABA"}`, // Custom border color
                          "& .MuiChip-label": {
                            fontWeight: "bold", // Optional: Make the label bold
                          },
                          "&:hover": {
                            backgroundColor: `${selectedOption === "Option 2" ? "#73AD21" : "#BABABA"}`, // Optional: Add a hover effect with a lighter green
                          },
                          marginRight: "5px",
                          fontSize: "14px"
                        }}
                        size="small"
                        label={(displayOptionSoup.includes(text) || displayOptionContinue.includes(text)) ? (text === "Beef Dumplings" ? "Fried" : "Quart $10") : displayOptionDish.includes(text) ? "Large $16" : displayOptionChinaDish.includes(text) ? "Large $24" : undefined}
                        variant="outlined"
                        onClick={() => handleSelectOption("Option 2")}
                      />
                    </Badge>
                    {
                      !displayOptionSoup.includes(text) ? (
                        <Chip
                          color="info"
                          size="small"
                          label="More.."
                          variant="outlined"
                          onClick={onClick}
                        />
                      ) : null
                    }
                </div>
              ) : (
                null
              )}
            </Box>
          </CardContent>
          <CardActions
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
            disableSpacing
          >
            <Typography variant="body2" style={{ color: "#73AD21", fontSize: "19px", fontWeight: "bold", marginLeft: "10px" }}>
              {"$" + parseFloat(price)}
            </Typography>
            {type === "name" && (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      border: "1px, solid",
                      borderRadius: "10px",
                      borderColor: "#BABABA"
                    }}
                  >
                                    <IconButton
                    size="small"
                    color="inherit"
                    onClick={() =>
                      displayOptionSoup.includes(text) || displayOptionContinue.includes(text) || displayOptionDish.includes(text) ||displayOptionChinaDish.includes(text)
                        ? handleDecrease(selectedOption || "Option 1")
                        : handleDecrease("")
                    }
                  >
                    <RemoveIcon fontSize="small" />
                  </IconButton>
                  <Typography>
                    {displayOptionSoup.includes(text) || displayOptionContinue.includes(text) || displayOptionDish.includes(text) || displayOptionChinaDish.includes(text)
                      ? itemCount[selectedOption || "Option 1"] || 0
                      : generalCount}
                  </Typography>
                  <IconButton
                    size="small"
                    color="inherit"
                    onClick={() =>
                      displayOptionSoup.includes(text) || displayOptionContinue.includes(text) || displayOptionDish.includes(text) || displayOptionChinaDish.includes(text)
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

  const MenuIcon = ({ color }: { color: string }) => {
    return (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="26" height="26" fill="white" fill-opacity="0.01"/>
        <path d="M16.7406 14.8375H6.37188C6.74688 14.6172 7.14063 14.3969 7.60001 14.2844C7.90938 14.2094 8.27501 14.2047 8.66407 14.2C8.95938 14.1953 9.26407 14.1906 9.57813 14.1578C9.86407 14.1297 10.1453 14.0688 10.4172 14.0125C10.8063 13.9281 11.1766 13.8531 11.5469 13.8531C11.9172 13.8531 12.2875 13.9328 12.6813 14.0125C12.9531 14.0688 13.2391 14.1297 13.5203 14.1578C13.8344 14.1906 14.1391 14.1953 14.4344 14.2C14.8234 14.2047 15.1938 14.2094 15.4984 14.2844C15.9719 14.4016 16.3656 14.6219 16.7406 14.8375ZM4.84844 17.2891H18.2641C18.0203 20.6781 15.1047 23.3594 11.5563 23.3594C8.01251 23.3594 5.09688 20.6781 4.84844 17.2891ZM19.2625 16.0516V16.075C19.2625 16.2297 19.1359 16.3516 18.9859 16.3516H4.12657C3.97188 16.3516 3.85001 16.225 3.85001 16.075V16.0516C3.85001 15.8969 3.97657 15.775 4.12657 15.775H18.9859C19.1406 15.775 19.2625 15.9016 19.2625 16.0516ZM22.15 7.46875C22.1406 7.21562 22.0094 6.99531 21.7891 6.87344L14.4203 2.73438C14.3078 2.67344 14.1906 2.64062 14.0734 2.64062C13.9563 2.64062 13.8438 2.66875 13.7359 2.72969C13.5156 2.84688 13.3797 3.05781 13.3609 3.30625L12.6578 13.0516C12.7328 13.0656 12.8078 13.0844 12.8828 13.0984C13.1453 13.1547 13.3938 13.2062 13.6281 13.2297C13.7406 13.2391 13.8578 13.2484 13.9703 13.2531L21.8266 8.0875C22.0422 7.95156 22.1594 7.72656 22.15 7.46875ZM14.1719 12.2828C14.0922 12.3344 14.0031 12.3578 13.9141 12.3578C13.7641 12.3578 13.6141 12.2828 13.525 12.1469C13.3844 11.9313 13.4406 11.6406 13.6609 11.5C13.8766 11.3594 14.1672 11.4156 14.3078 11.6359C14.4438 11.8516 14.3875 12.1422 14.1719 12.2828ZM14.5656 9.32969C14.5469 9.57812 14.3406 9.76562 14.0969 9.76562H14.0641C13.8063 9.74687 13.6141 9.52188 13.6328 9.26406C13.6516 9.00625 13.8766 8.81406 14.1344 8.83281C14.3922 8.85156 14.5844 9.07187 14.5656 9.32969ZM14.7531 6.7375C14.7344 6.98594 14.5281 7.17344 14.2844 7.17344H14.2516C13.9938 7.15469 13.8016 6.92969 13.8203 6.67188C13.8391 6.41406 14.0641 6.22188 14.3219 6.24063C14.5797 6.25469 14.7719 6.47969 14.7531 6.7375ZM14.8844 4.3375C14.8 4.49219 14.6406 4.57656 14.4766 4.57656C14.3969 4.57656 14.3219 4.55781 14.2469 4.51562C14.0219 4.38906 13.9422 4.10313 14.0688 3.87813C14.1953 3.65313 14.4813 3.57344 14.7063 3.7C14.9313 3.82656 15.0109 4.1125 14.8844 4.3375ZM16.3844 10.8297C16.3047 10.8812 16.2156 10.9047 16.1266 10.9047C15.9766 10.9047 15.8266 10.8297 15.7375 10.6938C15.5969 10.4781 15.6531 10.1875 15.8734 10.0469C16.0891 9.90625 16.3797 9.9625 16.5203 10.1828C16.6609 10.3937 16.6 10.6844 16.3844 10.8297ZM16.5156 8.07344C16.4359 8.125 16.3469 8.14844 16.2578 8.14844C16.1078 8.14844 15.9578 8.07344 15.8641 7.9375C15.7234 7.72188 15.7844 7.43125 16 7.29062C16.2156 7.15 16.5063 7.21094 16.6469 7.42656C16.7922 7.64219 16.7313 7.93281 16.5156 8.07344ZM16.9094 5.47656C16.825 5.63125 16.6656 5.71562 16.5016 5.71562C16.4219 5.71562 16.3469 5.69688 16.2719 5.65469C16.0469 5.52813 15.9672 5.24219 16.0938 5.01719C16.2203 4.79219 16.5063 4.7125 16.7313 4.83906C16.9563 4.96563 17.0359 5.25156 16.9094 5.47656ZM18.6016 9.37188C18.5219 9.42344 18.4328 9.44687 18.3438 9.44687C18.1938 9.44687 18.0438 9.37187 17.95 9.23594C17.8094 9.02031 17.8703 8.72969 18.0859 8.58906C18.3016 8.44844 18.5922 8.50938 18.7328 8.725C18.8734 8.94063 18.8172 9.23125 18.6016 9.37188ZM18.9391 6.61563C18.8547 6.77031 18.6953 6.85469 18.5313 6.85469C18.4516 6.85469 18.3766 6.83594 18.3016 6.79375C18.0766 6.66719 17.9969 6.38125 18.1234 6.15625C18.25 5.93125 18.5359 5.85156 18.7609 5.97812C18.9859 6.10469 19.0656 6.39063 18.9391 6.61563ZM20.9641 7.75469C20.8797 7.90938 20.7203 7.99375 20.5563 7.99375C20.4766 7.99375 20.4016 7.975 20.3266 7.93281C20.1016 7.80625 20.0219 7.52031 20.1484 7.29531C20.275 7.07031 20.5609 6.99062 20.7859 7.11719C21.0109 7.24375 21.0906 7.52969 20.9641 7.75469Z" fill={color}/>
        
      </svg>
    )
  }

  const drawer = (
    <div>
      <Divider />
      <Paper
        sx={{
          height: "100px",
          display: "flex",
          backgroundColor: 'white',
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
                color: `${selectedChip === title ? "#FFFFFF" : "#BABABA"}`,
                backgroundColor: `${selectedChip === title ? "#73AD21" : "#FFFFFF"}`,
                fontWeight: `${selectedChip === title ? "bold" : "normal"}`, // Add this line
                fontSize: "15px"
              }}
              icon={
                <MenuIcon
                  color={selectedChip === title ? "#FFFFFF" : "#BABABA"} // Pass color dynamically
                />
              }
              variant={selectedChip === title ? "filled" : "outlined"} // Change variant when selected
              key={index}
              onClick={() => {
                setSelectedOptionListData([]);
                setChunkTotalPrice(0);
                setSelectedChunkData(undefined);
                setTotalPrice("");
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
              label={title}
            >
            </Chip>
          );
        })}
      </Paper>
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
              startIcon={<ArrowBackIosIcon />}
              sx={{
                marginLeft: "30px",
                marginTop: "10px",
                marginBottom: "10px",
                width: "100px",
                color: "black"
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
                    color: `${selectedNameChip === item.value ? "#FFFFFF" : "#BABABA"}`,
                    backgroundColor: `${selectedNameChip === item.value ? "#73AD21" : "#FFFFFF"}`,
                    fontWeight: `${selectedNameChip === item.value ? "bold" : "normal"}`, // Add this line
                    fontSize: "14px"
                  }}
                  variant="outlined"
                  label={item.value}
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
                >
                </Chip>
              );
            })}
            <Button
              variant="outlined"
              color="success"
              sx={{
                color: "#73AD21",
                marginLeft: "auto",
                fontSize: "16px",
                fontWeight: "bold",
                border: "1px solid",
                borderColor: "#73AD21",
              }}
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
              ${((parseFloat(selectedChunkData?.price ?? '0') || 0) + chunkTotalPrice).toFixed(2)}
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
                    backgroundColor: isSelected ? "#e3f2fd" : "white", // Highlight selected background
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
                      setSelectedChunkData(item);
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
    <Box sx={{ display: "flex" }} >
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
          paddingBottom: "100px",
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
        
      >
        <div
          style={{
            height: "80vh",
            maxHeight: "950px",
            overflowY: "auto",
            padding: "10px",
            position: "relative",
          }}
          ref={containerRef}
        >
          {messages.map((message, index) => (
            <ChatMessage key={index} {...message} />
          ))}
          
          <ChatInput
            onSendMessage={(message) =>
              handleSendMessageViaInput(message.content, flag)
            }
          />
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
          badgeContent={cartCount}
          sx={{
            "& .MuiBadge-badge": {
              backgroundColor: "#FF3B30", // Set the badge background color
              color: "white", // Set the badge text color (optional)
              border: "2px solid #FF3B30", // Optional: Add a border matching the color
            },
            position: "fixed",
            bottom: "150px",
            right: "50px",
          }}
        >
          <Fab
            sx={{ backgroundColor: "#73AD21" }}
            aria-label="add"
            onClick={handleCartOpen}
          >
            <AddShoppingCartIcon sx={{ color: "white" }} />
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
            sx={{
              display: "flex",
              top: "auto",
              height: "50px",
              bottom: 0,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#73AD21"
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
