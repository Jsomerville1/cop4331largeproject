// src/components/CreateMessage.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CreateMessage from './CreateMessage';
import { MemoryRouter } from 'react-router-dom';
import fetchMock from 'jest-fetch-mock';
import { mockNavigate } from 'react-router-dom';

describe('CreateMessage Component', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
    mockNavigate.mockClear();
    localStorage.clear();
    localStorage.setItem(
      'user_data',
      JSON.stringify({
        id: '1',
        firstName: 'Test',
        lastName: 'User',
      })
    );
  });

  test('renders CreateMessage component with all elements', () => {
    render(<CreateMessage />, { wrapper: MemoryRouter });

    // Check for main elements
    expect(screen.getByText('Return to Check In')).toBeInTheDocument();
    expect(screen.getByText('Create a New Message')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Text Message' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'PDF Message' })).toBeInTheDocument();
    expect(screen.getByLabelText('Message Content:')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add Message' })).toBeInTheDocument();
  });

  test('can add a new text message', async () => {
    // Mock the fetch response for adding a message
    fetchMock.mockResponseOnce(JSON.stringify({ messageId: 123 }));

    render(<CreateMessage />, { wrapper: MemoryRouter });

    // Enter message content
    fireEvent.change(screen.getByLabelText('Message Content:'), {
      target: { value: 'Test message content' },
    });

    // Click on "Add Message" button
    fireEvent.click(screen.getByRole('button', { name: 'Add Message' }));

    // Wait for the success message to appear
    await waitFor(() => {
      expect(screen.getByText('Message added successfully!')).toBeInTheDocument();
    });

    // Check that the message is displayed
    expect(screen.getByText('Added Messages')).toBeInTheDocument();
    expect(screen.getByText('Test message content')).toBeInTheDocument();

    // Verify that fetch was called with correct parameters
    expect(fetchMock).toHaveBeenCalledWith('api/addmessage', {
      method: 'POST',
      body: JSON.stringify({ userId: '1', content: 'Test message content' }),
      headers: { 'Content-Type': 'application/json' },
    });
  });

  test('can upload a new PDF message', async () => {
    // Mock the fetch response for uploading a PDF
    fetchMock.mockResponseOnce(
      JSON.stringify({ documentId: 456, filePath: '/path/to/file.pdf' })
    );

    render(<CreateMessage />, { wrapper: MemoryRouter });

    // Switch to PDF Message tab
    fireEvent.click(screen.getByRole('tab', { name: 'PDF Message' }));

    // Enter PDF title
    fireEvent.change(screen.getByLabelText('Title:'), {
      target: { value: 'Test PDF Title' },
    });

    // Upload PDF file
    const file = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' });
    const fileInput = screen.getByLabelText('Upload PDF:') as HTMLInputElement;
    Object.defineProperty(fileInput, 'files', {
      value: [file],
    });
    fireEvent.change(fileInput);

    // Enter recipient name and email
    fireEvent.change(screen.getByLabelText('Recipient Name:'), {
      target: { value: 'Recipient Name' },
    });
    fireEvent.change(screen.getByLabelText('Recipient Email:'), {
      target: { value: 'recipient@example.com' },
    });

    // Click on "Upload PDF" button
    fireEvent.click(screen.getByRole('button', { name: 'Upload PDF' }));

    // Wait for the success message to appear
    await waitFor(() => {
      expect(screen.getByText('PDF uploaded successfully!')).toBeInTheDocument();
    });

    // Check that the PDF details are displayed
    expect(screen.getByText('Uploaded PDFs')).toBeInTheDocument();
    expect(screen.getByText('Title: Test PDF Title')).toBeInTheDocument();
    expect(
      screen.getByText('Recipient: Recipient Name (recipient@example.com)')
    ).toBeInTheDocument();

    // Verify that fetch was called with correct parameters
    expect(fetchMock).toHaveBeenCalledWith('api/uploadPdf', expect.any(Object));
  });

  test('can add a recipient to a message', async () => {
    // Mock the fetch responses:
    // First call: adding a message
    // Second call: adding a recipient
    fetchMock
      .mockResponseOnce(JSON.stringify({ messageId: 123 }))
      .mockResponseOnce(JSON.stringify({ recipientId: 456 }));

    render(<CreateMessage />, { wrapper: MemoryRouter });

    // Add a new message
    fireEvent.change(screen.getByLabelText('Message Content:'), {
      target: { value: 'Test message content' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Add Message' }));

    // Wait for the message to be added
    await waitFor(() => {
      expect(screen.getByText('Message added successfully!')).toBeInTheDocument();
    });

    // Expand the message card
    fireEvent.click(screen.getByText('Test message content'));

    // Click on "Add Recipient" button
    fireEvent.click(screen.getByRole('button', { name: 'Add Recipient' }));

    // Fill in recipient details in the modal
    fireEvent.change(screen.getByPlaceholderText('Enter recipient name'), {
      target: { value: 'Recipient Name' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter recipient email'), {
      target: { value: 'recipient@example.com' },
    });

    // Click on "Add Recipient" in the modal
    fireEvent.click(screen.getByRole('button', { name: 'Add Recipient' }));

    // Wait for the recipient to be added
    await waitFor(() => {
      expect(screen.getByText('Recipient added successfully!')).toBeInTheDocument();
    });

    // Check that the recipient details are displayed
    expect(screen.getByText('Recipients:')).toBeInTheDocument();
    expect(screen.getByText('Recipient Name')).toBeInTheDocument();
    expect(screen.getByText('recipient@example.com')).toBeInTheDocument();

    // Verify that fetch was called with correct parameters
    expect(fetchMock).toHaveBeenNthCalledWith(1, 'api/addmessage', {
      method: 'POST',
      body: JSON.stringify({ userId: '1', content: 'Test message content' }),
      headers: { 'Content-Type': 'application/json' },
    });
    expect(fetchMock).toHaveBeenNthCalledWith(2, 'api/addRecipient', {
      method: 'POST',
      body: JSON.stringify({
        userId: '1',
        recipientName: 'Recipient Name',
        recipientEmail: 'recipient@example.com',
        messageId: 123,
      }),
      headers: { 'Content-Type': 'application/json' },
    });
  });
});
