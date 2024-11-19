import PageTitle from '../components/PageTitle';
import LoggedInName from '../components/LoggedInName';
import CheckIn from '../components/CheckIn';
//import MessageField from '../components/Message';
import Recipients from '../components/Recipients';

const CardPage = () =>
{
    return(
        <div>
            <PageTitle />
            <LoggedInName />
            <CheckIn />
            <Recipients />
            {/* 
            <MessageField />
            */}
        </div>
    );
}

export default CardPage;
