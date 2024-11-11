// src/components/Message.tsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Message.css'; // Import the CSS file

function Message() {
  const [messages, setMessages] = useState<any[]>([]);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageModalData, setMessageModalData] = useState({ content: '', messageId: null });
  const [showRecipientModal, setShowRecipientModal] = useState(false);
  const [recipientModalData, setRecipientModalData] = useState({
    recipientName: '',
    recipientEmail: '',
    recipientId: null,
    messageId: null,
  });

  const user = JSON.parse(localStorage.getItem('user_data') || '{}');
  const userId = user.id;

  // Fetch messages on component mount
  useEffect(() => {
    fetchMessages();
  }, []);

  function buildPath(route: string): string {
    return import.meta.env.MODE === 'development' ? 'http://localhost:5000/' + route : '/' + route;
  }

  const fetchMessages = async () => {
    try {
      const response = await axios.post(buildPath('api/getUserMessages'), { userId });
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Message Functions
  const handleAddMessage = () => {
    setMessageModalData({ content: '', messageId: null });
    setShowMessageModal(true);
  };

  const handleEditMessage = (message: any) => {
    setMessageModalData({ content: message.content, messageId: message.messageId });
    setShowMessageModal(true);
  };

  const handleDeleteMessage = async (messageId: number) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await axios.post(buildPath('api/deletemessage'), { messageId, userId });
        fetchMessages();
      } catch (error) {
        console.error('Error deleting message:', error);
      }
    }
  };

  const handleMessageModalSave = async () => {
    if (messageModalData.messageId) {
      // Edit message
      try {
        await axios.post(buildPath('api/editmessage'), {
          messageId: messageModalData.messageId,
          userId,
          content: messageModalData.content,
        });
        setShowMessageModal(false);
        fetchMessages();
      } catch (error) {
        console.error('Error editing message:', error);
      }
    } else {
      // Add message
      try {
        await axios.post(buildPath('api/addmessage'), {
          userId,
          content: messageModalData.content,
        });
        setShowMessageModal(false);
        fetchMessages();
      } catch (error) {
        console.error('Error adding message:', error);
      }
    }
  };

  // Recipient Functions
  const handleAddRecipient = (messageId: number) => {
    setRecipientModalData({ recipientName: '', recipientEmail: '', recipientId: null, messageId });
    setShowRecipientModal(true);
  };

  const handleEditRecipient = (recipient: any) => {
    setRecipientModalData({
      recipientName: recipient.recipientName,
      recipientEmail: recipient.recipientEmail,
      recipientId: recipient.recipientId,
      messageId: recipient.messageId,
    });
    setShowRecipientModal(true);
  };

  const handleDeleteRecipient = async (recipientId: string) => {
    if (window.confirm('Are you sure you want to delete this recipient?')) {
      try {
        await axios.post(buildPath('api/deleteRecipient'), { recipientId });
        fetchMessages();
      } catch (error) {
        console.error('Error deleting recipient:', error);
      }
    }
  };

  const handleRecipientModalSave = async () => {
    if (recipientModalData.recipientId) {
      // Edit recipient
      try {
        await axios.post(buildPath('api/editRecipient'), {
          recipientId: recipientModalData.recipientId,
          messageId: recipientModalData.messageId,
          recipientName: recipientModalData.recipientName,
          recipientEmail: recipientModalData.recipientEmail,
        });
        setShowRecipientModal(false);
        fetchMessages();
      } catch (error) {
        console.error('Error editing recipient:', error);
      }
    } else {
      // Add recipient
      try {
        await axios.post(buildPath('api/addRecipient'), {
          username: user.username,
          recipientName: recipientModalData.recipientName,
          recipientEmail: recipientModalData.recipientEmail,
          messageId: recipientModalData.messageId,
        });
        setShowRecipientModal(false);
        fetchMessages();
      } catch (error) {
        console.error('Error adding recipient:', error);
      }
    }
  };

  return (
    <div className="messages-container">
      <h3>Your Messages</h3>
      <button onClick={handleAddMessage} className="add-message-button">
        Add Message
      </button>

      <table className="messages-table">
        <thead>
          <tr>
            <th>Message ID</th>
            <th>Content</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {messages.map((message) => (
            <React.Fragment key={message.messageId}>
              <tr className="message-row">
                <td>{message.messageId}</td>
                <td>{message.content}</td>
                <td>{new Date(message.createdAt).toLocaleString()}</td>
                <td>
                  <button onClick={() => handleEditMessage(message)}>Edit</button>{' '}
                  <button onClick={() => handleDeleteMessage(message.messageId)}>Delete</button>{' '}
                  <button onClick={() => handleAddRecipient(message.messageId)}>Add Recipient</button>
                </td>
              </tr>
              {/* Recipients */}
              {message.recipients && message.recipients.length > 0 && (
                <tr className="recipients-row">
                  <td colSpan={4}>
                    <table className="recipients-table">
                      <thead>
                        <tr>
                          <th>Recipient Name</th>
                          <th>Recipient Email</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {message.recipients.map((recipient: any) => (
                          <tr key={recipient.recipientId}>
                            <td>{recipient.recipientName}</td>
                            <td>{recipient.recipientEmail}</td>
                            <td>
                              <button onClick={() => handleEditRecipient(recipient)}>Edit</button>{' '}
                              <button onClick={() => handleDeleteRecipient(recipient.recipientId)}>Delete</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>

      {/* Message Modal */}
      {showMessageModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{messageModalData.messageId ? 'Edit Message' : 'Add Message'}</h2>
            <textarea
              rows={5}
              value={messageModalData.content}
              onChange={(e) => setMessageModalData({ ...messageModalData, content: e.target.value })}
              placeholder="Enter your message content here..."
            />
            <div className="modal-buttons">
              <button onClick={() => setShowMessageModal(false)}>Cancel</button>
              <button onClick={handleMessageModalSave}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Recipient Modal */}
      {showRecipientModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{recipientModalData.recipientId ? 'Edit Recipient' : 'Add Recipient'}</h2>
            <input
              type="text"
              placeholder="Recipient Name"
              value={recipientModalData.recipientName}
              onChange={(e) => setRecipientModalData({ ...recipientModalData, recipientName: e.target.value })}
            />
            <input
              type="email"
              placeholder="Recipient Email"
              value={recipientModalData.recipientEmail}
              onChange={(e) => setRecipientModalData({ ...recipientModalData, recipientEmail: e.target.value })}
            />
            <div className="modal-buttons">
              <button onClick={() => setShowRecipientModal(false)}>Cancel</button>
              <button onClick={handleRecipientModalSave}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Message;
