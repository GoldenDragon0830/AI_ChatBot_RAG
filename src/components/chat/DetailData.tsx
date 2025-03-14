import React from "react";
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
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const DetailData: React.FC = () => {
  // Retrieve the data from sessionStorage
  const itemData = JSON.parse(sessionStorage.getItem("itemData") || "{}");

  // Price extraction with fallback to "N/A"
  const priceMatch = itemData.single_price?.match(/\$?(\d+\.\d+)$/);
  const price = priceMatch ? `$${priceMatch[1]}` : "N/A";

  if (!itemData || !itemData.title) {
    return <Typography variant="h6">No data available.</Typography>;
  }

  return (
    <Grid container justifyContent="center" mt={4}>
      <Card sx={{ boxShadow: 0, padding: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography
            variant="h5"
            fontWeight="bold"
            textAlign="center"
            flexGrow={1}
          >
            {itemData.title}
          </Typography>
          <Chip
            label={price !== "N/A" ? price : "Price not available"}
            color={price !== "N/A" ? "success" : "default"}
            sx={{ fontWeight: "bold" }}
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