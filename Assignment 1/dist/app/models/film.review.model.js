"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addReview = exports.getReviews = void 0;
const db_1 = require("../../config/db");
const getReviews = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `SELECT
    R.user_id as reviewerId,
    U.first_name as reviewerFirstName,
    U.last_name as reviewerLastName,
    R.rating as rating,
    R.review as review,
    R.timestamp as timestamp
    FROM film_review R LEFT JOIN user U on R.user_id = U.id
    WHERE film_id=?
    ORDER BY timestamp DESC`;
    const rows = yield (0, db_1.getPool)().query(query, [id]);
    return rows[0];
});
exports.getReviews = getReviews;
const addReview = (filmId, userId, review, rating) => __awaiter(void 0, void 0, void 0, function* () {
    const query = "INSERT INTO film_review (film_id, user_id, rating, review, timestamp) VALUES (?, ?, ?, ?, ?)";
    const [result] = yield (0, db_1.getPool)().query(query, [filmId, userId, rating, review, new Date()]);
    return result && result.affectedRows === 1;
});
exports.addReview = addReview;
//# sourceMappingURL=film.review.model.js.map