const express = require('express');
const { google } = require('googleapis');
const path = require('path');
const app = express();
const port = 3000;
app.use(express.json());
app.use(express.static('public'));
const auth = new google.auth.GoogleAuth({
  keyFile: 'sparepart-77308-a18d52f2e6b3.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const sheets = google.sheets({ version: 'v4', auth });
const spreadsheetId = '1Q-2ToqB3oppDiv6MdUpFot7_hlJmG7y0ZELKeYRUXM8';
app.get('/api/data', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1!A2:C',
    });
    const rows = response.data.values || [];
    const data = rows.map((row, index) => ({
      id: index + 2,
      item: row[0] || '',
      product: row[1] || '',
      qty: row[2] || '',
    }));
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching data');
  }
});
app.post('/api/data', async (req, res) => {
  const { item, product, qty } = req.body;
  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Sheet1!A2:C',
      valueInputOption: 'RAW',
      resource: { values: [[item, product, qty]] },
    });
    res.status(201).send('Data added');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error adding data');
  }
});
app.put('/api/data/:id', async (req, res) => {
  const { id } = req.params;
  const { item, product, qty } = req.body;
  const row = parseInt(id);
  try {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Sheet1!A${row}:C${row}`,
      valueInputOption: 'RAW',
      resource: { values: [[item, product, qty]] },
    });
    res.send('Data updated');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error updating data');
  }
});
app.delete('/api/data/:id', async (req, res) => {
  const { id } = req.params;
  const row = parseInt(id);
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1!A2:C',
    });
    let values = response.data.values || [];
    values = values.filter((_, index) => index + 2 !== row);
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Sheet1!A2:C',
      valueInputOption: 'RAW',
      resource: { values: values.length > 0 ? values : [[]] },
    });
    res.send('Data deleted');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error deleting data');
  }
});
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
