const STORAGE_KEY = "voxion-briefing-v1";

const sections = [
  {
    title: "Sobre o negócio",
    intro: "Entenda a origem, a operação e o que torna o negócio diferente antes de pensar na estética.",
    items: [
      q("Qual é o nome do negócio ou marca?", "Inclua a grafia correta e qualquer variação usada no dia a dia."),
      q("Como vocês resumem o negócio em poucas palavras?", "Explique o que fazem, para quem fazem e em qual contexto atuam."),
      q("Quais produtos, serviços ou experiências vocês oferecem?", "Liste os principais e destaque o que tem mais importância hoje."),
      q("O que vocês acreditam que torna o negócio diferente dos concorrentes?", "Pode ser qualidade, atendimento, preço, processo, experiência, especialização, agilidade, cuidado ou outro diferencial.")
    ]
  },
  {
    title: "Momento atual da marca",
    intro: "Mapeie como a marca é percebida hoje e o que precisa mudar.",
    items: [
      q("Hoje, como vocês se sentem em relação à imagem da marca?", "O que funciona, o que incomoda e o que parece não representar mais o negócio?"),
      q("Existe alguma parte da identidade atual que vocês gostariam de manter?"),
      checks("Situação atual da marca", ["Ainda não existe identidade definida", "Existe uma marca, mas está simples demais", "A marca parece desatualizada", "A marca não transmite profissionalismo", "A marca não combina mais com o negócio", "A marca funciona, mas precisa de organização"])
    ]
  },
  {
    title: "Objetivos da mudança",
    intro: "Defina o que a nova identidade precisa melhorar na percepção do negócio.",
    items: [
      q("Qual é o principal objetivo com a nova identidade visual?", "Ex.: vender mais, parecer mais profissional, atrair outro público, organizar a comunicação, modernizar, crescer."),
      q("Como vocês querem que a marca seja percebida daqui para frente?"),
      checks("A marca deve parecer mais", ["Profissional", "Premium", "Moderna", "Tradicional", "Caseira ou próxima", "Divertida", "Elegante", "Criativa", "Minimalista", "Confiável", "Popular", "Exclusiva"]),
      q("O que não pode se perder nessa mudança?", "Ex.: proximidade, história, essência, público atual, cores, algum símbolo, jeito de falar."),
      scale("Nível de mudança desejado", "Apenas evoluir", "Mudar bastante")
    ]
  },
  {
    title: "Público e clientes",
    intro: "Entenda quem compra, quem deve ser atraído e que sensação a marca precisa gerar.",
    items: [
      q("Quem mais compra, contrata ou se interessa pelo negócio hoje?", "Descreva idade, estilo de vida, localização, profissão, renda, hábitos ou contexto."),
      q("Existe algum público que vocês querem atrair mais?"),
      q("O que esse público mais valoriza ao escolher uma marca como a de vocês?", "Preço, confiança, estética, praticidade, status, atendimento, qualidade, rapidez, experiência etc."),
      q("Como vocês querem que as pessoas se sintam quando veem a marca pela primeira vez?"),
      checks("Sensações desejadas", ["Confiança", "Desejo", "Acolhimento", "Segurança", "Sofisticação", "Agilidade", "Criatividade", "Cuidado", "Exclusividade", "Familiaridade", "Energia", "Tranquilidade"])
    ]
  },
  {
    title: "Comunicação e divulgação",
    intro: "Avalie onde a marca aparece hoje e como a identidade pode ajudar na comunicação.",
    items: [
      q("Hoje vocês usam Instagram, WhatsApp, site, marketplace, anúncios ou outras formas de divulgação?"),
      q("Qual é a maior dificuldade visual ou de comunicação hoje?", "Ex.: falta de padrão, posts fracos, materiais amadores, dificuldade de vender, pouca clareza ou pouca personalidade."),
      q("Quais canais serão mais importantes para a nova identidade?", "Redes sociais, site, WhatsApp, propostas, embalagens, fachada, apresentações, anúncios, uniformes etc."),
      checks("Canais prioritários", ["Instagram", "WhatsApp", "Site", "Google/Busca", "Anúncios", "Materiais impressos", "Embalagens", "Apresentações", "Fachada ou ambiente físico", "Eventos", "E-mail", "Marketplace"])
    ]
  },
  {
    title: "Referências e gosto visual",
    intro: "Transforme preferências visuais em critérios claros para criação.",
    items: [
      q("Existe alguma marca, negócio, perfil ou site que vocês acham bonito?", "Pode ser do mesmo segmento ou de outro mercado."),
      q("O que exatamente agrada nessas referências?", "Cores, simplicidade, sofisticação, energia, fotos, tipografia, organização, sensação etc."),
      q("Existe alguma marca ou estilo que vocês não gostam? Por quê?"),
      checks("Estilo visual preferido", ["Minimalista", "Moderno", "Elegante", "Divertido", "Tradicional", "Artesanal", "Tecnológico", "Colorido", "Neutro", "Premium", "Popular", "Afetivo"]),
      q("Existe alguma cor, símbolo ou elemento que vocês querem usar ou evitar?"),
      scale("Complexidade visual", "Limpa", "Rica em detalhes"),
      scale("Uso de cor", "Neutro", "Vibrante")
    ]
  },
  {
    title: "Concorrentes e mercado",
    intro: "Entenda como o negócio se diferencia e o que não deve parecer igual ao mercado.",
    items: [
      q("Quais marcas ou negócios vocês consideram concorrentes diretos?"),
      q("O que vocês admiram e o que não querem repetir no mercado?", "Pode incluir estética, postura, preço, linguagem, atendimento ou posicionamento."),
      q("O que faria um cliente escolher vocês em vez de outra opção?"),
      scale("Posicionamento de preço/percepção", "Acessível", "Exclusivo")
    ]
  },
  {
    title: "Crescimento e futuro",
    intro: "A identidade deve acompanhar o futuro desejado para o negócio.",
    items: [
      q("Vocês pensam em expandir o negócio?", "Ex.: vender online, abrir unidade, criar novos produtos, atender outras regiões, franquear, lançar cursos, criar embalagens próprias."),
      q("Quais novos produtos, serviços, linhas ou frentes podem surgir no futuro?"),
      q("Quais aplicações serão importantes no futuro?", "Embalagem, fachada, uniforme, site, aplicativo, apresentação comercial, catálogo, veículo, sinalização etc."),
      checks("Possíveis usos da identidade", ["Logo principal", "Logo reduzido", "Paleta de cores", "Tipografia", "Redes sociais", "Site", "Embalagens", "Fachada", "Uniforme", "Apresentação comercial", "Materiais impressos", "Templates"])
    ]
  },
  {
    title: "Restrições e cuidados",
    intro: "Evite escolhas bonitas que geram problema de uso, leitura ou interpretação.",
    items: [
      q("Existe alguma informação obrigatória, restrição legal ou cuidado técnico que precisa ser respeitado?"),
      q("A marca precisa funcionar em algum uso específico?", "Bordado, impressão simples, etiqueta pequena, fachada, fundo escuro, assinatura digital, carimbo etc."),
      q("Existe alguma palavra, símbolo, cor ou associação que precisa ser evitada?"),
      q("Quem precisa aprovar a nova identidade visual e quais critérios serão mais importantes?", "Clareza, beleza, originalidade, profissionalismo, custo de aplicação, aceitação do público, facilidade de uso.")
    ]
  },
  {
    title: "Pergunta final",
    intro: "Feche o briefing com a sensação central que a marca precisa transmitir.",
    items: [
      q("Em uma frase, o que essa marca precisa comunicar?"),
      q("Quais três palavras resumem a marca ideal?"),
      q("Existe algo importante que não foi perguntado e precisa ser considerado?")
    ]
  }
];

function q(label, hint = "") {
  return { type: "textarea", label, hint };
}

function checks(label, options) {
  return { type: "checks", label, options };
}

function scale(label, left, right) {
  return { type: "scale", label, left, right };
}

function slug(text) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function loadData() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveData() {
  const data = {};
  document.querySelectorAll("[data-field]").forEach((field) => {
    if (field.type === "checkbox") {
      data[field.dataset.field] = field.checked;
      return;
    }
    if (field.type === "radio") {
      if (field.checked) data[field.name] = field.value;
      return;
    }
    data[field.dataset.field] = field.value;
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  const status = document.getElementById("saveStatus");
  if (status) {
    status.textContent = "✓";
    status.title = "Respostas salvas";
  }
  updateProgress();
}

function restoreData() {
  const data = loadData();
  document.querySelectorAll("[data-field]").forEach((field) => {
    const key = field.type === "radio" ? field.name : field.dataset.field;
    if (!(key in data)) return;
    if (field.type === "checkbox") field.checked = Boolean(data[key]);
    else if (field.type === "radio") field.checked = data[key] === field.value;
    else field.value = data[key];
  });
}

function buildNav() {
  const nav = document.getElementById("sectionNav");
  if (!nav) return;
  nav.innerHTML = sections
    .map((section, index) => {
      const n = String(index + 1).padStart(2, "0");
      return `<a href="#${slug(section.title)}"><strong>${n}</strong><span>${section.title}</span></a>`;
    })
    .join("");
}

function buildForm() {
  const form = document.getElementById("briefingForm");
  form.innerHTML = sections
    .map((section, sectionIndex) => renderSection(section, sectionIndex))
    .join("");
}

function renderSection(section, sectionIndex) {
  const n = String(sectionIndex + 1).padStart(2, "0");
  return `
    <section class="briefing-section" id="${slug(section.title)}">
      <div class="section-header">
        <span class="section-number">${n}</span>
        <div>
          <h2>${section.title}</h2>
          <p>${section.intro}</p>
        </div>
      </div>
      <div class="questions">
        ${section.items.map((item, itemIndex) => renderItem(item, sectionIndex, itemIndex)).join("")}
      </div>
    </section>
  `;
}

function renderItem(item, sectionIndex, itemIndex) {
  const field = `s${sectionIndex}.i${itemIndex}`;
  if (item.type === "checks") {
    return `
      <div class="question" data-question="${field}">
        <span class="question__label">${item.label}</span>
        <div class="option-grid">
          ${item.options
            .map((option, optionIndex) => {
              const id = `${field}.o${optionIndex}`;
              return `
                <label class="option" for="${id}">
                  <input id="${id}" data-field="${id}" type="checkbox" />
                  <span>${option}</span>
                </label>
              `;
            })
            .join("")}
        </div>
      </div>
    `;
  }

  if (item.type === "scale") {
    return `
      <div class="question scale" data-question="${field}">
        <span class="question__label">${item.label}</span>
        <div class="scale__row">
          <span class="scale__edge">${item.left}</span>
          ${Array.from({ length: 10 }, (_, index) => index + 1)
            .map((value) => {
              const id = `${field}.v${value}`;
              return `
                <label class="scale__choice" for="${id}" title="${value}">
                  <input id="${id}" data-field="${field}" name="${field}" type="radio" value="${value}" />
                  <span>${value}</span>
                </label>
              `;
            })
            .join("")}
          <span class="scale__edge">${item.right}</span>
        </div>
      </div>
    `;
  }

  return `
    <label class="question" data-question="${field}">
      <span class="question__label">${item.label}</span>
      ${item.hint ? `<span class="question__hint">${item.hint}</span>` : ""}
      <textarea data-field="${field}" rows="4"></textarea>
    </label>
  `;
}

function updateProgress() {
  const fields = Array.from(document.querySelectorAll("[data-field]"));
  const groupedRadios = new Set(fields.filter((field) => field.type === "radio").map((field) => field.name));
  const normalFields = fields.filter((field) => field.type !== "radio");
  const total = normalFields.length + groupedRadios.size;
  let filled = 0;

  normalFields.forEach((field) => {
    if (field.type === "checkbox") {
      if (field.checked) filled += 1;
    } else if (field.value.trim()) {
      filled += 1;
    }
  });

  groupedRadios.forEach((name) => {
    if (document.querySelector(`input[name="${CSS.escape(name)}"]:checked`)) filled += 1;
  });

  const percent = total ? Math.round((filled / total) * 100) : 0;
  document.getElementById("progressLabel").textContent = `${percent}%`;
  document.getElementById("progressBar").style.width = `${percent}%`;
}

function exportText() {
  const data = loadData();
  const lines = [];
  lines.push("VOXION STUDIO | QUESTIONÁRIO DE BRIEFING");
  lines.push("Identidade visual");
  lines.push("");

  sections.forEach((section, sectionIndex) => {
    lines.push(`${String(sectionIndex + 1).padStart(2, "0")}. ${section.title}`);
    section.items.forEach((item, itemIndex) => {
      const field = `s${sectionIndex}.i${itemIndex}`;
      lines.push(`\n${item.label}`);
      if (item.type === "textarea") {
        lines.push(data[field] || "");
      } else if (item.type === "checks") {
        const selected = item.options.filter((_, optionIndex) => data[`${field}.o${optionIndex}`]);
        lines.push(selected.length ? selected.join(", ") : "");
      } else if (item.type === "scale") {
        lines.push(data[field] ? `${data[field]} / 10 (${item.left} → ${item.right})` : "");
      }
    });
    lines.push("");
  });

  return lines.join("\n");
}

function wrapPdfText(text, maxChars = 86) {
  const clean = String(text || "").replace(/\r/g, "").split("\n");
  const wrapped = [];
  clean.forEach((paragraph) => {
    const words = paragraph.split(/\s+/).filter(Boolean);
    if (!words.length) {
      wrapped.push("");
      return;
    }
    let line = "";
    words.forEach((word) => {
      const next = line ? `${line} ${word}` : word;
      if (next.length > maxChars) {
        wrapped.push(line);
        line = word;
      } else {
        line = next;
      }
    });
    if (line) wrapped.push(line);
  });
  return wrapped;
}

function pdfEscape(text) {
  return String(text)
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/[^\x20-\x7EÀ-ÿ]/g, "");
}

function buildPdfBlob(text) {
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
      stream += `${margin} ${y.toFixed(2)} Td (${pdfEscape(line)}) Tj\n`;
      stream += `${-margin} 0 Td\n`;
      y -= lineHeight;
    });
    stream += "ET";
    objects.push(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
  });

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new Blob([pdf], { type: "application/pdf" });
}

function downloadPdf() {
  const text = exportText();
  const blob = buildPdfBlob(text);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const firstAnswer = (document.querySelector('[data-field="s0.i0"]')?.value || "briefing")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/(^-|-$)/g, "")
    .toLowerCase();
  a.href = url;
  a.download = `briefing-voxion-${firstAnswer || "briefing"}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}

function getClientName() {
  return document.querySelector('[data-field="s0.i0"]')?.value || "briefing";
}

function apiUrl(path) {
  const host = window.location.hostname;
  const isLocal = host === "localhost" || host === "127.0.0.1" || host === "";

  if (!isLocal && (window.location.protocol === "http:" || window.location.protocol === "https:")) {
    return "/.netlify/functions/briefings";
  }

  if (isLocal && window.location.port !== "8787") {
    return `http://127.0.0.1:8787${path}`;
  }

  return `http://127.0.0.1:8787${path}`;
}

async function openExport() {
  saveData();
  const button = document.getElementById("exportText");
  const previousText = button.textContent;
  button.disabled = true;
  button.textContent = "Enviando...";

  try {
    const response = await fetch(apiUrl("/api/briefings"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientName: getClientName(),
        text: exportText(),
      }),
    });
    const result = await response.json();
    if (!result.ok) throw new Error(result.error || "Nao foi possivel enviar.");

    if (result.emailSent) {
      alert("Respostas enviadas para voxionstudio@gmail.com com o PDF em anexo.");
    } else if (result.emailConfigured) {
      alert(`O PDF foi salvo, mas o e-mail nao foi enviado. Erro: ${result.emailError || "verifique o backend."}`);
    } else {
      alert("O PDF foi salvo no backend, mas o envio de e-mail ainda precisa das credenciais SMTP no arquivo .env.");
    }
  } catch (error) {
    downloadPdf();
    alert("Nao consegui conectar ao backend. Baixei o PDF das respostas para voce nao perder o briefing.");
  } finally {
    button.disabled = false;
    button.textContent = previousText;
  }
}

function downloadExport() {
  const text = document.getElementById("exportOutput").value;
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const firstAnswer = (document.querySelector('[data-field="s0.i0"]')?.value || "briefing")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/(^-|-$)/g, "")
    .toLowerCase();
  a.href = url;
  a.download = `briefing-voxion-${firstAnswer || "briefing"}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

function setupEvents() {
  setupHeroScrollAnimation();

  document.addEventListener("input", (event) => {
    if (!event.target.matches("[data-field]")) return;
    const status = document.getElementById("saveStatus");
    if (status) status.textContent = "…";
    clearTimeout(window.saveTimer);
    window.saveTimer = setTimeout(saveData, 180);
  });

  document.getElementById("exportText").addEventListener("click", openExport);
  document.getElementById("closeDialog").addEventListener("click", () => document.getElementById("exportDialog").close());
  document.getElementById("copyExport").addEventListener("click", async () => {
    await navigator.clipboard.writeText(document.getElementById("exportOutput").value);
  });
  document.getElementById("downloadExport").addEventListener("click", downloadExport);
  document.getElementById("resetForm").addEventListener("click", () => {
    if (!confirm("Limpar todas as respostas salvas?")) return;
    localStorage.removeItem(STORAGE_KEY);
    document.querySelectorAll("[data-field]").forEach((field) => {
      if (field.type === "checkbox" || field.type === "radio") field.checked = false;
      else field.value = "";
    });
    updateProgress();
  });

  if (document.getElementById("sectionNav")) {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        document.querySelectorAll("#sectionNav a").forEach((link) => {
          link.classList.toggle("is-active", link.getAttribute("href") === `#${visible.target.id}`);
        });
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: [0.15, 0.4, 0.7] }
    );
    document.querySelectorAll(".briefing-section").forEach((section) => observer.observe(section));
  }
}

function setupHeroScrollAnimation() {
  const hero = document.querySelector(".hero");
  if (!hero || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  let ticking = false;
  const update = () => {
    const rect = hero.getBoundingClientRect();
    const distance = Math.max(1, rect.height * 0.82);
    const progress = Math.min(1, Math.max(0, -rect.top / distance));
    hero.style.setProperty("--hero-progress", progress.toFixed(3));
    ticking = false;
  };

  const requestUpdate = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };

  update();
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
}

buildNav();
buildForm();
restoreData();
updateProgress();
setupEvents();
