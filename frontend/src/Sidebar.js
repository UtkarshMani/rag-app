import React, { useState } from "react";
import styles from "./App.module.css";

function Sidebar({ 
  currentChatId, 
  chatHistory = [],
  onNewChat, 
  onSelectChat, 
  onDeleteChat, 
  user, 
  onLogout 
}) {
  const [loading, setLoading] = useState(false);

  const handleDeleteChat = async (chatId, e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this chat?")) {
      try {
        setLoading(true);
        await onDeleteChat(chatId);
      } catch (error) {
        console.error("Error deleting chat:", error);
        alert("Failed to delete chat. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className={styles.sidebar}>
      {/* Header */}
      <div className={styles.sidebarHeader}>
        <button 
          className={styles.newChatBtn}
          onClick={onNewChat}
        >
          <span className={styles.plusIcon}>+</span>
          New chat
        </button>
      </div>

      {/* Chat History */}
      <div className={styles.chatHistory}>
        {loading ? (
          <div className={styles.loadingChats}>Loading chats...</div>
        ) : chatHistory.length === 0 ? (
          <div className={styles.noChats}>No chat history yet</div>
        ) : (
          chatHistory.map((chat) => (
            <div
              key={chat.id}
              className={`${styles.chatItem} ${currentChatId === chat.id ? styles.activeChatItem : ''}`}
              onClick={() => onSelectChat(chat)}
            >
              <div className={styles.chatTitle}>{chat.title}</div>
              <div className={styles.chatMeta}>
                <button
                  className={styles.deleteChatBtn}
                  onClick={(e) => handleDeleteChat(chat.id, e)}
                  title="Delete chat"
                  disabled={loading}
                >
                  <span className={styles.deleteIcon}>🗑️</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* User Profile & Logout */}
      <div className={styles.sidebarFooter}>
        {user && (
          <div className={styles.userProfileSidebar}>
            <div className={styles.userInfoSidebar}>
              <div className={styles.userName}>{user.full_name}</div>
              <div className={styles.userRole}>{user.role}</div>
            </div>
            <button 
              onClick={onLogout} 
              className={styles.logoutBtnSidebar}
              title="Logout"
            >
              ↗
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Sidebar;