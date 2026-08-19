import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
const LOGGED_IN_USER_ID = JSON.parse(localStorage.getItem("data123"))?.id;

export default function QuotationInFreightCostumer() {
  const location = useLocation();
  const navigate = useNavigate();
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const isSendingRef = useRef(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const activeChat =
    location.state?.data || JSON.parse(localStorage.getItem("activeChat"));
  const RECEIVER_ID = activeChat?.client_id || activeChat?.freight_client_id;
  const LOGGED_IN_USER_NAME = JSON.parse(localStorage.getItem("data123"))?.name || JSON.parse(localStorage.getItem("data123"))?.full_name || "Me";
  const OTHER_USER_NAME = activeChat?.full_name || activeChat?.shipper_name || activeChat?.name || activeChat?.client_name || activeChat?.freight_client_name || activeChat?.sender_name || "Client";

  /* ================= SOCKET CONNECT ================= */
  useEffect(() => {
    if (!LOGGED_IN_USER_ID) return;
    socketRef.current = io("https://sisccltd.com", {
      path: "/socket.io",
      transports: ["websocket"],
      reconnection: true,
    });
    socketRef.current.on("connect", () => {
      console.log("✅ Socket connected");
      setSocketConnected(true);
      // Join user room
      socketRef.current.emit("joinUser", LOGGED_IN_USER_ID);
    });
    socketRef.current.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
      setSocketConnected(false);
    });
    socketRef.current.on("connect_error", (err) => {
      console.log("⚠️ Socket error:", err.message);
      setSocketConnected(false);
    });
    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  /* ================= RECEIVE SOCKET MESSAGE ================= */
  useEffect(() => {
    if (!socketConnected || !socketRef.current) return;

    const handleReceiveMessage = (data) => {
      if (data.sender_id === LOGGED_IN_USER_ID) return;
      setMessages((prev) => [
        ...prev,
        {
          key: `socket-${data.id}`,
          text: data.message,
          sender: data.sender_id === LOGGED_IN_USER_ID ? "me" : "other",
          sender_name: data.sender_name || (data.sender_id === LOGGED_IN_USER_ID ? LOGGED_IN_USER_NAME : OTHER_USER_NAME),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
      ]);
    };

    socketRef.current.on("receiveMessage", handleReceiveMessage);

    return () => {
      socketRef.current.off("receiveMessage", handleReceiveMessage);
    };
  }, [socketConnected, conversationId]);
  /* ================= CREATE CONVERSATION ================= */
  //   const createConversation = async () => {
  //     try {
  //       if (!LOGGED_IN_USER_ID || !RECEIVER_ID) return;

  //       const res = await axios.post(
  //         `${process.env.REACT_APP_BASE_URL}chat/createConversation`,
  //         {
  //           sender_id: LOGGED_IN_USER_ID,
  //           receiver_id: RECEIVER_ID,
  //         }
  //       );
  //       console.log(res.data.conversation_id)
  //        setConversationId(res.data.conversation_id.trim());
  //       if (res?.data?.conversation_id) {
  //         console.log("work")
  //        setConversationId(res.data.conversation_id.trim());
  //       }
  //     } catch (error) {
  //       toast.error("Failed to create conversation");
  //     }
  //   };
  const createConversation = async () => {
    try {
      if (!LOGGED_IN_USER_ID || !RECEIVER_ID) return;
      const res = await axios.post(
        `${process.env.REACT_APP_BASE_URL}chat/createConversation`,
        {
          sender_type: "user",
          receiver_type: "user",
          sender_id: LOGGED_IN_USER_ID,
          receiver_id: RECEIVER_ID,
        }
      );
      const conversationId = res?.data?.conversation_id;
      if (res.status === 200) {
        console.log(res.data)
        setConversationId(conversationId);
      }
      if (!conversationId) {
        toast.error("Conversation ID not received");
        return;
      }
      if (res.data.success === true) {
        setConversationId(conversationId);
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to create conversation"
      );
    }
  };
  useEffect(() => {
    if (!conversationId && RECEIVER_ID) {
      createConversation();
    }
  }, [RECEIVER_ID]);
  /* ================= JOIN CONVERSATION ROOM ================= */
  useEffect(() => {
    if (!conversationId || !socketConnected) return;
    console.log("📥 Joining conversation:", conversationId);
    socketRef.current.emit("joinConversation", conversationId);

    return () => {
      socketRef.current.emit("leaveConversation", conversationId);
    };
  }, [conversationId, socketConnected]);
  /* ================= LOAD MESSAGES ================= */
  useEffect(() => {
    if (!conversationId) return;
    const payload = {
      conversation_id: conversationId,
      receiver_id: RECEIVER_ID
    }
    axios
      .post(
        `${process.env.REACT_APP_BASE_URL}chat/getMessages/`, payload
      )
      .then((res) => {
        console.log("Loaded messages:", res.data.messages);
        setMessages(
          res.data.messages.map((m) => ({
            key: `db-${m.id}`,
            text: m.message,
            sender: m.sender_id === LOGGED_IN_USER_ID ? "me" : "other",
            sender_name: m.sender_name || (m.sender_id === LOGGED_IN_USER_ID ? LOGGED_IN_USER_NAME : OTHER_USER_NAME),
            time: m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""
          }))
        );
      });
  }, [conversationId]);
  /* ================= SEND MESSAGE ================= */
  const sendMessage = async () => {
    if (isSendingRef.current) return;
    const textToSend = message.trim();
    if (!textToSend) return;

    isSendingRef.current = true;
    setMessage(""); // Clear input immediately to prevent rapid double-send

    try {
      console.log("A")
      const payload = {
        sender_id: LOGGED_IN_USER_ID,
        receiver_id: RECEIVER_ID,
        conversation_id: conversationId,
        message: textToSend,
      };
      // Optimistic UI
      setMessages((prev) => [
        ...prev,
        {
          key: `local-${Date.now()}`,
          text: textToSend,
          sender: "me",
          sender_name: LOGGED_IN_USER_NAME,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
      ]);
      console.log(payload)
      const res = await axios.post(
        `${process.env.REACT_APP_BASE_URL}chat/sendMessage`,
        payload
      );
      socketRef.current.emit("sendMessage", {
        ...payload,
        id: res.data.id,
        sender_name: LOGGED_IN_USER_NAME,
      });
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      isSendingRef.current = false;
    }
  };
  /* ================= AUTO SCROLL ================= */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  if (!activeChat) return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh", color: "#64748b", fontSize: "16px", fontWeight: "500" }}>Select a chat to start conversation</div>;
  
  return (
    <div className="wpWrapper" style={{ padding: "20px 0" }}>
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-12">
            <div 
              style={{ 
                height: "80vh", 
                backgroundColor: "#f8fafc", 
                borderRadius: 16,
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.05)",
                border: "1px solid #e2e8f0",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                fontFamily: "Inter, system-ui, sans-serif"
              }}
            >
              {/* Chat Top Header */}
              <div 
                style={{ 
                  padding: "14px 20px", 
                  backgroundColor: "#ffffff", 
                  borderBottom: "1px solid #e2e8f0", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "space-between" 
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {/* Back Button */}
                  <button 
                    onClick={() => navigate(-1)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#64748b",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "6px",
                      borderRadius: "50%",
                      transition: "background-color 0.2s, color 0.2s",
                      outline: "none"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#f1f5f9";
                      e.currentTarget.style.color = "#1e293b";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = "#64748b";
                    }}
                    title="Go Back"
                  >
                    <svg 
                      width="20" 
                      height="20" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <line x1="19" y1="12" x2="5" y2="12"></line>
                      <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                  </button>
                  <div 
                    style={{ 
                      width: 38, 
                      height: 38, 
                      borderRadius: "50%", 
                      backgroundColor: "#0b63e6", 
                      color: "#ffffff", 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "center",
                      fontWeight: "600",
                      fontSize: 15
                    }}
                  >
                    {OTHER_USER_NAME ? OTHER_USER_NAME.trim().charAt(0).toUpperCase() : ""}
                  </div>
                  <div>
                    <h6 style={{ margin: 0, fontWeight: "600", color: "#1e293b", fontSize: "14px", lineHeight: 1.2 }}>
                      {OTHER_USER_NAME}
                    </h6>
                    <span style={{ fontSize: "11px", color: socketConnected ? "#10b981" : "#ef4444", display: "flex", alignItems: "center", gap: 4, marginTop: "2px" }}>
                      <span 
                        style={{ 
                          width: 6, 
                          height: 6, 
                          borderRadius: "50%", 
                          backgroundColor: socketConnected ? "#10b981" : "#ef4444",
                          display: "inline-block" 
                        }} 
                      />
                      {socketConnected ? "Online" : "Disconnected"}
                    </span>
                  </div>
                </div>
                {activeChat?.freight_number && (
                  <div style={{ fontSize: "12px", color: "#475569", backgroundColor: "#f1f5f9", padding: "4px 10px", borderRadius: 16, fontWeight: "500" }}>
                    Freight: #{activeChat.freight_number}
                  </div>
                )}
              </div>

              {/* Socket Disconnected Alert Banner */}
              {!socketConnected && (
                <div className="text-center bg-warning text-dark p-2" style={{ fontSize: "12px", fontWeight: "500" }}>
                  ⚠️ Chat connection interrupted. Reconnecting...
                </div>
              )}

              {/* Chat Message List Area */}
              <div 
                style={{ 
                  flex: 1, 
                  overflowY: "auto", 
                  padding: "20px", 
                  display: "flex", 
                  flexDirection: "column", 
                  gap: "16px",
                  backgroundColor: "#f1f5f9"
                }}
              >
                {messages.length === 0 ? (
                  <div className="h-100 d-flex align-items-center justify-content-center flex-column" style={{ minHeight: "200px" }}>
                    <span style={{ color: "#64748b", fontSize: "14px", fontWeight: "500", backgroundColor: "#ffffff", padding: "8px 16px", borderRadius: 20, boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
                      No messages here yet. Start the conversation!
                    </span>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.key}
                      style={{
                        textAlign: msg.sender === "me" ? "right" : "left",
                      }}
                    >
                      <div
                        style={{
                          background: msg.sender === "me" ? "#0b63e6" : "#ffffff",
                          color: msg.sender === "me" ? "#ffffff" : "#1e293b",
                          padding: "10px 14px",
                          borderRadius: msg.sender === "me" ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
                          display: "inline-block",
                          textAlign: "left",
                          maxWidth: "70%",
                          wordBreak: "break-word",
                          boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                          border: msg.sender === "me" ? "none" : "1px solid #e2e8f0",
                        }}
                      >
                        <strong
                          style={{
                            display: "block",
                            fontSize: "11px",
                            fontWeight: "600",
                            marginBottom: "4px",
                            color: msg.sender === "me" ? "rgba(255, 255, 255, 0.85)" : "#64748b",
                          }}
                        >
                          {msg.sender_name || (msg.sender === "me" ? LOGGED_IN_USER_NAME : OTHER_USER_NAME)}
                        </strong>
                        <div style={{ fontSize: "13.5px", lineHeight: "1.4" }}>{msg.text}</div>
                        {msg.time && (
                          <div 
                            style={{ 
                              fontSize: "9px", 
                              color: msg.sender === "me" ? "rgba(255, 255, 255, 0.7)" : "#94a3b8",
                              textAlign: "right",
                              marginTop: "4px"
                            }}
                          >
                            {msg.time}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Footer Area */}
              <div 
                style={{ 
                  padding: "14px 20px", 
                  backgroundColor: "#ffffff", 
                  borderTop: "1px solid #e2e8f0", 
                  display: "flex", 
                  gap: 12,
                  alignItems: "center"
                }}
              >
                <input
                  className="form-control"
                  placeholder="Type message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  style={{
                    borderRadius: "24px",
                    padding: "9px 16px",
                    border: "1px solid #cbd5e1",
                    fontSize: "13.5px",
                    outline: "none",
                    boxShadow: "none"
                  }}
                />
                <button
                  className="btn btn-primary"
                  onClick={sendMessage}
                  disabled={!socketConnected}
                  style={{
                    borderRadius: "24px",
                    padding: "9px 22px",
                    backgroundColor: "#0b63e6",
                    borderColor: "#0b63e6",
                    fontWeight: "600",
                    fontSize: "13.5px",
                    display: "flex",
                    alignItems: "center",
                    gap: 6
                  }}
                >
                  {socketConnected ? "Send" : "Connecting..."}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
