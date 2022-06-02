require('dotenv').config();
const { Pool } = require('pg');
const config = {
  user: process.env.DB_user,
  password: process.env.DB_password,
  host: process.env.DB_host,
  database: process.env.DB_database
}

const pool = new Pool(config);

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function(email) {
  return pool.query(`
    SELECT *
    FROM users
    WHERE email = $1;`, [email])
    .then((result) => {
      console.log(result.rows);
      if (!result.rows) {
        return null;
      } else {
        return result.rows[0];
      }
    })
    .catch((err) => {
      console.log(err.message);
    });
}
exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function(id) {
  return pool.query(`
  SELECT *
  FROM users
  WHERE id = $1;
  `, [id])
  .then((result) => {
    if (!result.rows) {
      return null;
    } else {
      return result.rows[0];
    }
  })
  .catch((err) => {
    console.log(err.message)
  });
}
exports.getUserWithId = getUserWithId;


/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser =  function(user) {
  return pool.query(`
    INSERT INTO users (name, email, password)
    VALUES ($1, $2, $3)
    RETURNING *;
    `, [user.name, user.email, user.password])
    .then((result) => {
      console.log(result.rows);
      return result.rows;
    })
    .catch((err) => {
      console.log(err.message)
    });
}
exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function(guest_id/**, limit = 10*/) {
  return pool.query(`
    SELECT r.id, p.title, p.cost_per_night, p.thumbnail_photo_url, p.cover_photo_url, r.start_date, r.end_date, avg(rating) as average_rating
    FROM reservations r
    JOIN properties p ON r.property_id = p.id
    JOIN property_reviews pr ON p.id = pr.property_id
    WHERE r.guest_id = $1
    GROUP BY p.id, r.id
    ORDER BY r.start_date
    `, [guest_id])
    .then((result) => {
      console.log(result.rows);
      return result.rows;
    })
    .catch((err) => {
      console.log(err.message)
    });
}
exports.getAllReservations = getAllReservations;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = function(options, limit = 10) {
  
  const queryParams = [];
  let queryString = `
    SELECT p.*, AVG(pr.rating) AS average_rating
    FROM properties p
    JOIN property_reviews pr ON p.id = pr.property_id
    JOIN users u ON p.owner_id = u.id
    WHERE 1 = 1
  `;

  if(options.city) {
    queryParams.push(`%${options.city}%`);
    queryString += `AND p.city LIKE $${queryParams.length} \n`;
  }

  if(options.owner_id) {
    queryParams.push(options.owner_id);
    queryString += `AND p.owner_id = $${queryParams.length} \n`;
  }

  if(options.minimum_price_per_night) {
    queryParams.push(options.minimum_price_per_night * 100);
    queryString += `AND p.cost_per_night >= $${queryParams.length} \n`;
  }

  if(options.maximum_price_per_night) {
    queryParams.push(options.maximum_price_per_night * 100);
    queryString += `AND p.cost_per_night <= $${queryParams.length} \n`;
  }

  queryString += `GROUP BY p.id \n`

  if(options.minimum_rating) {
    queryParams.push(options.minimum_rating);
    queryString += `HAVING AVG(pr.rating) >= $${queryParams.length} \n`;
  }

  queryParams.push(limit);
  queryString += `
    ORDER BY cost_per_night
    LIMIT $${queryParams.length};
    `;

  return pool.query(queryString, queryParams)
    .then((result) => {
      return result.rows;
    })
    .catch((err) => {
      console.log(err.message);
    });
}
exports.getAllProperties = getAllProperties;


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {
  const queryParams = [
    property.owner_id,
    property.title,
    property.description,
    property.thumbnail_photo_url,
    property.cover_photo_url,
    property.cost_per_night * 100,
    property.street,
    property.city,
    property.province,
    property.post_code,
    property.country,
    property.parking_spaces,
    property.number_of_bathrooms,
    property.number_of_bedrooms
  ];
  const queryString = `
    INSERT INTO properties (owner_id, title, description, thumbnail_photo_url, cover_photo_url, cost_per_night, street, city, province, post_code, country, parking_spaces, number_of_bathrooms, number_of_bedrooms)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    RETURNING *;
  `;

  return pool.query(queryString, queryParams)
    .then((result) => {
      return result.rows;
    })
    .catch((err) => {
      console.log(err.message);
    });
}
exports.addProperty = addProperty;
