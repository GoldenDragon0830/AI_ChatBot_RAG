import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import DOMPurify from "dompurify";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Grid,
  Chip,
  IconButton,
} from "@mui/material";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';

const DetailData: React.FC = () => {
  const location = useLocation();
  const [itemData, setItemData] = useState<any>(null);

  useEffect(() => {
    // Get data from URL parameters
    const params = new URLSearchParams(location.search);
    const data = {
      title: params.get('title'),
      image_urls: params.get('image'),
      category: params.get('category'),
      single_price: params.get('price'),
      subtitle: params.get('subtitle'),
      details: params.get('details'),
      directions: params.get('directions')
    };
    setItemData(data);
  }, [location]);

  if (!itemData) return <div>Loading...</div>;

  return (
    <Grid container justifyContent="center" mt={4}>
      <Card sx={{ boxShadow: 0, padding: "2vh 20vw" }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <IconButton onClick={()=>{window.close()}} >
            <ArrowBackIosIcon/>
          </IconButton>
          <Typography
            variant="h5"
            fontWeight="bold"
            textAlign="center"
            flexGrow={1}
          >
            {itemData.title}
          </Typography>
          <Chip
            label={itemData.single_price !== "N/A" ? "$"+itemData.single_price : "$Undefined"}
            sx={{
              fontWeight: "bold",
              backgroundColor: "#73AD21",
              color: "white",
              borderRadius: 1
            }}
          />
        </Box>

        <CardMedia
          component="img"
          height="400"
          image={itemData.image_urls}
          alt={itemData.title}
          sx={{ borderRadius: 2, marginY: 2 }}
        />

        <CardContent>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            Subtitle: {itemData.subtitle || "No subtitle available"}
          </Typography>

          <Box mt={2}>
            <Typography variant="h6" fontWeight="bold">
              Details:
            </Typography>
            <Typography
              variant="body2"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(itemData.details || "No details provided."),
              }}
            />
          </Box>

          <Box mt={2}>
            <Typography variant="h6" fontWeight="bold">
              Features:
            </Typography>
            <Typography
              variant="body2"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(itemData.directions || "No features listed."),
              }}
            />
          </Box>
        </CardContent>
      </Card>
    </Grid>
  );
};

export default DetailData;
