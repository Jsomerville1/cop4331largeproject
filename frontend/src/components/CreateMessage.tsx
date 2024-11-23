import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Table, InputGroup, FormControl } from 'react-bootstrap';
import './CreateMessage.css';

function CreateMessage() {
    function buildPath(route: string): string {
        return import.meta.env.MODE === 'development'
            ? 'http://localhost:5000/' + route
            : '/' + route;
    }

    const [content, setContent] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [messageId, setMessageId] = useState<number | null>(null);
    const [recipients, setRecipients] = useState<{ name: string; email: string }[]>([]);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user_data') || '{}');
    const userId = user.id;

    async function addMessage(event: React.FormEvent): Promise<void> {
        event.preventDefault();

        if (!userId || !content) {
            setErrorMessage("User ID and message content are required.");
            return;
        }

        const messageData = { userId: userId, content: content };
        const requestBody = JSON.stringify(messageData);

        try {
            const response = await fetch(buildPath('api/addmessage'), {
                method: 'POST',
                body: requestBody,
                headers: { 'Content-Type': 'application/json' }
            });

            const res = await response.json();
            if (res.error) {
                setErrorMessage(res.error);
            } else {
                setMessageId(res.messageId);
                setErrorMessage(null);
                setSuccessMessage("Message added successfully!");
            }
        } catch (error: any) {
            alert(error.toString());
        }
    };

    async function addRecipients(messageId: number): Promise<void> {
        for (const recipient of recipients) {
            const { name: recipientName, email: recipientEmail } = recipient;
            const recipientData = { userId, recipientName, recipientEmail, messageId };
            const requestBody = JSON.stringify(recipientData);

            try {
                const response = await fetch(buildPath('api/addRecipient'), {
                    method: 'POST',
                    body: requestBody,
                    headers: { 'Content-Type': 'application/json' }
                });

                const res = await response.json();
                if (res.error) {
                    setErrorMessage(res.error);
                    return;
                } else {
                    setSuccessMessage("Recipients added successfully!");
                }
            } catch (error: any) {
                alert(error.toString());
            }
        }
    }

    const handleAddRecipient = () => {
        setRecipients([...recipients, { name: '', email: '' }]);
    };

    const handleClearRecipients = () => {
        setRecipients([]);
    };

    const handleRecipientChange = (index: number, field: 'name' | 'email', value: string) => {
        const newRecipients = [...recipients];
        newRecipients[index][field] = value;
        setRecipients(newRecipients);
    };

    const handleRemoveRecipient = (index: number) => {
        setRecipients(recipients.filter((_, i) => i !== index));
    };

    const handleSubmit = async (event: React.FormEvent) => {
        await addMessage(event);
        if (messageId) {
            await addRecipients(messageId);
        } else {
            setErrorMessage("Failed to add Recipients to message.");
            console.log("invalid messageId when adding Recipients");
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
            <h2>Create a New Message</h2>
            <p>Be sure to add Recipients before submitting!</p>
            <form onSubmit={handleSubmit}>
                <label >Message Content:</label>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                />
                <button type="submit">Add Message with Recipients</button>
            </form>

            {errorMessage && <p className="error-message">{errorMessage}</p>}
            {successMessage && <p className="success-message">{successMessage}</p>}

            <h2>Message Recipients</h2>
            <div className="d-flex mb-2">
                <Button variant="primary" onClick={handleAddRecipient}>
                    Add Recipient
                </Button>
                <Button variant="danger" onClick={handleClearRecipients} className="ms-2">
                    Clear All Recipients
                </Button>
            </div>

            <Table bordered className="custom-table">
                <thead className="custom-thead">
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {recipients.map((recipient, index) => (
                        <tr key={index}>
                            <td>
                                <InputGroup>
                                    <FormControl
                                        type="text"
                                        placeholder="Recipient Name"
                                        value={recipient.name}
                                        onChange={(e) => handleRecipientChange(index, 'name', e.target.value)}
                                    />
                                </InputGroup>
                            </td>
                            <td>
                                <InputGroup>
                                    <FormControl
                                        type="email"
                                        placeholder="Recipient Email"
                                        value={recipient.email}
                                        onChange={(e) => handleRecipientChange(index, 'email', e.target.value)}
                                    />
                                </InputGroup>
                            </td>
                            <td>
                                <Button variant="danger" onClick={() => handleRemoveRecipient(index)}>
                                    Remove
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
}

export default CreateMessage;
