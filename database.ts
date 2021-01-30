import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('task', 'admin', 'tauseef#123', {
    host: 'database-2.clzxpgifxwsf.ap-south-1.rds.amazonaws.com',
    dialect: 'mysql',
});

export default sequelize;
