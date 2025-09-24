const express = require('express');
const path = require('path')
const multer = require("multer");
const xlsx = require("xlsx");
const fs = require("fs");
const app = express();

const port = parseInt(process.env.PORT) || process.argv[3] || 8080;

app.use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/api', (req, res) => {
  res.json({"msg": "Hello world"});
});

// app.listen(port, () => {
//   console.log(`Listening on http://localhost:${port}`);
// })

const upload = multer({ dest: "uploads/" });

app.post("/merge", upload.array("files"), (req, res) => {
  try {
    const mergedData = [];

    req.files.forEach((file) => {
      const workbook = xlsx.readFile(file.path);
      const sheetName = workbook.SheetNames[0]; // first sheet
      const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });

      // skip headers if not the first file
      if (mergedData.length === 0) {
        mergedData.push(...sheetData);
      } else {
        mergedData.push(...sheetData.slice(1));
      }

      fs.unlinkSync(file.path); // cleanup
    });

    // Create new workbook
    const newWB = xlsx.utils.book_new();
    const newWS = xlsx.utils.aoa_to_sheet(mergedData);
    xlsx.utils.book_append_sheet(newWB, newWS, "Merged");

    const buffer = xlsx.write(newWB, { type: "buffer", bookType: "xlsx" });
    res.setHeader("Content-Disposition", "attachment; filename=merged.xlsx");
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error merging files");
  }
});

app.listen(port, () => console.log(`Server running on http://localhost:${port}`));