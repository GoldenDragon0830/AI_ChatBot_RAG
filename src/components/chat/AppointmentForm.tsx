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
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
  Grid,
} from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';

const EMAIL_SERVICE_ID = "service_zeoucv3"
const EMAIL_TEMPLATE_ID = "template_qa57d3p"
const EMAIL_USER_PUBLIC_KEY = "zLRxsQKdzbmCEjQfx"

const AppointmentForm = () => {

  const [formData, setFormData] = useState({
     doctor: '',
     patientCondition: [],
     patientInterest: [],
     patientPreference: '',
     firstName: '',
     lastName: '',
     email: '',
     phone: ''
  });

  const sendEmail = (formData: any) => {
    const templateParams = {
      doctor: formData.doctor,
      patientCondition: formData.patientCondition,
      patientInterest: formData.patientInterest,
      patientPreference: formData.patientPreference,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone
    };

    emailjs.send(EMAIL_SERVICE_ID, EMAIL_TEMPLATE_ID, templateParams, EMAIL_USER_PUBLIC_KEY)
      .then((response) => {
        console.log('SUCCESS!', response.status, response.text);
      }, (error) => {
        console.log('FAILED...', error);
      });
  }

  const handleInputChange = (e: any) => {
    const { name, value, checked, type } = e.target;

    if (type === 'checkbox') {
      setFormData((prevState : any) => {
        const currentArray = prevState[name];
        if (checked) {
          return {
            ...prevState,
            [name]: [...currentArray, value],
          };
        } else {
          return {
            ...prevState,
            [name]: currentArray.filter((item: string) => item !== value),
          };
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };


  const handleSubmit = (e: any) => {
    e.preventDefault();
    sendEmail(formData);
  };

  return (
    <Box sx={{ p: 3, bgcolor: 'white', borderRadius: 2, boxShadow: 3, maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: '#73AD21' }}>
        Request an Appointment
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Grid container spacing={2}>
              {/* Form Fields */}
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <FormLabel>Which doctor would you like to see?</FormLabel>
                  <Select 
                    name='doctor'
                    defaultValue=""
                    value={formData.doctor}
                    onChange={handleInputChange}
                    >
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
                    <FormControlLabel
                      control={<Checkbox name="patientCondition" value="Bowleg" onChange={handleInputChange} />}
                      label="Bowleg"
                    />
                    <FormControlLabel
                      control={<Checkbox name="patientCondition" value="Knock Knee" onChange={handleInputChange} />}
                      label="Knock Knee"
                    />
                    <FormControlLabel
                      control={<Checkbox name="patientCondition" value="Osseointegration" onChange={handleInputChange} />}
                      label="Osseointegration"
                    />
                    <FormControlLabel
                      control={<Checkbox name="patientCondition" value="Leg Length Discrepancy" onChange={handleInputChange} />}
                      label="Leg Length Discrepancy"
                    />
                    <FormControlLabel
                      control={<Checkbox name="patientCondition" value="Arm or Wrist" onChange={handleInputChange} />}
                      label="Arm or Wrist"
                    />
                    <FormControlLabel
                      control={<Checkbox name="patientCondition" value="Foot or Ankle" onChange={handleInputChange} />}
                      label="Foot or Ankle"
                    />
                    <FormControlLabel
                      control={<Checkbox name="patientCondition" value="Other/Something Else" onChange={handleInputChange} />}
                      label="Other/Something Else"
                    />
                    <FormControlLabel
                      control={<Checkbox name="patientCondition" value="I Don't Know" onChange={handleInputChange} />}
                      label="I Don't Know"
                    />
                  </FormGroup>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">Patient Interest</FormLabel>
                  <FormGroup row>
                    <FormControlLabel
                      control={<Checkbox name="patientInterest" value="Appointment" onChange={handleInputChange} />}
                      label="Appointment"
                    />
                    <FormControlLabel
                      control={<Checkbox name="patientInterest" value="Consultation" onChange={handleInputChange} />}
                      label="Consultation"
                    />
                    <FormControlLabel
                      control={<Checkbox name="patientInterest" value="Surgery" onChange={handleInputChange} />}
                      label="Surgery"
                    />
                    <FormControlLabel
                      control={<Checkbox name="patientInterest" value="I Don't Know" onChange={handleInputChange} />}
                      label="I Don't Know"
                    />
                  </FormGroup>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <FormLabel>Patient Preference</FormLabel>
                  <Select 
                    defaultValue=""
                    name='patientPreference'
                    onChange={handleInputChange}
                    value={formData.patientPreference}
                    >
                    <MenuItem value="">Choose one</MenuItem>
                    <MenuItem value="person">In person</MenuItem>
                    <MenuItem value="virtual">Virtual</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="First Name"  name='firstName' value={formData.firstName} onChange={handleInputChange}/>
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="Last Name" name='lastName' value={formData.lastName} onChange={handleInputChange}/>
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Email" name='email' value={formData.email} onChange={handleInputChange} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Phone" name='phone' value={formData.phone} onChange={handleInputChange}/>
              </Grid>
              <Grid item xs={12}>
                <Button type='submit' variant="contained" color="success" fullWidth>
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
      </form>
    </Box>
  );
};

export default AppointmentForm;