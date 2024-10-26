"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activeLog = void 0;
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
// Middleware global : journalise chaque requête
exports.activeLog = app.use((req, res, next) => {
    console.log(`${req.method} request for '${req.url}'`);
    next(); // passe au middleware suivant
});
