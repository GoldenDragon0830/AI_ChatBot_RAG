import React, { useState } from 'react';
import emailjs from 'emailjs-com';

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
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';

const EMAIL_SERVICE_ID = "service_zeoucv3"
const EMAIL_TEMPLATE_ID = "template_qiuegmp"
const EMAIL_USER_PUBLIC_KEY = "zLRxsQKdzbmCEjQfx"

const ContactForm = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    doctor: '',
    email: '',
    subject: '',
    message: ''
  });

  const [emailSent, setEmailSent] = useState(false); // State to track email sent status
  const [notificationOpen, setNotificationOpen] = useState(false); // State to manage notification visibility
  const [loading, setLoading] = useState(false); 


  const sendEmail = (formData: any) => {
    setLoading(true)
    const templateParams = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      doctor: formData.doctor,
      email: formData.email,
      subject: formData.subject,
      message: formData.message
    };

    emailjs.send(EMAIL_SERVICE_ID, EMAIL_TEMPLATE_ID, templateParams, EMAIL_USER_PUBLIC_KEY)
      .then((response) => {
        console.log('SUCCESS!', response.status, response.text);
        setEmailSent(true);
        setNotificationOpen(true);
      }, (error) => {
        console.log('FAILED...', error);
      })
      .finally(() => {
        setLoading(false);
      });;
  }

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };


  const handleSubmit = (e: any) => {
    e.preventDefault();
    sendEmail(formData);
  };

  const handleNotificationClose = () => {
    setNotificationOpen(false);
  }

  return (
    <Box sx={{ p: 3, bgcolor: 'white', borderRadius: 2, boxShadow: 3, maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: '#73AD21' }}>
        Have a Question?
      </Typography>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={12}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <FormLabel>Which doctor would you like to contact?</FormLabel>
                  <Select
                    name="doctor"
                    value={formData.doctor}
                    onChange={handleInputChange}
                    defaultValue=""
                    color='success'
                  >
                    <MenuItem value="">Choose One</MenuItem>
                    <MenuItem value="Dr. Robert Rozbruch">Dr. Robert Rozbruch</MenuItem>
                    <MenuItem value="Dr. Austin Fragomen">Dr. Austin Fragomen</MenuItem>
                    <MenuItem value="Dr. Taylor Reif">Dr. Taylor Reif</MenuItem>
                    <MenuItem value="Dr. Jason Hoellwarth">Dr. Jason Hoellwarth</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField color='success' fullWidth label="First Name" required name='firstName' value={formData.firstName} onChange={handleInputChange}/>
              </Grid>
              <Grid item xs={6}>
                <TextField color='success' fullWidth label="Last Name" required name='lastName' value={formData.lastName} onChange={handleInputChange}/>
              </Grid>
              <Grid item xs={12}>
                <TextField color='success' fullWidth label="Email" required name='email' value={formData.email} onChange={handleInputChange}/>
              </Grid>
              <Grid item xs={12}>
                <TextField color='success' fullWidth label="Subject" required name='subject' value={formData.subject} onChange={handleInputChange}/>
              </Grid>
              <Grid item xs={12}>
                <TextField color='success' fullWidth label="Message" multiline rows={4} required name='message' value={formData.message} onChange={handleInputChange}/>
              </Grid>
              <Grid item xs={12}>
                <Button
                  type='submit'
                  variant="contained"
                  color="success"
                  fullWidth
                  disabled={emailSent || loading}
                  startIcon={loading ? <CircularProgress size={20} /> : null} // Display loading icon
                >
                  {loading ? 'Sending...' : 'Submit'}
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </form>
      <Snackbar
        open={notificationOpen}
        autoHideDuration={6000}
        onClose={handleNotificationClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }} // Positioning the Snackbar
      >
        <Alert onClose={handleNotificationClose} severity="success" sx={{ width: '100%' }}>
          Email sent successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ContactForm;