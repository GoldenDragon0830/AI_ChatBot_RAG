import React, { useState, useRef, useEffect } from "react";
import { Typography, Box, IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

// New component for handling Pint and Quart options
const PintQuartSelector: React.FC<{
  options: string[];
  selectedOption: string;
  setSelectedOption: (option: string) => void;
  itemCount: number;
  setItemCount: (count: number) => void;
}> = ({ options, selectedOption, setSelectedOption, itemCount, setItemCount }) => {
  console.log(selectedOption)
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: "10px",
      }}
    >
      {options.map((option) => (
        <Typography
          key={option}
          sx={{
            fontWeight: selectedOption === option ? "bold" : "normal",
            color: selectedOption === option ? "green" : "gray",
            cursor: "pointer",
            marginRight: "10px",
          }}
          onClick={() => setSelectedOption(option)}
        >
          {option}
        </Typography>
      ))}
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            setItemCount(Math.max(1, itemCount - 1));
          }}
        >
          <RemoveIcon fontSize="small" />
        </IconButton>
        <Typography>{itemCount}</Typography>
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            setItemCount(itemCount + 1);
          }}
        >
          <AddIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
};

export default PintQuartSelector