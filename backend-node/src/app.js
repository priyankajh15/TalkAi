const express = require("express");
const cors = require("cors");
const compression = require("compression");

const requestId = require("./middleware/requestId.middleware");
const { globalLimiter } = require("./middleware/rateLimit.middleware");
const corsConfig = require("./config/cors.config");
const errorHandler = require("./middleware/errorHandler.middleware");

const authRoutes = require("./routes/auth.routes");
const protectedRoutes = require("./routes/protected.routes");
const knowledgeRoutes = require("./routes/knowledge.routes");
const aiRoutes = require("./routes/ai.routes");
const voiceRoutes = require("./routes/voice.routes");
const callLogsRoutes = require("./routes/callLogs.routes");
const analyticsRoutes = require("./routes/analytics.routes");
const healthRoutes = require("./routes/health.routes");

const app = express();
app.set("trust proxy", 1);

app.use(compression());
app.use(express.json());
app.use(requestId);
app.use(cors(corsConfig));
app.use(globalLimiter);

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/protected", protectedRoutes);
app.use("/api/v1/knowledge", knowledgeRoutes);
app.use("/api/v1/ai", aiRoutes);
app.use("/api/v1/ai", callLogsRoutes);
app.use("/api/v1/analytics", analyticsRoutes);
app.use("/api/voice", voiceRoutes);
app.use("/health", healthRoutes);

app.use(errorHandler);

module.exports = app;
