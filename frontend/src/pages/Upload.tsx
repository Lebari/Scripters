import axios from "axios";
import React, {useState} from "react"

const Upload = () => {
    const defaultSignUpForm = {
        name: "",
        price: 1,
        status: true,
        category: "",
        slug: "",
        auction_type: "",
        duration: 1
    };
    const [signupForm, setSignUpForm]
        = useState(defaultSignUpForm);
    const [success, setSuccess] = useState(false);
    const upload = (event: React.FormEvent) =>{
        console.log(`auction ${signupForm.name} typ ${signupForm.auction_type}`)
        axios({
            baseURL: "http://localhost:5000",
            url: "catalog/upload",
            method: "post",
            data: {
                name: signupForm.name,
                price: signupForm.price,
                status: signupForm.status,
                category: signupForm.category,
                slug: signupForm.slug,
                auction_type: signupForm.auction_type,
                duration: signupForm.duration
            }
        }).then((result) => {
            console.log(result.data);
            setSuccess(true);
        }).catch((error) => {
            setSuccess(false);
            if (error.response) {
                console.log(error.response);
                console.log(error.response.status);
                console.log(error.response.headers);
            }
        });

        setSignUpForm(defaultSignUpForm);

        event.preventDefault();
    }
    const updateForm = (event: React.ChangeEvent<HTMLInputElement>) => {
        // handle updating the signupForm state whenever a field changes
        const {value, name} = event.target
        setSignUpForm(prevNote => ({
                ...prevNote, [name]: value
            })
        )
    }
    const fieldStyle = "border";

    return(
        <div className={"flex flex-col items-center gap-4"}>
            <h1>Upload Auction</h1>
            <form>
                <div className={"grid grid-cols-1 white max-w-md items-start"}>
                    <label htmlFor={"name"}>Auction Name</label>
                    <input type={"text"} name={"name"} value={signupForm.name} onChange={updateForm} className={fieldStyle}/>
                    <label htmlFor={"price"}>Price</label>
                    <input type={"number"} name={"price"} value={signupForm.price} onChange={updateForm} className={fieldStyle}/>

                    <label htmlFor={"category"}>Category</label>
                    <input type={"text"} name={"category"} value={signupForm.category} onChange={updateForm} className={fieldStyle}/>

                    <label htmlFor={"slug"}>Auction Slug</label>
                    <p>ie. the url to reach the auction at</p>
                    <input type={"text"} name={"slug"} value={signupForm.slug} onChange={updateForm} className={fieldStyle}/>

                    <label htmlFor={"auction_type"}>Type</label>
                    <div className={"grid grid-cols-4"}>
                    <input type={"radio"} id={"Dutch"} name={"auction_type"} value={"Dutch"} onChange={updateForm} className={fieldStyle}/>
                    <label htmlFor={"Dutch"}>Dutch</label>
                    <input type={"radio"} id={"Forward"} name={"auction_type"} value={"Forward"} onChange={updateForm} className={fieldStyle}/>
                    <label htmlFor={"Forward"}>Forward</label>
                    </div>

                    <label htmlFor={"duration"}>Duration</label>
                    <input type={"number"} name={"duration"} value={signupForm.duration} onChange={updateForm} className={fieldStyle}/>

                    <input type={"submit"} name={"submit"} onClick={upload} className={"mt-8"}/>
                </div>
            </form>
            {success?
                <p className={"text-green"}>Auction Uploaded.</p>
                :
                <p className={"text-red-400"}>Please check credentials and submit.</p>
            }
        </div>
    )
}
export default Upload;