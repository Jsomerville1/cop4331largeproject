// CreateMessage.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Tabs, Tab, Modal, Form, Table } from 'react-bootstrap';
import './CreateMessage.css';

interface Message {
  messageId: number;
  userId: number;
  content: string;
  isSent: boolean;
  createdAt: string;
  sendAt: string | null;
  recipients: Recipient[];
}

interface Recipient {
  recipientId: number;
  userId: number;
  recipientName: string;
  recipientEmail: string;
  messageId: number;
  createdAt: string;
}

interface Document {
  documentId: number;
  userId: number;
  recipientEmail: string;
  recipientName: string;
  title: string;
  filePath: string;
  isSent: boolean;
  createdAt: string;
}

function CreateMessage() {
  function buildPath(route: string): string {
    return import.meta.env.MODE === 'development'
      ? 'http://localhost:5000/' + route
      : '/' + route;
  }

  const [key, setKey] = useState<string>('text'); // For Tabs
  const [content, setContent] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [showRecipientModal, setShowRecipientModal] = useState(false);
  const [currentMessageId, setCurrentMessageId] = useState<number | null>(null);
  const [newRecipient, setNewRecipient] = useState<{ name: string; email: string }>({ name: '', email: '' });
  const [expandedMessageId, setExpandedMessageId] = useState<number | null>(null);

  // PDF Message State
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfTitle, setPdfTitle] = useState('');
  const [pdfRecipientName, setPdfRecipientName] = useState('');
  const [pdfRecipientEmail, setPdfRecipientEmail] = useState('');

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user_data') || '{}');
  const userId = user.id;

  // Function to add a new text message
  async function addMessage(event: React.FormEvent): Promise<void> {
    event.preventDefault();

    if (!userId || !content.trim()) {
      setErrorMessage('User ID and message content are required.');
      return;
    }

    const messageData = { userId: Number(userId), content: content.trim() };
    const requestBody = JSON.stringify(messageData);

    try {
      const response = await fetch(buildPath('api/addmessage'), {
        method: 'POST',
        body: requestBody,
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await response.json();
      if (res.error) {
        setErrorMessage(res.error);
        setSuccessMessage(null);
      } else {
        const newMessage: Message = {
          messageId: res.messageId,
          userId: Number(userId),
          content: content.trim(),
          isSent: false,
          createdAt: new Date().toISOString(),
          sendAt: null,
          recipients: [],
        };
        setMessages([...messages, newMessage]);
        setContent(''); // Clear the message input
        setErrorMessage(null);
        setSuccessMessage('Message added successfully!');
      }
    } catch (error: any) {
      setErrorMessage('An error occurred while adding the message.');
    }
  }

  // Function to add a new PDF message
  async function uploadPdf(event: React.FormEvent): Promise<void> {
    event.preventDefault();

    if (!userId || !pdfFile || !pdfRecipientName.trim() || !pdfRecipientEmail.trim() || !pdfTitle.trim()) {
      setErrorMessage('All fields are required for PDF upload.');
      return;
    }

    const formData = new FormData();
    formData.append('pdfFile', pdfFile); // The file itself
    formData.append('userId', userId.toString());
    formData.append('recipientEmail', pdfRecipientEmail.trim());
    formData.append('recipientName', pdfRecipientName.trim());
    formData.append('title', pdfTitle.trim());

    try {
      const response = await fetch(buildPath('api/uploadPdf'), {
        method: 'POST',
        body: formData,
      });

      const res = await response.json();
      if (res.error) {
        setErrorMessage(res.error);
        setSuccessMessage(null);
      } else {
        const newDocument: Document = {
          documentId: res.documentId,
          userId: Number(userId),
          recipientEmail: pdfRecipientEmail.trim(),
          recipientName: pdfRecipientName.trim(),
          title: pdfTitle.trim(),
          filePath: res.filePath, // The server should return the file path
          isSent: false,
          createdAt: new Date().toISOString(),
        };
        setDocuments([...documents, newDocument]);
        // Clear the form fields
        setPdfFile(null);
        setPdfTitle('');
        setPdfRecipientName('');
        setPdfRecipientEmail('');
        setErrorMessage(null);
        setSuccessMessage('PDF uploaded successfully!');
      }
    } catch (error: any) {
      setErrorMessage('An error occurred while uploading the PDF.');
    }
  }

  // Function to handle PDF file selection
  const handlePdfFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setPdfFile(event.target.files[0]);
    } else {
      setPdfFile(null);
    }
  };

  // Function to handle opening the recipient modal
  const handleOpenRecipientModal = (messageId: number, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering message expansion
    setCurrentMessageId(messageId);
    setNewRecipient({ name: '', email: '' }); // Reset recipient fields
    setShowRecipientModal(true);
  };

  // Function to handle closing the recipient modal
  const handleCloseRecipientModal = () => {
    setShowRecipientModal(false);
    setCurrentMessageId(null);
    setNewRecipient({ name: '', email: '' });
  };

  // Function to add a recipient to a specific message
  const handleAddRecipient = async () => {
    if (!newRecipient.name.trim() || !newRecipient.email.trim()) {
      setErrorMessage('Recipient name and email are required.');
      return;
    }

    const recipientData = {
      userId: Number(userId),
      recipientName: newRecipient.name.trim(),
      recipientEmail: newRecipient.email.trim(),
      messageId: currentMessageId,
    };
    const requestBody = JSON.stringify(recipientData);

    try {
      const response = await fetch(buildPath('api/addRecipient'), {
        method: 'POST',
        body: requestBody,
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await response.json();
      if (res.error) {
        setErrorMessage(res.error);
      } else {
        // Update the recipients list for the specific message
        setMessages(
          messages.map((msg) => {
            if (msg.messageId === currentMessageId) {
              return {
                ...msg,
                recipients: [
                  ...msg.recipients,
                  {
                    recipientId: res.recipientId,
                    userId: Number(userId),
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
        setErrorMessage(null);
        setSuccessMessage('Recipient added successfully!');
        handleCloseRecipientModal();
      }
    } catch (error: any) {
      setErrorMessage('An error occurred while adding the recipient.');
    }
  };

  // Function to remove a recipient from a message
  const handleRemoveRecipient = async (messageId: number, recipientId: number, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering message expansion
    try {
      const requestBody = JSON.stringify({ recipientId });
      const response = await fetch(buildPath('api/deleteRecipient'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: requestBody,
      });

      const res = await response.json();
      if (res.error) {
        setErrorMessage(res.error);
      } else {
        // Update the recipients list for the specific message
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
        setErrorMessage(null);
        setSuccessMessage('Recipient removed successfully!');
      }
    } catch (error: any) {
      setErrorMessage('An error occurred while removing the recipient.');
    }
  };

  // Function to toggle message expansion
  const toggleMessageExpansion = (messageId: number) => {
    setExpandedMessageId(expandedMessageId === messageId ? null : messageId);
  };

  // Function to truncate message content
  const truncateContent = (content: string, maxLength: number) => {
    return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
  };

  return (
    <div className="create-message-container">
      <Button variant="secondary" className="mb-3" onClick={() => navigate('/afterwords')}>
        Return to Check In
      </Button>

      <h2>Create a New Message</h2>

      <Tabs
        id="message-type-tabs"
        activeKey={key}
        onSelect={(k) => {
          setKey(k || 'text');
          setErrorMessage(null);
          setSuccessMessage(null);
        }}
        className="mb-3 custom-tabs"
      >
        <Tab eventKey="text" title="Text Message">
          {/* Text Message Form */}
          <form onSubmit={addMessage} className="message-form">
            <label htmlFor="messageContent">Message Content:</label>
            <textarea
              id="messageContent"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter your message here..."
              required
            />
            <button type="submit">Add Message</button>
          </form>

          {errorMessage && <p className="error-message">{errorMessage}</p>}
          {successMessage && <p className="success-message">{successMessage}</p>}

          <h3>Added Messages</h3>
          {messages.length === 0 ? (
            <p>No messages added yet.</p>
          ) : (
            messages.map((message) => (
              <div
                key={message.messageId}
                className="message-card"
                onClick={() => toggleMessageExpansion(message.messageId)}
              >
                <div className="message-summary">
                  <p>
                    {expandedMessageId === message.messageId
                      ? message.content
                      : truncateContent(message.content, 100)}
                  </p>
                </div>
                {expandedMessageId === message.messageId && (
                  <div className="message-details">
                    <Button variant="info" onClick={(e) => handleOpenRecipientModal(message.messageId, e)}>
                      Add Recipient
                    </Button>

                    <h5>Recipients:</h5>
                    {message.recipients.length === 0 ? (
                      <p>No recipients added.</p>
                    ) : (
                      <Table bordered size="sm" className="custom-table">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {message.recipients.map((recipient) => (
                            <tr key={recipient.recipientId}>
                              <td>{recipient.recipientName}</td>
                              <td>{recipient.recipientEmail}</td>
                              <td>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={(e) =>
                                    handleRemoveRecipient(message.messageId, recipient.recipientId, e)
                                  }
                                >
                                  Remove
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </Tab>

        <Tab eventKey="pdf" title="PDF Message">
          {/* PDF Message Form */}
          <form onSubmit={uploadPdf} className="pdf-form">
            <Form.Group controlId="pdfTitle">
              <Form.Label>Title:</Form.Label>
              <Form.Control
                type="text"
                value={pdfTitle}
                onChange={(e) => setPdfTitle(e.target.value)}
                placeholder="Enter title"
                required
              />
            </Form.Group>

            <Form.Group controlId="pdfFile" className="mt-3">
              <Form.Label>Upload PDF:</Form.Label>
              <Form.Control type="file" accept="application/pdf" onChange={handlePdfFileChange} required />
            </Form.Group>

            <Form.Group controlId="pdfRecipientName" className="mt-3">
              <Form.Label>Recipient Name:</Form.Label>
              <Form.Control
                type="text"
                value={pdfRecipientName}
                onChange={(e) => setPdfRecipientName(e.target.value)}
                placeholder="Enter recipient name"
                required
              />
            </Form.Group>

            <Form.Group controlId="pdfRecipientEmail" className="mt-3">
              <Form.Label>Recipient Email:</Form.Label>
              <Form.Control
                type="email"
                value={pdfRecipientEmail}
                onChange={(e) => setPdfRecipientEmail(e.target.value)}
                placeholder="Enter recipient email"
                required
              />
            </Form.Group>

            <button type="submit" className="mt-3">
              Upload PDF
            </button>
          </form>

          {errorMessage && <p className="error-message">{errorMessage}</p>}
          {successMessage && <p className="success-message">{successMessage}</p>}

          <h3>Uploaded PDFs</h3>
          {documents.length === 0 ? (
            <p>No PDFs uploaded yet.</p>
          ) : (
            documents.map((doc) => (
              <div key={doc.documentId} className="document-card">
                <p>
                  <strong>Title:</strong> {doc.title}
                </p>
                <p>
                  <strong>Recipient:</strong> {doc.recipientName} ({doc.recipientEmail})
                </p>
              </div>
            ))
          )}
        </Tab>
      </Tabs>

      {/* Recipient Modal */}
      <Modal
        show={showRecipientModal}
        onHide={handleCloseRecipientModal}
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
          <Button variant="secondary" onClick={handleCloseRecipientModal}>
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

export default CreateMessage;
