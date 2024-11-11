import { useState } from 'react';

function buildPath(route: string): string {
    return import.meta.env.MODE === 'development'
    ? 'http://localhost:5000/' + route
    : '/' + route;
}

function CheckIn() {
    return(
        <><h2>Check In</h2>
        <p>Functionality for seeing the date you must check in by,<br></br>
        buttons for updating the checkInFreq which changes date when saved,<br></br>
        and a button to check in - which also changes the date when pressed
        </p></>
    );
}

export default CheckIn;
