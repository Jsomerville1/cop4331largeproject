import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';
import LoginPage from './pages/LoginPage';
import CardPage from './pages/CardPage';
import CreateMessagePage from './pages/CreateMessagePage';
import ViewMessagesPage from './pages/ViewMessagesPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/afterwords" element={<CardPage />} />
        <Route path="/afterwords/create-message" element={<CreateMessagePage />} />
        <Route path="/afterwords/view-messages" element={<ViewMessagesPage />} />
        <Route path="/afterwords/settings" element={<SettingsPage />} />
      </Routes>
    </BrowserRouter>
      );
}

export default App;