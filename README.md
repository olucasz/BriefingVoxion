# Voxion Briefing

Aplicacao de briefing da Voxion pronta para deploy como app Node.js tradicional.

## Estrutura

- `public/`: frontend estatico do formulario
- `server.js`: servidor HTTP, API, geracao de PDF e envio por e-mail
- `submissions/`: pasta onde os PDFs e arquivos TXT sao salvos localmente

## Rodar localmente

1. Instale as dependencias:

```bash
npm install
```

2. Copie o arquivo de exemplo e ajuste as variaveis:

```bash
cp .env.example .env
```

3. Inicie o servidor:

```bash
npm start
```

4. Abra:

```txt
http://127.0.0.1:8787
```

## Variaveis de ambiente



Se o SMTP ou o `EMAIL_TO` nao estiverem configurados, o sistema continua gerando e salvando o PDF no servidor, mas nao envia e-mail.

## Deploy na Hostinger

As instrucoes resumidas estao em [HOSPEDAGEM_HOSTINGER.md](/Users/lucasz/Desktop/voxion-briefing/HOSPEDAGEM_HOSTINGER.md).

## Arquivos para deploy

Envie estes itens para a aplicacao Node.js na Hostinger:

- `package.json`
- `package-lock.json`
- `server.js`
- `public/`

Nao envie:

- `node_modules/`
- `submissions/`
- `.env` local da sua maquina
