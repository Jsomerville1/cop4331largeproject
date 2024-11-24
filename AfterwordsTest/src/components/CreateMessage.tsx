//import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Table, InputGroup, FormControl } from 'react-bootstrap';
import './CreateMessage.css';

function CreateMessage() {
    function buildPath(route: string): string {
        return import.meta.env.MODE === 'development'
            ? 'http://copteam22.xyz:5000/' + route
            : '/' + route;
    }

    const [content, setContent] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [recipients, setRecipients] = useState<{ name: string; email: string }[]>([]);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user_data') || '{}');
    const userId = user.id;

    async function addMessage(event: React.FormEvent): Promise<number | null> {
        event.preventDefault(); //prevents page refresh from form submit
        
        if (!userId || !content) {
            setErrorMessage("Error: Message content is required.");
            return null;
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
                return null;
            } else {
                setErrorMessage(null); // Clear any previous error
                setSuccessMessage("Message added successfully!");
                return Number(res.messageId);
            }
        } catch (error: any) {
            setErrorMessage("Error: failed to create message.");
            alert(error.toString());
            return null;
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
                setErrorMessage("No recipients added.");
                console.log(res.error);
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
        const newMessageId = await addMessage(event); //get messageId
        if (newMessageId) {
            await addRecipients(newMessageId); //valid messageId
        } else {
            setErrorMessage("Failed to add Recipients to message.");
            console.log("invalid messageId when adding Recipients");
        }
    };

    return (
        <div>
            <Button variant="primary" onClick={() => navigate('/afterwords')}>
                Back to Main Page
            </Button>
            <h2>Create a New Message</h2>
            <form onSubmit={handleSubmit}>
                <div>
                <label>Message Content:</label>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                />
                </div>
                <button type="submit">Add Message with Recipients</button>
            </form>

            {errorMessage && <p className="error-message">{errorMessage}</p>}
            {successMessage && <p className="success-message">{successMessage}</p>}

            <h3>Recipients</h3>
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