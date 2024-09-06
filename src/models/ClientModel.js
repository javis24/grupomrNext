import { Sequelize } from 'sequelize';
import db from '../config/Database.js';
import Users from './UserModel.js';

const { DataTypes } = Sequelize;

const Servicios = db.define('servicios', {
    programacion: {
        type: DataTypes.STRING,
        allowNull: false
    },
    equipo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    numeroEconomico: {
        type: DataTypes.STRING,
        allowNull: false
    },
    contenido: {
        type: DataTypes.STRING,
        allowNull: false
    },
    manifiesto: {
        type: DataTypes.STRING,
        allowNull: false
    },
    generado: {
        type: DataTypes.STRING,
        allowNull: false
    },
    renta2024: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    recoleccion: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    disposicion: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    contacto: {
        type: DataTypes.STRING,
        allowNull: false
    },
    telefono: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    ubicacion: {
        type: DataTypes.STRING,
        allowNull: false
    },
    rfc: {
        type: DataTypes.STRING,
        allowNull: false
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    }
}, {
    freezeTableName: true
});

// Relación con Users: Un Usuario (Users) tiene muchos Servicios
Users.hasMany(Servicios, { foreignKey: 'userId' });

// Un Servicio pertenece a un Usuario (Users)
Servicios.belongsTo(Users, { foreignKey: 'userId' });

export default Servicios;
