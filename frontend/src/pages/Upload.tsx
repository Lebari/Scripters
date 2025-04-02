import axios from "axios";
import React, {useState} from "react"

const Upload = () => {
    const defaultUploadForm = {
        name: "",
        price: 10,
        status: true,
        category: "",
        slug: "",
        auction_type: "",
        duration: 3600
    };
    const [uploadForm, setUploadForm]
        = useState(defaultUploadForm);
    const [success, setSuccess] = useState(false);
    const [failure, setFailure] = useState(false);
    const [failureMsg, setFailureMsg] = useState("Please check credentials and resubmit.");

    const validateForm = (): boolean =>{
        if (!uploadForm.name) { setFailureMsg("Name must be a non-empty string"); setFailure(true); return false;}
        if (uploadForm.price <= 0) { setFailureMsg("Price must be a positive Integer"); setFailure(true); return false;}
        if (uploadForm.duration <= 0) { setFailureMsg("Duration must be a positive Integer"); setFailure(true); return false;}
        if (!uploadForm.category) { setFailureMsg("Category must be a non-empty string"); setFailure(true); return false;}
        if (!uploadForm.slug) { setFailureMsg("Slug must be unique"); setFailure(true); return false;}
        if (!uploadForm.auction_type) { setFailureMsg("Type must be 'Dutch' or 'Forward'"); setFailure(true); return false;}
        setFailure(false);
        return true;
    }

    const upload = (event: React.FormEvent) =>{
        console.log(`auction: ${uploadForm.name} price: ${uploadForm.price} status: ${uploadForm.status}
            category: ${uploadForm.category} slug: ${uploadForm.slug} 
            typ ${uploadForm.auction_type} duration: ${uploadForm.duration}`)
        const valid = validateForm();
        if (valid){
            axios({
                baseURL: import.meta.env.VITE_API_URL,
                url: "catalog/upload",
                method: "post",
                data: {
                    name: uploadForm.name,
                    price: Number.parseInt(String(uploadForm.price)),
                    status: uploadForm.status,
                    category: uploadForm.category,
                    slug: uploadForm.slug,
                    auction_type: uploadForm.auction_type,
                    duration: Number.parseInt(String(uploadForm.duration))
                }
            }).then((result) => {
                console.log(result.data);
                setSuccess(true);
                setFailure(false);
            }).catch((error) => {
                setSuccess(false);
                setFailure(true);
                setFailureMsg(error.response.data.message);
                if (error.response) {
                    console.log(error.response);
                    console.log(error.response.status);
                    console.log(error.response.headers);
                }
            });
        }

        // setUploadForm(defaultUploadForm);

        event.preventDefault();
    }
    const updateForm = (event: React.ChangeEvent<HTMLInputElement>) => {
        // handle updating the uploadForm state whenever a field changes
        const {value, name} = event.target
        setUploadForm(prevNote => ({
                ...prevNote, [name]: value
            })
        )
    }
    const fieldStyle = "border";
    const labelStyle = "text-lg pt-4 pb-2";

    return(
        <div className={"flex flex-col items-center gap-4"}>
            <h1>Upload Auction</h1>
            <form>
                <div className={"grid grid-cols-1 white max-w-md items-start"}>
                    <label htmlFor={"name"} className={labelStyle}>Auction Name</label>
                    <input type={"text"} name={"name"} value={uploadForm.name} onChange={updateForm} className={fieldStyle} maxLength={50}/>
                    <label htmlFor={"price"} className={labelStyle}>Price</label>
                    <input type={"number"} name={"price"} value={uploadForm.price} onChange={updateForm} className={fieldStyle} maxLength={50}/>

                    <label htmlFor={"category"} className={labelStyle}>Category</label>
                    <input type={"text"} name={"category"} value={uploadForm.category} onChange={updateForm} className={fieldStyle} maxLength={50}/>

                    <label htmlFor={"slug"} className={labelStyle}>Auction Slug</label>
                    <p>Your auction will be reachable at <br/> http://localhost:5173{import.meta.env.VITE_APP_CATALOG_URL}/slug</p>
                    <input type={"text"} name={"slug"} value={uploadForm.slug} onChange={updateForm} className={fieldStyle} maxLength={50}/>

                    <label htmlFor={"auction_type"} className={labelStyle}>Type</label>
                    <div className={"grid grid-cols-4"}>
                    <input type={"radio"} id={"Dutch"} name={"auction_type"} value={"Dutch"} onChange={updateForm} className={fieldStyle} maxLength={50} defaultChecked={true}/>
                    <label htmlFor={"Dutch"}>Dutch</label>
                    <input type={"radio"} id={"Forward"} name={"auction_type"} value={"Forward"} onChange={updateForm} className={fieldStyle} maxLength={50}/>
                    <label htmlFor={"Forward"}>Forward</label>
                    </div>

                    <label htmlFor={"duration"} className={labelStyle}>Duration</label>
                    <p>in minutes</p>
                    <input type={"number"} name={"duration"} value={uploadForm.duration} onChange={updateForm} className={fieldStyle} maxLength={50}/>

                    <input type={"submit"} name={"submit"} onClick={upload} className={"mt-8"}/>
                </div>
            </form>
            {success?
                <p className={"text-green"}>Auction Uploaded.</p>
                :
                <>{failure?
                    <p className={"text-red-400"}>{failureMsg}</p>
                    :
                    <></>
                }</>
            }
        </div>
    )
}
export default Upload;