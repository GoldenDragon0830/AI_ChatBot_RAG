import React from 'react';
import {
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
  Grid,
} from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';

const AppointmentForm = () => {
  return (
    <Box sx={{ p: 3, bgcolor: 'white', borderRadius: 2, boxShadow: 3, maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: '#73AD21' }}>
        Request an Appointment
      </Typography>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Grid container spacing={2}>
            {/* Form Fields */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <FormLabel>Which doctor would you like to see?</FormLabel>
                <Select defaultValue="">
                  <MenuItem value="">Choose one</MenuItem>
                  <MenuItem value="Dr. Robert Rozbruch">Dr. Robert Rozbruch</MenuItem>
                  <MenuItem value="Dr. Austin Fragomen">Dr. Austin Fragomen</MenuItem>
                  <MenuItem value="Dr. Taylor Reif">Dr. Taylor Reif</MenuItem>
                  <MenuItem value="Dr. Jason Hoellwarth">Dr. Jason Hoellwarth</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Patient Condition</FormLabel>
                <FormGroup row>
                  <FormControlLabel control={<Checkbox />} label="Bowleg" />
                  <FormControlLabel control={<Checkbox />} label="Knock Knee" />
                  <FormControlLabel control={<Checkbox />} label="Osseointegration" />
                  <FormControlLabel control={<Checkbox />} label="Leg Length Discrepancy" />
                  <FormControlLabel control={<Checkbox />} label="Arm or Wrist" />
                  <FormControlLabel control={<Checkbox />} label="Foot or Ankle" />
                  <FormControlLabel control={<Checkbox />} label="Other/Something Else" />
                  <FormControlLabel control={<Checkbox />} label="I Don't Know" />
                </FormGroup>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Patient Interest</FormLabel>
                <FormGroup row>
                  <FormControlLabel control={<Checkbox />} label="Appointment" />
                  <FormControlLabel control={<Checkbox />} label="Consultation" />
                  <FormControlLabel control={<Checkbox />} label="Surgery" />
                  <FormControlLabel control={<Checkbox />} label="I Don't Know" />
                </FormGroup>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <FormLabel>Patient Preference</FormLabel>
                <Select defaultValue="">
                  <MenuItem value="">Choose one</MenuItem>
                  <MenuItem value="person">In person</MenuItem>
                  <MenuItem value="virtual">Virtual</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="First Name" />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Last Name" />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Email" />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Phone" />
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
                phone: "347-808-4739",
                emails: ["deano@hss.edu", "morar@hss.edu"],
              },
              {
                name: "Dr. Austin Fragomen",
                phone: "347-763-6079",
                emails: ["fragomena@hss.edu"],
              },
              {
                name: "Dr. Taylor Reif",
                phone: "347-472-1110",
                emails: ["Robertsonsh@hss.edu"],
              },
              {
                name: "Dr. Jason Hoellwarth",
                phone: "213-652-9630",
                emails: ["hoellwarthj@HSS.EDU"],
              },
            ].map((doctor, index) => (
              <Box key={index} sx={{ mb: 3, p: 2, border: '1px solid #ddd', borderRadius: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{doctor.name}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <PhoneIcon sx={{ mr: 1, color: '#73AD21' }} />
                  <Typography>{doctor.phone}</Typography>
                </Box>
                {doctor.emails.map((email, idx) => (
                  <Box key={idx} sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <EmailIcon sx={{ mr: 1, color: '#73AD21' }} />
                    <Typography>{email}</Typography>
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AppointmentForm;