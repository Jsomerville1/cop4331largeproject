import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Table, InputGroup, FormControl } from 'react-bootstrap';
import './ViewMessages.css';

function ViewMessage() {
    function buildPath(route: string): string {
        return import.meta.env.MODE === 'development'
            ? 'http://localhost:5000/' + route
            : '/' + route;
    }

    const navigate = useNavigate();

    return (
        <div>
            <Button
                variant="secondary"
                className="redirect-button"
                onClick={() => navigate('/afterwords')}
            >
                Return to Check In
            </Button>
            <h5>Functionality to view all creates messages<br></br>
            (along with their respective recipients) <br></br>
            and delete any message.</h5>
        </div>
    );
}

export default ViewMessage;