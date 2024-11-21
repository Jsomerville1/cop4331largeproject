import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Table, InputGroup, FormControl } from 'react-bootstrap';
import './ViewMessages.css';

function ViewMessages() {
    const navigate = useNavigate();

    const [messages, setMessages] = useState<any[]>([]);
    const [isEditing, setIsEditing] = useState<number | null>(null);
    const [updatedContent, setUpdatedContent] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const user = JSON.parse(localStorage.getItem('user_data') || '{}');
    const userId = user.id;

    // Fetch messages for the user on component mount
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await fetch(buildPath('api/getUserMessages'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId })
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
    }, [userId]);

    const buildPath = (route: string): string => {
        return import.meta.env.MODE === 'development'
            ? 'http://localhost:5000/' + route
            : '/' + route;
    };

    const handleDeleteMessage = async (messageId: number) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this message?');
        
        if (!confirmDelete) {
            return;
        }
    
        try {
            const response = await fetch(buildPath('api/deletemessage'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messageId, userId })
            });
            const result = await response.json();
            if (result.error) {
                setErrorMessage(result.error);
            } else {
                setSuccessMessage('Message deleted successfully.');
                setMessages(messages.filter(msg => msg.messageId !== messageId));
            }
        } catch (error) {
            setErrorMessage('Error deleting message.');
        }
    };

    const handleEditMessage = (messageId: number, content: string) => {
        setIsEditing(messageId);
        setUpdatedContent(content);
    };

    const handleUpdateMessage = async (messageId: number) => {
        try {
            const response = await fetch(buildPath('api/editmessage'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messageId, userId, content: updatedContent })
            });
            const result = await response.json();
            if (result.error) {
                setErrorMessage(result.error);
            } else {
                setSuccessMessage('Message updated successfully.');
                // Update the message content in the state
                setMessages(messages.map(msg => msg.messageId === messageId ? { ...msg, content: updatedContent } : msg));
                setIsEditing(null);  // Exit edit mode
            }
        } catch (error) {
            setErrorMessage('Error updating message.');
        }
    };

    return (
        <div>
            <Button
                variant="secondary"
                className="redirect-button"
                onClick={() => navigate('/afterwords')}
            >
                Return to Check In
            </Button>

            <h2>Your Messages</h2>

            {errorMessage && <p className="error-message">{errorMessage}</p>}
            {successMessage && <p className="success-message">{successMessage}</p>}

            {messages.map((message) => (
                <div key={message.messageId} className="message-container">
                    {/* Message Content */}
                    <div className="message-content">
                        <h5>Content:</h5>
                        {isEditing === message.messageId ? (
                            <InputGroup>
                                <FormControl
                                    as="textarea"
                                    value={updatedContent}
                                    onChange={(e) => setUpdatedContent(e.target.value)}
                                />
                            </InputGroup>
                        ) : (
                            <p>{message.content}</p>
                        )}
                    </div>

                    {/* Recipients */}
                    <div className="message-recipients">
                        <h5>Recipients:</h5>
                        <ul>
                            {message.recipients && message.recipients.map((recipient: { name: string; email: string }, index: number) => (
                                <li key={index}>
                                    {recipient.name} ({recipient.email})
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Actions */}
                    <div className="message-actions">
                        {isEditing === message.messageId ? (
                            <Button variant="success" onClick={() => handleUpdateMessage(message.messageId)}>
                                Update Message
                            </Button>
                        ) : (
                            <Button variant="warning" onClick={() => handleEditMessage(message.messageId, message.content)}>
                                Edit
                            </Button>
                        )}
                        <Button variant="danger" onClick={() => handleDeleteMessage(message.messageId)}>
                            Delete
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default ViewMessages;
