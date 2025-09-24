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

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post("/merge", upload.array("files"), (req, res) => {
  try {
    const mergedData = [];

    req.files.forEach((file, index) => {
      // Read workbook directly from memory buffer
      const workbook = xlsx.read(file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });

      // Keep headers from first file only
      if (index === 0) {
        mergedData.push(...sheetData);
      } else {
        mergedData.push(...sheetData.slice(1));
      }
    });

    // Create new workbook
    const newWB = xlsx.utils.book_new();
    const newWS = xlsx.utils.aoa_to_sheet(mergedData);
    xlsx.utils.book_append_sheet(newWB, newWS, "Merged");

    // Send file to client
    const buffer = xlsx.write(newWB, { type: "buffer", bookType: "xlsx" });
    res.setHeader("Content-Disposition", "attachment; filename=merged.xlsx");
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.send(buffer);
  } catch (err) {
    console.error("Merge error:", err);
    res.status(500).send("Error merging files");
  }
});


app.listen(port, () => console.log(`Server running on http://localhost:${port}`));