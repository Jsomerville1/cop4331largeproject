import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Modal, Form } from 'react-bootstrap';
import './ViewMessages.css';

interface Recipient {
  recipientId: number;
  userId: number;
  recipientName: string;
  recipientEmail: string;
  messageId: number;
  createdAt: string;
}

interface Message {
  messageId: number;
  userId: number;
  content: string;
  isSent: boolean;
  createdAt: string;
  sendAt: string | null;
  recipients: Recipient[];
}

function ViewMessages() {
  const navigate = useNavigate();

  const [messages, setMessages] = useState<Message[]>([]);
  const [expandedMessageId, setExpandedMessageId] = useState<number | null>(null);
  const [expandedRecipientId, setExpandedRecipientId] = useState<number | null>(null);
  const [isEditingMessageId, setIsEditingMessageId] = useState<number | null>(null);
  const [updatedContent, setUpdatedContent] = useState<string>('');
  const [isEditingRecipientId, setIsEditingRecipientId] = useState<number | null>(null);
  const [updatedRecipient, setUpdatedRecipient] = useState<{ name: string; email: string }>({
    name: '',
    email: '',
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showAddRecipientModal, setShowAddRecipientModal] = useState<boolean>(false);
  const [currentMessageId, setCurrentMessageId] = useState<number | null>(null);
  const [newRecipient, setNewRecipient] = useState<{ name: string; email: string }>({
    name: '',
    email: '',
  });

  const user = JSON.parse(localStorage.getItem('user_data') || '{}');
  const userId = user.id;

  const buildPath = (route: string): string => {
    return import.meta.env.MODE === 'development' ? 'http://localhost:5000/' + route : '/' + route;
  };

  // Fetch messages for the user on component mount
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(buildPath('api/getUserMessages'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        });
        const result = await response.json();
        if (result.error) {
          setErrorMessage(result.error);
        } else {
          setMessages(result.messages);
        }
      } catch (error) {
        console.error(error);
        setErrorMessage('Failed to load messages.');
      }
    };

    fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Function to toggle message expansion
  const toggleMessageExpansion = (messageId: number) => {
    setExpandedMessageId(expandedMessageId === messageId ? null : messageId);
    setIsEditingMessageId(null); // Close edit mode if open
  };

  // Function to toggle recipient expansion
  const toggleRecipientExpansion = (recipientId: number) => {
    setExpandedRecipientId(expandedRecipientId === recipientId ? null : recipientId);
    setIsEditingRecipientId(null); // Close edit mode if open
  };

  // Function to truncate content
  const truncateContent = (content: string, maxLength: number) => {
    return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
  };

  // Handle message edit
  const handleEditMessage = (messageId: number, content: string) => {
    setIsEditingMessageId(messageId);
    setUpdatedContent(content);
  };

  // Handle message update
  const handleUpdateMessage = async (messageId: number) => {
    try {
      const response = await fetch(buildPath('api/editmessage'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, userId, content: updatedContent }),
      });
      const result = await response.json();
      if (result.error) {
        setErrorMessage(result.error);
      } else {
        setSuccessMessage('Message updated successfully.');
        // Update the message content in the state
        setMessages(
          messages.map((msg) =>
            msg.messageId === messageId ? { ...msg, content: updatedContent } : msg
          )
        );
        setIsEditingMessageId(null); // Exit edit mode
      }
    } catch (error) {
      setErrorMessage('Error updating message.');
    }
  };

  // Handle message delete
  const handleDeleteMessage = async (messageId: number, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent collapsing the message
    const confirmDelete = window.confirm('Are you sure you want to delete this message?');
    if (!confirmDelete) {
      return;
    }
    try {
      const response = await fetch(buildPath('api/deletemessage'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, userId }),
      });
      const result = await response.json();
      if (result.error) {
        setErrorMessage(result.error);
      } else {
        setSuccessMessage('Message deleted successfully.');
        setMessages(messages.filter((msg) => msg.messageId !== messageId));
      }
    } catch (error) {
      setErrorMessage('Error deleting message.');
    }
  };

  // Handle recipient edit
  const handleEditRecipient = (recipient: Recipient) => {
    setIsEditingRecipientId(recipient.recipientId);
    setUpdatedRecipient({ name: recipient.recipientName, email: recipient.recipientEmail });
  };

  // Handle recipient update
  const handleUpdateRecipient = async (recipientId: number, messageId: number) => {
    try {
      const response = await fetch(buildPath('api/editRecipient'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId,
          recipientName: updatedRecipient.name,
          recipientEmail: updatedRecipient.email,
          messageId,
        }),
      });
      const result = await response.json();
      if (result.error) {
        setErrorMessage(result.error);
      } else {
        setSuccessMessage('Recipient updated successfully.');
        // Update the recipient in the state
        setMessages(
          messages.map((msg) => {
            if (msg.messageId === messageId) {
              return {
                ...msg,
                recipients: msg.recipients.map((recip) =>
                  recip.recipientId === recipientId
                    ? {
                        ...recip,
                        recipientName: updatedRecipient.name,
                        recipientEmail: updatedRecipient.email,
                      }
                    : recip
                ),
              };
            }
            return msg;
          })
        );
        setIsEditingRecipientId(null); // Exit edit mode
      }
    } catch (error) {
      setErrorMessage('Error updating recipient.');
    }
  };

  // Handle recipient delete
  const handleDeleteRecipient = async (
    recipientId: number,
    messageId: number,
    event: React.MouseEvent
  ) => {
    event.stopPropagation(); // Prevent collapsing the recipient
    const confirmDelete = window.confirm('Are you sure you want to delete this recipient?');
    if (!confirmDelete) {
      return;
    }
    try {
      const response = await fetch(buildPath('api/deleteRecipient'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientId }),
      });
      const result = await response.json();
      if (result.error) {
        setErrorMessage(result.error);
      } else {
        setSuccessMessage('Recipient deleted successfully.');
        // Update the state
        setMessages(
          messages.map((msg) => {
            if (msg.messageId === messageId) {
              return {
                ...msg,
                recipients: msg.recipients.filter((recip) => recip.recipientId !== recipientId),
              };
            }
            return msg;
          })
        );
      }
    } catch (error) {
      setErrorMessage('Error deleting recipient.');
    }
  };

  // Handle adding a new recipient
  const handleAddRecipient = async () => {
    if (!newRecipient.name.trim() || !newRecipient.email.trim()) {
      setErrorMessage('Recipient name and email are required.');
      return;
    }
    try {
      const response = await fetch(buildPath('api/addRecipient'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          recipientName: newRecipient.name.trim(),
          recipientEmail: newRecipient.email.trim(),
          messageId: currentMessageId,
        }),
      });
      const result = await response.json();
      if (result.error) {
        setErrorMessage(result.error);
      } else {
        setSuccessMessage('Recipient added successfully.');
        // Update the state
        setMessages(
          messages.map((msg) => {
            if (msg.messageId === currentMessageId) {
              return {
                ...msg,
                recipients: [
                  ...msg.recipients,
                  {
                    recipientId: result.recipientId,
                    userId,
                    recipientName: newRecipient.name.trim(),
                    recipientEmail: newRecipient.email.trim(),
                    messageId: currentMessageId!,
                    createdAt: new Date().toISOString(),
                  },
                ],
              };
            }
            return msg;
          })
        );
        setShowAddRecipientModal(false);
        setNewRecipient({ name: '', email: '' });
      }
    } catch (error) {
      setErrorMessage('Error adding recipient.');
    }
  };

  return (
    <div className="view-messages-container">
      <Button variant="secondary" className="mb-3" onClick={() => navigate('/afterwords')}>
        Return to Check In
      </Button>

      <h2>Your Messages</h2>

      {errorMessage && <p className="error-message">{errorMessage}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}

      {messages.length === 0 ? (
        <p>No messages found.</p>
      ) : (
        messages.map((message) => (
          <div
            key={message.messageId}
            className="message-card"
            onClick={() => toggleMessageExpansion(message.messageId)}
          >
            <div className="message-summary">
              <p>
                {expandedMessageId === message.messageId || message.content.length <= 100
                  ? message.content
                  : truncateContent(message.content, 100)}
              </p>
            </div>

            {expandedMessageId === message.messageId && (
              <div className="message-details">
                {/* Message Actions */}
                <div className="message-actions">
                  {isEditingMessageId === message.messageId ? (
                    <>
                      <Form.Control
                        as="textarea"
                        value={updatedContent}
                        onChange={(e) => setUpdatedContent(e.target.value)}
                        className="mb-2"
                        style={{
                          backgroundColor: '#4b4b4b',
                          color: '#ffffff',
                          border: '1px solid #414141',
                        }}
                      />
                      <Button
                        variant="success"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateMessage(message.messageId);
                        }}
                        className="custom-button"
                      >
                        Save
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="info"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentMessageId(message.messageId);
                          setShowAddRecipientModal(true);
                        }}
                        className="custom-button"
                      >
                        Add Recipient
                      </Button>
                      <Button
                        variant="edit"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditMessage(message.messageId, message.content);
                        }}
                        className="custom-button ml-2"
                      >
                        Edit Message
                      </Button>
                      <Button
                        variant="delete"
                        size="sm"
                        onClick={(e) => handleDeleteMessage(message.messageId, e)}
                        className="custom-button ml-2"
                      >
                        Delete Message
                      </Button>
                    </>
                  )}
                </div>

                {/* Recipients */}
                <h5>Recipients:</h5>

                {message.recipients.length === 0 ? (
                  <p>No recipients added.</p>
                ) : (
                  message.recipients.map((recipient) => (
                    <div
                      key={recipient.recipientId}
                      className="recipient-card"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleRecipientExpansion(recipient.recipientId);
                      }}
                    >
                      <div className="recipient-summary">
                        <p>
                          {recipient.recipientName} ({recipient.recipientEmail})
                        </p>
                      </div>

                      {expandedRecipientId === recipient.recipientId && (
                        <div className="recipient-details">
                          {isEditingRecipientId === recipient.recipientId ? (
                            <>
                              <Form.Group controlId="recipientName">
                                <Form.Label style={{ color: '#F8F8FF' }}>
                                  Recipient Name:
                                </Form.Label>
                                <Form.Control
                                  type="text"
                                  value={updatedRecipient.name}
                                  onChange={(e) =>
                                    setUpdatedRecipient({
                                      ...updatedRecipient,
                                      name: e.target.value,
                                    })
                                  }
                                  style={{
                                    backgroundColor: '#4b4b4b',
                                    color: '#ffffff',
                                    border: '1px solid #414141',
                                  }}
                                />
                              </Form.Group>
                              <Form.Group controlId="recipientEmail">
                                <Form.Label style={{ color: '#F8F8FF' }}>
                                  Recipient Email:
                                </Form.Label>
                                <Form.Control
                                  type="email"
                                  value={updatedRecipient.email}
                                  onChange={(e) =>
                                    setUpdatedRecipient({
                                      ...updatedRecipient,
                                      email: e.target.value,
                                    })
                                  }
                                  style={{
                                    backgroundColor: '#4b4b4b',
                                    color: '#ffffff',
                                    border: '1px solid #414141',
                                  }}
                                />
                              </Form.Group>
                              <Button
                                variant="success"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateRecipient(recipient.recipientId, message.messageId);
                                }}
                                className="custom-button"
                              >
                                Save
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="edit"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditRecipient(recipient);
                                }}
                                className="custom-button"
                              >
                                Edit Recipient
                              </Button>
                              <Button
                                variant="delete"
                                size="sm"
                                onClick={(e) =>
                                  handleDeleteRecipient(
                                    recipient.recipientId,
                                    message.messageId,
                                    e
                                  )
                                }
                                className="custom-button ml-2"
                              >
                                Delete Recipient
                              </Button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        ))
      )}

      {/* Add Recipient Modal */}
      <Modal
        show={showAddRecipientModal}
        onHide={() => setShowAddRecipientModal(false)}
        centered
        dialogClassName="custom-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title style={{ color: '#F8F8FF' }}>Add Recipient</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: '#2c2c2c' }}>
          <Form>
            <Form.Group controlId="recipientName">
              <Form.Label style={{ color: '#F8F8FF' }}>Recipient Name:</Form.Label>
              <Form.Control
                type="text"
                value={newRecipient.name}
                onChange={(e) => setNewRecipient({ ...newRecipient, name: e.target.value })}
                placeholder="Enter recipient name"
                style={{
                  backgroundColor: '#4b4b4b',
                  color: '#ffffff',
                  border: '1px solid #414141',
                }}
                required
              />
            </Form.Group>
            <Form.Group controlId="recipientEmail" className="mt-3">
              <Form.Label style={{ color: '#F8F8FF' }}>Recipient Email:</Form.Label>
              <Form.Control
                type="email"
                value={newRecipient.email}
                onChange={(e) => setNewRecipient({ ...newRecipient, email: e.target.value })}
                placeholder="Enter recipient email"
                style={{
                  backgroundColor: '#4b4b4b',
                  color: '#ffffff',
                  border: '1px solid #414141',
                }}
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: '#2c2c2c' }}>
          <Button variant="secondary" onClick={() => setShowAddRecipientModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddRecipient}>
            Add Recipient
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default ViewMessages;
