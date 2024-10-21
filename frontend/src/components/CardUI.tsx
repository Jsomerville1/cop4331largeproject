
import React, { useState } from 'react';

function CardUI() {
    let _ud: any = localStorage.getItem('user_data');
    let ud = JSON.parse(_ud);
    let userId: string = ud.id;
    // @ts-ignore
    let firstName: string = ud.firstName;
    // @ts-ignore
    let lastName: string = ud.lastName;
    // @ts-ignore
    const [message, setMessage] = useState('');
    // @ts-ignore
    const [searchResults, setResults] = useState('');
    // @ts-ignore
    const [cardList, setCardList] = useState('');
    // @ts-ignore
    const [search, setSearchValue] = React.useState('');
    // @ts-ignore
    const [card, setCardNameValue] = React.useState('');
    const app_name = 'copteam22.xyz';
    // @ts-ignore
    function buildPath(route: string): string {
        if (process.env.NODE_ENV != 'development') {
            return 'http://' + app_name + ':5000/' + route;
        }
        else {
            return 'http://copteam22.xyz:5000/' + route;
        }
    }

    async function addCard(e: any): Promise<void> {
        e.preventDefault();
        let obj = { userId: userId, card: card };
        let js = JSON.stringify(obj);
        try {
            const response = await
                fetch('http://copteam22.xyz:5000/api/addcard',
                    {
                        method: 'POST', body: js, headers: {
                            'Content-Type':
                                'application/json'
                        }
                    });
            let txt = await response.text();
            let res = JSON.parse(txt);
            if (res.error.length > 0) {
                setMessage("API Error:" + res.error);
            }
            else {
                setMessage('Card has been added');
            }
        }
        catch (error: any) {
            setMessage(error.toString());
        }
    };
    async function searchCard(e: any): Promise<void> {
        e.preventDefault();
        let obj = { userId: userId, search: search };
        let js = JSON.stringify(obj);
        try {
            const response = await
                fetch('http://copteam22.xyz:5000/api/searchcards',
                    {
                        method: 'POST', body: js, headers: {
                            'Content-Type':
                                'application/json'
                        }
                    });
            let txt = await response.text();
            let res = JSON.parse(txt);
            let _results = res.results;
            let resultText = '';
            for (let i = 0; i < _results.length; i++) {
                resultText += _results[i];
                if (i < _results.length - 1) {
                    resultText += ', ';
                }
            }
            setResults('Card(s) have been retrieved');
            setCardList(resultText);
        }
        catch (error: any) {
            alert(error.toString());
            setResults(error.toString());
        }
    };
    return (
        <div id="accessUIDiv">
            <br />
            <input type="text" id="searchText" placeholder="Card To Search For" />
            <button type="button" id="searchCardButton" className="buttons"
                onClick={searchCard}> Search Card </button><br />
            <span id="cardSearchResult"></span>
            <p id="cardList"></p><br /><br />
            <input type="text" id="cardText" placeholder="Card To Add" />
            <button type="button" id="addCardButton" className="buttons"
                onClick={addCard}> Add Card </button><br />
            <span id="cardAddResult"></span>
        </div>
    );
}
export default CardUI;