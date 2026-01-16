const fs = require('fs');
const path = require('path');

const services = [
    'Reddit Account (Aged)', 'Instagram 10k Followers', 'Discord 1k Members',
    'Facebook Page (Monetized)', 'Twitter Blue Verified', 'TikTok 5k Followers'
];

const messages = [
    "Absolutely amazing service! Instant delivery.",
    "The account was exactly as described. High karma and aged.",
    "Best place to buy social assets. Support was very helpful.",
    "Got my Discord members in under an hour. Real looking profiles too.",
    "Trusted seller. I have bought 3 accounts so far.",
    "Smooth transaction via Crypto. Recommend!",
    "Finally a legit site for Reddit accounts.",
    "Saved me months of grinding. Worth every penny.",
    "The followers are sticking, high retention. Good job.",
    "Easy checkout, instant access. 10/10.",
    "Had a small issue but admin fixed it in 5 mins.",
    "High authority backlinks really helped my SEO.",
    "Cheap prices for such high quality accounts.",
    "Will definitely buy again. Thanks guys!",
    "Authentication worked perfectly, no bans."
];

const names = [
    "Alex M.", "Sarah J.", "Michael K.", "David R.", "Emma W.", "James L.",
    "Daniel T.", "Olivia P.", "William B.", "Sophia H.", "Liam C.", "Ava D.",
    "Noah F.", "Isabella G.", "Mason E."
];

const reviews = [];

// Generate 50 High Quality Reviews
for (let i = 0; i < 50; i++) {
    const service = services[Math.floor(Math.random() * services.length)];
    const msg = messages[Math.floor(Math.random() * messages.length)];
    const name = names[Math.floor(Math.random() * names.length)];

    reviews.push({
        id: i + 1,
        name: name,
        role: `Buyer - ${service}`,
        review: msg,
        isAdmin: false
    });
}

// Write to file
fs.writeFileSync(path.join(__dirname, 'data', 'testimonials.json'), JSON.stringify(reviews, null, 2));
console.log('generated reviews');
