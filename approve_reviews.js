const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'data', 'testimonials.json');
const reviews = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Approve all existing reviews
const approvedReviews = reviews.map(r => ({ ...r, approved: true }));

fs.writeFileSync(filePath, JSON.stringify(approvedReviews, null, 2));
console.log('All reviews approved.');
