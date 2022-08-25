const express = require('express')
const { google } = require('googleapis')

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

async function fetchData(id) {
    const auth = await google.auth.getClient({
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const sheets = google.sheets({ version: "v4", auth });

    const range = `Sheet1!A${id}:B${id}`;

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
        range: `Sheet1!${col}${row}`,
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

app.get('/log/:id', function(req, res) {
    fetchData(req.params.id).then(async(data) => {
        res.send(data);
        await update(
            dateCollection[new Date().getDate() + 2],
            req.params.id,
            new Date().toLocaleTimeString()
        );
    });
})


app.listen(3001, () => {
    console.log(`Example app listening on port ${3001}`)
})