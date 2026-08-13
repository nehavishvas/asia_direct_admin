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
          normalizedMsg.conversation_id ===
          selectedChatRef.current?.conversation_id
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
          chat.conversation_id === normalizedMsg.conversation_id
            ? { 
                ...chat, 
                last_message: normalizedMsg.message,
                unread_count: (normalizedMsg.conversation_id === selectedChatRef.current?.conversation_id)
                  ? 0
                  : (chat.unread_count || chat.unread || chat.unreadCount || 0) + 1
              }
            : chat
        );
        const current = updated.find(
          (c) => c.conversation_id === normalizedMsg.conversation_id
        );
        const rest = updated.filter(
          (c) => c.conversation_id !== normalizedMsg.conversation_id
        );
        return current ? [current, ...rest] : updated;
      });

      // 👉 STAFF SIDEBAR UPDATE
      setStaff((prev) => {
        return prev.map((s) =>
          s.id === normalizedMsg.sender_id
            ? { 
                ...s, 
                last_message: normalizedMsg.message,
                unread_count: (selectedChatRef.current?.sender_id === s.id)
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
    if (!messageText.trim() || !selectedChat) return;

    isSendingRef.current = true;

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_BASE_URL}chat/sendMessage`,
        {
          conversation_id: selectedChat.conversation_id,
          sender_id: userId,
          receiver_id: selectedChat.sender_id,
          message: messageText,
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
          message: messageText,
          conversation_id: selectedChat.conversation_id,
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, newMsg]);
        socketRef.current.emit("sendMessage", newMsg);
        setMessageText("");
        
        // Update local users sidebar last_message immediately
        setUsers((prev) => {
          let updated = prev.map((chat) =>
            chat.conversation_id === selectedChat.conversation_id
              ? { ...chat, last_message: messageText }
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
    } finally {
      isSendingRef.current = false;
    }
  };
  // ================= UI =================
  return (
    <div className="container-fluid chat-app">
      <div className="row g-0">
        {/* SIDEBAR */}
        <div className="col-md-3 chat-sidebar">
          <div className="chat-header">
            <h5>Chats</h5>
          </div>
          {/* TABS */}
          <ul className="nav nav-tabs">
            <li className="nav-item">
              <button
                className={`nav-link ${
                  activeTab === "users" ? "active" : ""
                }`}
                onClick={() => setActiveTab("users")}
              >
                Users
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${
                  activeTab === "staff" ? "active" : ""
                }`}
                onClick={() => setActiveTab("staff")}
              >
                Staff
              </button>
            </li>
          </ul>
          <div className="chat-list">
            {/* USERS */}
            {activeTab === "users" &&
              users.map((chat) => (
                <div
                  key={chat.conversation_id}
                  className={`chat-user ${
                    selectedChat?.conversation_id ===
                    chat.conversation_id
                      ? "active"
                      : ""
                  }`}
                  onClick={() => getMessages1(chat)}
                >
                  <div className="avatar">
                    {chat.sender_name?.charAt(0)}
                  </div>

                  <div className="chat-info" style={{ flex: 1 }}>
                    <strong>{chat.sender_name}</strong>
                    <p>{truncateMessage(chat.last_message, 20)}</p>
                  </div>
                  {(chat.unread_count > 0 || chat.unread > 0 || chat.unreadCount > 0) && (
                    <div className="unread-badge">
                      {chat.unread_count || chat.unread || chat.unreadCount}
                    </div>
                  )}
                </div>
              ))}
            {/* STAFF */}
            {activeTab === "staff" &&
              staff.map((item) => (
                <div
                  key={item.id}
                  className={`chat-user ${
                    selectedChat?.sender_id === item.id
                      ? "active"
                      : ""
                  }`}
                  onClick={() => startStaffChat(item)}
                >
                  <div className="avatar">
                    {item.full_name?.charAt(0)}
                  </div>

                  <div className="chat-info" style={{ flex: 1 }}>
                    <strong>{item.full_name}</strong>
                    <p>{item.last_message || item.country_name}</p>
                  </div>
                  {(item.unread_count > 0 || item.unread > 0 || item.unreadCount > 0) && (
                    <div className="unread-badge">
                      {item.unread_count || item.unread || item.unreadCount}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
        {/* CHAT AREA */}
        <div className="col-md-9 chat-main">
          <div className="chat-top">
            {selectedChat
              ? selectedChat.sender_name
              : "Select Chat"}
          </div>
          <div className="chat-messages">
            {messages.map((msg, i) => {
              const isMe = msg.sender_id === userId;
              return (
                <div
                  key={i}
                  className={`message-row ${
                    isMe ? "sent" : "received"
                  }`}
                >
                  <div className="message-bubble">
                    <div className="message-name">
                      {msg.sender_name}
                    </div>
                    <div>{msg.message}</div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
          <div className="chat-input d-flex gap-2 p-2">
            <input
              type="text"
              className="form-control"
              placeholder="Type message..."
              value={messageText}
              onChange={(e) =>
                setMessageText(e.target.value)
              }
              onKeyDown={(e) =>
                e.key === "Enter" && sendMessage1()
              }
            />
            <button
              className="btn btn-primary"
              onClick={sendMessage1}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}