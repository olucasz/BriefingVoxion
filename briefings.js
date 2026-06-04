const net = require("node:net");
const tls = require("node:tls");
const crypto = require("node:crypto");

const EMAIL_TO = process.env.EMAIL_TO || "griccoparaizo@gmail.com";

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Content-Type": "application/json; charset=utf-8",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return json(405, { ok: false, error: "Metodo nao permitido." }, headers);
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const text = String(body.text || "").trim();
    const clientName = sanitizeName(body.clientName || "briefing");

    if (!text) {
      return json(400, { ok: false, error: "Nenhuma resposta foi recebida." }, headers);
    }

    const pdfBuffer = buildPdfBuffer(text);
    const email = {
      sent: false,
      configured: hasSmtpConfig(),
      error: null,
    };

    if (email.configured) {
      try {
        await sendEmail({
          to: EMAIL_TO,
          subject: `Novo briefing de identidade visual - ${clientName}`,
          text: [
            "Ola,",
            "",
            "Um novo questionario de briefing foi enviado pelo site da Voxion.",
            "O PDF com as respostas esta anexado a este e-mail.",
          ].join("\n"),
          attachmentName: `briefing-voxion-${clientName}.pdf`,
          attachmentBuffer: pdfBuffer,
        });
        email.sent = true;
      } catch (error) {
        email.error = error.message;
      }
    }

    return json(email.sent ? 200 : 202, {
      ok: true,
      emailSent: email.sent,
      emailConfigured: email.configured,
      emailError: email.error,
    }, headers);
  } catch (error) {
    return json(500, { ok: false, error: "Erro interno ao enviar o briefing." }, headers);
  }
};

function json(statusCode, payload, headers) {
  return {
    statusCode,
    headers,
    body: JSON.stringify(payload),
  };
}

function hasSmtpConfig() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function sanitizeName(value) {
  return String(value || "briefing")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/(^-|-$)/g, "")
    .toLowerCase() || "briefing";
}

function wrapPdfText(text, maxChars = 82) {
  const lines = [];
  String(text || "").replace(/\r/g, "").split("\n").forEach((paragraph) => {
    const words = paragraph.split(/\s+/).filter(Boolean);
    if (!words.length) {
      lines.push("");
      return;
    }
    let line = "";
    words.forEach((word) => {
      const next = line ? `${line} ${word}` : word;
      if (next.length > maxChars) {
        if (line) lines.push(line);
        line = word;
      } else {
        line = next;
      }
    });
    if (line) lines.push(line);
  });
  return lines;
}

function pdfHex(text) {
  const utf16 = Buffer.from(`\uFEFF${text}`, "utf16le");
  for (let i = 0; i < utf16.length; i += 2) {
    const a = utf16[i];
    utf16[i] = utf16[i + 1];
    utf16[i + 1] = a;
  }
  return utf16.toString("hex").toUpperCase();
}

function buildPdfBuffer(text) {
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const margin = 48;
  const lineHeight = 14;
  const linesPerPage = Math.floor((pageHeight - margin * 2) / lineHeight);
  const allLines = wrapPdfText(text);
  const pages = [];

  for (let i = 0; i < allLines.length; i += linesPerPage) {
    pages.push(allLines.slice(i, i + linesPerPage));
  }
  if (!pages.length) pages.push([""]);

  const objects = [];
  objects.push("<< /Type /Catalog /Pages 2 0 R >>");
  objects.push(`<< /Type /Pages /Kids [${pages.map((_, index) => `${3 + index * 2} 0 R`).join(" ")}] /Count ${pages.length} >>`);

  pages.forEach((pageLines, index) => {
    const pageObjectNumber = 3 + index * 2;
    const contentObjectNumber = pageObjectNumber + 1;
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> /F2 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> >> >> /Contents ${contentObjectNumber} 0 R >>`);

    let stream = "BT\n/F1 10 Tf\n";
    let y = pageHeight - margin;
    pageLines.forEach((line) => {
      const isTitle = /^(\d{2}\.|VOXION|Identidade visual)/.test(line);
      stream += isTitle ? "/F2 11 Tf\n" : "/F1 10 Tf\n";
      stream += `1 0 0 1 ${margin} ${y.toFixed(2)} Tm <${pdfHex(line)}> Tj\n`;
      y -= lineHeight;
    });
    stream += "ET";
    objects.push(`<< /Length ${Buffer.byteLength(stream, "binary")} >>\nstream\n${stream}\nendstream`);
  });

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf, "binary"));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = Buffer.byteLength(pdf, "binary");
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf, "binary");
}

async function sendEmail({ to, subject, text, attachmentName, attachmentBuffer }) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 465);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || user;

  const client = await connectSmtp(host, port);
  try {
    await smtpRead(client);
    await smtpCommand(client, `EHLO ${process.env.SMTP_DOMAIN || "voxionstudio.com"}`);
    await smtpCommand(client, "AUTH LOGIN");
    await smtpCommand(client, Buffer.from(user).toString("base64"));
    await smtpCommand(client, Buffer.from(pass).toString("base64"));
    await smtpCommand(client, `MAIL FROM:<${from}>`);
    await smtpCommand(client, `RCPT TO:<${to}>`);
    await smtpCommand(client, "DATA", 354);
    client.write(buildMimeMessage({ from, to, subject, text, attachmentName, attachmentBuffer }) + "\r\n.\r\n");
    await smtpRead(client, 250);
    await smtpCommand(client, "QUIT", 221).catch(() => {});
  } finally {
    client.end();
  }
}

function connectSmtp(host, port) {
  return new Promise((resolve, reject) => {
    const options = { host, port, servername: host };
    const socket = port === 465 ? tls.connect(options) : net.connect(options);
    socket.setEncoding("utf8");
    socket.once("error", reject);
    socket.once(port === 465 ? "secureConnect" : "connect", () => {
      socket.off("error", reject);
      resolve(socket);
    });
  });
}

function smtpRead(socket, expectedCode) {
  return new Promise((resolve, reject) => {
    let buffer = "";
    const onData = (chunk) => {
      buffer += chunk;
      const lines = buffer.split(/\r?\n/).filter(Boolean);
      const last = lines[lines.length - 1] || "";
      if (!/^\d{3} /.test(last)) return;
      socket.off("data", onData);
      const code = Number(last.slice(0, 3));
      if (expectedCode && code !== expectedCode) {
        reject(new Error(`SMTP esperava ${expectedCode}, recebeu ${code}`));
      } else if (code >= 400) {
        reject(new Error(`SMTP erro ${code}`));
      } else {
        resolve(buffer);
      }
    };
    socket.on("data", onData);
  });
}

async function smtpCommand(socket, command, expectedCode) {
  socket.write(command + "\r\n");
  return smtpRead(socket, expectedCode);
}

function buildMimeMessage({ from, to, subject, text, attachmentName, attachmentBuffer }) {
  const boundary = `voxion-${crypto.randomBytes(12).toString("hex")}`;
  const encodedSubject = `=?UTF-8?B?${Buffer.from(subject, "utf8").toString("base64")}?=`;
  const attachmentBase64 = wrapBase64(attachmentBuffer.toString("base64"));

  return [
    `From: Voxion Studio <${from}>`,
    `To: ${to}`,
    `Subject: ${encodedSubject}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    "Content-Type: text/plain; charset=utf-8",
    "Content-Transfer-Encoding: 8bit",
    "",
    text,
    "",
    `--${boundary}`,
    `Content-Type: application/pdf; name="${attachmentName}"`,
    "Content-Transfer-Encoding: base64",
    `Content-Disposition: attachment; filename="${attachmentName}"`,
    "",
    attachmentBase64,
    "",
    `--${boundary}--`,
  ].join("\r\n");
}

function wrapBase64(value) {
  return String(value).replace(/.{1,76}/g, "$&\r\n").trim();
}
