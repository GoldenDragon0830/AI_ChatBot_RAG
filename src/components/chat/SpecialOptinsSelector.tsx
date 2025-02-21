// SpecialOptionsSelector.tsx
import React from 'react';
import { Box, Button, IconButton, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

interface SpecialOptionsSelectorProps {
  options: string[];
  selectedOption: string;
  setSelectedOption: (option: string) => void;
  itemCount: number;
  setItemCount: (count: number) => void;
}

const SpecialOptionsSelector: React.FC<SpecialOptionsSelectorProps> = ({
  options,
  selectedOption,
  setSelectedOption,
  itemCount,
  setItemCount,
}) => {
  const handleIncrease = () => {
    setItemCount(itemCount + 1);
  };

  const handleDecrease = () => {
    setItemCount(Math.max(1, itemCount - 1));
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: '10px',
      }}
    >
      <Box sx={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
        {options.map((option) => (
          <Button
            key={option}
            variant={selectedOption === option ? 'contained' : 'outlined'}
            color="success"
            onClick={() => setSelectedOption(option)}
            sx={{
              textTransform: 'capitalize',
              fontWeight: selectedOption === option ? 'bold' : 'normal',
            }}
          >
            {option}
          </Button>
        ))}
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <IconButton onClick={handleDecrease}>
          <RemoveIcon />
        </IconButton>
        <Typography>
          {selectedOption} X {itemCount}
        </Typography>
        <IconButton onClick={handleIncrease}>
          <AddIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default SpecialOptionsSelector;