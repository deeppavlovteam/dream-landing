import React, { useState, useCallback, useRef, useEffect } from "react";
import type { NextPage } from "next";
import TextareaAutosize from "react-textarea-autosize";
import html2canvas from "html2canvas";

import useChat from "../hooks/useChat";
import styles from "./chat.module.css";
import Sidebar from "../components/Sidebar";
import MessageBubble, { ThinkingBubble } from "../components/MessageBubble";
import StarsRating from "../components/StarsRating";
import FeedbackPopup from "../components/FeedbackPopup";
import DisclaimerPopup from "../components/DisclaimerPopup";
import { PopupProvider } from "../components/Popup";
import { ReactionsPopup } from "../components/MessageReaction";

const Chat: NextPage = () => {
  const {
    messages,
    loading,
    error,
    sendMsg,
    reset,
    setRating,
    rating,
    setMsgReaction,
  } = useChat();

  const chatRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const getChatPic = () => {
    if (!chatRef.current) return;
    const watermark = document.createElement("div");
    watermark.innerHTML = "dream.deeppavlov.ai";
    watermark.classList.add(styles["watermark"]);
    html2canvas(chatRef.current, {
      onclone: (_, el) => el.appendChild(watermark),
    }).then((canvas) => {
      const imgDataUrl = canvas.toDataURL();
      const a = document.createElement("a");
      a.download = "canvas_image.png";
      a.href = imgDataUrl;
      a.click();
    });
  };

  const [msgDraft, setMsgDraft] = useState("");
  const onClickSend = useCallback(
    () =>
      !loading &&
      msgDraft.replace(/\W/gi, "") !== "" &&
      (sendMsg(msgDraft), setMsgDraft(""), inputRef.current?.focus()),
    [loading, msgDraft, sendMsg]
  );

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <PopupProvider>
      <div className={`page ${styles["chat-page"]}`}>
        <div className={styles["top-bar"]}>
          <StarsRating rating={rating} setRating={setRating} showFeedbackLink />
        </div>

        <FeedbackPopup rating={rating} setRating={setRating} />
        <DisclaimerPopup />
        <ReactionsPopup onReact={setMsgReaction} />

        <Sidebar onScreenshot={getChatPic} onReset={reset}></Sidebar>

        <div className={styles["content"]}>
          <div className={styles["chat-cont"]}>
            {error && <div style={{ color: "red" }}>{error}</div>}
            <div ref={chatRef} className={styles["messages-cont"]}>
              {messages.map((msg, i) => (
                <MessageBubble
                  key={i}
                  msg={msg}
                  isNew={i === messages.length - 1 && !loading}
                  onReact={setMsgReaction}
                />
              ))}
              {loading && <ThinkingBubble />}
            </div>
            <div className={styles["input-cont"]}>
              <TextareaAutosize
                autoFocus
                ref={inputRef}
                maxRows={5}
                className={styles["input-area"]}
                placeholder="Type your message here..."
                value={msgDraft}
                onInput={(ev) => (
                  setMsgDraft((ev.target as HTMLTextAreaElement).value), true
                )}
                onKeyDown={(ev) =>
                  ev.key === "Enter" && !ev.shiftKey && (onClickSend(), ev.preventDefault())
                }
                disabled={!!error}
              />
              <button onClick={() => onClickSend()}>Send</button>
            </div>
          </div>
        </div>
      </div>
    </PopupProvider>
  );
};

export default Chat;
