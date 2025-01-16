import React from "react";
import ChatWindow from "./components/chat/ChatWindow";
import DetailData from "./components/chat/DetailData"; // Import your new component

const App: React.FC = () => {
  const currentPath = window.location.pathname;

  let ComponentToRender;
  if (currentPath.includes("details")){
    ComponentToRender = <DetailData />;
  } else {
    ComponentToRender = <ChatWindow />;
  }

  return <>{ComponentToRender}</>;
};

export default App;