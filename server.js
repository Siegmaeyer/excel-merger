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

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post("/merge", upload.array("files"), (req, res) => {
  try {
    const mergedData = [];
    let headersAdded = false; //bool for adding filename checkbox
    const addFilename = req.body.addFilename === "true"; // checkbox state

    req.files.forEach((file, index) => {
      // Read workbook directly from memory buffer
      const workbook = xlsx.read(file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });

      if (sheetData.length === 0) return; // skip empty sheets

       // 👇 Remove top rows (4 for first file, 5 for the rest)
       let rowsToRemove = index === 0 ? 4 : 5;
       let trimmedData = sheetData.slice(rowsToRemove);
 
       // 👇 Remove empty rows (rows that are entirely blank)
       trimmedData = trimmedData.filter(
         (row) => row.some((cell) => cell !== null && cell !== undefined && cell !== "")
       );

      if (trimmedData.length === 0) return;

      // Add headers only once
      if (!headersAdded) {
        if (addFilename) {
          mergedData.push(["Source File", ...trimmedData[0]]);
        } else {
          mergedData.push(trimmedData[0]);
        }
        headersAdded = true;
      }

      // Add rows
      for (let r = 1; r < trimmedData.length; r++) {
        if (addFilename) {
          mergedData.push([file.originalname, ...trimmedData[r]]);
        } else {
          mergedData.push(trimmedData[r]);
        }
      }

      // // Keep headers from first file only
      // if (index === 0) {
      //   mergedData.push(...sheetData);
      // } else {
      //   mergedData.push(...sheetData.slice(1));
      // }
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