import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Modal, Form } from 'react-bootstrap';
import './ViewMessages.css';

interface Recipient {
  recipientId: number;
  userId: number;
  recipientName: string;
  recipientEmail: string;
  messageId?: number;
  documentId?: number;
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

interface Document {
  documentId: number;
  userId: number;
  title: string;
  filePath: string;
  fileName: string;
  isSent: boolean;
  createdAt: string;
  recipientName: string;
  recipientEmail: string;
}

type MessageOrDocument = {
  type: 'text' | 'pdf';
  id: number;
  userId: number;
  content?: string; // For text messages
  title?: string; // For PDF messages
  filePath?: string; // For PDF messages
  fileName?: string;
  isSent: boolean;
  createdAt: string;
  sendAt?: string | null;
  recipients?: Recipient[]; // For text messages
  recipientName?: string; // For PDFs
  recipientEmail?: string; // For PDFs
};

function ViewMessages() {
  const navigate = useNavigate();

  const [messagesOrDocuments, setMessagesOrDocuments] = useState<MessageOrDocument[]>([]);
  const [expandedItemId, setExpandedItemId] = useState<number | null>(null);
  const [expandedItemType, setExpandedItemType] = useState<'text' | 'pdf' | null>(null);
  const [isEditingItemId, setIsEditingItemId] = useState<number | null>(null);
  const [isEditingItemType, setIsEditingItemType] = useState<'text' | 'pdf' | null>(null);
  const [updatedContent, setUpdatedContent] = useState<string>('');
  const [expandedRecipientId, setExpandedRecipientId] = useState<number | null>(null);
  const [isEditingRecipientId, setIsEditingRecipientId] = useState<number | null>(null);
  const [updatedRecipient, setUpdatedRecipient] = useState<{ name: string; email: string }>({
    name: '',
    email: '',
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showAddRecipientModal, setShowAddRecipientModal] = useState<boolean>(false);
  const [currentItemId, setCurrentItemId] = useState<number | null>(null);
  const [currentItemType, setCurrentItemType] = useState<'text' | 'pdf' | null>(null);
  const [newRecipient, setNewRecipient] = useState<{ name: string; email: string }>({
    name: '',
    email: '',
  });

  // State variables for delete confirmations
  const [showDeleteItemModal, setShowDeleteItemModal] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: number; type: 'text' | 'pdf' } | null>(
    null
  );

  const [showDeleteRecipientModal, setShowDeleteRecipientModal] = useState<boolean>(false);
  const [
    recipientToDelete,
    setRecipientToDelete,
  ] = useState<{ recipientId: number; itemId: number; itemType: 'text' | 'pdf' } | null>(null);

  const user = JSON.parse(localStorage.getItem('user_data') || '{}');
  const userId = user.id;

  const buildPath = (route: string): string => {
    return import.meta.env.MODE === 'development' ? 'http://localhost:5000/' + route : '/' + route;
  };

  // Fetch messages and documents for the user on component mount
  useEffect(() => {
    const fetchMessagesAndDocuments = async () => {
      try {
        const [messagesResponse, documentsResponse] = await Promise.all([
          fetch(buildPath('api/getUserMessages'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId }),
          }),
          fetch(buildPath('api/getUserDocuments'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId }),
          }),
        ]);

        const messagesResult = await messagesResponse.json();
        const documentsResult = await documentsResponse.json();

        console.log('Messages API Response:', messagesResult);
        console.log('Documents API Response:', documentsResult);
        let combinedMessages: MessageOrDocument[] = [];

        if (messagesResult.error) {
          setErrorMessage(messagesResult.error);
          console.error('Messages Error:', messagesResult.error);
        } else if (messagesResult.messages && messagesResult.messages.length > 0) {
          const mappedMessages = messagesResult.messages.map((msg: Message) => ({
            type: 'text',
            id: msg.messageId,
            userId: msg.userId,
            content: msg.content,
            isSent: msg.isSent,
            createdAt: msg.createdAt || new Date().toISOString(),
            sendAt: msg.sendAt,
            recipients: msg.recipients || [],
          }));
          combinedMessages = combinedMessages.concat(mappedMessages);
        } else {
          console.warn('No messages found for the user.');
        }

        if (documentsResult.error) {
          setErrorMessage(documentsResult.error);
          console.error('Documents Error:', documentsResult.error);
        } else if (documentsResult.documents && documentsResult.documents.length > 0) {
          const mappedDocuments = documentsResult.documents.map((doc: Document) => ({
            type: 'pdf',
            id: doc.documentId,
            userId: doc.userId,
            title: doc.title || 'Untitled PDF',
            filePath: doc.filePath || '',
            fileName: doc.filePath
              ? doc.filePath.split('/').pop()?.split('\\').pop()
              : 'Unknown File',
            isSent: doc.isSent,
            createdAt: doc.createdAt || new Date().toISOString(),
            recipientName: doc.recipientName || 'Unknown Recipient',
            recipientEmail: doc.recipientEmail || 'No Email Provided',
          }));
          combinedMessages = combinedMessages.concat(mappedDocuments);
        } else {
          console.warn('No documents found for the user.');
        }

        // Sort the combined array by createdAt descending
        combinedMessages.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });

        console.log('Combined Messages and Documents:', combinedMessages);
        setMessagesOrDocuments(combinedMessages);
      } catch (error) {
        console.error('Error fetching data:', error);
        setErrorMessage('Failed to load messages and documents.');
      }
    };

    fetchMessagesAndDocuments();
  }, [userId]);

  // Function to toggle item expansion
  const toggleItemExpansion = (type: 'text' | 'pdf', id: number) => {
    if (expandedItemId === id && expandedItemType === type) {
      setExpandedItemId(null);
      setExpandedItemType(null);
    } else {
      setExpandedItemId(id);
      setExpandedItemType(type);
    }
    setIsEditingItemId(null); // Close edit mode if open
  };

  // Function to toggle recipient expansion (only for text messages)
  const toggleRecipientExpansion = (recipientId: number) => {
    setExpandedRecipientId(expandedRecipientId === recipientId ? null : recipientId);
    setIsEditingRecipientId(null); // Close edit mode if open
  };

  // Function to truncate content
  const truncateContent = (content: string, maxLength: number) => {
    return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
  };

  // Handle message edit (only applicable for text messages)
  const handleEditMessage = (messageId: number, content: string) => {
    setIsEditingItemId(messageId);
    setIsEditingItemType('text');
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
        setMessagesOrDocuments(
          messagesOrDocuments.map((item) =>
            item.type === 'text' && item.id === messageId
              ? { ...item, content: updatedContent }
              : item
          )
        );
        setIsEditingItemId(null); // Exit edit mode
        setIsEditingItemType(null);
      }
    } catch (error) {
      setErrorMessage('Error updating message.');
    }
  };

  // Handle message or PDF delete
  const handleDeleteItem = (
    itemType: 'text' | 'pdf',
    itemId: number,
    event: React.MouseEvent
  ) => {
    event.stopPropagation(); // Prevent collapsing the item
    setItemToDelete({ id: itemId, type: itemType });
    setShowDeleteItemModal(true);
  };

  // Confirm deletion when the modal is confirmed
  const confirmDeleteItem = async () => {
    if (!itemToDelete) return;

    const { id: itemId, type: itemType } = itemToDelete;

    try {
      const apiRoute = itemType === 'text' ? 'api/deletemessage' : 'api/deleteDocument';
      const response = await fetch(buildPath(apiRoute), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          itemType === 'text' ? { messageId: itemId, userId } : { documentId: itemId }
        ),
      });
      const result = await response.json();
      if (result.error) {
        setErrorMessage(result.error);
      } else {
        setSuccessMessage(`${itemType === 'text' ? 'Message' : 'PDF'} deleted successfully.`);
        setMessagesOrDocuments(
          messagesOrDocuments.filter((item) => !(item.type === itemType && item.id === itemId))
        );
      }
    } catch (error) {
      setErrorMessage(`Error deleting ${itemType === 'text' ? 'message' : 'PDF'}.`);
    } finally {
      setShowDeleteItemModal(false);
      setItemToDelete(null);
    }
  };

  // Handle recipient edit (only for text messages)
  const handleEditRecipient = (recipient: Recipient) => {
    setIsEditingRecipientId(recipient.recipientId);
    setUpdatedRecipient({ name: recipient.recipientName, email: recipient.recipientEmail });
  };

  // Handle recipient update (only for text messages)
  const handleUpdateRecipient = async (
    recipientId: number,
    itemId: number,
    itemType: 'text' | 'pdf'
  ) => {
    if (itemType !== 'text') {
      // Since we don't handle recipients for PDFs
      return;
    }
    try {
      const response = await fetch(buildPath('api/editRecipient'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId,
          recipientName: updatedRecipient.name.trim(),
          recipientEmail: updatedRecipient.email.trim(),
          messageId: itemId,
        }),
      });
      const result = await response.json();
      if (result.error) {
        setErrorMessage(result.error);
      } else {
        setSuccessMessage('Recipient updated successfully.');
        // Update the recipient in the state
        setMessagesOrDocuments(
          messagesOrDocuments.map((item) => {
            if (item.type === itemType && item.id === itemId) {
              return {
                ...item,
                recipients: item.recipients?.map((recip) =>
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
            return item;
          })
        );
        setIsEditingRecipientId(null); // Exit edit mode
      }
    } catch (error) {
      setErrorMessage('Error updating recipient.');
    }
  };

  // Handle recipient delete (only for text messages)
  const handleDeleteRecipient = (
    recipientId: number,
    itemId: number,
    itemType: 'text' | 'pdf',
    event: React.MouseEvent
  ) => {
    if (itemType !== 'text') {
      // Since we don't handle recipients for PDFs
      return;
    }
    event.stopPropagation(); // Prevent collapsing the recipient
    setRecipientToDelete({ recipientId, itemId, itemType });
    setShowDeleteRecipientModal(true);
  };

  // Confirm deletion when the modal is confirmed
  const confirmDeleteRecipient = async () => {
    if (!recipientToDelete) return;

    const { recipientId, itemId, itemType } = recipientToDelete;

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
        setMessagesOrDocuments(
          messagesOrDocuments.map((item) => {
            if (item.type === itemType && item.id === itemId) {
              return {
                ...item,
                recipients: item.recipients?.filter(
                  (recip) => recip.recipientId !== recipientId
                ),
              };
            }
            return item;
          })
        );
      }
    } catch (error) {
      setErrorMessage('Error deleting recipient.');
    } finally {
      setShowDeleteRecipientModal(false);
      setRecipientToDelete(null);
    }
  };

  // Handle adding a new recipient (only for text messages)
  const handleAddRecipient = async () => {
    if (!newRecipient.name.trim() || !newRecipient.email.trim()) {
      setErrorMessage('Recipient name and email are required.');
      return;
    }
    if (currentItemType !== 'text') {
      setErrorMessage('Cannot add recipients to PDFs.');
      return;
    }
    try {
      // Build the request body
      const requestBody: any = {
        userId,
        recipientName: newRecipient.name.trim(),
        recipientEmail: newRecipient.email.trim(),
        messageId: currentItemId,
      };

      const response = await fetch(buildPath('api/addRecipient'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      const result = await response.json();
      if (result.error) {
        setErrorMessage(result.error);
      } else {
        setSuccessMessage('Recipient added successfully.');
        // Update the state
        setMessagesOrDocuments(
          messagesOrDocuments.map((item) => {
            if (item.type === 'text' && item.id === currentItemId) {
              return {
                ...item,
                recipients: [
                  ...(item.recipients || []),
                  {
                    recipientId: result.recipientId,
                    userId,
                    recipientName: newRecipient.name.trim(),
                    recipientEmail: newRecipient.email.trim(),
                    messageId: currentItemId!,
                    createdAt: new Date().toISOString(),
                  },
                ],
              };
            }
            return item;
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

      {messagesOrDocuments.length === 0 ? (
        <p>No messages found.</p>
      ) : (
        messagesOrDocuments.map((item) => (
          <div key={`${item.type}-${item.id}`} className="message-card">
            <div
              className="message-summary"
              onClick={() => toggleItemExpansion(item.type, item.id)}
              style={{ cursor: 'pointer' }}
            >
              {item.type === 'pdf' && <span className="pdf-indicator">PDF</span>}
              {item.type === 'text' ? (
                <p>
                  {expandedItemId === item.id || (item.content && item.content.length <= 100)
                    ? item.content
                    : truncateContent(item.content || '', 100)}
                </p>
              ) : (
                <p>{item.title}</p>
              )}
            </div>

            {expandedItemId === item.id && expandedItemType === item.type && (
              <div className="message-details">
                {item.type === 'text' &&
                isEditingItemId === item.id &&
                isEditingItemType === 'text' ? (
                  <>
                    {/* Message Editing */}
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
                      onClick={(e) => e.stopPropagation()} // Prevent collapse when clicking textarea
                    />
                    <Button
                      variant="success"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent collapse when clicking Save
                        handleUpdateMessage(item.id);
                      }}
                      className="custom-button"
                    >
                      Save
                    </Button>
                  </>
                ) : (
                  <>
                    {/* Item Actions */}
                    <div className="message-actions">
                      {item.type === 'text' && (
                        <>
                          <Button
                            variant="info"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent collapse when clicking Add Recipient
                              setCurrentItemId(item.id);
                              setCurrentItemType(item.type);
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
                              e.stopPropagation(); // Prevent collapse when clicking Edit Message
                              handleEditMessage(item.id, item.content || '');
                            }}
                            className="custom-button ml-2"
                          >
                            Edit Message
                          </Button>
                        </>
                      )}
                      <Button
                        variant="delete"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent collapse when clicking Delete
                          handleDeleteItem(item.type, item.id, e);
                        }}
                        className="custom-button ml-2"
                      >
                        Delete {item.type === 'text' ? 'Message' : 'PDF'}
                      </Button>
                    </div>
                  </>
                )}

                {/* Display Item Details */}
                {item.type === 'pdf' && (
                  <>
                    <p>
                      <strong>Title:</strong> {item.title}
                    </p>
                    <p>
                      <strong>File Name:</strong> {item.fileName}
                    </p>
                  </>
                )}

                {/* Recipients */}
                {item.type === 'text' && (
                  <>
                    <h5>Recipients:</h5>
                    <div className="recipients-list">
                      {item.recipients && item.recipients.length > 0 ? (
                        item.recipients.map((recipient) => (
                          <div
                            key={recipient.recipientId}
                            className="recipient-item"
                            onClick={() => toggleRecipientExpansion(recipient.recipientId)}
                            style={{
                              cursor: 'pointer',
                              border: '1px solid #ccc',
                              padding: '10px',
                              marginBottom: '5px',
                              borderRadius: '5px',
                              backgroundColor:
                                expandedRecipientId === recipient.recipientId
                                  ? '#2c2c2c'
                                  : '#fff',
                            }}
                          >
                            <div className="recipient-summary">
                              <strong>{recipient.recipientName}</strong> ({recipient.recipientEmail})
                            </div>
                            {expandedRecipientId === recipient.recipientId && (
                              <div
                                className="recipient-details"
                                style={{ marginTop: '10px' }}
                                onClick={(e) => e.stopPropagation()} // Prevent collapse when clicking inside
                              >
                                {isEditingRecipientId === recipient.recipientId ? (
                                  <>
                                    <Form.Group
                                      controlId={`recipientName-${recipient.recipientId}`}
                                    >
                                      <Form.Label>Name:</Form.Label>
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
                                        onClick={(e) => e.stopPropagation()} // Prevent collapse when clicking input
                                      />
                                    </Form.Group>
                                    <Form.Group
                                      controlId={`recipientEmail-${recipient.recipientId}`}
                                      className="mt-2"
                                    >
                                      <Form.Label>Email:</Form.Label>
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
                                        onClick={(e) => e.stopPropagation()} // Prevent collapse when clicking input
                                      />
                                    </Form.Group>
                                    <div className="recipient-actions mt-2">
                                      <Button
                                        variant="success"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation(); // Prevent collapse when clicking Save
                                          handleUpdateRecipient(
                                            recipient.recipientId,
                                            item.id,
                                            item.type
                                          );
                                        }}
                                        className="custom-button"
                                      >
                                        Save
                                      </Button>
                                      <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation(); // Prevent collapse when clicking Cancel
                                          setIsEditingRecipientId(null);
                                        }}
                                        className="ml-2"
                                      >
                                        Cancel
                                      </Button>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <Button
                                      variant="primary"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation(); // Prevent collapse when clicking Edit
                                        handleEditRecipient(recipient);
                                      }}
                                      className="custom-button mt-2"
                                    >
                                      Edit
                                    </Button>
                                    <Button
                                      variant="danger"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation(); // Prevent collapse when clicking Remove
                                        handleDeleteRecipient(
                                          recipient.recipientId,
                                          item.id,
                                          item.type,
                                          e
                                        );
                                      }}
                                      className="custom-button ml-2 mt-2"
                                    >
                                      Remove
                                    </Button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <p>No recipients added.</p>
                      )}
                    </div>
                  </>
                )}

                {item.type === 'pdf' && (
                  <>
                    <h5>Recipient:</h5>
                    <p>
                      {item.recipientName} ({item.recipientEmail})
                    </p>
                  </>
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
                onClick={(e) => e.stopPropagation()} // Prevent collapse when clicking inside modal
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
                onClick={(e) => e.stopPropagation()} // Prevent collapse when clicking inside modal
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

      {/* Delete Item Modal */}
      <Modal
        show={showDeleteItemModal}
        onHide={() => setShowDeleteItemModal(false)}
        centered
        dialogClassName="custom-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title style={{ color: '#F8F8FF' }}>
            Confirm Delete {itemToDelete?.type === 'text' ? 'Message' : 'PDF'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: '#2c2c2c' }}>
          <p>
            Are you sure you want to delete this{' '}
            {itemToDelete?.type === 'text' ? 'message' : 'PDF'}?
          </p>
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: '#2c2c2c' }}>
          <Button variant="secondary" onClick={() => setShowDeleteItemModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDeleteItem}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Recipient Modal */}
      <Modal
        show={showDeleteRecipientModal}
        onHide={() => setShowDeleteRecipientModal(false)}
        centered
        dialogClassName="custom-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title style={{ color: '#F8F8FF' }}>Confirm Delete Recipient</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: '#2c2c2c' }}>
          <p>Are you sure you want to delete this recipient?</p>
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: '#2c2c2c' }}>
          <Button variant="secondary" onClick={() => setShowDeleteRecipientModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDeleteRecipient}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default ViewMessages;
