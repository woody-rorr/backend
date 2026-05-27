import express from "express";

const PORT = parseInt(process.env.PORT || "5013", 10);
const app = express();

app.get("/health", (_, res) => res.json({ status: "ok", server: "backend", port: PORT }));
app.get("/", (_, res) => res.json({ message: "backend placeholder — replaced by scaffold_new_project_api (NestJS) later" }));

app.listen(PORT, () => process.stdout.write(`backend placeholder running on :${PORT}\n`));
