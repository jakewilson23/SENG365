import axios from 'axios';
import React from "react";
import {Link, useNavigate, useParams } from "react-router-dom";
import * as loginTracker from "./components/LoggedInTracker";
import DefaultImage from "../no-image-icon.png";

const Manage = () => {

    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")
    const [loggedInFlag, setLoggedInFlag] = React.useState(false)
    const [directedFilms, setDirectedFilms] = React.useState <Array<Film>>([])
    const [directedFilmsDetails, setDirectedFilmsDetails] = React.useState <Array<FilmDetails>>([])
    const [filmsUserReviewed, setFilmsUserReviewed] = React.useState<Array<Film>>([])
    const [allFilms, setAllFilms] = React.useState <Array<Film>>([])
    const [filmsImages, setFilmsImages] = React.useState <Array<FilmIdImage>>([])
    const [allGenre, setAllGenre] = React.useState<Array<Genre>>([])

    React.useEffect(() => {
        checkLoggedIn()
        getUsersDirectedFilms()
        //getFilmDetails()
        getAllFilms()
        //getReviewedFilms()
        getAllGenre()
    }, [])

    React.useEffect(() => {
        getFilmDetails()
        //getReviewedFilms()
    }, [directedFilms])

    //React.useEffect(() => {
    //    getReviewedFilms()
    //}, [allFilms])


    const checkLoggedIn = () => {
        let userId = sessionStorage.getItem("Auth_User_Id")
        let userAuth = sessionStorage.getItem("Auth_Token")
        if (userId === null || userAuth === null) {
            setLoggedInFlag(false)
        } else {
            setLoggedInFlag(true)
        }
    }

    const getUsersDirectedFilms = async () => {
        let tempUserId = sessionStorage.getItem("Auth_User_Id")
        let getRequest
        let reqParams:any = {}
        reqParams["directorId"] = tempUserId

        await axios.get('http://localhost:4941/api/v1/films', {params: reqParams} )
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                setDirectedFilms(response.data.films)
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
            })
    }

    const getFilmDetails = async () => {
        let tempArray: FilmDetails[] = []
        for (let i = 0; i < directedFilms.length; i = i + 1) {
            await axios.get('http://localhost:4941/api/v1/films/'+ directedFilms[i].filmId)
                .then((response) => {
                    setErrorFlag(false)
                    setErrorMessage("")
                    tempArray.push(response.data)
                }, (error) => {
                    setErrorFlag(true)
                    setErrorMessage(error.toString())
                })
        }
        setDirectedFilmsDetails(tempArray)
        getAllFilmImages()
    }

    const getAllFilms = async () => {
        await axios.get('http://localhost:4941/api/v1/films')
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                setAllFilms(response.data.films)
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
            })
    }

    const getAllGenre = () => {
        let tempArray: any[] = []
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

    const getReviewedFilms = async () => {
        let tempUserId = sessionStorage.getItem("Auth_User_Id")
        if (tempUserId === null) {
            tempUserId = "-1"
        }
        let tempUserIdInt = parseInt(tempUserId, 10)
        let tempArray: Film[] = []
        let tempAllFilms = allFilms
        for (let i = 0; i < tempAllFilms.length; i++) {
            await axios.get('http://localhost:4941/api/v1/films/'+ tempAllFilms[i].filmId + '/reviews')
                .then((response) => {
                    setErrorFlag(false)
                    setErrorMessage("")
                    for (let i = 0; i < response.data.length; i++) {
                        if (response.data[i].reviewerId === tempUserIdInt){
                            tempArray.push(tempAllFilms[i])
                        }
                    }
                }, (error) => {
                    setErrorFlag(true)
                    setErrorMessage(error.toString())
                })
        }
        setFilmsUserReviewed(tempArray)
    }

    const getAllFilmImages = async () => {
        let tempFilms = directedFilmsDetails
        let tempArray = filmsImages
        for (let i = 0; i < tempFilms.length; i++) {
            await axios.get('http://localhost:4941/api/v1/films/' + tempFilms[i].filmId + '/image', {responseType: "arraybuffer"})
                .then((response) => {
                    setErrorFlag(false)
                    setErrorMessage("")
                    const base64 = btoa(
                        new Uint8Array(response.data).reduce(
                            (data, byte) => data + String.fromCharCode(byte),
                            ''
                        )
                    )
                    tempArray.push({filmId: tempFilms[i].filmId, filmImage: `data:;base64,${base64}`})
                }, (error) => {
                    setErrorFlag(true)
                    setErrorMessage(error.toString())
                    tempArray.push({filmId: tempFilms[i].filmId, filmImage: DefaultImage})
                })
        }
        setFilmsImages(tempArray)
    }

    const deleteFilm = (deleteFilmId: number) => {
        if (window.confirm("Delete?")) {
            let reqHeaders: any = {}
            let userAuth = sessionStorage.getItem("Auth_Token")
            if (userAuth === null) {
                userAuth = "-1"
            }
            reqHeaders["X-Authorization"] = userAuth

            axios.delete('http://localhost:4941/api/v1/films/' + deleteFilmId, {headers: reqHeaders})
                .then((response) => {
                    setErrorFlag(false)
                    setErrorMessage("")
                    const updatedDetailsFilms = directedFilmsDetails.filter((film) => film.filmId !== deleteFilmId)
                    setDirectedFilmsDetails(updatedDetailsFilms)
                }, (error) => {
                    setErrorFlag(true)
                    setErrorMessage(error.toString())
                })
        }
    }

    let navigate = useNavigate()

    const goToEditFilm = (editFilmId: number) => {
        if (loggedInFlag) {
            sessionStorage.setItem("Edit_Film_Id", editFilmId.toString())
            let editPath = "/manage/edit"
            navigate(editPath)
        }
    }

    const listDirectedFilmsTitle = () => {
        if (loggedInFlag) {
            return (
                <div className="manageTitle">
                    <h1>Your Directed Films</h1>
                </div>
            )
        }
    }

    const listDirectedFilms = () => {
        if ((filmsImages.length === 0) && (directedFilmsDetails.length > 0)) {
            getAllFilmImages()
        }
        //console.log("directedFilmsDetails", directedFilmsDetails)
        //console.log("filmsImages", filmsImages)
        if (loggedInFlag) {
            return directedFilmsDetails.map((item: FilmDetails) =>
                <div className="manageFilmDetailedResult">
                    <div className="manageFilmImage">
                        <img
                            src={filmsImages.filter(tempFilm => tempFilm.filmId === item.filmId).map(thing => thing.filmImage)[0]}
                            style={{height: "auto", width: 300}}
                            alt="If Nothing shows up try click on View Films/Reviews Again"/>
                    </div>
                    <div className="manageFilmTitle">
                        <p>{item.title}</p>
                    </div>
                    <div className="manageFilmDetails">
                        <p>Description: {item.description}</p>
                        <p>Genre: {allGenre.filter(tempGenre => tempGenre.genreId === item.genreId).map(thing => thing.name)[0]}</p>
                        <p>Release Date: {item.releaseDate}</p>
                        <p>Age Rating: {item.ageRating}</p>
                        <p>Runtime: {item.runtime} minutes</p>
                        <p>Director: {item.directorFirstName} {item.directorLastName}</p>
                        <p>Rating: {item.rating} out of 10</p>
                        <p>This Film has {item.numReviews} Review(s)</p>
                    </div>
                    <Link to={"/films/" + item.filmId} className="filmLink">Go to Film</Link>
                    <div className="editDeleteDirectedFilm">
                        <div className="editDirectedFilm">
                            <button onClick={e => goToEditFilm(item.filmId)} className="editDeleteButton">Edit</button>
                        </div>
                        <div className="deleteDirectedFilm">
                            <button onClick={e => deleteFilm(item.filmId)} className="editDeleteButton">Delete</button>
                        </div>
                    </div>
                </div>
            )
        }
    }

    const listReviewedTitle = () => {
        if (loggedInFlag) {
            return (
                <div className="manageTitle">
                    <h1>Films You Have Reviewed</h1>
                </div>
            )
        }
    }

    const listFilmsReviewed = () => {
        //console.log("all films", allFilms)
        //console.log("reviewed films", filmsUserReviewed)
        return filmsUserReviewed.map((film: Film) =>
            <div id="filmDetails">
                <div id="title">
                    <h1>{film.title}</h1>
                </div>
                <div id="loginTracker">
                    {loginTracker.default()}
                </div>
                <div id="filmPicture">
                    <p>!!!!!!!!!!!!!!!!!!!!Image Goes Here!!!!!!!!!!!!!!!!!!!!!</p>
                </div>
                <div id="filmDetails">
                    <p>Release Date: {film.releaseDate}</p>
                    <p>Genre: {film.genreId}</p>
                    <p>Age Rating: {film.ageRating}</p>
                    <p>Rating: {film.rating} out of 10</p>
                </div>
                <div id="filmDirector">
                    <div id="directorImage">
                        <p>!!!!!!!!!!!Director Image goes here!!!!!!!!!!!!!!!!!!</p>
                    </div>
                    <div id="directorDetails">
                        <p>Directed By:</p>
                        <p>{film.directorFirstName + " " + film.directorLastName}</p>
                    </div>
                </div>
                <Link to={"/films/" + film.filmId}>Go to
                    Film</Link>
            </div>
        )
    }

    const listFilmsReviewedMain = () => {
        //console.log("all films", allFilms)
        //console.log("filmsUserReviewed", filmsUserReviewed)
        if (filmsUserReviewed.length > 0) {
            return (listFilmsReviewed())
        } else {
            return (
                <div>
                    <p>No Films Reviewed</p>
                </div>
            )
        }
    }

    const addFilmButton = () => {
        if (loggedInFlag) {
            return (
                <div>
                    <Link to={"/manage/add"} className="menuLink">Add a New Film</Link>
                </div>
            )
        }
    }


    /*if (errorFlag) {
        return (
            <div>
                <h1>User</h1>
                <div style={{ color: "red" }}>
                    {errorMessage}
                </div>
            </div>
        )
    } else {*/
        return (
            <div>
                <div className="loginTracker">
                    {loginTracker.default()}
                </div>
                <div className="manageTitle">
                    <h1>Manage Your Films/Reviews</h1>
                </div>
                {addFilmButton()}
                {listDirectedFilmsTitle()}
                {listDirectedFilms()}
                {listReviewedTitle()}
                {listFilmsReviewedMain()}
                <div>
                    <Link to={"/"} className="menuLink">Back to Main Menu</Link>
                </div>
            </div>
        )
    //}
}

export default Manage;