import { useState, useEffect } from 'react';
import { Accordion, Container, ListGroup, Dropdown, NavItem, Nav, Button, Modal, Form, InputGroup, FormControl } from 'react-bootstrap';
//import { useNavigate } from 'react-router-dom';
import './ViewMessage.css';

function Message() {
    function buildPath(route: string): string {
        return import.meta.env.MODE === 'development'
            ? 'http://copteam22.xyz:5000/' + route
            : '/' + route;
    }

    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [modalErrorMessage, setmodalErrorMessage] = useState<string | null>(null);
    const [messages, setMessages] = useState<
    {
        _id: string;
        messageId: number;
        userId: number;
        content: string;
        isSent: boolean;
        createdAt: string;
        sendAt: string;
        recipients: {
            _id: string;
            messageId: number;
            recipientEmail: string;
            recipientId: number;
            recipientName: string;
            userId: number;
        }[];
    }[] | null>(null);

    const [selectedMessageId, setSelectedMessageId] = useState<number | null>(null);
    const [content, setContent] = useState('');
    const [showEditMessage, setShowEditMessage] = useState(false);
    const [selectedRecipientId, setSelectedRecipientId] = useState<number | null>(null);
    const [recipientName, setRecipientName] = useState('');
    const [recipientEmail, setRecipientEmail] = useState('');
    const [showEditRecipient, setShowEditRecipient] = useState(false);

    //const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user_data') || '{}');
    const userId = user.id;

    async function displayMessages(): Promise<void> {
        if (!userId) {
            setErrorMessage("Error: User ID is required.");
            return;
        }

        const messageData = { userId: userId };
        const requestBody = JSON.stringify(messageData);

        try {
            const response = await fetch(buildPath('api/getUserMessages'), {
                method: 'POST',
                body: requestBody,
                headers: { 'Content-Type': 'application/json' },
            });

            const res = await response.json();
            if (res.error) {
                setErrorMessage(res.error);
            } else {
                setMessages(res.messages); // Set retrieved messages to state
                setErrorMessage(null); // Clear any previous error
            }
        } catch (error: any) {
            setErrorMessage("Error: failed to fetch messages.");
        }
    }

    // Fetch messages when the component loads
    useEffect(() => {
        displayMessages();
    }, []);

    //delete message
    const handleDeleteMessage = async (messageId: number) => {
        if (!messages) {
            alert("Error: No messages to be deleted.");
            return;
        }

        const confirmDelete = window.confirm('Are you sure you want to delete this message?');
        if (!confirmDelete) {return;}
    
        try {
            const response = await fetch(buildPath('api/deletemessage'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messageId, userId })
            });
            const res = await response.json();
            if (res.error) {
                alert(res.error);
            } else {
                console.log('Message deleted successfully.');
                setMessages(messages.filter(msg => msg.messageId !== messageId));
            }
        } catch (error) {
            alert('Error deleting message.');
        }
    };

    const toggleEditMessage = async (messageId: number, messageContent: string) => {
        setmodalErrorMessage("");
        setSelectedMessageId(messageId);
        setContent(messageContent);
        setShowEditMessage(true);
    }

    //edit message
    const saveMessageChanges = async (messageId: number | null) => {
        if (!userId || !content || !messages) {
            setmodalErrorMessage("Message content is required.");
            return;
        } else {
            setmodalErrorMessage("");
        }

        const updatedMessages = messages.map((message) =>
            message.messageId === messageId
                ? { ...message, content: content } //...message = all the message properties
                : message // Keep other messages unchanged
        );

        const messageData = { messageId, userId, content };
        const requestBody = JSON.stringify(messageData);

        try {
            const response = await fetch(buildPath('api/editmessage'), {
                method: 'POST',
                body: requestBody,
                headers: { 'Content-Type': 'application/json' },
            });

            const res = await response.json();
            if (res.error) {
                setmodalErrorMessage(res.error);
            } else {
                setMessages(updatedMessages);
                setmodalErrorMessage("");
                setShowEditMessage(false);
            }
        } catch (error: any) {
            setmodalErrorMessage("Error: failed to fetch messages.");
        }
    }

    const toggleEditRecipient = async (messageId: number, recipientId: number, recipName: string, recipEmail: string) => {
        setmodalErrorMessage("");
        setSelectedMessageId(messageId);
        setSelectedRecipientId(recipientId);
        setRecipientName(recipName);
        setRecipientEmail(recipEmail);
        setShowEditRecipient(true);
    }

    //edit recipient
    const saveRecipientChanges = async (messageId: number | null, recipientId: number | null) => {
        if (!userId || !recipientName || !recipientEmail || !messages) {
            setmodalErrorMessage("All fields must be filled.");
            return;
        } else {
            setmodalErrorMessage("");
        }

        const updatedMessages = messages.map((message) =>
            message.messageId === messageId
                ?   
                {
                    ...message,
                    recipients: message.recipients.map((recipient) =>
                        recipient.recipientId === selectedRecipientId
                        ? { ...recipient, recipientName: recipientName, recipientEmail: recipientEmail }
                        : recipient
                    ),
                }
                : message
          );

        const messageData = { recipientId, messageId, recipientName, recipientEmail };
        const requestBody = JSON.stringify(messageData);

        try {
            const response = await fetch(buildPath('api/editRecipient'), {
                method: 'POST',
                body: requestBody,
                headers: { 'Content-Type': 'application/json' },
            });

            const res = await response.json();
            if (res.error) {
                setmodalErrorMessage(res.error);
            } else {
                setMessages(updatedMessages);
                setmodalErrorMessage("");
                setShowEditRecipient(false);
            }
        } catch (error: any) {
            setmodalErrorMessage("Error: failed to fetch messages.");
        }
    }

    return (
        <Container>
            <h2>User Messages</h2>
            {errorMessage && <p className="error-message">{errorMessage}</p>}

            {messages && messages.length > 0 ? (
                messages?.map((message, index) => 
                (
                    <ListGroup key={message.messageId} className="mb-3">
                        <ListGroup.Item>
                            <Nav className="justify-content-end">
                                <Nav.Item>
                                    <Dropdown as={NavItem}>
                                        <Dropdown.Toggle variant="outline-secondary" id={`dropdown-${message.messageId}`} size="sm">
                                            Actions
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu>
                                            <Dropdown.Item onClick={() => toggleEditMessage(message.messageId, message.content)}>Edit</Dropdown.Item>
                                            <Dropdown.Item onClick={() => handleDeleteMessage(message.messageId)}>Delete</Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </Nav.Item>
                            </Nav>

                            <div>
                                <h4>Message {index + 1}</h4>
                                <p><strong>Created At:</strong> {new Date(message.createdAt).toLocaleString()}</p>
                                <p><strong>Status:</strong> {message.isSent ? 'Sent' : 'Not Sent'}</p>
                                <br />
                                <p><strong>Content:</strong> <br /> {message.content}</p>
                            </div>

                            <Accordion>
                                <Accordion.Item eventKey="0">
                                    <Accordion.Header>{message.recipients.length} Recipient(s)</Accordion.Header>
                                    <Accordion.Body>
                                        {message.recipients.map((recipient) => (
                                            <div key={recipient.recipientId} className="d-flex  align-items-start">
                                                <div className='mx-auto'>
                                                    <p key={recipient.recipientId}>
                                                        <strong>Name:</strong> {recipient.recipientName}<br />
                                                        <strong>Email:</strong> {recipient.recipientEmail}
                                                    </p>
                                                </div>
                                                <div className='mx-auto'>
                                                    <Button 
                                                        variant="outline-secondary"
                                                        size='sm'
                                                        onClick={() => toggleEditRecipient(message.messageId, recipient.recipientId, recipient.recipientName, recipient.recipientEmail)}
                                                        >Edit
                                                    </Button>{' '}
                                                    <Button variant="outline-danger" size='sm'>Remove</Button>
                                                </div>
                                            </div>
                                        ))}
                                    </Accordion.Body>
                                </Accordion.Item>
                            </Accordion>

                        </ListGroup.Item>
                    </ListGroup>
                ) )
            ):(
                <p>You currently have no messages.</p>
            )}

            <Modal centered show={showEditMessage} backdrop="static" onHide={() => setShowEditMessage(false)}>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3" controlId={`form-${selectedMessageId}`}>
                            <Form.Label>Edit Message Content:</Form.Label>
                            <Form.Control 
                                as="textarea"
                                value={content} 
                                onChange={(e) => setContent(e.target.value)} 
                                rows={7} 
                            />
                            {modalErrorMessage && <p className="error-message">{modalErrorMessage}</p>}
                        </Form.Group>
                    </Form>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEditMessage(false)}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={() => saveMessageChanges(selectedMessageId)}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal centered show={showEditRecipient} backdrop="static" onHide={() => setShowEditRecipient(false)}>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3" controlId={`form-${selectedRecipientId}`}>
                            <Form.Label>Edit Recipient Name:</Form.Label>
                            <InputGroup>
                                <FormControl
                                    type="text"
                                    placeholder="Recipient Name"
                                    value={recipientName}
                                    onChange={(e) => setRecipientName(e.target.value)}
                                />
                            </InputGroup>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId={`form-${selectedRecipientId}`}>
                            <Form.Label>Edit Recipient Name:</Form.Label>
                            <InputGroup>
                                <FormControl
                                    type="email"
                                    placeholder="Recipient Email"
                                    value={recipientEmail}
                                    onChange={(e) => setRecipientEmail(e.target.value)}
                                />
                            </InputGroup>
                        </Form.Group>
                        {modalErrorMessage && <p className="error-message">{modalErrorMessage}</p>}
                    </Form>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEditRecipient(false)}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={() => saveRecipientChanges(selectedMessageId, selectedRecipientId)}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
    
}

export default Message;