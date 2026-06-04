# Voxion Briefing Backend

Este backend recebe as respostas do questionario, gera um PDF, salva uma copia em `submissions/` e envia o PDF por e-mail para `voxionstudio@gmail.com`.

## Rodar localmente

1. Copie `.env.example` para `.env`.
2. Preencha `SMTP_PASS` com uma senha de app do Gmail ou credenciais SMTP equivalentes.
3. Rode:

```bash
node backend/server.js
```

4. Acesse:

```txt
http://127.0.0.1:8787
```

## Configuracao de e-mail

Para Gmail, a senha precisa ser uma **senha de app**, nao a senha normal da conta.

Variaveis usadas:

```txt
EMAIL_TO=voxionstudio@gmail.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=voxionstudio@gmail.com
SMTP_PASS=sua-senha-de-app
SMTP_FROM=voxionstudio@gmail.com
```

Se as credenciais SMTP nao estiverem configuradas, o backend ainda salva o PDF em `submissions/`, mas nao envia e-mail.
