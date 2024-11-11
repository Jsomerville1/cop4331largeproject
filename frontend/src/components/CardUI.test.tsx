import { render, screen, fireEvent } from '@testing-library/react';
import CardUI from './CardUI';

describe('CardUI Component', () => {
  beforeEach(() => {
    // Mock localStorage
    const user_data = { id: '123', firstName: 'John', lastName: 'Doe' };
    localStorage.setItem('user_data', JSON.stringify(user_data));
  });

  afterEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
  });

  test('renders search and add card inputs and buttons', () => {
    render(<CardUI />);

    expect(screen.getByPlaceholderText('Card To Search For')).toBeInTheDocument();
    expect(screen.getByText('Search Card')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Card To Add')).toBeInTheDocument();
    expect(screen.getByText('Add Card')).toBeInTheDocument();
  });

  test('shows message when card is added', async () => {
    // Mock fetch for addCard
    global.fetch = jest.fn(() =>
      Promise.resolve({
        text: () => Promise.resolve(JSON.stringify({ error: '', result: 'Card added' })),
      })
    ) as jest.Mock;

    render(<CardUI />);

    fireEvent.change(screen.getByPlaceholderText('Card To Add'), { target: { value: 'New Card' } });
    fireEvent.click(screen.getByText('Add Card'));

    const message = await screen.findByText('Card has been added');
    expect(message).toBeInTheDocument();
  });

  test('displays search results', async () => {
    // Mock fetch for searchCard
    const mockResults = ['Card1', 'Card2'];
    global.fetch = jest.fn(() =>
      Promise.resolve({
        text: () => Promise.resolve(JSON.stringify({ results: mockResults, error: '' })),
      })
    ) as jest.Mock;

    render(<CardUI />);

    fireEvent.change(screen.getByPlaceholderText('Card To Search For'), { target: { value: 'Card' } });
    fireEvent.click(screen.getByText('Search Card'));

    const resultMessage = await screen.findByText('Card(s) have been retrieved');
    expect(resultMessage).toBeInTheDocument();

    expect(screen.getByText('Card1, Card2')).toBeInTheDocument();
  });
});
