import PageTitle from '../components/PageTitle';
import LoggedInName from '../components/LoggedInName';
import CheckIn from '../components/CheckIn';

const CardPage = () =>
{
    return(
        <div>
            <PageTitle />
            <LoggedInName />
            <CheckIn />
        </div>
    );
}

export default CardPage;
