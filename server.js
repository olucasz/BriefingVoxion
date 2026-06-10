const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");

const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, "public");
const SUBMISSIONS_DIR = path.join(ROOT, "submissions");
const ENV_PATH = path.join(ROOT, ".env");
const LOGO_PATH = path.join(PUBLIC_DIR, "assets", "voxion-mark-orange-crop.png");
const MAX_BODY_SIZE = 2_000_000;

const CONTENT_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".otf": "font/otf",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ttc": "font/collection",
  ".ttf": "font/ttf",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

const PROMPT_LABELS = new Set([
  "Situação atual da marca",
  "A marca deve parecer mais",
  "Nível de mudança desejado",
  "Sensações desejadas",
  "Canais prioritários",
  "Estilo visual preferido",
  "Complexidade visual",
  "Uso de cor",
  "Posicionamento de preço/percepção",
  "Possíveis usos da identidade",
]);

const BRAND = {
  accent: "#f18536",
  background: "#fffaf6",
  brown: "#31251f",
  line: "#d8c5b6",
  muted: "#5c4a41",
};

loadEnv(ENV_PATH);

const PORT = Number(process.env.PORT || 8787);
const HOST = process.env.HOST || "0.0.0.0";

fs.mkdirSync(SUBMISSIONS_DIR, { recursive: true });

const server = http.createServer((req, res) => {
  routeRequest(req, res).catch((error) => {
    const statusCode = error instanceof HttpError ? error.statusCode : 500;
    if (statusCode >= 500) {
      console.error(error);
    }
    if (res.headersSent) {
      res.end();
      return;
    }
    sendJson(res, statusCode, {
      ok: false,
      error: error.message || "Erro interno no servidor.",
    });
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Voxion briefing rodando em http://${HOST}:${PORT}`);
});

async function routeRequest(req, res) {
  setCorsHeaders(res);

  const pathname = getPathname(req.url);

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === "GET" && pathname === "/api/health") {
    sendJson(res, 200, {
      ok: true,
      status: "up",
      timestamp: new Date().toISOString(),
    });
    return;
  }

  if (req.method === "POST" && pathname === "/api/briefings") {
    await handleBriefing(req, res);
    return;
  }

  if (req.method === "GET" || req.method === "HEAD") {
    serveStatic(pathname, req.method === "HEAD", res);
    return;
  }

  throw new HttpError(405, "Metodo nao permitido.");
}

async function handleBriefing(req, res) {
  const body = await readJson(req);
  const text = normalizeBriefingText(body.text);
  const clientName = normalizeClientName(body.clientName);

  if (!text) {
    throw new HttpError(400, "Nenhuma resposta foi recebida.");
  }

  const createdAt = new Date();
  const submissionId = `${formatDateForFile(createdAt)}-${sanitizeName(clientName)}-${crypto.randomBytes(3).toString("hex")}`;
  const pdfBuffer = await buildPdfBuffer({ clientName, createdAt, submissionId, text });
  const pdfFilename = `${submissionId}.pdf`;
  const textFilename = `${submissionId}.txt`;
  const pdfPath = path.join(SUBMISSIONS_DIR, pdfFilename);
  const textPath = path.join(SUBMISSIONS_DIR, textFilename);

  await Promise.all([
    fs.promises.writeFile(pdfPath, pdfBuffer),
    fs.promises.writeFile(textPath, `${text}\n`, "utf8"),
  ]);

  const email = {
    configured: hasEmailConfig(),
    error: null,
    sent: false,
  };

  if (email.configured) {
    try {
      await sendSubmissionEmail({
        clientName,
        createdAt,
        pdfBuffer,
        pdfFilename,
        submissionId,
        text,
        textFilename,
      });
      email.sent = true;
    } catch (error) {
      email.error = error.message;
    }
  }

  sendJson(res, email.sent ? 200 : 202, {
    ok: true,
    emailConfigured: email.configured,
    emailError: email.error,
    emailSent: email.sent,
    savedAs: {
      pdf: pdfFilename,
      text: textFilename,
    },
  });
}

function serveStatic(pathname, headOnly, res) {
  const requestedPath = pathname === "/" ? "/index.html" : pathname;
  const filePath = path.resolve(PUBLIC_DIR, `.${requestedPath}`);

  if (!isSafePublicPath(filePath)) {
    throw new HttpError(404, "Arquivo nao encontrado.");
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = CONTENT_TYPES[ext];
  if (!contentType) {
    throw new HttpError(404, "Arquivo nao encontrado.");
  }

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    throw new HttpError(404, "Arquivo nao encontrado.");
  }

  const stats = fs.statSync(filePath);
  res.writeHead(200, {
    "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=604800, immutable",
    "Content-Length": stats.size,
    "Content-Type": contentType,
  });

  if (headOnly) {
    res.end();
    return;
  }

  fs.createReadStream(filePath).pipe(res);
}

function isSafePublicPath(filePath) {
  return filePath === PUBLIC_DIR || filePath.startsWith(`${PUBLIC_DIR}${path.sep}`);
}

function getPathname(url) {
  try {
    return new URL(url || "/", "http://localhost").pathname;
  } catch {
    return "/";
  }
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    let settled = false;

    req.on("data", (chunk) => {
      if (settled) return;

      raw += chunk;
      if (raw.length > MAX_BODY_SIZE) {
        settled = true;
        reject(new HttpError(413, "Payload muito grande."));
        req.destroy();
      }
    });

    req.on("end", () => {
      if (settled) return;

      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new HttpError(400, "JSON invalido."));
      }
    });

    req.on("error", (error) => {
      if (settled) return;
      reject(error);
    });
  });
}

function setCorsHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function sendJson(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return;

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;

    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    value = value.replace(/^["']|["']$/g, "");

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function hasEmailConfig() {
  return Boolean(
    process.env.EMAIL_TO &&
      process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
  );
}

function normalizeClientName(value) {
  const normalized = String(value || "").trim();
  return normalized || "Briefing sem nome";
}

function normalizeBriefingText(value) {
  return String(value || "").replace(/\r/g, "").trim();
}

function sanitizeName(value) {
  return (
    String(value || "briefing")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/(^-|-$)/g, "")
      .toLowerCase() || "briefing"
  );
}

function formatDateForFile(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
  ].join("");
}

function formatDateForDisplay(date) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);
}

function buildPdfBuffer({ clientName, createdAt, submissionId, text }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      autoFirstPage: true,
      bufferPages: false,
      margins: { top: 54, right: 56, bottom: 54, left: 56 },
      size: "A4",
    });

    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.info = {
      Author: "Voxion Studio",
      CreationDate: createdAt,
      Creator: "Voxion Briefing",
      Producer: "PDFKit",
      Subject: "Briefing de identidade visual",
      Title: `Briefing Voxion - ${clientName}`,
    };

    drawCoverPage(doc, { clientName, createdAt, submissionId });
    doc.addPage();
    drawContentHeader(doc, { clientName, createdAt }, false);
    renderBriefingContent(doc, { clientName, createdAt }, text);

    doc.end();
  });
}

function drawCoverPage(doc, meta) {
  const { left, right, top } = doc.page.margins;
  const contentWidth = doc.page.width - left - right;

  doc.rect(0, 0, doc.page.width, doc.page.height).fill(BRAND.background);
  doc.rect(0, 0, doc.page.width, 14).fill(BRAND.accent);

  if (fs.existsSync(LOGO_PATH)) {
    doc.image(LOGO_PATH, left, top + 18, { fit: [56, 56] });
  }

  doc.fillColor(BRAND.accent);
  doc.font("Helvetica-Bold");
  doc.fontSize(11);
  doc.text("VOXION STUDIO", left + 72, top + 24, { width: contentWidth - 72 });

  doc.fillColor(BRAND.brown);
  doc.fontSize(28);
  doc.text("Briefing de Identidade Visual", left, top + 110, { width: contentWidth });

  doc.fillColor(BRAND.muted);
  doc.font("Helvetica");
  doc.fontSize(12);
  doc.text(
    "Documento gerado automaticamente a partir do formulario enviado pelo site.",
    left,
    top + 172,
    { width: contentWidth, lineGap: 4 }
  );

  const cardTop = top + 250;
  doc.roundedRect(left, cardTop, contentWidth, 142, 16).fillAndStroke("#fff", BRAND.line);

  doc.fillColor(BRAND.muted);
  doc.fontSize(10);
  doc.text("Cliente", left + 24, cardTop + 24);

  doc.fillColor(BRAND.brown);
  doc.font("Helvetica-Bold");
  doc.fontSize(18);
  doc.text(meta.clientName, left + 24, cardTop + 40, { width: contentWidth - 48 });

  doc.fillColor(BRAND.muted);
  doc.font("Helvetica");
  doc.fontSize(10);
  doc.text("Gerado em", left + 24, cardTop + 86);

  doc.fillColor(BRAND.brown);
  doc.font("Helvetica-Bold");
  doc.fontSize(12);
  doc.text(formatDateForDisplay(meta.createdAt), left + 24, cardTop + 102, {
    width: contentWidth - 48,
  });

  doc.fillColor(BRAND.muted);
  doc.font("Helvetica");
  doc.fontSize(10);
  doc.text(`Protocolo: ${meta.submissionId}`, left, doc.page.height - 92, {
    align: "center",
    width: contentWidth,
  });
}

function drawContentHeader(doc, meta, isContinuation) {
  const { left, right, top } = doc.page.margins;
  const contentWidth = doc.page.width - left - right;

  doc.rect(0, 0, doc.page.width, doc.page.height).fill(BRAND.background);
  doc.rect(0, 0, doc.page.width, 10).fill(BRAND.accent);

  if (fs.existsSync(LOGO_PATH)) {
    doc.image(LOGO_PATH, left, top - 10, { fit: [28, 28] });
  }

  doc.fillColor(BRAND.accent);
  doc.font("Helvetica-Bold");
  doc.fontSize(10);
  doc.text("VOXION STUDIO", left + 38, top - 6);

  doc.fillColor(BRAND.muted);
  doc.font("Helvetica");
  doc.fontSize(9);
  doc.text(
    isContinuation ? "Continuação do briefing" : meta.clientName,
    left,
    top - 6,
    { align: "right", width: contentWidth }
  );

  doc.moveTo(left, top + 22);
  doc.lineTo(doc.page.width - right, top + 22);
  doc.lineWidth(1);
  doc.strokeColor(BRAND.line);
  doc.stroke();

  doc.y = top + 38;
}

function renderBriefingContent(doc, meta, text) {
  const lines = text.split("\n");
  let hasContent = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      doc.moveDown(0.45);
      continue;
    }

    if (line === "VOXION STUDIO | QUESTIONÁRIO DE BRIEFING" || line === "Identidade visual") {
      continue;
    }

    if (/^\d{2}\.\s/.test(line)) {
      ensureSpace(doc, meta, 52);
      doc.moveDown(0.35);
      doc.fillColor(BRAND.accent);
      doc.font("Helvetica-Bold");
      doc.fontSize(15);
      doc.text(line, { lineGap: 2 });
      doc.moveDown(0.18);
      continue;
    }

    if (isPromptLine(line)) {
      ensureSpace(doc, meta, 38);
      doc.fillColor(BRAND.brown);
      doc.font("Helvetica-Bold");
      doc.fontSize(11.5);
      doc.text(line, { lineGap: 2 });
      doc.moveDown(0.12);
      continue;
    }

    ensureSpace(doc, meta, 32);
    doc.fillColor(BRAND.muted);
    doc.font("Helvetica");
    doc.fontSize(10.5);
    doc.text(line, { lineGap: 3 });
    doc.moveDown(0.45);
    hasContent = true;
  }

  if (!hasContent) {
    doc.fillColor(BRAND.muted);
    doc.font("Helvetica");
    doc.fontSize(11);
    doc.text("Nenhuma resposta foi encontrada para compor o briefing.");
  }
}

function ensureSpace(doc, meta, minHeight) {
  const bottomLimit = doc.page.height - doc.page.margins.bottom;
  if (doc.y + minHeight <= bottomLimit) return;

  doc.addPage();
  drawContentHeader(doc, meta, true);
}

function isPromptLine(line) {
  return line.endsWith("?") || PROMPT_LABELS.has(line);
}

async function sendSubmissionEmail({
  clientName,
  createdAt,
  pdfBuffer,
  pdfFilename,
  submissionId,
  text,
  textFilename,
}) {
  const transport = nodemailer.createTransport({
    auth: {
      pass: process.env.SMTP_PASS,
      user: process.env.SMTP_USER,
    },
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 465),
    secure: parseBoolean(process.env.SMTP_SECURE, Number(process.env.SMTP_PORT || 465) === 465),
  });

  const previewLines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 8);

  await transport.sendMail({
    attachments: [
      {
        content: pdfBuffer,
        contentType: "application/pdf",
        filename: pdfFilename,
      },
      {
        content: `${text}\n`,
        contentType: "text/plain; charset=utf-8",
        filename: textFilename,
      },
    ],
    from: {
      address: process.env.SMTP_FROM || process.env.SMTP_USER,
      name: process.env.SMTP_FROM_NAME || "Voxion Studio",
    },
    html: buildEmailHtml({ clientName, createdAt, previewLines, submissionId }),
    subject: `Novo briefing de identidade visual - ${clientName}`,
    text: buildEmailText({ clientName, createdAt, previewLines, submissionId }),
    to: process.env.EMAIL_TO,
  });
}

function buildEmailText({ clientName, createdAt, previewLines, submissionId }) {
  const lines = [
    "Novo briefing recebido pelo site da Voxion.",
    "",
    `Cliente: ${clientName}`,
    `Data: ${formatDateForDisplay(createdAt)}`,
    `Protocolo: ${submissionId}`,
    "",
    "Arquivos anexados:",
    "- PDF do briefing",
    "- TXT com as respostas",
  ];

  if (previewLines.length) {
    lines.push("", "Prévia do conteúdo:");
    lines.push(...previewLines);
  }

  return lines.join("\n");
}

function buildEmailHtml({ clientName, createdAt, previewLines, submissionId }) {
  const preview = previewLines.length
    ? `<div style="margin-top:24px"><strong>Previa do conteudo</strong><pre style="margin:12px 0 0;padding:16px;border-radius:12px;background:#fff7f2;border:1px solid #f0d7c3;white-space:pre-wrap;font-family:Arial,sans-serif">${escapeHtml(previewLines.join("\n"))}</pre></div>`
    : "";

  return `
    <div style="font-family:Arial,sans-serif;background:#fffaf6;color:#31251f;padding:24px">
      <div style="max-width:680px;margin:0 auto;background:#ffffff;border:1px solid #ead9cb;border-radius:18px;overflow:hidden">
        <div style="height:10px;background:#f18536"></div>
        <div style="padding:28px">
          <h1 style="margin:0 0 18px;font-size:24px;color:#31251f">Novo briefing recebido</h1>
          <p style="margin:0 0 20px;color:#5c4a41">O formulario do site recebeu uma nova submissao e os arquivos seguem anexados neste e-mail.</p>
          <table style="width:100%;border-collapse:collapse">
            <tr>
              <td style="padding:10px 0;color:#5c4a41"><strong>Cliente</strong></td>
              <td style="padding:10px 0;color:#31251f">${escapeHtml(clientName)}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;color:#5c4a41"><strong>Data</strong></td>
              <td style="padding:10px 0;color:#31251f">${escapeHtml(formatDateForDisplay(createdAt))}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;color:#5c4a41"><strong>Protocolo</strong></td>
              <td style="padding:10px 0;color:#31251f">${escapeHtml(submissionId)}</td>
            </tr>
          </table>
          ${preview}
        </div>
      </div>
    </div>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function parseBoolean(value, fallback) {
  if (value == null || value === "") return fallback;
  return ["1", "true", "yes", "on"].includes(String(value).trim().toLowerCase());
}

class HttpError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.name = "HttpError";
    this.statusCode = statusCode;
  }
}
