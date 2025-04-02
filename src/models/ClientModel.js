import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import Users from "./UserModel.js";

const { DataTypes } = Sequelize;

const Clients = db.define('clients', {
    uuid: {
        type: DataTypes.STRING,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    fullName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [3, 100]
        }
    },
    companyName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [2, 100]
        }
    },
    businessTurn: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    address: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [5, 255]
        }
    },
    contactName: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            len: [0, 100]
        }
    },
    companyPhone: { 
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            len: [0, 20] 
        }
    },
    contactPhone: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            len: [0, 20]
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isEmail: true,
            notEmpty: false
        }
    },
    position: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            len: [0, 100]
        }
    },
    planta: {  
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            len: [0, 100]
        }
    },
    producto: { 
        type: DataTypes.STRING,
        allowNull: true,
        },
        assignedUser: { 
            type: DataTypes.STRING,
            allowNull: true, 
            validate: {
              isEmail: true, 
            },
        },
        billingContactName: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                len: [0, 100]
            }
        },
        billingPhone: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                len: [0, 20]
            }
        },
        billingEmail: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                isEmail: true,
            }
        },
        usoCFDI: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                len: [0, 50]
            }
        },
        paymentMethod: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                len: [0, 50]
            }
        },
        paymentConditions: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                len: [0, 100]
            }
        },
        billingDepartment: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                len: [0, 100]
            }
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

Users.hasMany(Clients);
Clients.belongsTo(Users, { foreignKey: 'userId' });

export default Clients;
