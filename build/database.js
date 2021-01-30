"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const sequelize = new sequelize_1.Sequelize('task', 'admin', 'tauseef#123', {
    host: 'database-2.clzxpgifxwsf.ap-south-1.rds.amazonaws.com',
    dialect: 'mysql',
});
exports.default = sequelize;
