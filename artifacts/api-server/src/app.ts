import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes/index.js";
import { logger } from "./lib/logger.js";

const app: Express = express();
app.use(cors());
app.use(
  (pinoHttp as any)({
    logger,
    serializers: {
      req(req: any) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res: any) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (_req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Goodies Box</title>
        <meta http-equiv="refresh" content="0; url=/index.html" />
        <style>
          body { font-family: system-ui, sans-serif; text-align: center; padding: 50px; background: #0f172a; color: white; }
          a { color: #38bdf8; text-decoration: none; font-weight: bold; font-size: 1.2rem; }
        </style>
      </head>
      <body>
        <h1>🎁 Goodies Box App</h1>
        <p>Service: @workspace/api-server is online.</p>
        <p><a href="/index.html">Click here to open Goodies Box Application</a></p>
      </body>
    </html>
  `);
});

app.use("/api", router);

export default app;
