import axios from 'axios';
import React from "react";
import {Link, useNavigate, useParams } from "react-router-dom";
import * as loginTracker from "./components/LoggedInTracker";
import DefaultImage from "../no-image-icon.png";

const Review = () => {

    const {id} = useParams();
    const navigate = useNavigate();
    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")
    const [responseCode, setResponseCode] = React.useState(0)
    const [responseMessage, setResponseMessage] = React.useState(0)
    const [addNewRating, setAddNewRating] = React.useState(1)
    const [addNewReview, setAddNewReview] = React.useState("")
    const [loggedInFlag, setLoggedInFlag] = React.useState(false)
    const [filmBeingReviewed, setFilmBeingReviewed] = React.useState<FilmDetails>({
        description: "", numReviews: 0, runtime: 0, filmId:0, title:"", genreId:0, ageRating:"", directorId:0,
        directorFirstName:"", directorLastName:"", rating:0, releaseDate:""})
    const [filmImage, setFilmImage] = React.useState(DefaultImage);

    React.useEffect(() => {
        setErrorFlag(false)
    }, [addNewRating, addNewReview])

    React.useEffect(() => {
        checkLoggedIn()
        getFilm()
    }, [])

    React.useEffect(() => {
        getFilmImage()
    }, [filmBeingReviewed])

    const reviewNewFilm = () => {
        console.log(addNewReview)
        let reqBody:any = {}
        reqBody["rating"] = addNewRating
        if (addNewReview !== "") {
            reqBody["review"] = addNewReview
        }

        let reqHeaders:any = {}
        let userAuth = sessionStorage.getItem("Auth_Token")
        if (userAuth === null) {
            userAuth = "-1"
        }
        reqHeaders["X-Authorization"] = userAuth

        axios.post('http://localhost:4941/api/v1/films/' + id + '/reviews', reqBody, {headers: reqHeaders})
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                setResponseCode(response.status)
            }, (error) => {
                console.log(error)
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
        axios.get('http://localhost:4941/api/v1/films/' + id)
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                setFilmBeingReviewed(response.data)
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
            })
    }

    const getFilmImage = async () => {
        await axios.get('http://localhost:4941/api/v1/films/' + id + '/image', {responseType: "arraybuffer"})
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
                        <p>Your Film Review has been Successfully Placed</p>
                    </div>
                )
            }
        }
    }

    const listFilmBeingReviewed = () => {
        if (loggedInFlag) {
            return (
                <div className="filmDetailedResult">
                    <div className="filmImage">
                        <img src={filmImage}
                             style={{height: "auto", width:200}}
                             alt="If Nothing shows up try go to different film pages"/>
                    </div>
                    <div className="filmTitle">
                        <p>{filmBeingReviewed.title}</p>
                    </div>
                    <div className="filmDetails">
                        <p>Description: {filmBeingReviewed.description}</p>
                        <p>Genre: {filmBeingReviewed.genreId}</p>
                        <p>Release Date: {filmBeingReviewed.releaseDate}</p>
                        <p>Age Rating: {filmBeingReviewed.ageRating}</p>
                        <p>Runtime: {filmBeingReviewed.runtime} minutes</p>
                        <p>Director: {filmBeingReviewed.directorFirstName} {filmBeingReviewed.directorLastName}</p>
                        <p>Rating: {filmBeingReviewed.rating} out of 10</p>
                        <p>This Film has {filmBeingReviewed.numReviews} Review(s)</p>
                    </div>
                    <Link to={"/films/" + filmBeingReviewed.filmId} className="filmLink">Go to Film</Link>
                </div>
            )
        }
    }

    const inputRatingField = () => {
        if (loggedInFlag) {
            return (
                <div id="reviewFilmRating">
                    <p>Give the Film a Rating (1-10)</p>
                    <input type="number" min="1" max="10" onChange={(e) => changeNewRating(e.target.value)}/>
                </div>
            )
        }
    }

    const changeNewRating = (newRating: string) => {
        let tempRating = parseInt(newRating)
        if (!(isNaN(tempRating))) {
            setAddNewRating(tempRating)
        }
    }

    const inputReviewField = () => {
        if (loggedInFlag) {
            return (
                <div id="editFilmDesc">
                    <p>Enter your Review (optional)</p>
                    <input type="text" onChange={(e) => changeNewReview(e.target.value)}/>
                </div>
            )
        }
    }

    const changeNewReview = (newReview: string) => {
        setAddNewReview(newReview)
    }

    const reviewFilmButtonField = () => {
        if (loggedInFlag) {
            return (
                <div id="reviewFilmSubmit">
                    <button onClick={() => reviewNewFilm()} className="menuLink">Submit Review</button>
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
                <h1>Review A Film</h1>
            </div>
            <div>
                {listFilmBeingReviewed()}
            </div>
            <div className="filmSearch">
                {inputRatingField()}
                {inputReviewField()}
                <div></div>
            </div>
            {responseCodeMessage()}
            {reviewFilmButtonField()}
            <div id="filmLink">
                <Link to={"/films/" + id} className="menuLink">Go Back to Film</Link>
            </div>
            <div id="returnLink">
                <Link to={"/films"} className="menuLink">Go to Film Search</Link>
            </div>
            <div id="menuLink">
                <Link to={"/"} className="menuLink">Back to Main Menu</Link>
            </div>
        </div>
    )
}

export default Review;