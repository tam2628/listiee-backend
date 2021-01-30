import { DataTypes } from "sequelize";
import db from "../database";

const User = db.define('User', {
    id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull:  false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

const Post = db.define('Post', {
    id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true
    },
    postText: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    picture: {
        type: DataTypes.TEXT,
    },
    latitude: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    longitude: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    userId: {
        type:DataTypes.STRING,
        allowNull: false
    },
    country: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

Post.belongsTo(User, {
    foreignKey: {
        name:"userId" ,
        allowNull: false,
    },
    targetKey:"id"
});

User.hasMany(Post, {
    foreignKey: {
        name: "userId",
        allowNull: false,
    },
    sourceKey:"id"
});

export {User, Post} ;