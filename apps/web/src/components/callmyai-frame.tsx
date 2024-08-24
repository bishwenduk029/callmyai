"use client"
import { env } from "@/env.mjs"
import { useState } from "react"

export default function CallMyAIIframe() {
  const [isIframeVisible, setIsIframeVisible] = useState(false)

  const toggleIframeVisibility = () => {
    setIsIframeVisible(!isIframeVisible)
  }

  return (
    <>
      <button
        onClick={toggleIframeVisibility}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          width: "75px",
          height: "75px",
          borderRadius: "50%",
          backgroundColor: "#000000",
          color: "white",
          border: "none",
          boxShadow: "0 4px 8px rgba(0,0,0,.3)",
          zIndex: 9999,
          cursor: "pointer",
        }}
      >
        {isIframeVisible ? "Close" : "Open"}
      </button>
      {isIframeVisible && (
        <iframe
          id="callmyai-iframe"
          src={`${env.NEXT_PUBLIC_APP_URL}/bishwenduk029/embed`}
          style={{
            position: "fixed",
            bottom: "100px",
            borderColor: "black",
            right: "20px",
            width: "450px",
            height: "700px",
            boxShadow: "0 80px 80px rgba(0,0,0,.6)",
            borderRadius: "5px",
            overflow: "hidden",
            border: "2px solid black",
            zIndex: 45,
            scrollbarWidth: "none",
          }}
          scrolling="no"
        />
      )}
    </>
  )
}
