import React from "react";
import { Alert, AlertTitle, Snackbar } from "@mui/material";

interface NotificationProps {
  open: boolean; // Whether the notification is visible
  onClose: () => void; // Callback to close the notification
  severity: "error" | "warning" | "info" | "success"; // Type of notification
  title?: string; // Optional title for the notification
  message: string; // The main message inside the notification
  duration?: number; // Auto-close duration in milliseconds (default: 3000ms)
}

const Notification: React.FC<NotificationProps> = ({
  open,
  onClose,
  severity,
  title,
  message,
  duration = 3000,
}) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={duration} // Automatically closes after the specified duration
      onClose={onClose}
      anchorOrigin={{ vertical: "top", horizontal: "center" }} // Position of the notification
    >
      <Alert onClose={onClose} severity={severity} sx={{ width: "100%" }}>
        {title && <AlertTitle>{title}</AlertTitle>}
        {message}
      </Alert>
    </Snackbar>
  );
};

export default Notification;