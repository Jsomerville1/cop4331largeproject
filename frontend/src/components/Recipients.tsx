//import { useState } from 'react';

/*
function buildPath(route: string): string {
  return import.meta.env.MODE === 'development'
  ? 'http://localhost:5000/' + route
  : '/' + route;
}
  */

function Recipients() {
  return(
    <><h2>Recipients</h2>
    <p>Functionality for adding a new recipient,<br></br>
    seeing a list underneath of all the current receipients,<br></br>
    along with a delete button next to each recipient in the list
    </p></>
  );
}

export default Recipients;
