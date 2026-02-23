const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'secure_data', 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) return console.error('Error opening db:', err);
    db.all("SELECT id, name FROM products", [], (err, rows) => {
        if (err) return console.error(err);
        console.log("Current Products:");
        rows.forEach((row) => {
            console.log(`${row.id}: ${row.name}`);
        });
        db.close();
    });
});
