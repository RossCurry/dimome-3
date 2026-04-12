import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "DiMoMe API is running" });
  });

  // Mock database (in-memory for now, can be replaced with MongoDB)
  let menuData = {
    categories: [
      { id: "1", name: "Starters", items: ["101", "102"] },
      { id: "2", name: "Mains", items: ["201"] }
    ],
    items: {
      "101": { id: "101", name: "Truffle Arancini", price: 12, description: "Crispy risotto balls with truffle oil", allergens: ["Dairy", "Gluten"] },
      "102": { id: "102", name: "Burrata & Heirloom Tomato", price: 14, description: "Fresh burrata with basil oil", allergens: ["Dairy"] },
      "201": { id: "201", name: "Wild Mushroom Risotto", price: 22, description: "Creamy arborio rice with seasonal mushrooms", allergens: ["Dairy"] }
    }
  };

  app.get("/api/menu", (req, res) => {
    res.json(menuData);
  });

  app.post("/api/menu/update", (req, res) => {
    // In a real app, this would update the DB
    menuData = { ...menuData, ...req.body };
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`DiMoMe Server running on http://localhost:${PORT}`);
  });
}

startServer();
