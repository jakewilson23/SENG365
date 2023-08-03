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
exports.addReview = exports.getReviews = void 0;
const Film = __importStar(require("../models/film.model"));
const Review = __importStar(require("../models/film.review.model"));
const logger_1 = __importDefault(require("../../config/logger"));
const validator_1 = require("../services/validator");
const schemas = __importStar(require("../resources/schemas.json"));
const getReviews = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const reviews = yield Review.getReviews(filmId);
        res.status(200).send(reviews);
        return;
    }
    catch (err) {
        logger_1.default.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
});
exports.getReviews = getReviews;
const addReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        if (film.directorId === req.authId) {
            res.statusMessage = "Cannot post a review on your own film.";
            res.status(403).send();
            return;
        }
        if (Date.parse(film.releaseDate) > Date.now()) {
            res.statusMessage = "Cannot place a review on a film that has not yet released.";
            res.status(403).send();
            return;
        }
        const reviews = yield Review.getReviews(filmId);
        if (reviews.find((r) => r.reviewerId === req.authId) !== undefined) {
            res.statusMessage = "Cannot post more than one review on a film.";
            res.status(403).send();
            return;
        }
        const validation = yield (0, validator_1.validate)(schemas.film_review_post, req.body);
        if (validation !== true) {
            res.statusMessage = `Bad Request: ${validation.toString()}`;
            res.status(400).send();
            return;
        }
        const added = yield Review.addReview(filmId, req.authId, req.body.review, parseInt(req.body.rating, 10));
        res.status(201).send();
    }
    catch (err) {
        logger_1.default.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
    }
});
exports.addReview = addReview;
//# sourceMappingURL=film.review.controller.js.map