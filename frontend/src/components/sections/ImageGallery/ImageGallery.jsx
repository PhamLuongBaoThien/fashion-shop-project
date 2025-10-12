"use client"

import { useState } from "react"
import { Image } from "antd"
import "./ImageGallery.css"

const ImageGallery = ({ images }) => {
  const [selectedImage, setSelectedImage] = useState(0)

  return (
    <div className="image-gallery">
      <div className="main-image-container">
        <Image.PreviewGroup>
          <Image
            src={images[selectedImage] || "/placeholder.svg"}
            alt={`Product view ${selectedImage + 1}`}
            className="main-image"
            preview={{
              mask: <div style={{ fontSize: "14px" }}>Click để xem</div>,
            }}
          />
        </Image.PreviewGroup>
      </div>

      <div className="thumbnail-list">
        {images.map((image, index) => (
          <div
            key={index}
            className={`thumbnail ${selectedImage === index ? "active" : ""}`}
            onClick={() => setSelectedImage(index)}
          >
            <img src={image || "/placeholder.svg"} alt={`Thumbnail ${index + 1}`} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default ImageGallery
