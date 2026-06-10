# Hospedagem na Hostinger

Este projeto foi ajustado para rodar como uma aplicacao Node.js unica, servindo o frontend e a API no mesmo dominio ou subdominio.

## O que subir

Suba a raiz inteira do projeto com estes arquivos e pastas principais:

- `package.json`
- `package-lock.json`
- `server.js`
- `public/`

Nao envie a pasta `submissions/` se ela ainda nao existir. O servidor cria essa pasta automaticamente quando iniciar.
Tambem nao envie `node_modules/`, porque a instalacao deve ser feita no ambiente da Hostinger com `npm install`.

## Configuracao esperada

- Aplicacao Node.js
- Subdominio apontando para essa aplicacao
- Comando de start: `npm start`
- Node moderno, preferencialmente 18+
- Variaveis de ambiente cadastradas no painel

## Variaveis de ambiente

- `PORT`
- `HOST`
- `EMAIL_TO`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`
- `SMTP_FROM_NAME`

Exemplo:

```txt
PORT=8787
HOST=0.0.0.0
EMAIL_TO=contato@seudominio.com
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=contato@seudominio.com
SMTP_PASS=sua-senha-ou-app-password
SMTP_FROM=contato@seudominio.com
SMTP_FROM_NAME=Voxion Studio
```

## Fluxo no subdominio

- O frontend abre no proprio subdominio.
- O envio do formulario usa a rota relativa `/api/briefings`.
- O backend gera o PDF, salva uma copia local em `submissions/` e envia os anexos por e-mail.

## Checklist rapido

1. Rode `npm install`.
2. Configure as variaveis de ambiente no painel da Hostinger.
3. Suba os arquivos `package.json`, `package-lock.json`, `server.js` e `public/`.
4. Execute `npm install` no ambiente da aplicacao.
5. Inicie com `npm start`.
6. Abra `/api/health` no subdominio e confirme `{"ok":true,...}`.
7. Envie um briefing de teste e confirme:
   - carregamento da pagina
   - criacao do PDF
   - criacao do TXT
   - recebimento do e-mail em `voxionstudio@gmail.com`

## Variaveis prontas para este projeto

Se voce for usar o proprio Gmail da Voxion como remetente e destinatario, pode cadastrar assim:

```txt
PORT=8787
HOST=0.0.0.0
EMAIL_TO=voxionstudio@gmail.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=voxionstudio@gmail.com
SMTP_PASS=SUA_SENHA_DE_APP_DO_GMAIL
SMTP_FROM=voxionstudio@gmail.com
SMTP_FROM_NAME=Voxion Studio
```

Importante:

- `SMTP_PASS` precisa ser a senha de app do Google, nao a senha normal da conta.
- Depois de salvar as variaveis, reinicie a aplicacao.
