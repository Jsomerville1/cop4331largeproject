// src/components/Messages.tsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Table, Modal, Form } from 'react-bootstrap';

function Messages() {
  const [messages, setMessages] = useState<any[]>([]);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageModalData, setMessageModalData] = useState({ content: '', messageId: null });
  const [showRecipientModal, setShowRecipientModal] = useState(false);
  const [recipientModalData, setRecipientModalData] = useState({ recipientName: '', recipientEmail: '', recipientId: null, messageId: null });

  const user = JSON.parse(localStorage.getItem('user_data') || '{}');
  const userId = user.id;

  // Fetch messages on component mount
  useEffect(() => {
    fetchMessages();
  }, []);

  function buildPath(route: string): string {
    return import.meta.env.MODE === 'development'
      ? 'http://localhost:5000/' + route
      : '/' + route;
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
    <div className="container mt-4">
      <h3>Your Messages</h3>
      <Button variant="primary" onClick={handleAddMessage}>
        Add Message
      </Button>
      <Table striped bordered hover className="mt-3">
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
              <tr>
                <td>{message.messageId}</td>
                <td>{message.content}</td>
                <td>{new Date(message.createdAt).toLocaleString()}</td>
                <td>
                  <Button variant="secondary" size="sm" onClick={() => handleEditMessage(message)}>
                    Edit
                  </Button>{' '}
                  <Button variant="danger" size="sm" onClick={() => handleDeleteMessage(message.messageId)}>
                    Delete
                  </Button>{' '}
                  <Button variant="success" size="sm" onClick={() => handleAddRecipient(message.messageId)}>
                    Add Recipient
                  </Button>
                </td>
              </tr>
              {/* Recipients */}
              {message.recipients && message.recipients.length > 0 && (
                <tr>
                  <td colSpan={4}>
                    <Table bordered>
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
                              <Button variant="secondary" size="sm" onClick={() => handleEditRecipient(recipient)}>
                                Edit
                              </Button>{' '}
                              <Button variant="danger" size="sm" onClick={() => handleDeleteRecipient(recipient.recipientId)}>
                                Delete
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </Table>

      {/* Message Modal */}
      <Modal show={showMessageModal} onHide={() => setShowMessageModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{messageModalData.messageId ? 'Edit Message' : 'Add Message'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="messageContent">
              <Form.Label>Message Content</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={messageModalData.content}
                onChange={(e) => setMessageModalData({ ...messageModalData, content: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowMessageModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleMessageModalSave}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Recipient Modal */}
      <Modal show={showRecipientModal} onHide={() => setShowRecipientModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{recipientModalData.recipientId ? 'Edit Recipient' : 'Add Recipient'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="recipientName">
              <Form.Label>Recipient Name</Form.Label>
              <Form.Control
                type="text"
                value={recipientModalData.recipientName}
                onChange={(e) => setRecipientModalData({ ...recipientModalData, recipientName: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="recipientEmail">
              <Form.Label>Recipient Email</Form.Label>
              <Form.Control
                type="email"
                value={recipientModalData.recipientEmail}
                onChange={(e) => setRecipientModalData({ ...recipientModalData, recipientEmail: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRecipientModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleRecipientModalSave}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Messages;
