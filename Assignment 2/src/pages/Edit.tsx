import axios from 'axios';
import React from "react";
import {Link, useNavigate, useParams } from "react-router-dom";
import * as loginTracker from "./components/LoggedInTracker";
import DefaultImage from "../no-image-icon.png";

const Edit = () => {

    const {id} = useParams();
    const navigate = useNavigate();
    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")
    const [responseCode, setResponseCode] = React.useState(0)
    const [responseMessage, setResponseMessage] = React.useState("")
    const [addNewTitle, setAddNewTitle] = React.useState("")
    const [addNewDesc, setAddNewDesc] = React.useState("")
    const [addNewRelease, setAddNewRelease] = React.useState("")
    const [addNewGenre, setAddNewGenre] = React.useState(-1)
    const [addNewRuntime, setAddNewRuntime] = React.useState(-1)
    const [addNewAgeRating, setAddNewAgeRating] = React.useState("")
    const [loggedInFlag, setLoggedInFlag] = React.useState(false)
    const [allGenre, setAllGenre] = React.useState<Array<Genre>>([])
    const [filmBeingEdited, setFilmBeingEdited] = React.useState<FilmDetails>({
        description: "", numReviews: 0, runtime: 0, filmId:0, title:"", genreId:0, ageRating:"", directorId:0,
        directorFirstName:"", directorLastName:"", rating:0, releaseDate:""})
    const [filmImage, setFilmImage] = React.useState(DefaultImage);
    const [newFilmImage, setNewFilmImage] = React.useState<Blob>();
    const [newFilmImageType, setNewFilmImageType] = React.useState("");

    React.useEffect(() => {
        setErrorFlag(false)
    }, [addNewTitle, addNewDesc, addNewRelease, addNewGenre, addNewRuntime, addNewAgeRating])

    React.useEffect(() => {
        checkLoggedIn()
        getAllGenre()
        getFilm()
    }, [])

    React.useEffect(() => {
        getFilmImage()
    }, [filmBeingEdited])

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

    const editNewFilm = () => {
        console.log("runtime:", )
        let patchFilmId = filmBeingEdited.filmId

        let reqBody:any = {}
        if (addNewTitle !== "") {
            reqBody["title"] = addNewTitle
        }
        if (addNewDesc !== "") {
            reqBody["description"] = addNewDesc
        }
        if (addNewRelease !== "") {
            reqBody["releaseDate"] = addNewRelease
        }
        if (addNewGenre !== -1) {
            reqBody["genreId"] = addNewGenre
        }
        if (addNewRuntime !== -1) {
            reqBody["runtime"] = addNewRuntime
        }
        if (addNewAgeRating !== "") {
            reqBody["ageRating"] = addNewAgeRating
        }

        let reqHeaders:any = {}
        let userAuth = sessionStorage.getItem("Auth_Token")
        if (userAuth === null) {
            userAuth = "-1"
        }
        reqHeaders["X-Authorization"] = userAuth

        axios.patch('http://localhost:4941/api/v1/films/' + patchFilmId, reqBody, {headers: reqHeaders})
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                setResponseCode(response.status)
                setResponseMessage(response.statusText)
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
                setResponseCode(error.response.status)
                setResponseMessage(error.response.statusText)
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

    const getFilm = () => {
        let filmId = sessionStorage.getItem("Edit_Film_Id")
        let tempFilmId = -1
        if (filmId !== null) {
            tempFilmId = parseInt(filmId, 10)
        }
        axios.get('http://localhost:4941/api/v1/films/' + tempFilmId)
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                setResponseMessage(response.statusText)
                setFilmBeingEdited(response.data)
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
                setResponseMessage(error.response.statusText)
            })
    }

    const getFilmImage = async () => {
        let filmId = sessionStorage.getItem("Edit_Film_Id")
        let tempFilmId = -1
        if (filmId !== null) {
            tempFilmId = parseInt(filmId, 10)
        }
        await axios.get('http://localhost:4941/api/v1/films/' + tempFilmId + '/image', {responseType: "arraybuffer"})
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                const base64 = btoa(
                    new Uint8Array(response.data).reduce(
                        (data, byte) => data + String.fromCharCode(byte),
                        ''
                    )
                )
                setFilmImage(`data:;base64,${base64}`)
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
                setFilmImage(DefaultImage)
            })
    }

    const editFilmImage = () => {
        let filmId = sessionStorage.getItem("Edit_Film_Id")
        let tempFilmId = -1
        if (filmId !== null) {
            tempFilmId = parseInt(filmId, 10)
        }
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

        axios.put('http://localhost:4941/api/v1/films/' + tempFilmId + '/image', reqBody, {headers: reqHeaders})
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                setResponseCode(response.status)
                setResponseMessage(response.statusText)
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
                setResponseCode(error.response.status)
                setResponseMessage(error.response.statusText)
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
            } else if (responseCode === 401){
                return (
                    <div>
                        <p>You are not Logged in</p>
                    </div>
                )
            } else if (responseCode === 403){
                return (
                    <div>
                        <p>{responseMessage}</p>
                    </div>
                )
            } else if (responseCode === 404){
                return (
                    <div>
                        <p>Film does not exist in Database</p>
                    </div>
                )
            } else if (responseCode === 500){
                return (
                    <div>
                        <p>There is an error with the server</p>
                    </div>
                )
            }
        } else {
            if (responseCode === 200) {
                return (
                    <div>
                        <p>Your Film has been Successfully Edited</p>
                    </div>
                )
            } else if (responseCode === 201) {
                return (
                    <div>
                        <p>Your New Film Image has been created</p>
                    </div>
                )
            }
        }
    }

    const listFilmBeingEdited = () => {
        if (loggedInFlag) {
            return (
                <div className="filmDetailedResult">
                    <div className="filmImage">
                        <img src={filmImage}
                             style={{height: "auto", width:200}}
                             alt="If Nothing shows up try go to different film pages"/>
                    </div>
                    <div className="filmTitle">
                        <p>{filmBeingEdited.title}</p>
                    </div>
                    <div className="filmDetails">
                        <p>Description: {filmBeingEdited.description}</p>
                        <p>Genre: {filmBeingEdited.genreId}</p>
                        <p>Release Date: {filmBeingEdited.releaseDate}</p>
                        <p>Age Rating: {filmBeingEdited.ageRating}</p>
                        <p>Runtime: {filmBeingEdited.runtime} minutes</p>
                        <p>Director: {filmBeingEdited.directorFirstName} {filmBeingEdited.directorLastName}</p>
                        <p>Rating: {filmBeingEdited.rating} out of 10</p>
                        <p>This Film has {filmBeingEdited.numReviews} Review(s)</p>
                    </div>
                    <Link to={"/films/" + filmBeingEdited.filmId} className="filmLink">Go to Film</Link>
                </div>
            )
        }
    }

    const inputTitleField = () => {
        if (loggedInFlag) {
            return (
                <div id="editFilmTitle">
                    <h3>Enter your Films Title</h3>
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
                <div id="editFilmDesc">
                    <h3>Enter your Films Description</h3>
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
                <div id="editFilmRelease">
                    <h3>Enter your Films Release Date (Cannot be in the Past)</h3>
                    <input type="datetime-local" onChange={(e) => changeNewRelease(e.target.value)}/>
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
                    <input type="radio" name={"editFilmAgeRating"} onChange={() => changeNewAgeRating(item)}/>
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
                <div id="editFilmGenreId">
                    <p>Enter your Films Runtime in minutes</p>
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
                    <p>Input your New Film Image</p>
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

    const editProfileImageButtonField = () => {
        if (loggedInFlag) {
            return (
                <div id="editFilmImageSubmit">
                    <button onClick={() => editFilmImage()} className="menuLink">Edit Profile Image</button>
                </div>
            )
        }
    }

    const editFilmButtonField = () => {
        if (loggedInFlag) {
            return (
                <div id="editFilmSubmit">
                    <button onClick={() => editNewFilm()} className="menuLink">Edit Film</button>
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
                <h1>Edit a Film</h1>
            </div>
            {listFilmBeingEdited()}
            <div className="filmSearch">
                {inputTitleField()}
                {inputDescField()}
                <div className="genreSearch">
                    <h3>Select your Films Genre</h3>
                    <div className="genreSearchSelection">
                        {inputGenreIdField()}
                    </div>
                </div>
                {inputReleaseField()}
                <div className="genreSearch">
                    <h3>Select your Films Age Rating</h3>
                    <div className="genreSearchSelection">
                        {inputAgeRatingField()}
                    </div>
                </div>
                {inputRuntimeField()}
                {inputNewFilmImage()}
                {editProfileImageButtonField()}
            </div>
            {responseCodeMessage()}
            {editFilmButtonField()}
            <div id="menuLink">
                <Link to={"/"} className="menuLink">Back to Main Menu</Link>
            </div>
        </div>
    )
}

export default Edit;