import axios from 'axios';
import React from "react";
import {Link, useNavigate, useParams } from "react-router-dom";
import * as loginTracker from "./components/LoggedInTracker";

const Add = () => {

    const {id} = useParams();
    const navigate = useNavigate();
    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")
    const [responseCode, setResponseCode] = React.useState(0)
    const [addNewTitle, setAddNewTitle] = React.useState("")
    const [addNewDesc, setAddNewDesc] = React.useState("")
    const [addNewRelease, setAddNewRelease] = React.useState("")
    const [addNewGenre, setAddNewGenre] = React.useState(-1)
    const [addNewRuntime, setAddNewRuntime] = React.useState(-1)
    const [addNewAgeRating, setAddNewAgeRating] = React.useState("TBC")
    const [loggedInFlag, setLoggedInFlag] = React.useState(false)
    const [allGenre, setAllGenre] = React.useState<Array<Genre>>([])
    const [newFilmImage, setNewFilmImage] = React.useState<Blob>();
    const [newFilmImageType, setNewFilmImageType] = React.useState("");
    const [newFilmId, setNewFilmId] = React.useState(-1)


    React.useEffect(() => {
        setErrorFlag(false)
    }, [addNewTitle, addNewDesc, addNewRelease, addNewGenre, addNewRuntime, addNewAgeRating])

    React.useEffect(() => {
        checkLoggedIn()
        getAllGenre()
    }, [])

    React.useEffect(() => {
        if (newFilmImage) {
            addFilmImage()
        }
    }, [newFilmId])

    const getAllGenre = () => {
        axios.get('http://localhost:4941/api/v1/films/genres')
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                setAllGenre(response.data)
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
            })
    }

    const addNewFilm = () => {
        let reqBody:any = {}
        reqBody["title"] = addNewTitle
        reqBody["description"] = addNewDesc
        if (addNewRelease !== "") {
            reqBody["releaseDate"] = addNewRelease
        }
        console.log(addNewRelease)
        reqBody["genreId"] = addNewGenre
        if (addNewRuntime !== -1) {
            reqBody["runtime"] = addNewRuntime
        }
        reqBody["ageRating"] = addNewAgeRating

        let reqHeaders:any = {}
        let userAuth = sessionStorage.getItem("Auth_Token")
        if (userAuth === null) {
            userAuth = "-1"
        }
        reqHeaders["X-Authorization"] = userAuth

        axios.post('http://localhost:4941/api/v1/films', reqBody, {headers: reqHeaders})
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                setResponseCode(response.status)
                setNewFilmId(response.data.filmId)
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
                setResponseCode(error.response.status)
            })
    }

    const checkLoggedIn = () => {
        let userId = sessionStorage.getItem("Auth_User_Id")
        let userAuth = sessionStorage.getItem("Auth_Token")
        if (userId === null || userAuth === null) {
            setLoggedInFlag(false)
        } else {
            //getLoggedUserDetails()
            setLoggedInFlag(true)
        }
    }

    const addFilmImage = () => {
        let reqBody:any = {}
        if (newFilmImage) {
            reqBody = newFilmImage
        }

        let reqHeaders:any = {}
        let userAuth = sessionStorage.getItem("Auth_Token")
        if (userAuth === null) {
            userAuth = "-1"
        }
        reqHeaders["X-Authorization"] = userAuth
        if (newFilmImageType !== "") {
            reqHeaders["Content-Type"] = newFilmImageType
        }

        axios.put('http://localhost:4941/api/v1/films/' + newFilmId + '/image', reqBody, {headers: reqHeaders})
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                setResponseCode(response.status)
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
                setResponseCode(error.response.status)
            })
    }

    const responseCodeMessage = () => {
        if (errorFlag) {
            if (responseCode === 400) {
                return (
                    <div>
                        <p>Invalid Details Entered</p>
                    </div>
                )
            } else if (responseCode === 403){
                return (
                    <div>
                        <p>The Title is already in use or your Release Date is in the past</p>
                    </div>
                )
            } else {
                return (
                    <div>
                        <p>There is an error with the server</p>
                    </div>
                )
            }
        } else {
            if (responseCode === 201) {
                return (
                    <div>
                        <p>Your Film has been Successfully Created</p>
                    </div>
                )
            }
        }
    }

    const inputTitleField = () => {
        if (loggedInFlag) {
            return (
                <div id="addFilmTitle">
                    <h3>Enter your Films Title (Required)</h3>
                    <input type="text" onChange={(e) => changeNewTitle(e.target.value)}/>
                </div>
            )
        }
    }

    const changeNewTitle = (newTitle: string) => {
        setAddNewTitle(newTitle)
    }

    const inputDescField = () => {
        if (loggedInFlag) {
            return (
                <div id="addFilmDesc">
                    <h3>Enter your Films Description (Required)</h3>
                    <input type="text" onChange={(e) => changeNewDesc(e.target.value)}/>
                </div>
            )
        }
    }

    const changeNewDesc = (newDesc: string) => {
        setAddNewDesc(newDesc)
    }

    const inputGenreIdField = () => {
        if (loggedInFlag) {
            return allGenre.map((item: Genre) =>
                <div className={"genreCheckBox"}>
                    <label>{item.name}</label>
                    <input type="radio" name={"addFilmGenre"} onChange={() => changeNewGenreId(item.genreId)}/>
                </div>
            )
        }
    }

    const changeNewGenreId = (newGenreId: number) => {
        setAddNewGenre(newGenreId)
    }

    const inputReleaseField = () => {
        if (loggedInFlag) {
            return (
                <div id="addFilmRelease">
                    <h3>Enter your Films Release Date (Optional)</h3>
                    <input type="datetime-local" onChange={(e) => changeNewRelease(e.target.value)}/>
                    <p>Cannot be in the Past</p>
                    <p>The Default Value is set to the current time</p>
                </div>
            )
        }
    }

    const changeNewRelease = (newReleaseDate: string) => {
        let formattedReleaseDate = formatReleaseDate(newReleaseDate)
        setAddNewRelease(formattedReleaseDate)
    }

    const formatReleaseDate = (dateToBeFormatted: string) => {
        //Example input: "2023-06-01T12:47"
        //Format Required: "2023-06-01 12:47:00"
        let tempResult = dateToBeFormatted.replace("T", " ");
        tempResult = tempResult + ":00"
        return tempResult
    }

    const inputAgeRatingField = () => {
        if (loggedInFlag) {
            const allAgeRatings = ["G", "PG", "M", "R13", "R16", "R18", "TBC"];
            return allAgeRatings.map((item: string) =>
                <div className={"genreCheckBox"}>
                    <label>{item}</label>
                    <input type="radio" name={"addFilmAgeRating"} onChange={() => changeNewAgeRating(item)}/>
                </div>
            )
        }
    }

    const changeNewAgeRating = (newAgeRating: string) => {
        setAddNewAgeRating(newAgeRating)
    }

    const inputRuntimeField = () => {
        if (loggedInFlag) {
            return (
                <div id="addFilmGenreId">
                    <h3>Enter your Films Runtime in minutes (Optional)</h3>
                    <input type="text" onChange={(e) => changeNewRuntime(e.target.value)}/>
                </div>
            )
        }
    }

    const changeNewRuntime = (newRuntime: string) => {
        let tempRuntime = parseInt(newRuntime, 10)
        if (!(isNaN(tempRuntime))) {
            setAddNewRuntime(tempRuntime)
        }
    }

    const inputNewFilmImage = () => {
        if (loggedInFlag) {
            return (
                <div id="inputNewImage">
                    <h3>Input your New Films Image (Required)</h3>
                    <input type="file" onChange={handleUserImageChange} accept="image/png, image/jpeg, image/gif"/>
                </div>
            )
        }
    }

    const handleUserImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log(e.target.files)
        if (!e.target.files) {
            return;
        }
        setNewFilmImageType(e.target.files[0]["type"])
        e.target.files[0].arrayBuffer().then((arrayBuffer) => {
            const blob = new Blob([new Uint8Array(arrayBuffer)]);
            console.log("blob", blob);
            setNewFilmImage(blob);
        });

    };

    const addFilmButtonField = () => {
        if (loggedInFlag) {
            return (
                <div>
                    <button onClick={() => addNewFilm()} className="menuLink">Add Film</button>
                </div>
            )
        }
    }

    return (
        <div>
            <div className="loginTracker">
                {loginTracker.default()}
            </div>
            <div className="manageTitle">
                <h1>Add a new Film</h1>
            </div>
            <div className="filmSearch">
                {inputTitleField()}
                {inputDescField()}
                <div className="genreSearch">
                    <h3>Select your Films Genre (Required)</h3>
                    <div className="genreSearchSelection">
                        {inputGenreIdField()}
                    </div>
                </div>
                {inputReleaseField()}
                <div className="genreSearch">
                    <h3>Select your Films Age Rating (Optional)</h3>
                    <div className="genreSearchSelection">
                        {inputAgeRatingField()}
                    </div>
                    <p>Default Value is TBC</p>
                </div>
                {inputRuntimeField()}
                {inputNewFilmImage()}
            </div>
            {responseCodeMessage()}
            {addFilmButtonField()}
            <div id="menuLink">
                <Link to={"/"} className="menuLink">Back to Main Menu</Link>
            </div>
        </div>
    )
}

export default Add;