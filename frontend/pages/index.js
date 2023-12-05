// Import necessary components and styles from external libraries
import Head from "next/head";
import { Paper, IconButton, Button } from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  ChatContainer,
  MessageInput,
  MessageList,
  Message,
  ConversationHeader,
  TypingIndicator
} from "@chatscope/chat-ui-kit-react";
import styles from "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import botImage from "../public/chatbot.png";
import bg from "../public/background.jpg";
import Image from "next/image";
import { useState } from "react";
import FileUploadIcon from "@mui/icons-material/FileUpload";

// Styled component for visually hidden file input
const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

// Main component for the home page
export default function Home() {
  // State variables for managing chat functionality
  const [currentMessage, setCurrentMessage] = useState("");
  const [chatContent, setChatContent] = useState([]);
  const [typing, setTyping] = useState(false);
  const [fileUploaded, setFileUploaded] = useState(false);

  // Function to handle file upload
  const upload = async (event) => {
    const file = event.target.files[0];

    // Check if the uploaded file is a PDF
    if (file.type == "application/pdf") {
      // Update the formData object
      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", file.name);

      // Send a POST request to the server for file upload
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      // Check the server response and update chat content accordingly
      if (response.status == 200) {
        const messageData = {
          sender: "incoming",
          content: "Your file '" + file.name + "' has been uploaded, you can start chatting now.",
        };

        setFileUploaded(true);
        setChatContent((list) => [...list, messageData]);
      } else {
        setFileUploaded(false);
      }
    }
  };

  // Function to send a message and handle server response
  const sendMessage = async () => {
    var temporaryMessage = currentMessage;
    setCurrentMessage("");

    var messageData = {
      sender: "outgoing",
      content: temporaryMessage,
    };

    setChatContent((list) => [...list, messageData]);
    
    setTyping(true);
    const response = await fetch("http://localhost:5000/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: temporaryMessage }),
    });

    const data = await response.json();
    messageData = {
      sender: "incoming",
      content: data.message,
    };

    setTyping(false);
    setChatContent((list) => [...list, messageData]);
  };

  // Render the UI components
  return (
    <div className="main">
      {/* Head section for setting page title and icon */}
      <Head>
        <title>Chatbot</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Global styles for the background */}
      <style jsx global>{`
        .bg {
          filter: brightness(0.4); // Adjust the blur radius as needed
        }
      `}</style>

      {/* Background image */}
      <Image
        src={bg}
        layout="fill"
        objectFit="cover"
        quality={100}
        className="bg"
      />

      {/* Main chatbot UI */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "48%",
          transform: "translate(-50%, -50%)",
          zIndex: "1",
        }}
      >
        <center>
          {/* Chatbot avatar */}
          <Image src={botImage} width={200} height={200} style={{marginBottom:"-1em"}} />
        </center>

        {/* Chat container */}
        <Paper elevation={3}>
          <div
            style={{
              height: "500px",
              width: "500px",
            }}
          >
            {/* Chat components from Chat-UI-Kit-React */}
            <ChatContainer>
              <ConversationHeader>
                <ConversationHeader.Content
                  userName="Chatbot"
                  info="Always active to answer your questions"
                />
              </ConversationHeader>

              {/* Display initial message and chat content */}
              <MessageList>
                <Message
                  model={{
                    message: "Hello my friend ! Upload a pdf file to start.",
                    sender: "Chatbot",
                    direction: "incoming",
                    position: "single",
                  }}
                ></Message>
                {chatContent.map((val) => (
                  <Message
                    model={{
                      message: val.content,
                      direction: val.sender,
                      position: "single",
                    }}
                  />
                ))}
                {typing ? <TypingIndicator /> : ""}
              </MessageList>

              {/* Message input for user interaction */}
              <MessageInput
                value={currentMessage}
                onChange={(val) => setCurrentMessage(val)}
                onSend={sendMessage}
                attachButton={false}
                autoFocus
                disabled={fileUploaded ? false : true}
              />
            </ChatContainer>
          </div>

          {/* File upload button */}
          <center>
            <Button
              component="label"
              variant="contained"
              startIcon={<FileUploadIcon />}
              style={{ marginBottom: "0.5em" }}
              onChange={upload}
            >
              Upload file
              <VisuallyHiddenInput type="file" />
            </Button>
          </center>
        </Paper>
      </div>
    </div>
  );
}
