type Film = {
    /**
     * Film id as defined by the database
     */
    filmId: number,
    /**
     * Film Title as entered when created
     */
    title: string,
    /**
     * Genre id as defined by the database
     */
    genreId: number,
    /**
     * Age Rating as entered when created
     */
    ageRating: string,
    /**
     * Director id as defined by the database
     */
    directorId: number,
    /**
     * Director firstname as entered when created
     */
    directorFirstName: string,
    /**
     * Director lastname as defined by the database
     */
    directorLastName: string,
    /**
     * Rating as entered when created
     */
    rating: number,
    /**
     * Release Date as defined by the database
     */
    releaseDate: string
}

type Genre = {
    /**
     * Genre id as defined by the database
     */
    genreId: number,
    /**
     * Genre name as entered when created
     */
    name: string
}

type SortObject = {
    /**
     * Keyword to be sent to the api
     */
    keyword: string,
    /**
     * Description to be shown to the user
     */
    description: string
}

type FilmDetails = {
    /**
     * Film id as defined by the database
     */
    filmId: number,
    /**
     * Film Title as entered when created
     */
    title: string,
    /**
     * Film Description as entered when created
     */
    description: string,
    /**
     * Genre id as defined by the database
     */
    genreId: number,
    /**
     * Director id as defined by the database
     */
    directorId: number,
    /**
     * Director firstname as entered when created
     */
    directorFirstName: string,
    /**
     * Director lastname as defined by the database
     */
    directorLastName: string,
    /**
     * Release Date as defined by the database
     */
    releaseDate: string,
    /**
     * Age Rating as entered when created
     */
    ageRating: string,
    /**
     * Runtime as entered when created
     */
    runtime: number,
    /**
     * Rating as entered when created
     */
    rating: number,
    /**
     * Number of Reviews the Film has
     */
    numReviews: number
}

type Review = {
    /**
     * ID of the user who posted the review
     */
    reviewerId: number,
    /**
     * First Name of the user who posted the review
     */
    reviewerFirstName: string,
    /**
     * Last Name of the user who posted the review
     */
    reviewerLastName: string,
    /**
     * The rating given in the review
     */
    rating: number,
    /**
     * Text review given by the user who reviewed
     */
    review: string,
    /**
     * Time when the review was created
     */
    timestamp: string,
}

type FilmIdImage = {
    /**
     * Film id as defined by the database
     */
    filmId: number,

    /**
     * Film Image Data
     */
    filmImage: string
}

type ReviewIdImage = {
    /**
     * Reviewer id as defined by the database
     */
    reviewerId: number,

    /**
     * User Image Data
     */
    userImage: string
}

type DirectorIdImage = {
    /**
     * Director id as defined by the database
     */
    directorId: number,

    /**
     * User Image Data
     */
    userImage: string
}