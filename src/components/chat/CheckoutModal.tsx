import { FC, useState } from "react";
import {
    Modal, IconButton,
  Dialog, InputAdornment, DialogContent, TextField, Button, 
  FormControl, InputLabel, MenuItem, Select, Autocomplete, 
  Checkbox, FormControlLabel, Grid, Typography, Link, Box, 
  Card
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";

interface ModalProps {
  open: boolean;
  onClose: () => void;
}

const countryOptions = ["United States", "Canada", "United Kingdom"];
const stateOptions = ["California", "Texas", "New York", "Florida"];
const addressSuggestions = ["123 Main St", "456 Elm St", "789 Oak St"];
const apartmentSuggestions = ["Apt 101", "Suite 202", "Floor 3"];

const CheckoutModal: FC<ModalProps> = ({ open, onClose }) => {
  const [country, setCountry] = useState<string>("United States");
  const [state, setState] = useState<string>("");

  return (
    <Modal open={open} onClose={onClose}>
        <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="100vh"
            bgcolor="rgba(0, 0, 0, 0.5)"
            sx={{flexDirection: "column"}}
        >
            <Card sx={{ width: '90%', maxWidth: 600, p: 3, position: 'relative', borderRadius: 3 }}>
                {/* Modal Header */}
                <Box display="flex" justifyContent="space-between" alignItems="center" px={3} pb={3}>
                    <Typography variant="h5" textAlign="center" flexGrow={1}>
                        Please enter your details
                    </Typography>
                </Box>

                <div>
                {/* Contact Section */}
                <div style={{display: "flex", justifyContent:"space-between", alignItems: "baseline" }} >
                    <Typography variant="subtitle1" fontWeight="bold">
                    Contact
                    </Typography>
                    <Link href="#" underline="hover" sx={{ fontSize: "14px", fontWeight: "bold" }}>
                    Log In
                    </Link>
                </div>

                <FormControl fullWidth margin="normal" sx={{margin: "4px 0"}} >
                    <TextField label="Email or mobile phone number" type="email" fullWidth />
                </FormControl>

                <FormControlLabel 
                    control={<Checkbox defaultChecked sx={{ color: "#73AD21", '&.Mui-checked': { color: "#73AD21" } }} />} 
                    label="Email me with news and offers"
                />

                {/* Delivery Section */}
                <Typography variant="subtitle1" fontWeight="bold" mt={2} mb={1}>
                    Delivery
                </Typography>

                {/* Country Select */}
                <FormControl fullWidth margin="normal">
                    <InputLabel>Country/Region</InputLabel>
                    <Select value={country} onChange={(e) => setCountry(e.target.value)}>
                    {countryOptions.map((c) => (
                        <MenuItem key={c} value={c}>{c}</MenuItem>
                    ))}
                    </Select>
                </FormControl>

                {/* First Name & Last Name in the same row */}
                <Grid container spacing={2} sx={{mt: "1px"}} >
                    <Grid item xs={6}>
                    <TextField label="First Name" fullWidth />
                    </Grid>
                    <Grid item xs={6}>
                    <TextField label="Last Name" fullWidth />
                    </Grid>
                </Grid>

                <FormControl fullWidth sx={{mt: 2}} >
                    <Autocomplete
                        freeSolo
                        options={addressSuggestions}
                        renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Address"
                            variant="outlined"
                            InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                                <InputAdornment position="end">
                                <SearchIcon sx={{ color: "gray" }} />
                                </InputAdornment>
                            ),
                            }}
                        />
                        )}
                    />
                </FormControl>

                
                <FormControl fullWidth sx={{mt: 2}} >
                    <Autocomplete
                        freeSolo
                        options={apartmentSuggestions}
                        renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Apartment, Suite, etc. (optional)"
                            variant="outlined"
                            InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                                <InputAdornment position="end">
                                <SearchIcon sx={{ color: "gray" }} />
                                </InputAdornment>
                            ),
                            }}
                        />
                        )}
                    />
                </FormControl>


                {/* City, State, ZIP Code in the same row */}
                <Grid container spacing={2} sx={{mt: "4px", mb:"6px"}}>
                    <Grid item xs={4}>
                    <TextField label="City" fullWidth />
                    </Grid>
                    <Grid item xs={4}>
                    <FormControl fullWidth>
                        <InputLabel>State</InputLabel>
                        <Select value={state} onChange={(e) => setState(e.target.value)}>
                        {stateOptions.map((s) => (
                            <MenuItem key={s} value={s}>{s}</MenuItem>
                        ))}
                        </Select>
                    </FormControl>
                    </Grid>
                    <Grid item xs={4}>
                    <TextField label="ZIP Code" fullWidth />
                    </Grid>
                </Grid>

                {/* <FormControlLabel 
                    control={<Checkbox />} 
                    label="Save this information for next time" 
                    sx={{ mt: 2 }}
                /> */}
                <FormControlLabel 
                    control={<Checkbox defaultChecked sx={{ color: "#73AD21", '&.Mui-checked': { color: "#73AD21" } }} />} 
                    label="Save this information for next time" 
                />

                <Button variant="contained" color="success" fullWidth sx={{ mt: 2, bgcolor: "#73AD21"}}>Continue</Button>
                </div>
            </Card>

            {/* Close Button Outside */}
            <IconButton
                onClick={onClose}
                sx={{
                    marginTop: "30px",
                    backgroundColor: '#fff',
                    boxShadow: 3,
                    '&:hover': { backgroundColor: '#f0f0f0' },
                }}
                >
                <CloseIcon />
            </IconButton>
        </Box>
    </Modal>
  );
};

export default CheckoutModal;

