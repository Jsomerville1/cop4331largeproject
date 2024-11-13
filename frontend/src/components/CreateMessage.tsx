import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function CreateMessage() {
    function buildPath(route: string): string {
        return import.meta.env.MODE === 'development'
            ? 'http://localhost:5000/' + route
            : '/' + route;
    }

    const [content, setContent] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [messageId, setMessageId] = useState<number | null>(null);

    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user_data') || '{}');

    async function addMessage(event: React.FormEvent): Promise<void> {
        event.preventDefault(); //prevents page refresh from form submit
        const userId = user.id;

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
                setErrorMessage(null); // Clear any previous error
            }
        } catch (error: any) {
            alert(error.toString());
        }
    };

    return (
        <div>
            <h2>Create a New Message</h2>
            <form onSubmit={addMessage}>
                <div>
                    <label>Message Content:</label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />
                </div>
                <button type="submit">Add Message</button>
            </form>
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
            {messageId && (<p style={{ color: 'green' }}>Message added successfully! Message ID: {messageId}</p>)}
        </div>
    );
}

export default CreateMessage;