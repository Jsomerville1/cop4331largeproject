import { useState } from 'react';

function buildPath(route: string): string {
    return import.meta.env.MODE === 'development'
    ? 'http://localhost:5000/' + route
    : '/' + route;
}

function Message() {
    return(
        <><h2>Message</h2>
        <p>Functionality for seeing the user's message upon loading,<br></br>
        a large text box for the user to type in,<br></br>
        and buttons to update the user's message (with whats in the text box) & delete it
        </p></>
    );
}

export default Message;
