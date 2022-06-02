SELECT p.city, COUNT(p.city) AS total_resverations
FROM properties p JOIN reservations r ON p.id = r.property_id
GROUP BY p.city
ORDER BY total_resverations DESC;