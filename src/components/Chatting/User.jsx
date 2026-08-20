import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

export default function User() {
  const userData = JSON.parse(localStorage.getItem("data123"));
  const userId = userData?.id;
  const token = localStorage.getItem("token");
  const socketRef = useRef(null);
  const selectedChatRef = useRef(null);
  const messagesEndRef = useRef(null);
  const isSendingRef = useRef(false);
  const [users, setUsers] = useState([]);
  const [staff, setStaff] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [activeTab, setActiveTab] = useState("users");
  const [messageText, setMessageText] = useState("");
  // ================= REF FIX =================
  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);
  // ================= SCROLL =================
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  // ================= SOCKET =================
  useEffect(() => {
    socketRef.current = io(process.env.REACT_APP_BASE_URLSoket, {
      transports: ["websocket"],
    });
    const socket = socketRef.current;
    socket.on("connect", () => {
      console.log("Connected:", socket.id);
      
      // Join conversation rooms
      users.forEach((chat) => {
        socket.emit("joinConversation", chat.conversation_id);
      });

      // Join user room (both styles to match dev/prod socket setups)
      if (userId) {
        console.log("📡 Joining socket user rooms:", userId);
        socket.emit("joinUser", userId);
        socket.emit("join", userId);
      }
    });

    const handleIncomingMessage = (data) => {
      console.log("Incoming message via socket:", data);
      
      // Normalize socket payload fields
      const normalizedMsg = {
        id: data.id || data.message_id || Date.now(),
        message: data.message || data.text || "",
        sender_id: data.sender_id,
        sender_name: data.sender_name || 
                     (selectedChatRef.current && String(data.sender_id) === String(selectedChatRef.current.sender_id) 
                       ? selectedChatRef.current.sender_name 
                       : (String(data.sender_id) === String(userId) ? (userData?.name || "Admin") : "User")),
        conversation_id: data.conversation_id,
        message_type: data.message_type || "text",
        created_at: data.created_at || new Date().toISOString()
      };

      // 👉 CHAT WINDOW UPDATE
      setMessages((prev) => {
        if (
          selectedChatRef.current &&
          String(normalizedMsg.conversation_id) === String(selectedChatRef.current.conversation_id)
        ) {
          if (String(normalizedMsg.sender_id) === String(userId)) {
            return prev;
          }
          const exists = prev.some((msg) => {
            if (msg.id && normalizedMsg.id && String(msg.id) === String(normalizedMsg.id)) {
              return true;
            }
            if (msg.sender_id === normalizedMsg.sender_id && msg.message === normalizedMsg.message) {
              const t1 = new Date(msg.created_at).getTime();
              const t2 = new Date(normalizedMsg.created_at).getTime();
              if (!isNaN(t1) && !isNaN(t2) && Math.abs(t1 - t2) < 10000) {
                return true;
              }
            }
            return false;
          });
          if (exists) return prev;
          return [...prev, normalizedMsg];
        }
        return prev;
      });

      // 👉 USERS SIDEBAR UPDATE
      setUsers((prev) => {
        let updated = prev.map((chat) =>
          String(chat.conversation_id) === String(normalizedMsg.conversation_id)
            ? { 
                ...chat, 
                last_message: normalizedMsg.message,
                unread_count: (String(normalizedMsg.sender_id) === String(userId))
                  ? (chat.unread_count || chat.unread || chat.unreadCount || 0)
                  : (selectedChatRef.current && String(normalizedMsg.conversation_id) === String(selectedChatRef.current.conversation_id))
                    ? 0
                    : (chat.unread_count || chat.unread || chat.unreadCount || 0) + 1
              }
            : chat
        );
        const current = updated.find(
          (c) => String(c.conversation_id) === String(normalizedMsg.conversation_id)
        );
        const rest = updated.filter(
          (c) => String(c.conversation_id) !== String(normalizedMsg.conversation_id)
        );
        return current ? [current, ...rest] : updated;
      });

      // 👉 STAFF SIDEBAR UPDATE
      setStaff((prev) => {
        return prev.map((s) =>
          String(s.id) === String(normalizedMsg.sender_id)
            ? { 
                ...s, 
                last_message: normalizedMsg.message,
                unread_count: (String(normalizedMsg.sender_id) === String(userId))
                  ? (s.unread_count || s.unread || s.unreadCount || 0)
                  : (selectedChatRef.current && String(selectedChatRef.current.sender_id) === String(s.id))
                    ? 0
                    : (s.unread_count || s.unread || s.unreadCount || 0) + 1
              }
            : s
        );
      });
    };

    socket.on("newMessage", handleIncomingMessage);
    socket.on("receiveMessage", handleIncomingMessage);

    return () => {
      socket.off("newMessage", handleIncomingMessage);
      socket.off("receiveMessage", handleIncomingMessage);
      socket.disconnect();
    };
  }, [userId]);
  // ================= JOIN ROOM =================
  useEffect(() => {
    if (selectedChat && socketRef.current) {
      socketRef.current.emit("joinConversation", selectedChat.conversation_id);
    }
  }, [selectedChat]);
  // ================= API =================
  const initiateChat = async () => {
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_BASE_URL}chat/getAdminInbox`,
        { admin_id: userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setUsers(res.data.inbox);
      }
    } catch (err) {
      console.log(err);
    }
  };
  const staffList = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_BASE_URL}staff-list`
      );
      if (res.data.success) {
        setStaff(res.data.data);
      }
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    initiateChat();
    staffList();
  }, []);
useEffect(() => {
  if (socketRef.current && users.length > 0) {
    console.log("📡 Joining all user conversations");
    users.forEach((chat) => {
      socketRef.current.emit("joinConversation", chat.conversation_id);
    });
  }
}, [users]);
  const getMessages1 = async (chat) => {
    setSelectedChat(chat);
    setMessages([]);
    // Clear unread count locally when chat is opened
    setUsers((prev) =>
      prev.map((c) =>
        c.conversation_id === chat.conversation_id
          ? { ...c, unread_count: 0, unread: 0, unreadCount: 0 }
          : c
      )
    );
    // Mark all messages as read on the backend
    try {
      await axios.post(
        `${process.env.REACT_APP_BASE_URL}markMessagesRead`,
        {
          conversation_id: chat.conversation_id,
          current_user_id: userId,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.log("Error marking messages as read:", err);
    }
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_BASE_URL}chat/getMessages`,
        {
          conversation_id: chat.conversation_id,
          receiver_id: chat.sender_id,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setMessages(res.data.messages);
      }
    } catch (err) {
      console.log(err);
    }
  };
  // ================= START STAFF CHAT =================
  const startStaffChat = async (staffData) => {
    // Clear unread count locally when staff chat is opened
    setStaff((prev) =>
      prev.map((s) =>
        s.id === staffData.id
          ? { ...s, unread_count: 0, unread: 0, unreadCount: 0 }
          : s
      )
    );
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_BASE_URL}chat/createConversation`,
        {
          sender_id: userId,
          sender_type: "user",
          receiver_type: "user",
          receiver_id: staffData.id,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );  
      if (res.data.success) {
        const chat = {
          conversation_id: res.data.conversation_id,
          sender_id: staffData.id,
          sender_name: staffData.full_name,
        };
        setSelectedChat(chat);
        getMessages1(chat);
      }
    } catch (err) {
      console.log(err);
    }
  };
const truncateMessage = (text, limit = 20) => {
  if (!text) return "";
  return text.length > limit
    ? text.substring(0, limit) + "..."
    : text;
};
  const sendMessage1 = async () => {
    if (isSendingRef.current) return;
    const textToSend = messageText.trim();
    if (!textToSend || !selectedChat) return;

    isSendingRef.current = true;
    setMessageText("");

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_BASE_URL}chat/sendMessage`,
        {
          conversation_id: selectedChat.conversation_id,
          sender_id: userId,
          receiver_id: selectedChat.sender_id,
          message: textToSend,
          message_type: "text",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        const newMsg = {
          ...res.data.data,
          id: res.data.id || res.data.data?.id,
          sender_id: userId,
          sender_name: userData?.name || "Admin",
          message: textToSend,
          conversation_id: selectedChat.conversation_id,
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, newMsg]);
        socketRef.current.emit("sendMessage", newMsg);
        
        // Update local users sidebar last_message immediately
        setUsers((prev) => {
          let updated = prev.map((chat) =>
            chat.conversation_id === selectedChat.conversation_id
              ? { ...chat, last_message: textToSend }
              : chat
          );
          const current = updated.find(
            (c) => c.conversation_id === selectedChat.conversation_id
          );
          const rest = updated.filter(
            (c) => c.conversation_id !== selectedChat.conversation_id
          );
          return current ? [current, ...rest] : updated;
        });

        initiateChat();
      }
    } catch (err) {
      console.log(err);
      setMessageText(textToSend);
    } finally {
      isSendingRef.current = false;
    }
  };

  // ================= UI =================
  return (
    <div className="container-fluid chat-app" style={{ height: "80vh", backgroundColor: "#ffffff", borderRadius: 16, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.05)", border: "1px solid #e2e8f0", overflow: "hidden", fontFamily: "Inter, system-ui, sans-serif" }}>
      <style>{`
        .chat-app-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 transparent;
        }
        .chat-app-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .chat-app-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .chat-app-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .chat-app-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
      <div className="row g-0 h-100">
        {/* SIDEBAR */}
        <div className="col-md-3 d-flex flex-column h-100" style={{ borderRight: "1px solid #e2e8f0", backgroundColor: "#ffffff" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
            <h5 style={{ margin: 0, fontWeight: "600", color: "#1e293b", fontSize: "16px" }}>Chats</h5>
          </div>
          {/* TABS */}
          <div style={{ display: "flex", padding: "4px", gap: 4, backgroundColor: "#f1f5f9", borderRadius: 8, margin: "12px 16px" }}>
            <button
              onClick={() => setActiveTab("users")}
              style={{
                flex: 1,
                border: "none",
                padding: "6px 12px",
                borderRadius: 6,
                fontSize: "13px",
                fontWeight: "600",
                backgroundColor: activeTab === "users" ? "#ffffff" : "transparent",
                color: activeTab === "users" ? "#0b63e6" : "#64748b",
                boxShadow: activeTab === "users" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                transition: "all 0.2s"
              }}
            >
              Users
            </button>
            <button
              onClick={() => setActiveTab("staff")}
              style={{
                flex: 1,
                border: "none",
                padding: "6px 12px",
                borderRadius: 6,
                fontSize: "13px",
                fontWeight: "600",
                backgroundColor: activeTab === "staff" ? "#ffffff" : "transparent",
                color: activeTab === "staff" ? "#0b63e6" : "#64748b",
                boxShadow: activeTab === "staff" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                transition: "all 0.2s"
              }}
            >
              Staff
            </button>
          </div>
          <div className="chat-app-scrollbar" style={{ flex: 1, overflowY: "auto" }}>
            {/* USERS */}
            {activeTab === "users" &&
              [...users]
                .sort((a, b) => {
                  const aUnread = a.unread_count || a.unread || a.unreadCount || 0;
                  const bUnread = b.unread_count || b.unread || b.unreadCount || 0;
                  if (aUnread > 0 && bUnread === 0) return -1;
                  if (aUnread === 0 && bUnread > 0) return 1;
                  return 0;
                })
                .map((chat) => {
                const isActive = selectedChat?.conversation_id === chat.conversation_id;
                return (
                  <div
                    key={chat.conversation_id}
                    onClick={() => getMessages1(chat)}
                    style={{
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "12px 16px 12px 20px",
                      cursor: "pointer",
                      borderBottom: "1px solid #f1f5f9",
                      backgroundColor: isActive ? "#f0f6ff" : "transparent",
                      transition: "background-color 0.2s"
                    }}
                  >
                    {isActive && (
                      <div
                        style={{
                          position: "absolute",
                          left: 0,
                          top: 0,
                          bottom: 0,
                          width: 4,
                          backgroundColor: "#0b57d0",
                          borderRadius: "0 4px 4px 0"
                        }}
                      />
                    )}
                    <div 
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: "50%",
                        backgroundColor: isActive ? "#0b63e6" : "#0b63e6",
                        color: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "600",
                        fontSize: 14
                      }}
                    >
                      {chat.sender_name ? chat.sender_name.trim().charAt(0).toUpperCase() : "?"}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <strong style={{ display: "block", fontSize: "14px", color: "#1e293b", fontWeight: "600", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                        {chat.sender_name}
                      </strong>
                      <p style={{ margin: 0, fontSize: "12.5px", color: "#64748b", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", marginTop: "2px" }}>
                        {truncateMessage(chat.last_message, 24)}
                      </p>
                    </div>
                    {(chat.unread_count > 0 || chat.unread > 0 || chat.unreadCount > 0) && (
                      <div 
                        style={{
                          backgroundColor: "#ef4444",
                          color: "#ffffff",
                          borderRadius: "50%",
                          minWidth: 18,
                          height: 18,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "10px",
                          fontWeight: "700",
                          padding: "0 4px"
                        }}
                      >
                        {chat.unread_count || chat.unread || chat.unreadCount}
                      </div>
                    )}
                  </div>
                );
              })}
            {/* STAFF */}
            {activeTab === "staff" &&
              [...staff]
                .sort((a, b) => {
                  const aUnread = a.unread_count || a.unread || a.unreadCount || 0;
                  const bUnread = b.unread_count || b.unread || b.unreadCount || 0;
                  if (aUnread > 0 && bUnread === 0) return -1;
                  if (aUnread === 0 && bUnread > 0) return 1;
                  return 0;
                })
                .map((item) => {
                const isActive = selectedChat?.sender_id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => startStaffChat(item)}
                    style={{
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "12px 16px 12px 20px",
                      cursor: "pointer",
                      borderBottom: "1px solid #f1f5f9",
                      backgroundColor: isActive ? "#f0f6ff" : "transparent",
                      transition: "background-color 0.2s"
                    }}
                  >
                    {isActive && (
                      <div
                        style={{
                          position: "absolute",
                          left: 0,
                          top: 0,
                          bottom: 0,
                          width: 4,
                          backgroundColor: "#0b57d0",
                          borderRadius: "0 4px 4px 0"
                        }}
                      />
                    )}
                    <div 
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: "50%",
                        backgroundColor: isActive ? "#0b63e6" : "#0b63e6",
                        color: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "600",
                        fontSize: 14
                      }}
                    >
                      {item.full_name ? item.full_name.trim().charAt(0).toUpperCase() : "?"}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <strong style={{ display: "block", fontSize: "14px", color: "#1e293b", fontWeight: "600", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                        {item.full_name}
                      </strong>
                      <p style={{ margin: 0, fontSize: "12.5px", color: "#64748b", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", marginTop: "2px" }}>
                        {item.last_message || item.country_name}
                      </p>
                    </div>
                    {(item.unread_count > 0 || item.unread > 0 || item.unreadCount > 0) && (
                      <div 
                        style={{
                          backgroundColor: "#ef4444",
                          color: "#ffffff",
                          borderRadius: "50%",
                          minWidth: 18,
                          height: 18,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "10px",
                          fontWeight: "700",
                          padding: "0 4px"
                        }}
                      >
                        {item.unread_count || item.unread || item.unreadCount}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>

        {/* CHAT AREA */}
        <div className="col-md-9 d-flex flex-column h-100" style={{ backgroundColor: "#f8fafc" }}>
          {selectedChat ? (
            <>
              {/* Header */}
              <div 
                style={{ 
                  padding: "14px 20px", 
                  backgroundColor: "#ffffff", 
                  borderBottom: "1px solid #e2e8f0", 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 12
                }}
              >
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
                  {selectedChat.sender_name ? selectedChat.sender_name.trim().charAt(0).toUpperCase() : "?"}
                </div>
                <div>
                  <h6 style={{ margin: 0, fontWeight: "600", color: "#1e293b", fontSize: "14px", lineHeight: 1.2 }}>
                    {selectedChat.sender_name}
                  </h6>
                  <span style={{ fontSize: "11px", color: "#10b981", display: "flex", alignItems: "center", gap: 4, marginTop: "2px" }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#10b981", display: "inline-block" }} />
                    Active Chat
                  </span>
                </div>
              </div>

              {/* Messages area */}
              <div 
                className="chat-app-scrollbar"
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
                  messages.map((msg, i) => {
                    const isMe = msg.sender_id === userId;
                    return (
                      <div
                        key={i}
                        style={{
                          textAlign: isMe ? "right" : "left",
                        }}
                      >
                        <div
                          style={{
                            background: isMe ? "#0b63e6" : "#ffffff",
                            color: isMe ? "#ffffff" : "#1e293b",
                            padding: "10px 14px",
                            borderRadius: isMe ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
                            display: "inline-block",
                            textAlign: "left",
                            maxWidth: "70%",
                            wordBreak: "break-word",
                            boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                            border: isMe ? "none" : "1px solid #e2e8f0",
                          }}
                        >
                          <strong
                            style={{
                              display: "block",
                              fontSize: "11px",
                              fontWeight: "600",
                              marginBottom: "4px",
                              color: isMe ? "rgba(255, 255, 255, 0.85)" : "#64748b",
                            }}
                          >
                            {msg.sender_name || (isMe ? "Me" : selectedChat?.sender_name || "User")}
                          </strong>
                          <div style={{ fontSize: "13.5px", lineHeight: "1.4" }}>{msg.message}</div>
                          {msg.created_at && (
                            <div 
                              style={{ 
                                fontSize: "9px", 
                                color: isMe ? "rgba(255, 255, 255, 0.7)" : "#94a3b8",
                                textAlign: "right",
                                marginTop: "4px"
                              }}
                            >
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
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
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage1()}
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
                  onClick={sendMessage1}
                  disabled={!messageText.trim()}
                  style={{
                    borderRadius: "24px",
                    padding: "9px 22px",
                    backgroundColor: !messageText.trim() ? "#cbd5e1" : "#0b63e6",
                    borderColor: !messageText.trim() ? "#cbd5e1" : "#0b63e6",
                    color: !messageText.trim() ? "#94a3b8" : "#ffffff",
                    fontWeight: "600",
                    fontSize: "13.5px",
                    cursor: !messageText.trim() ? "not-allowed" : "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  Send
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", color: "#64748b", fontSize: "16px", fontWeight: "500" }}>
              Select a chat to start conversation
            </div>
          )}
        </div>
      </div>
    </div>
  );
}