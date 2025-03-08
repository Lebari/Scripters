import axios from "axios";
import {useState} from "react"

const Catalog = () => {
    // const [catalogsList, setCatalogsList] = useState({"All Auctions": []});
    const [success, setSuccess] = useState(false);

    const getAllAuctions = () =>{
        axios({
            baseURL: "http://localhost:5000",
            url: "catalog",
            method: "get",
        }).then((result) => {
            console.log(result);
            setSuccess(true);
            // setCatalogsList(result.data);
        }).catch((error) => {
            if (error.response) {
                console.log(error.response);
                console.log(error.response.status);
                console.log(error.response.headers);
            }
        });
    }

    return(
        <div className={"flex flex-col items-center gap-4"}>
        <h1>Welcome to the Scripters Auction Platform - Catalog</h1>
        <div className="card">
            <button onClick={getAllAuctions }>
                View all auctions
            </button>
            {success? <p>View auctions in console.</p>
            : <>Auctions not retrieved.</>}
            <pre>
                <code>
                    {/*{catalogsList["All Auctions"]}*/}
                </code>
            </pre>
        </div>
        </div>
    )
}
export default Catalog;