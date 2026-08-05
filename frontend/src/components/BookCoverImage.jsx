import React, { useState } from "react";

export const BookCoverImage = ({ coverUrl, title, height = "250px", className = "card-img-top" }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError || !coverUrl) {
    return (
      <div
        className="bg-secondary text-white d-flex align-items-center justify-content-center"
        style={{ height, minHeight: height }}
      >
        📖 Không có bìa
      </div>
    );
  }

  return (
    <img
      src={coverUrl}
      alt={title}
      className={className}
      style={{ height, objectFit: "cover" }}
      onError={() => setHasError(true)}
    />
  );
};

export default BookCoverImage;
