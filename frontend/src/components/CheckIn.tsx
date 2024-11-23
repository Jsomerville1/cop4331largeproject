import { useState, useEffect } from 'react';
import './CustomCheckIn.css';

function CheckIn() {
    const [user, setUser] = useState<any>(null);
    const [message, setMessage] = useState('');
    const [checkInFreq, setCheckInFreq] = useState<number>(604800); // Default to 7 days
    const [lastLogin, setLastLogin] = useState<string | null>(null);
    const [checkInExpiration, setCheckInExpiration] = useState<string | null>(null);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user_data') || 'null');
        if (storedUser) {
            setUser(storedUser);
            setCheckInFreq(storedUser.checkInFreq || 604800);
            setLastLogin(storedUser.lastLogin || null);

            if (storedUser.lastLogin) {
                const expiration = new Date(new Date(storedUser.lastLogin).getTime() + (storedUser.checkInFreq || 604800) * 1000);
                setCheckInExpiration(expiration.toLocaleString());
            }
        } else {
            setMessage('User data not found. Please log in again.');
        }
    }, []);

    function buildPath(route: string): string {
        return import.meta.env.MODE === 'development'
            ? 'http://localhost:5000/' + route
            : '/' + route;
    }

    async function handleCheckIn() {
        if (!user || !user.id) {
            setMessage('User not found. Please log in again.');
            return;
        }

        try {
            const response = await fetch(buildPath('api/checkIn'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ UserId: user.id }),
            });

            const res = await response.json();
            if (res.error) {
                setMessage(res.error);
            } else {
                setMessage(res.message);
                const newLoginDate = new Date().toISOString();
                setLastLogin(newLoginDate);

                const expiration = new Date(new Date(newLoginDate).getTime() + checkInFreq * 1000);
                setCheckInExpiration(expiration.toLocaleString());

                const updatedUser = { ...user, lastLogin: newLoginDate };
                setUser(updatedUser);
                localStorage.setItem('user_data', JSON.stringify(updatedUser));
            }
        } catch (error) {
            setMessage('Check-in failed. Please try again.');
        }
    }

    async function updateFrequency(newFreq: number) {
        if (!user || !user.id) {
            setMessage('User not found. Please log in again.');
            return;
        }

        try {
            const response = await fetch(buildPath('api/checkin-frequency'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, CheckInFreq: newFreq }),
            });

            const res = await response.json();
            if (res.error) {
                setMessage(res.error);
            } else {
                setMessage(res.message);
                setCheckInFreq(newFreq);

                if (lastLogin) {
                    const expiration = new Date(new Date(lastLogin).getTime() + newFreq * 1000);
                    setCheckInExpiration(expiration.toLocaleString());
                }

                const updatedUser = { ...user, checkInFreq: newFreq };
                setUser(updatedUser);
                localStorage.setItem('user_data', JSON.stringify(updatedUser));
            }
        } catch (error) {
            setMessage('Failed to update check-in frequency. Please try again.');
        }
    }

    function formatFrequency(freq: number): string {
        switch (freq) {
            case 120:
                return '2 minutes';
            case 604800:
                return '1 week';
            case 2592000:
                return '1 month';
            case 31536000:
                return '1 year';
            default:
                return `${freq} seconds`;
        }
    }

    return (
        <div className="custom-check-in-container">
            <h2>Check In</h2>

            {user ? (
                <>
                    <p><strong>Last Check-In Date:</strong> {lastLogin ? new Date(lastLogin).toLocaleString() : 'Never'}</p>
                    <p><strong>Current Check-In Frequency:</strong> {formatFrequency(checkInFreq)}</p>
                    <p><strong>Check-In Expiration:</strong> {checkInExpiration || 'N/A'}</p>

                    <button onClick={handleCheckIn} className="custom-check-in-button">
                        Check In
                    </button>

                    <div className="custom-check-in-frequency">
                        <label>Set Check-In Frequency:</label>
                        <div className="custom-radio-option">
                            <input
                                type="radio"
                                value={120}
                                checked={checkInFreq === 120}
                                onChange={() => updateFrequency(120)}
                            />
                            2 Minutes
                        </div>
                        <div className="custom-radio-option">
                            <input
                                type="radio"
                                value={604800}
                                checked={checkInFreq === 604800}
                                onChange={() => updateFrequency(604800)}
                            />
                            1 Week (7 Days)
                        </div>
                        <div className="custom-radio-option">
                            <input
                                type="radio"
                                value={2592000}
                                checked={checkInFreq === 2592000}
                                onChange={() => updateFrequency(2592000)}
                            />
                            1 Month (30 Days)
                        </div>
                        <div className="custom-radio-option">
                            <input
                                type="radio"
                                value={31536000}
                                checked={checkInFreq === 31536000}
                                onChange={() => updateFrequency(31536000)}
                            />
                            1 Year (365 Days)
                        </div>
                    </div>

                    {message && <div className="custom-message">{message}</div>}
                </>
            ) : (
                <p>Loading user data...</p>
            )}
        </div>
    );
}

export default CheckIn;
