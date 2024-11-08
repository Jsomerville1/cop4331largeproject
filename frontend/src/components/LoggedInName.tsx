function LoggedInName()
{
  const user = JSON.parse(localStorage.getItem('user_data') || '{}');

  function doLogout(event: any): void {
    event.preventDefault();
    localStorage.removeItem("user_data");
    window.location.href = '/';
  }

  return (
    <div id="loggedInDiv">
      {/* Display user's name if available */}
      <span id="userName">
        {user.firstName ? `Logged In As ${user.firstName} ${user.lastName}` : 'Logged In'}
      </span>
      <br />
      <button type="button" id="logoutButton" className="buttons" onClick={doLogout}>
        Log Out
      </button>
    </div>
  );
};

export default LoggedInName;


