SELECT r.id, p.title, p.cost_per_night, r.start_date, AVG(pr.rating) AS average_rating
FROM reservations r
  JOIN properties p ON r.property_id = p.id
  JOIN property_reviews pr ON r.property_id = pr.property_id
WHERE r.guest_id = 9
GROUP BY r.id, p.id
ORDER BY r.start_date
LIMIT 10;