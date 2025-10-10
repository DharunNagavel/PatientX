import express from "express";

const app = express();
const PORT = 9000;

app.use(express.json());


app.listen(PORT, () => {
  console.log(`Server is live at http://localhost:${PORT}`);
});