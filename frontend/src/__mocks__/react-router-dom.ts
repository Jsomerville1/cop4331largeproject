// src/__mocks__/react-router-dom.ts

export const mockNavigate = jest.fn();

export default {
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
};
