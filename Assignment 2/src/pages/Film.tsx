import axios from 'axios';
import React from "react";
import {Link, useNavigate, useParams } from "react-router-dom";
import * as loginTracker from "./components/LoggedInTracker";
import DefaultImage from '../no-image-icon.png';

const Film = () => {

    console.log("new Render")

    const {id} = useParams();
    const navigate = useNavigate();
    const [film, setFilm] = React.useState<FilmDetails>({
        description: "", numReviews: 0, runtime: 0, filmId:0, title:"", genreId:0, ageRating:"", directorId:0,
        directorFirstName:"", directorLastName:"", rating:0, releaseDate:""})
    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")
    const [reviews, setReviews] = React.useState<Array<Review>>([])
    const [similarFilms, setSimilarFilms] = React.useState <Array<Film>>([])
    const [similarFilmsImages, setSimilarFilmsImages] = React.useState <Array<FilmIdImage>>([])
    const [reviewUserImages, setReviewUserImages] = React.useState <Array<ReviewIdImage>>([])
    const [loggedInFlag, setLoggedInFlag] = React.useState(false)
    const [mainFilmImage, setMainFilmImage] = React.useState(DefaultImage);
    const [directorImage, setDirectorImage] = React.useState(DefaultImage);
    const [allGenre, setAllGenre] = React.useState<Array<Genre>>([])

    React.useEffect(() => {
        checkLoggedIn()
        getFilm()
        getAllGenre()
    }, [id])

    React.useEffect(() => {
        getReviews()
        getFilmImage()
        getDirectorImage()
    }, [film])

    React.useEffect(() => {
        getUserImageById()
    }, [reviews])

    const getFilm = () => {
        axios.get('http://localhost:4941/api/v1/films/'+id)
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                setFilm(response.data)
                getSimilarDirector(response.data.directorId, response.data.genreId, response.data.title);
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
            })
    }
    const getReviews = async () => {
        await axios.get('http://localhost:4941/api/v1/films/'+id+'/reviews')
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                setReviews(response.data)
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

    const getSimilarDirector = (searchDirectorId: number, searchGenreId: number, currentFilmTitle: string) => {
        let reqParams:any = {}
        reqParams["directorId"] = searchDirectorId
        axios.get('http://localhost:4941/api/v1/films', {params: reqParams})
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                getSimilarGenre(searchGenreId, response.data.films, currentFilmTitle)
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
            })
    }
    const getSimilarGenre = (searchGenreId: number, directorSimilarFilms: Array<Film>, currentFilmTitle: string) => {
        let reqParams:any = {}
        reqParams["genreIds"] = [searchGenreId]
        axios.get('http://localhost:4941/api/v1/films', {params: reqParams})
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                let tempGenreArray = response.data.films
                let tempDirectorArray = directorSimilarFilms
                let tempStateArray = tempDirectorArray.concat(tempGenreArray)

                //Remove Suggested Films that are the same as the current film
                for (let i = 0; i < tempStateArray.length; i++) {
                    if (tempStateArray[i].title === currentFilmTitle) {
                        tempStateArray.splice(i, 1);
                    }
                }

                //Remove Duplicates from the suggested films list
                for (let i = 0; i < tempStateArray.length; i++) {
                    for (let j = 0; j < tempStateArray.length; j++) {
                        if (j !== i) {
                            if (tempStateArray[j].filmId === tempStateArray[i].filmId) {
                                tempStateArray.splice(i, 1);
                            }
                        }
                    }
                }
                for (let i = 0; i < tempStateArray.length; i++) {
                    getFilmImageById(tempStateArray[i].filmId)
                }
                setSimilarFilms(tempStateArray)
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
            })
    }

    const checkLoggedIn = () => {
        let userId = sessionStorage.getItem("Auth_User_Id")
        let userAuth = sessionStorage.getItem("Auth_Token")
        if (userId === null || userAuth === null) {
            setLoggedInFlag(false)
        } else {
            setLoggedInFlag(true)
        }
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
                setMainFilmImage(`data:;base64,${base64}`)
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
                setMainFilmImage(DefaultImage)
            })
    }

    const getFilmImageById = async (filmId: number) => {
        let tempArray = similarFilmsImages
        await axios.get('http://localhost:4941/api/v1/films/' + filmId + '/image', {responseType: "arraybuffer"})
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                const base64 = btoa(
                    new Uint8Array(response.data).reduce(
                        (data, byte) => data + String.fromCharCode(byte),
                        ''
                    )
                )
                tempArray.push({filmId:filmId, filmImage:`data:;base64,${base64}`})
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
                tempArray.push({filmId:filmId, filmImage:DefaultImage})
            })
        setSimilarFilmsImages(tempArray)
    }

    const getUserImageById = async () => {
        let tempReviews = reviews
        let tempArray = reviewUserImages
        for (let i = 0; i < tempReviews.length; i++) {
            await axios.get('http://localhost:4941/api/v1/users/' + tempReviews[i].reviewerId + '/image', {responseType: "arraybuffer"})
                .then((response) => {
                    setErrorFlag(false)
                    setErrorMessage("")
                    const base64 = btoa(
                        new Uint8Array(response.data).reduce(
                            (data, byte) => data + String.fromCharCode(byte),
                            ''
                        )
                    )
                    tempArray.push({reviewerId: tempReviews[i].reviewerId, userImage: `data:;base64,${base64}`})
                }, (error) => {
                    setErrorFlag(true)
                    setErrorMessage(error.toString())
                    tempArray.push({reviewerId: tempReviews[i].reviewerId, userImage: DefaultImage})
                })
        }
        setReviewUserImages(tempArray)
    }

    const getDirectorImage = async () => {
        await axios.get('http://localhost:4941/api/v1/users/' + film.directorId + '/image', {responseType: "arraybuffer"})
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                const base64 = btoa(
                    new Uint8Array(response.data).reduce(
                        (data, byte) => data + String.fromCharCode(byte),
                        ''
                    )
                )
                setDirectorImage(`data:;base64,${base64}`)
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
                setDirectorImage(DefaultImage)
            })
    }

    const listFilmDetails = () => {
        return (
            <div className="filmDetailedResult">
                <div className="filmImage">
                    <img src={mainFilmImage}
                         style={{height: 200, width:200}}
                         alt="If Nothing shows up try go to different film pages"/>
                </div>
                <div className="filmTitle">
                    <p>{film.title}</p>
                </div>
                <div className="filmDetails">
                    <p>Release Date: {film.releaseDate}</p>
                    <p>{film.description}</p>
                    <p>Runtime: {film.runtime} minutes</p>
                    <p>Genre: {allGenre.filter(tempGenre => tempGenre.genreId === film.genreId).map(thing => thing.name)[0]}</p>
                    <p>Age Rating: {film.ageRating}</p>
                    <p>Rating: {film.rating} out of 10</p>
                    <p>This Film has {film.numReviews} Review(s)</p>
                </div>
                <div className="directorImage">
                    <img src={directorImage}
                         style={{height: "auto", width:150}}
                         alt="If Nothing shows up try go to different film pages"/>
                </div>
                <div className="directorDetails">
                    <p>Directed By:</p>
                    <p>{film.directorFirstName + " " + film.directorLastName}</p>
                </div>
                {createReview()}
            </div>
        )
    }

    const createReview = () => {
        if (loggedInFlag) {
            return (
                <div>
                    <button onClick={e => goToReviewFilm(film.filmId)} className="filmReviewButton">Post Review</button>
                </div>
            )
        }
    }

    const goToReviewFilm = (reviewFilmId: number) => {
        if (loggedInFlag) {
            let editPath = "/film/" + reviewFilmId + "/review"
            navigate(editPath)
        }
    }

    const listAllReviews = () => {
        //console.log("reviews list", reviews)
        //console.log("reviewUserImages", reviewUserImages)
        return reviews.map((item: Review) =>
            <div className="review">
                <div className="reviewImage">
                    <img
                        src={reviewUserImages.filter(reviewer => reviewer.reviewerId === item.reviewerId).map(thing => thing.userImage)[0]}
                        style={{height: "auto", width: 200}}
                        alt="If Nothing shows up try go to different film pages"/>
                </div>
                <div className="reviewDetails">
                    <p>{item.reviewerFirstName + ' ' + item.reviewerLastName}</p>
                    <p>Review: {item.review}</p>
                    <p>Rated {item.rating} out of 10</p>
                    <p>Review submitted at {item.timestamp}</p>
                </div>
            </div>
        )
    }

    const listSimilarFilms = () => {
        return similarFilms.map((item: Film) =>
            <div className="filmSearchResult">
                <div className="filmImage">
                    <img
                        src={similarFilmsImages.filter(singleFilm => singleFilm.filmId === item.filmId).map(thing => thing.filmImage)[0]}
                        style={{height: "auto", width: 200}}
                        alt="If Nothing shows up try go to different film pages"/>
                </div>
                <div className="filmTitle">
                    <p>{item.title}</p>
                </div>
                <div className="filmDetails">
                    <p>Age Rating: {item.ageRating}</p>
                    <p>Release Date: {item.releaseDate}</p>
                    <p>Genre: {allGenre.filter(tempGenre => tempGenre.genreId === item.genreId).map(thing => thing.name)[0]}</p>
                    <p>Director: {item.directorFirstName + " " + item.directorLastName}</p>
                    <p>Rating: {item.rating}  out of 10</p>
                </div>
                <Link to={"/films/" + item.filmId} className="filmLink">Go to Film</Link>
            </div>
        )
    }

    return (
        <div>
            <div className="loginTracker">
                {loginTracker.default()}
            </div>
            {listFilmDetails()}
            <div className="reviews">
                <div className="reviewTitle">
                    <h1>Reviews</h1>
                </div>
                {listAllReviews()}
            </div>
            <div className="allFilmResults">
                <div className="similarFilmTitle">
                    <h1>Similar Films</h1>
                </div>
                {listSimilarFilms()}
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

export default Film;