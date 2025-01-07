const { Pool } = require('pg');

const pool = new Pool({
  user: 'development',
  password: 'development',
  host: 'localhost',
  database: 'lightbnb',
});

/// Users

const getUserWithEmail = function (email) {
  return pool
    .query(`SELECT * FROM users WHERE email = $1 LIMIT 1;`, [email.toLowerCase()])
    .then((result) => (result.rows.length > 0 ? result.rows[0] : null))
    .catch((err) => {
      console.error(err.message);
      return null;
    });
};

const getUserWithId = function (id) {
  return pool
    .query(`SELECT * FROM users WHERE id = $1;`, [id])
    .then((result) => result.rows[0] || null)
    .catch((err) => {
      console.error('Query error:', err.stack);
      return null;
    });
};

const addUser = function (user) {
  const query = `
    INSERT INTO users (name, email, password)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;
  const values = [user.name, user.email, user.password];
  return pool.query(query, values)
    .then((res) => res.rows[0])
    .catch((err) => console.error('Error executing query', err));
};

/// Reservations

const getAllReservations = function (guest_id, limit = 10) {
  const query = `
    SELECT reservations.*, properties.*, AVG(property_reviews.rating) as average_rating
    FROM reservations
    JOIN properties ON reservations.property_id = properties.id
    JOIN property_reviews ON properties.id = property_reviews.property_id
    WHERE reservations.guest_id = $1
    GROUP BY properties.id, reservations.id
    ORDER BY reservations.start_date
    LIMIT $2;
  `;
  return pool
    .query(query, [guest_id, limit])
    .then((res) => res.rows)
    .catch((err) => console.error('Error executing query', err));
};

/// Properties

const getAllProperties = (options, limit = 10) => {
  const queryParams = [];
  let queryString = `
    SELECT properties.*, AVG(property_reviews.rating) as average_rating
    FROM properties
    LEFT JOIN property_reviews ON properties.id = property_reviews.property_id
  `;

  if (options.city) {
    queryParams.push(`%${options.city}%`);
    queryString += `WHERE city LIKE $${queryParams.length} `;
  }

  if (options.owner_id) {
    queryParams.push(options.owner_id);
    queryString += `${queryParams.length === 1 ? 'WHERE' : 'AND'} owner_id = $${queryParams.length} `;
  }

  if (options.minimum_price_per_night) {
    queryParams.push(options.minimum_price_per_night * 100);
    queryString += `${queryParams.length === 1 ? 'WHERE' : 'AND'} cost_per_night >= $${queryParams.length} `;
  }

  if (options.maximum_price_per_night) {
    queryParams.push(options.maximum_price_per_night * 100);
    queryString += `${queryParams.length === 1 ? 'WHERE' : 'AND'} cost_per_night <= $${queryParams.length} `;
  }

  if (options.minimum_rating) {
    queryParams.push(options.minimum_rating);
    queryString += `${queryParams.length === 1 ? 'WHERE' : 'AND'} property_reviews.rating >= $${queryParams.length} `;
  }

  queryString += `
    GROUP BY properties.id
    ORDER BY cost_per_night
    LIMIT $${queryParams.length + 1};
  `;

  queryParams.push(limit);

  return pool.query(queryString, queryParams)
    .then((result) => result.rows)
    .catch((err) => console.error('Query Error:', err));
};

const addProperty = function (property) {
  const queryString = `
    INSERT INTO properties (
      owner_id,
      title,
      description,
      thumbnail_photo_url,
      cover_photo_url,
      cost_per_night,
      street,
      city,
      province,
      post_code,
      country,
      parking_spaces,
      number_of_bathrooms,
      number_of_bedrooms
    )
    VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
    )
    RETURNING *;
  `;
  
  const queryParams = [
    property.owner_id,
    property.title,
    property.description,
    property.thumbnail_photo_url,
    property.cover_photo_url,
    property.cost_per_night,
    property.street,
    property.city,
    property.province,
    property.post_code,
    property.country,
    property.parking_spaces,
    property.number_of_bathrooms,
    property.number_of_bedrooms
  ];
  
  return pool
    .query(queryString, queryParams)
    .then(res => res.rows[0])
    .catch(err => {
      console.error('Error adding property:', err.message);
      throw err; // Ensure errors are visible
    });
};


module.exports = {
  getUserWithEmail,
  getUserWithId,
  addUser,
  getAllReservations,
  getAllProperties,
  addProperty,
};

