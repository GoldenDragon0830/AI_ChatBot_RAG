import React from 'react';
import {
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  FormLabel,
  Typography,
  Grid,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';

const ContactForm = () => {
  return (
    <Box sx={{ p: 3, bgcolor: 'white', borderRadius: 2, boxShadow: 3, maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: '#73AD21' }}>
        Have a Question?
      </Typography>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <FormLabel>Which doctor would you like to contact?</FormLabel>
                <Select defaultValue="">
                  <MenuItem value="">Choose One</MenuItem>
                  <MenuItem value="Dr. Robert Rozbruch">Dr. Robert Rozbruch</MenuItem>
                  <MenuItem value="Dr. Austin Fragomen">Dr. Austin Fragomen</MenuItem>
                  <MenuItem value="Dr. Taylor Reif">Dr. Taylor Reif</MenuItem>
                  <MenuItem value="Dr. Jason Hoellwarth">Dr. Jason Hoellwarth</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="First Name" required />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Last Name" required />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Email" required />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Subject" required />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Message" multiline rows={4} required />
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" color="success" fullWidth>
                Submit
              </Button>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box sx={{ pl: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Contact Information</Typography>
            {[
              {
                name: "Dr. Robert Rozbruch",
                email: "rozbruchsr@hss.edu",
              },
              {
                name: "Dr. Austin Fragomen",
                email: "fragomena@hss.edu",
              },
              {
                name: "Dr. Taylor Reif",
                email: "reift@hss.edu",
              },
              {
                name: "Dr. Jason Hoellwarth",
                email: "hoellwarthj@hss.edu",
              },
            ].map((doctor, index) => (
              <Box key={index} sx={{ mb: 3, p: 2, border: '1px solid #ddd', borderRadius: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{doctor.name}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <EmailIcon sx={{ mr: 1, color: '#73AD21' }} />
                  <Typography>{doctor.email}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ContactForm;