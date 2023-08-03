"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGenres = exports.deleteOne = exports.editOne = exports.addOne = exports.getOne = exports.viewAll = void 0;
const logger_1 = __importDefault(require("../../config/logger"));
const Film = __importStar(require("../models/film.model"));
const Review = __importStar(require("../models/film.review.model"));
const schemas = __importStar(require("../resources/schemas.json"));
const validator_1 = require("../services/validator");
const images_model_1 = require("../models/images.model");
const viewAll = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validation = yield (0, validator_1.validate)(schemas.film_search, req.query);
        if (validation !== true) {
            res.statusMessage = `Bad Request: ${validation.toString()}`;
            res.status(400).send();
            return;
        }
        if (req.query.hasOwnProperty("directorId"))
            req.query.directorId = parseInt(req.query.directorId, 10);
        if (req.query.hasOwnProperty("reviewerId"))
            req.query.reviewerId = parseInt(req.query.reviewerId, 10);
        if (req.query.hasOwnProperty("startIndex"))
            req.query.startIndex = parseInt(req.query.startIndex, 10);
        if (req.query.hasOwnProperty("count"))
            req.query.count = parseInt(req.query.count, 10);
        if (req.query.hasOwnProperty("genreIds")) {
            if (!Array.isArray(req.query.genreIds))
                req.query.genreIds = [parseInt(req.query.genreIds, 10)];
            else
                req.query.genreIds = req.query.genreIds.map((x) => parseInt(x, 10));
            const genres = yield Film.getGenres();
            if (!req.query.genreIds.every(c => genres.map(x => x.genreId).includes(c))) {
                res.statusMessage = `Bad Request: No genre with id`;
                res.status(400).send();
                return;
            }
        }
        if (req.query.hasOwnProperty("ageRatings")) {
            if (!Array.isArray(req.query.ageRatings))
                req.query.ageRatings = [req.query.ageRatings];
        }
        let search = {
            q: '',
            startIndex: 0,
            count: -1,
            genreIds: [],
            ageRatings: [],
            directorId: -1,
            reviewerId: -1,
            sortBy: 'RELEASED_ASC'
        };
        search = Object.assign(Object.assign({}, search), req.query);
        const films = yield Film.viewAll(search);
        res.status(200).send(films);
        return;
    }
    catch (err) {
        logger_1.default.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
});
exports.viewAll = viewAll;
const getOne = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const filmId = parseInt(req.params.id, 10);
        if (isNaN(filmId)) {
            res.statusMessage = "Id must be an integer";
            res.status(400).send();
            return;
        }
        const film = yield Film.getOne(filmId);
        if (film !== null) {
            res.status(200).send(film);
            return;
        }
        else {
            res.status(404).send();
            return;
        }
    }
    catch (err) {
        logger_1.default.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
    }
});
exports.getOne = getOne;
const addOne = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validation = yield (0, validator_1.validate)(schemas.film_post, req.body);
        if (validation !== true) {
            res.statusMessage = `Bad Request: ${validation.toString()}`;
            res.status(400).send();
            return;
        }
        let releaseDate = null;
        if (req.body.hasOwnProperty("releaseDate")) {
            if (Date.parse(req.body.releaseDate) < Date.now()) {
                res.statusMessage = "Cannot release a film in the past";
                res.status(403).send();
                return;
            }
            releaseDate = req.body.releaseDate;
        }
        else {
            const d = new Date();
            const year = d.getFullYear();
            const month = d.getMonth() + 1;
            const day = d.getDate();
            const hour = d.getHours();
            const minute = d.getMinutes();
            const second = d.getSeconds();
            releaseDate = `${year}-${month}-${day} ${hour}:${minute}:${second}`;
        }
        let runtime = null;
        if (req.body.hasOwnProperty("runtime")) {
            runtime = req.body.runtime;
        }
        let ageRating = "TBC";
        if (req.body.hasOwnProperty("ageRating")) {
            ageRating = req.body.ageRating;
        }
        const genres = yield Film.getGenres();
        if (!genres.find(g => g.genreId === req.body.genreId)) {
            res.statusMessage = "No genre with id";
            res.status(400).send();
            return;
        }
        const result = yield Film.addOne(req.authId, req.body.title, req.body.description, releaseDate, ageRating, req.body.genreId, runtime);
        if (result) {
            res.status(201).send({ "filmId": result.insertId });
            return;
        }
        else {
            logger_1.default.warn("Film not added to database...");
            res.statusMessage = "Film could not be saved to database";
            res.status(500).send();
            return;
        }
    }
    catch (err) {
        logger_1.default.error(err);
        if (err.errno === 1062) { // 1062 = Duplicate entry MySQL error number
            res.statusMessage = "Forbidden: Duplicate film";
            res.status(403).send();
            return;
        }
        else if (err.errno === 1292 && err.message.includes("datetime")) {
            res.statusMessage = "Bad Request: Invalid datetime value";
            res.status(400).send();
            return;
        }
        else {
            res.statusMessage = "Internal Server Error";
            res.status(500).send();
            return;
        }
    }
});
exports.addOne = addOne;
const editOne = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validation = yield (0, validator_1.validate)(schemas.film_patch, req.body);
        if (validation !== true) {
            res.statusMessage = `Bad Request: ${validation.toString()}`;
            res.status(400).send();
            return;
        }
        const filmId = parseInt(req.params.id, 10);
        if (isNaN(filmId)) {
            res.statusMessage = "Id must be an integer";
            res.status(400).send();
            return;
        }
        const film = yield Film.getOne(filmId);
        if (film == null) {
            res.status(404).send();
            return;
        }
        if (film.directorId !== req.authId) {
            res.statusMessage = "Cannot edit another user's auction";
            res.status(403).send();
            return;
        }
        const reviews = yield Review.getReviews(filmId);
        if (reviews.length > 0) {
            res.statusMessage = "Cannot edit a film after a review has been placed on it";
            res.status(403).send();
            return;
        }
        let title;
        if (req.body.hasOwnProperty("title")) {
            title = req.body.title;
        }
        else {
            title = film.title;
        }
        let description;
        if (req.body.hasOwnProperty("description")) {
            description = req.body.description;
        }
        else {
            description = film.description;
        }
        let releaseDate;
        if (req.body.hasOwnProperty("releaseDate")) {
            if (Date.parse(req.body.releaseDate) < Date.now()) {
                res.statusMessage = "Cannot release a film in the past.";
                res.status(403).send();
                return;
            }
            else if (Date.parse(film.releaseDate) < Date.now()) {
                res.statusMessage = "Cannot change the release date of a film already released.";
                res.status(403).send();
                return;
            }
            releaseDate = req.body.releaseDate;
        }
        else {
            releaseDate = film.releaseDate;
        }
        let ageRating;
        if (req.body.hasOwnProperty("ageRating")) {
            ageRating = req.body.ageRating;
        }
        else {
            ageRating = film.ageRating;
        }
        let genreId;
        if (req.body.hasOwnProperty("genreId")) {
            const genres = yield Film.getGenres();
            if (!genres.find(g => g.genreId === req.body.genreId)) {
                res.statusMessage = "No genre with id";
                res.status(400).send();
            }
            else {
                genreId = req.body.genreId;
            }
        }
        else {
            genreId = film.genreId;
        }
        let runtime;
        if (req.body.hasOwnProperty("runtime")) {
            runtime = req.body.runtime;
        }
        else {
            runtime = film.runtime;
        }
        const result = yield Film.editOne(filmId, title, description, releaseDate, ageRating, genreId, runtime);
        if (result) {
            res.status(200).send();
            return;
        }
        else {
            logger_1.default.warn("Film not updated in database...");
            res.statusMessage = "Film could not be updated";
            res.status(500).send();
        }
    }
    catch (err) {
        logger_1.default.error(err);
        if (err.errno === 1062) { // 1062 = Duplicate entry MySQL error number
            res.statusMessage = "Forbidden: Duplicate film";
            res.status(403).send();
            return;
        }
        else if (err.errno === 1292 && err.message.includes("datetime")) {
            res.statusMessage = "Bad Request: Invalid datetime value";
            res.status(400).send();
            return;
        }
        else {
            res.statusMessage = "Internal Server Error";
            res.status(500).send();
            return;
        }
    }
});
exports.editOne = editOne;
const deleteOne = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const filmId = parseInt(req.params.id, 10);
        if (isNaN(filmId)) {
            res.statusMessage = "Id must be an integer";
            res.status(400).send();
            return;
        }
        const film = yield Film.getOne(filmId);
        if (film == null) {
            res.status(404).send();
            return;
        }
        if (film.directorId !== req.authId) {
            res.statusMessage = "Cannot delete another user's film";
            res.status(403).send();
            return;
        }
        const filename = yield Film.getImageFilename(filmId);
        const result = yield Film.deleteOne(filmId);
        if (result) {
            if (filename !== null || filename !== "") {
                yield (0, images_model_1.removeImage)(filename);
            }
            res.status(200).send();
            return;
        }
        else {
            res.statusMessage = "Film could not be removed from the database";
            res.status(500).send();
            return;
        }
    }
    catch (err) {
        logger_1.default.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
    }
});
exports.deleteOne = deleteOne;
const getGenres = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const genres = yield Film.getGenres();
        res.status(200).send(genres);
    }
    catch (err) {
        logger_1.default.error(err);
        res.status(500).send();
    }
});
exports.getGenres = getGenres;
//# sourceMappingURL=film.controller.js.map