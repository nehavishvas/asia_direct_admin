import React, { useState, useEffect, useRef } from 'react';
import { useAiChat } from '../../hooks/useAiChat';
import { FaRobot, FaArrowUp, FaTimes, FaPlus } from 'react-icons/fa';
import './AiChatWidget.css';

// Safe markdown formatter helper
function renderMarkdown(text) {
  if (!text) return '';
  let html = text;
  
  // Basic HTML escape to prevent XSS
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Bold **text**
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Inline code `code`
  html = html.replace(/`(.*?)`/g, '<code>$1</code>');
  
  // Simple list formatting and paragraph formatting
  const lines = html.split('\n');
  let inList = false;
  const processedLines = lines.map(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const content = trimmed.substring(2);
      if (!inList) {
        inList = true;
        return '<ul><li>' + content + '</li>';
      }
      return '<li>' + content + '</li>';
    } else {
      let result = '';
      if (inList) {
        inList = false;
        result += '</ul>';
      }
      if (trimmed === '') {
        return result;
      }
      return result + '<p>' + line + '</p>';
    }
  });
  
  if (inList) {
    processedLines.push('</ul>');
  }
  
  return processedLines.join('');
}

// Custom structure renderer for freight, orders, invoices data
function renderRichCards(data) {
  if (!data) return null;
  
  // Freight details card
  if (data.freight && typeof data.freight === 'object' && Object.keys(data.freight).length > 0) {
    const frt = data.freight;
    return (
      <div className="ai-card-attachment">
        <div className="ai-card-header">
          <span>Freight Details</span>
          <span>{frt.freight_number || frt.number || frt.freightNumber || ''}</span>
        </div>
        <div className="ai-card-body">
          {frt.shipper && <div className="ai-card-row"><span className="ai-card-label">Shipper:</span><span className="ai-card-value">{frt.shipper}</span></div>}
          {frt.consignee && <div className="ai-card-row"><span className="ai-card-label">Consignee:</span><span className="ai-card-value">{frt.consignee}</span></div>}
          {frt.status && <div className="ai-card-row"><span className="ai-card-label">Status:</span><span className="ai-card-value">{frt.status}</span></div>}
          {frt.weight && <div className="ai-card-row"><span className="ai-card-label">Weight:</span><span className="ai-card-value">{frt.weight} kg</span></div>}
          {(frt.pol || frt.port_of_loading) && (
            <div className="ai-card-row">
              <span className="ai-card-label">POL:</span>
              <span className="ai-card-value">{frt.pol || frt.port_of_loading}</span>
            </div>
          )}
          {(frt.pod || frt.port_of_discharge) && (
            <div className="ai-card-row">
              <span className="ai-card-label">POD:</span>
              <span className="ai-card-value">{frt.pod || frt.port_of_discharge}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Orders details cards
  if (data.orders && Array.isArray(data.orders) && data.orders.length > 0) {
    return data.orders.map((ord, idx) => (
      <div className="ai-card-attachment" key={idx}>
        <div className="ai-card-header">
          <span>Order Details</span>
          <span>{ord.order_number || ord.id || ''}</span>
        </div>
        <div className="ai-card-body">
          {ord.client_name && <div className="ai-card-row"><span className="ai-card-label">Client:</span><span className="ai-card-value">{ord.client_name}</span></div>}
          {ord.warehouse_status && <div className="ai-card-row"><span className="ai-card-label">Warehouse Status:</span><span className="ai-card-value">{ord.warehouse_status}</span></div>}
          {ord.product_description && <div className="ai-card-row"><span className="ai-card-label">Product:</span><span className="ai-card-value">{ord.product_description}</span></div>}
        </div>
      </div>
    ));
  }

  // Invoices details cards
  if (data.invoices && Array.isArray(data.invoices) && data.invoices.length > 0) {
    return data.invoices.map((inv, idx) => (
      <div className="ai-card-attachment" key={idx}>
        <div className="ai-card-header">
          <span>Invoice Details</span>
          <span>{inv.invoice_number || inv.id || ''}</span>
        </div>
        <div className="ai-card-body">
          {inv.amount && <div className="ai-card-row"><span className="ai-card-label">Amount:</span><span className="ai-card-value">{inv.amount}</span></div>}
          {inv.due_date && <div className="ai-card-row"><span className="ai-card-label">Due Date:</span><span className="ai-card-value">{inv.due_date}</span></div>}
          {inv.status && <div className="ai-card-row"><span className="ai-card-label">Status:</span><span className="ai-card-value">{inv.status}</span></div>}
        </div>
      </div>
    ));
  }

  return null;
}

export default function AiChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [showShortcutsMenu, setShowShortcutsMenu] = useState(false);
  
  // Load auth user from local storage
  const [userId, setUserId] = useState(null);
  const [userRole, setUserRole] = useState('');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const checkUser = () => {
      try {
        const stored = localStorage.getItem("data123");
        if (stored) {
          const parsed = JSON.parse(stored);
          setUserId(parsed?.id || null);
          setUserRole(parsed?.user_type || 'User');
          setUserName(parsed?.name || '');
        } else {
          setUserId(null);
        }
      } catch (err) {
        console.error('Error loading current user details:', err);
      }
    };
    checkUser();
    // Watch localstorage for logout/login triggers
    window.addEventListener('storage', checkUser);
    return () => window.removeEventListener('storage', checkUser);
  }, []);

  const { user, topics, messages, loading, booting, send, newChat } = useAiChat({
    userId,
  });

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (open) {
      scrollToBottom();
    }
  }, [messages, loading, booting, open]);

  if (!userId) {
    return null; // Don't show the widget on login or unauthenticated screens
  }

  const handleSend = () => {
    if (input.trim()) {
      send(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good morning';
    if (hr < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const activeName = user?.name || userName || 'User';

  if (!open) {
    return (
      <div className="ai-fab-container">
        <button type="button" className="ai-fab" onClick={() => setOpen(true)} aria-label="Open Workspace AI Chat">
          <FaRobot />
        </button>
      </div>
    );
  }

  // Determine extra topics for "More shortcuts" card count
  const displayedTopics = topics.slice(0, 4);
  const remainingShortcuts = topics.length > 4 ? topics.length - 4 : 0;

  return (
    <div className="ai-panel">
      {/* Header */}
      <header>
        <div className="ai-header-left">
          <div className="ai-avatar">
            <FaRobot />
          </div>
          <div className="ai-title-group">
            <strong>Workspace AI</strong>
            <span className="ai-status">Online · AI ready</span>
          </div>
        </div>
        <div className="ai-header-right">
          <button type="button" className="ai-btn-new-chat" onClick={newChat}>
            New chat
          </button>
          <button type="button" className="ai-btn-close" onClick={() => setOpen(false)} aria-label="Close Chat">
            <FaTimes />
          </button>
        </div>
      </header>

      {/* Identity Sub-bar */}
      <div className="ai-user-identity">
        <span className="ai-user-role-label">
          {user?.roleLabel || userRole}: {user?.name || activeName}
        </span>
      </div>

      {/* Messages / Welcome View */}
      <div className="ai-messages-container">
        {booting && (
          <div className="ai-loading-dots" style={{ margin: 'auto' }}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}

        {!booting && messages.length === 0 && (
          <div className="ai-welcome-card">
            <h2 className="ai-welcome-title">{getGreeting()}, {activeName}</h2>
            <p className="ai-welcome-subtitle">
              Can I help you with freights, orders, warehouse, clients, suppliers, staff, Client KPI, collection, invoices, or more?
            </p>
            
            {topics.length > 0 && (
              <div className="ai-shortcuts-section">
                <span className="ai-shortcuts-title">Try a prompt</span>
                <div className="ai-shortcuts-grid">
                  {displayedTopics.map((t, idx) => (
                    <button
                      key={t.id}
                      type="button"
                      className={`ai-shortcut-card ${idx === 2 ? 'highlighted' : ''}`}
                      onClick={() => {
                        if (t.prompt || t.title) {
                          send(t.prompt || t.title);
                        }
                      }}
                    >
                      <strong>{t.title}</strong>
                      <span>{t.desc || 'Ask for details'}</span>
                    </button>
                  ))}
                  {remainingShortcuts > 0 && (
                    <button
                      type="button"
                      className="ai-shortcut-card"
                      onClick={() => {
                        // Click to show next topic from rest of list
                        const nextTopic = topics[4];
                        if (nextTopic && (nextTopic.prompt || nextTopic.title)) {
                          send(nextTopic.prompt || nextTopic.title);
                        }
                      }}
                    >
                      <strong>More shortcuts</strong>
                      <span>{remainingShortcuts} more options</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {!booting && messages.map((m, i) => (
          <div key={i} className={`ai-bubble-row ${m.role}`}>
            <div className="ai-bubble">
              <div dangerouslySetInnerHTML={{ __html: renderMarkdown(m.content) }} />
              {m.data && renderRichCards(m.data)}
            </div>
          </div>
        ))}

        {loading && (
          <div className="ai-bubble-row assistant">
            <div className="ai-bubble">
              <div className="ai-loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Composer (Footer) */}
      <footer>
        {showShortcutsMenu && topics.length > 0 && (
          <div className="ai-shortcuts-overlay">
            <div className="ai-shortcuts-overlay-header">
              <span>ALL SHORTCUTS</span>
              <button
                type="button"
                onClick={() => setShowShortcutsMenu(false)}
                aria-label="Close shortcuts"
              >
                <FaTimes />
              </button>
            </div>
            <div className="ai-shortcuts-overlay-list">
              {topics.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className="ai-shortcuts-overlay-item"
                  onClick={() => {
                    if (t.prompt || t.title) {
                      send(t.prompt || t.title);
                    }
                    setShowShortcutsMenu(false);
                  }}
                >
                  <strong>{t.title}</strong>
                  <span>{t.desc || 'Ask for details'}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="ai-composer-container">
          <textarea
            className="ai-composer-input"
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="How can Workspace AI help you today?"
          />
          <div className="ai-composer-bottom-row">
            <button
              type="button"
              className="ai-btn-shortcuts"
              onClick={() => setShowShortcutsMenu(!showShortcutsMenu)}
            >
              Shortcuts
            </button>
            <div className="ai-send-group">
              <span className="ai-brand-text">Workspace AI</span>
              <button
                type="button"
                className="ai-btn-send"
                onClick={handleSend}
                disabled={loading || !input.trim()}
                aria-label="Send message"
              >
                <FaArrowUp />
              </button>
            </div>
          </div>
        </div>
        <div className="ai-disclaimer">
          AI can make mistakes. Check freight, order, and invoice details before acting.
        </div>
      </footer>
    </div>
  );
}
