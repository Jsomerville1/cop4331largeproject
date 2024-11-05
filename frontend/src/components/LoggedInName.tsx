function LoggedInName()
{

    function doLogout(event:any) : void
    {
	    event.preventDefault();
		
      localStorage.removeItem("user_data")
      window.location.href = '/';
  };    

    return(
      <div id="loggedInDiv">
        <span id="userName">Logged In As John Doe </span><br />
        <button type="button" id="logoutButton" className="buttons" 
           onClick={doLogout}> Log Out </button>
      </div>
    );
};

export default LoggedInName;


