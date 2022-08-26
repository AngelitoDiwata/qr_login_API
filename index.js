const express = require('express')
const { google } = require('googleapis')

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

const dateCollection = [
    ...
    "0ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
    "AA",
    "AB",
    "AC",
    "AD",
    "AE",
    "AF",
]

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

function getCurrentSheet(value) {
    return months[value].toUpperCase()
}

async function fetchData(id) {
    const auth = await google.auth.getClient({
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const sheets = google.sheets({ version: "v4", auth });

    const range = `${getCurrentSheet(new Date().getMonth())}!A${id}:B${id}`;

    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.SHEET_ID,
        range,
    });

    const [value] = response.data.values;

    return value;
}

async function update(col, row, value) {
    const auth = await google.auth.getClient({
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const sheets = google.sheets({ version: "v4", auth });
    var data = [{
        range: `${getCurrentSheet(new Date().getMonth())}!${col}${row}`,
        values: [
            [value]
        ],
    }, ];

    const resource = {
        spreadsheetId: process.env.SHEET_ID,
        requestBody: { data: data, valueInputOption: "USER_ENTERED" },
    };

    sheets.spreadsheets.values.batchUpdate(resource);
}

app.get('/log/:id', function(req, res) {
    fetchData(req.params.id).then(async(data) => {
        res.send(data);
        await update(
            dateCollection[new Date().getDate() + 2],
            req.params.id,
            new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Manila' })
        );
    });
})

app.get('/', (req, res) => {
    res.send('<h1>Hello World</h1>')
})


app.listen(process.env.PORT || 3000, () => {
    console.log(`Example app listening on port ${process.env.PORT || 3000}`)
})