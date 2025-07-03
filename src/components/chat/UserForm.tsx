import React, { useState } from 'react';
import {
  Box,
  TextField,
  Typography,
  Paper,
  Button,
} from '@mui/material';

interface UserFormProps {
  onSubmit: (formData: { name: string; email: string; question: string }) => void;
}

const UserForm: React.FC<UserFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    question: ''
  });

  const handleInputChange = (field: keyof typeof formData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (formData.name && formData.email && formData.question) {
      onSubmit(formData);
    }
  };

  return (
    <Paper
      elevation={2}
      sx={{
        position: "fixed",
        bottom: 0,
        width: "-webkit-fill-available",
        mr: 2,
        p: 3,
        mb: 2,
        borderRadius: 2,
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        border: '1px solid #e0e0e0'
      }}
    >
      <Typography
        variant="h6"
        sx={{
          mb: 2,
          fontWeight: 600,
          color: '#333',
          textAlign: 'center'
        }}
      >
        Tell us about yourself
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Name"
          variant="outlined"
          value={formData.name}
          onChange={handleInputChange('name')}
          required
          fullWidth
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              '&:hover fieldset': {
                borderColor: '#73AD21',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#73AD21',
              },
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: '#73AD21',
            },
          }}
        />
        
        <TextField
          label="Email"
          type="email"
          variant="outlined"
          value={formData.email}
          onChange={handleInputChange('email')}
          required
          fullWidth
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              '&:hover fieldset': {
                borderColor: '#73AD21',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#73AD21',
              },
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: '#73AD21',
            },
          }}
        />
        
        <TextField
          label="Question"
          variant="outlined"
          multiline
          rows={3}
          value={formData.question}
          onChange={handleInputChange('question')}
          required
          fullWidth
          placeholder="What would you like to know?"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              '&:hover fieldset': {
                borderColor: '#73AD21',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#73AD21',
              },
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: '#73AD21',
            },
          }}
        />
        
        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{
            mt: 1,
            background: '#73AD21',
            color: 'white',
            fontWeight: 600,
            borderRadius: 2,
            py: 1.5,
            fontSize: '1.1rem',
            textTransform: 'none',
            '&:hover': {
              background: '#5e8e1e',
            },
          }}
        >
          Start Chat
        </Button>
      </Box>
    </Paper>
  );
};

export default UserForm; 