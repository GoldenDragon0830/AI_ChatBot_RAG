import React, { useState, useRef, useEffect } from "react";
import ChatInput from "./ChatInput";
import ChatMessage from "./ChatMessage";
import { CircularProgress, Button } from "@mui/material";

interface MessageInterface {
  content: string;
  role: "user" | "assistant";
}

const ChatWindow: React.FC = () => {
  //const API_URL = "https://pbbrgipvnj.us-east-1.awsapprunner.com/chat";
  const API_URL = "https://52.221.236.58:80/chat";
  // const TRAIN_API_URL = "http://54.224.75.56:8080/train";
  // const TRAIN_API_URL = "https://yourapi.com/train"; // Replace with your train API URL
  // const S3_BUCKET = "homebuyer-llm-datasets"; // Replace with your bucket name
  // const REGION = "eu-north-1"; // Replace with your region

  const [messages, setMessages] = useState<MessageInterface[]>([]);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  // const [file, setFile] = useState<File | null>(null);
  // const [fileStatus, setFileStatus] = useState<string>(""); // State for file selection status
  // const [uploadStatus, setUploadStatus] = useState<string>(""); // State for upload status
  // const [trainStatus, setTrainStatus] = useState<string>("");
  const containerRef = useRef<HTMLDivElement>(null);

  const ItemButton: React.FC<{ text: string; onClick: () => void }> = ({
    text,
    onClick,
  }) => (
    <Button variant="contained" color="primary" style={{margin: "5px", width: "200px"}} onClick={onClick}>
      {text}
    </Button>
  );

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleButtonClick = (text: string) => {
    const message: MessageInterface = {
      content: text,
      role: "user",
    };
    handleSendMessage(message);
  };

  const handleSendMessage = async (message: MessageInterface) => {
    setMessages((prevMessages) => [...prevMessages, message]);
    setSummary("");
    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}?prefix=You+are+an+AI+assistant&message=${
          message.content
        }&history=${JSON.stringify(messages)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "text/event-stream",
          },
        }
      );

      if (!response.ok) throw new Error("Network response was not ok");
      if (!response.body) throw new Error("Response body is null");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let newMessageContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n") || "";

        lines.forEach((line) => {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            // if(data.split("SummaryTitle"))
            newMessageContent += data;
            setMessages((prev) => {
              const newMessages = [...prev];
              const lastMessageIndex = newMessages.length - 1;

              if (
                lastMessageIndex >= 0 &&
                newMessages[lastMessageIndex].role === "assistant"
              ) {
                newMessages[lastMessageIndex].content =
                  newMessageContent.split("SummaryTitle")[0] || "";
              } else {
                newMessages.push({ content: data, role: "assistant" });
              }
              return newMessages;
            });
          }
        });
      }
      newMessageContent = newMessageContent.slice(10);
      console.log(newMessageContent)
      setSummary((prev) => {
        const newSummary = newMessageContent.split("SummaryTitle:@")[1] || "";
        return newSummary;
      });

      console.log(summary);
    } catch (error) {
      console.error(
        "Chat Error:",
        error instanceof Error ? error.message : error
      );
      setMessages((prev) => {
        const newMessages = [...prev];
        const lastMessageIndex = newMessages.length - 1;
        if (
          lastMessageIndex >= 0 &&
          newMessages[lastMessageIndex].role === "assistant"
        ) {
          newMessages[lastMessageIndex].content =
            "Sorry, there was an error. Please try again.";
        } else {
          newMessages.push({
            content: "Sorry, there was an error. Please try again.",
            role: "assistant",
          });
        }
        return newMessages;
      });
    } finally {
      setLoading(false);
    }
  };

  // const handleSubmit = async () => {
  //   console.log({ name });
  //   setLoading(true);
  //   try {
  //     const response = await axios.post(TRAIN_API_URL, { name });
  //     console.log(response);
  //     if ((response.data.content = "OK")) {
  //       console.log("Name successfully sent!");
  //       setLoading(false);
  //       setTrainStatus("Train successfull!"); // Clear the input field after successful submission
  //     } else {
  //       console.error("Failed to send name.");
  //       setLoading(false);
  //       setTrainStatus("Train failed!");
  //     }
  //   } catch (error) {
  //     setLoading(false);
  //     setTrainStatus("Failed!");
  //     console.error("Error:", error);
  //   }
  // };

  // const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   if (event.target.files && event.target.files[0]) {
  //     setFile(event.target.files[0]);
  //     setFileStatus(`File selected: ${event.target.files[0].name}`); // Set file selection status
  //     setUploadStatus(""); // Reset upload status when a new file is selected
  //   }
  // };

  // const handleUpload = async () => {
  //   if (!file) {
  //     alert("Please select a file first");
  //     return;
  //   }

  //   const params = {
  //     Bucket: S3_BUCKET,
  //     Key: file.name,
  //     Body: file,
  //     ContentType: file.type,
  //   };

  //   setLoading(true);

  //   try {
  //     await s3.upload(params).promise();
  //     setUploadStatus("File uploaded successfully.");
  //     setLoading(false);
  //   } catch (error) {
  //     console.error("Upload Error:", error);
  //     setUploadStatus("There was an error uploading your file.");
  //   }
  // };

  return (
    <div style={{ padding: "1rem" }}>
      {/* <input
        accept="*"
        id="file-upload"
        type="file"
        style={{ display: "none", padding: "1rem" }}
        onChange={handleFileChange}
      /> */}
      {/* <label htmlFor="file-upload">
        <Button component="span" variant="contained">
          Select File
        </Button>
      </label> */}
      {/* <Button
        variant="contained"
        color="primary"
        onClick={handleUpload}
        style={{ marginLeft: "1rem" }}
      >
        Upload to S3
      </Button> */}
      {/* <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ padding: "1rem", marginLeft: "1rem" }}
      /> */}
      {/* <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        disabled={!name}
        style={{ marginLeft: "1rem" }}
      >
        Submit
      </Button> */}
      {/* {fileStatus && <div>{fileStatus}</div>}{" "} */}
      {/* Display file selection status */}
      {/* {uploadStatus && <div>{uploadStatus}</div>} Display upload status */}
      {/* {trainStatus && <div>{trainStatus}</div>} Display upload status */}
      <div
        style={{
          height: "80vh",
          maxHeight: "650px",
          overflowY: "auto",
          padding: "50px",
          position: "relative",
        }}
        ref={containerRef}
      >
        {messages.map((message, index) => (
          <ChatMessage key={index} {...message} />
        ))}

      <div>
        {summary.split("@").length-1 !== 0 ? summary.split("@").map((word, index) => (
          <ItemButton key={index} text={word} onClick={() => handleButtonClick(word)} />
        )) : <b></b>}
      </div>
        {loading && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <CircularProgress />
          </div>
        )}
        <ChatInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
};

export default ChatWindow;
