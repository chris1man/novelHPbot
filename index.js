const express = require('express');
const app = express();

const PORT = process.env.PORT;

if (!PORT) {
    console.error('PORT is not defined');
    process.exit(1);
}

app.get('/', (req, res) => {
    res.status(200).send('EXPRESS ONLY — WORKS');
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
