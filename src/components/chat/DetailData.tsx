import React from "react";
import DOMPurify from 'dompurify';

const DetailData: React.FC = () => {
  // Retrieve the data from sessionStorage
  const itemData = JSON.parse(sessionStorage.getItem("itemData") || "{}");

  if (!itemData || !itemData.title) {
    return <div>No data available.</div>;
  }

  return (
    <div
      style={{
        justifySelf: 'center',
        width: '50vw'
      }}
    >
      <h1>{itemData.title}</h1>
      <img src={itemData.image_urls} alt={itemData.title} style={{ justifyContent: "center"}}/>
      <p>Subtitle: {itemData.subtitle}</p>
      <p>Single Price: {"$"+itemData.single_price.match(/\$?(\d+\.\d+)$/)?.[1]}</p>
        <p>Details: </p>
        <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(itemData.details)}}></div>
        <p>Features: </p>
        <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(itemData.directions)}}></div>
    </div>
  );
};

export default DetailData;