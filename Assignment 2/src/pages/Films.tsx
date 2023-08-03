import axios from 'axios';
import React from "react";
import { Link } from 'react-router-dom';
import * as loginTracker from "./components/LoggedInTracker";
import DefaultImage from "../no-image-icon.png";

const Films = () => {
    const [films, setFilms] = React.useState <Array<Film>>([])
    const [query, setQuery] = React.useState("")
    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")
    const [allGenre, setAllGenre] = React.useState<Array<Genre>>([])
    const [searchGenre, setSearchGenre] = React.useState<Array<Number>>([])
    const [searchAgeRating, setSearchAgeRating] = React.useState<Array<String>>([])
    const [searchSorting, setSearchSorting] = React.useState<Array<String>>([])
    const [numOfFilms, setNumOfFilms] = React.useState<number>(0)
    const [paginateStartIndex, setPaginateStartIndex] = React.useState<Array<number>>([0])
    const [paginateCount, setPaginateCount] = React.useState<Array<number>>([5])
    const [filmsImages, setFilmsImages] = React.useState <Array<FilmIdImage>>([])
    const [directorImages, setDirectorImages] = React.useState <Array<DirectorIdImage>>([])

    React.useEffect(() => {
        getFilms()
        getAllGenre()
    }, [])

    /*React.useEffect(() => {
        getAllFilmImages()
    }, [films])

    React.useEffect(() => {
        getFilms()
    }, [paginateStartIndex, query, searchGenre, searchAgeRating, searchSorting])*/

    const getFilms = () => {
        let getRequest
        let reqParams:any = {}
        if (!(query === "")) {
            reqParams["q"] = query
        }
        if (searchGenre.length > 0) {
            reqParams["genreIds"] = searchGenre
        }
        if (searchAgeRating.length > 0) {
            reqParams["ageRatings"] = searchAgeRating
        }
        if (searchSorting.length === 1) {
            reqParams["sortBy"] = searchSorting[0]
        }
        if (paginateStartIndex.length === 1) {
            reqParams["startIndex"] = paginateStartIndex[0]
        }
        if (paginateCount.length === 1) {
            reqParams["count"] = paginateCount[0]
        }
        getRequest = axios.get('http://localhost:4941/api/v1/films', {params: reqParams} )
        getRequest
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                setFilms(response.data.films)
                setNumOfFilms(response.data.count);
                //setPaginateStartIndex([0])
                getAllFilmImages()
                getAllDirectorImages()
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

    const getAllFilmImages = async () => {
        let tempFilms = films
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

    const getAllDirectorImages = async () => {
        let tempFilms = films
        let tempArray = directorImages
        for (let i = 0; i < tempFilms.length; i++) {
            await axios.get('http://localhost:4941/api/v1/users/' + tempFilms[i].directorId + '/image', {responseType: "arraybuffer"})
                .then((response) => {
                    setErrorFlag(false)
                    setErrorMessage("")
                    const base64 = btoa(
                        new Uint8Array(response.data).reduce(
                            (data, byte) => data + String.fromCharCode(byte),
                            ''
                        )
                    )
                    tempArray.push({directorId: tempFilms[i].directorId, userImage: `data:;base64,${base64}`})
                }, (error) => {
                    setErrorFlag(true)
                    setErrorMessage(error.toString())
                    tempArray.push({directorId: tempFilms[i].directorId, userImage: DefaultImage})
                })
        }
        setDirectorImages(tempArray)
    }

    const listFilms = () => {
        return films.map((item: Film) =>
            <div className="filmSearchResult">
                <div className="filmImage">
                    <img
                        src={filmsImages.filter(tempFilm => tempFilm.filmId === item.filmId).map(thing => thing.filmImage)[0]}
                        style={{height: 200, width: 200}}
                        alt="If Nothing shows up try change some search settings"/>
                </div>
                <div className="filmTitle">
                    <p>{item.title}</p>
                </div>
                <div className="filmDetails">
                    <p>Film Id: {item.filmId}</p>
                    <p>Age Rating: {item.ageRating}</p>
                    <p>Release Date: {item.releaseDate}</p>
                    <p>Genre: {allGenre.filter(tempGenre => tempGenre.genreId === item.genreId).map(thing => thing.name)[0]}</p>
                    <p>Rating: {item.rating}</p>
                </div>
                <div className="directorImage">
                    <img
                        src={directorImages.filter(tempDirector => tempDirector.directorId === item.directorId).map(thing => thing.userImage)[0]}
                        style={{height: "auto", width: 200}}
                        alt="If Nothing shows up try change some search settings"/>
                </div>
                <div className="directorDetails">
                    <p>Directed By:</p>
                    <p>{item.directorFirstName + " " + item.directorLastName}</p>
                </div>
                <Link to={"/films/" + item.filmId} className="filmLink">Go to Film</Link>
            </div>
        )
    }

    const listOfGenres = () => {
        return allGenre.map((item: Genre) =>
            <div className={"genreCheckBox"}>
                <label>{item.name}</label>
                <input type="checkbox" value={item.genreId} onChange={()=>updateSearchGenre(item.genreId)}/>
            </div>
        )
    }

    const listOfAgeRatings = () => {
        const allAgeRatings = ["G", "PG", "M", "R13", "R16", "R18", "TBC"];
        return allAgeRatings.map((item: String) =>
            <div className={"ageRatingCheckBox"}>
                <label>{item}</label>
                <input type="checkbox" onChange={()=>updateAgeRating(item)}/>
            </div>
        )
    }

    const listOfSorting = () => {
        const allSorting = [{"keyword": "ALPHABETICAL_ASC", "description": "By Title, A-Z"},
            {"keyword": "ALPHABETICAL_DESC", "description": "By Title, Z-A"},
            {"keyword": "RELEASED_ASC", "description": " By Release Oldest-Newest"},
            {"keyword": "RELEASED_DESC", "description": "By Release Newest-Oldest"},
            {"keyword": "RATING_ASC", "description": "By Rating, Low-High"},
            {"keyword": "RATING_DESC", "description": "By Rating, High-Low"}];
        return allSorting.map((item: SortObject) =>
            <div className={"sortRadioButton"}>
                <label>{item.description}</label>
                <input type="radio" name={"sort"} onChange={()=>updateSorting(item.keyword)}/>
            </div>
        )
    }

    const listOfPagination = () => {
        let pageNumbers = []
        for (let i = 1; i <= Math.ceil(numOfFilms / paginateCount[0]); i++) {
            pageNumbers.push(i)
        }
        return pageNumbers.map((item: number) =>
            <div>
                <li>
                    <button value={item} onClick={() => changePagination(item)}>{item}</button>
                </li>
            </div>
        )
    }

    const updateSearchGenre = (searchGenreId: number) => {
        let tempArray = searchGenre
        const index = tempArray.indexOf(searchGenreId);
        if (index > -1) {    //Genre is already being searched
            tempArray.splice(index, 1);
        } else {
            tempArray.push(searchGenreId);
        }
        setSearchGenre(tempArray)
        getFilms()
    }

    const updateAgeRating = (ageRatingString: String) => {
        let tempArray = searchAgeRating
        const index = tempArray.indexOf(ageRatingString);
        if (index > -1) {    //Genre is already being searched
            tempArray.splice(index, 1);
        } else {
            tempArray.push(ageRatingString);
        }
        setSearchAgeRating(tempArray)
        getFilms()
    }

    const updateSorting = (newSorting: String) => {
        let tempArray = searchSorting
        tempArray.splice(0, 1);
        tempArray.push(newSorting);
        setSearchSorting(tempArray)
        getFilms()
    }

    const handleQuerySearchChange = (value: React.SetStateAction<string>) => {
        setQuery(value)
        getFilms()
    }

    const changePagination = (newPageNum: number) => {
        let tempArray = paginateStartIndex
        tempArray.splice(0, 1);
        let newStartIndex = (newPageNum - 1) * paginateCount[0]
        tempArray.push(newStartIndex);
        setPaginateStartIndex(tempArray)
        getFilms()
    }

    /*if (errorFlag) {
        return (
            <div>
                <h1>Users</h1>
                <div style={{ color: "red" }}>
                    {errorMessage}
                </div>
                <Link to={"/"}>Back to Main Menu</Link>
            </div>
        )
    } else {*/
        return (
            <div>
                <div className="loginTracker">
                    {loginTracker.default()}
                </div>
                <div className="title">
                    <h1>Festival Film Search</h1>
                </div>
                <div className="filmSearch">
                    <div>
                        <form>
                            <h3>Search By Description</h3>
                            <input type="text" onChange={(e) => handleQuerySearchChange(e.target.value)}/>
                        </form>
                    </div>
                    <div className="genreSearch">
                        <h3>Search by Genre</h3>
                        <div className="genreSearchSelection">
                            {listOfGenres()}
                        </div>
                    </div>
                    <div className="ageRatingSearch">
                        <h3>Search by Age Rating</h3>
                        <div className="ageRatingSearchSelection">
                            {listOfAgeRatings()}
                        </div>
                    </div>
                    <div className="sortSearch">
                        <h3>Sort Films</h3>
                        <div className="sortSearchSelection">
                            {listOfSorting()}
                        </div>
                    </div>
                </div>
                <div className={"allFilmResults"}>
                    {listFilms()}
                </div>
                <div className="paginationCurrentPage">
                    <h3>Current Page: {(paginateStartIndex[0] / paginateCount[0]) + 1}</h3>
                </div>
                <div className={"filmPagination"}>
                    <ul className={"filmPaginationList"}>
                        {listOfPagination()}
                    </ul>
                </div>

                <div>
                    <Link to={"/"} className="menuLink">Back to Main Menu</Link>
                </div>
            </div>
        )
    //}
}

export default Films;