import db from './config/Database.js';
import './models/UserModel.js';
import './models/ClientModel.js';
import './models/CompanyModel.js';
import './models/BusinessUnitModel.js';
import './models/ProductModel.js';
import './models/EventModel.js';
import './models/TrafficLightModel.js';

async function syncDatabase() {
  try {
    await db.sync({ alter: true });
    console.log("All models were synchronized successfully.");
  } catch (error) {
    console.error("Error syncing models:", error);
  }
}

syncDatabase();
