import { Sequelize } from 'sequelize';
import db from '../config/Database.js';
import Users from './UserModel.js';

const { DataTypes } = Sequelize;

const Quotes = db.define('Quotes', {
    quoteNumber: { 
        type: DataTypes.INTEGER, 
        allowNull: false 
    },
    companyName: { 
        type: DataTypes.STRING, 
        allowNull: false 
    },
    address: { 
        type: DataTypes.TEXT // Campo para el domicilio
    },
    attentionTo: { 
        type: DataTypes.STRING 
    },
    department: { 
        type: DataTypes.STRING,
        defaultValue: 'COMPRAS'
    },
    email: { 
        type: DataTypes.STRING 
    },
    phone: { 
        type: DataTypes.STRING 
    },
    supervisor: { 
        type: DataTypes.STRING // Campo para el asesor
    },
    descripcionGeneral: { 
        type: DataTypes.TEXT 
    },
    // Almacenamos el array de productos como JSON string
    items: { 
        type: DataTypes.TEXT('long'),
        get() {
            const rawValue = this.getDataValue('items');
            return rawValue ? JSON.parse(rawValue) : [];
        },
        set(value) {
            this.setDataValue('items', JSON.stringify(value));
        }
    },
    // Almacenamos los términos seleccionados como JSON string
    observaciones: { 
        type: DataTypes.TEXT,
        get() {
            const rawValue = this.getDataValue('observaciones');
            return rawValue ? JSON.parse(rawValue) : [];
        },
        set(value) {
            this.setDataValue('observaciones', JSON.stringify(value));
        }
    },
    total: { 
        type: DataTypes.DECIMAL(10, 2), 
        allowNull: false 
    },
    status: { 
        type: DataTypes.STRING, 
        defaultValue: 'Pendiente' 
    },
    userId: { 
        type: DataTypes.INTEGER, 
        allowNull: false 
    }
}, {
    freezeTableName: true
});

Quotes.belongsTo(Users, { foreignKey: 'userId', as: 'assignedUser' });

export default Quotes;