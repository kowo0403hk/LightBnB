SELECT
  p.id, p.title, p.cost_per_night, p.city, AVG(r.rating) AS average_rating
FROM properties p JOIN property_reviews r ON p.id = r.property_id
WHERE city LIKE '%ancouv%'
GROUP BY p.id
HAVING AVG(r.rating) >= 4
ORDER BY p.cost_per_night
LIMIT 10;