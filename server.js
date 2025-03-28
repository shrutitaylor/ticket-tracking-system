const express = require("express");
const multer = require("multer");
const XLSX = require("xlsx");
const fs = require("fs");

const app = express();
const upload = multer();
app.use(express.json());
app.use(require("cors")());

const filePath = "./public/tickets.xlsx"; 

app.get("/tickets", (req, res) => {
  if (!fs.existsSync(filePath)) return res.json([]);
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet);
  res.json(data);
});

app.post("/add-ticket", upload.none(), (req, res) => {
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: "File not found" });

  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet);

  data.push(req.body); // Add new ticket
  const newSheet = XLSX.utils.json_to_sheet(data);
  workbook.Sheets[workbook.SheetNames[0]] = newSheet;
  XLSX.writeFile(workbook, filePath);

  res.json({ success: true });
});

app.listen(5000, () => console.log("Server running on port 5000"));
