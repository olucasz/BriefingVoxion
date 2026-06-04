# Hospedagem na Netlify

Este projeto ja esta preparado para Netlify.

## Configuracao do site

- Publish directory: `site`
- Functions directory: `netlify/functions`
- Build command: deixe vazio

Esses valores tambem estao no arquivo `netlify.toml`.

## URL correta do envio

Na Netlify, o questionario envia as respostas para:

`/.netlify/functions/briefings`

Nao use `http://127.0.0.1`, `localhost` ou `/api/briefings` na hospedagem.

## Variaveis de ambiente

No painel da Netlify, va em:

Site configuration > Environment variables

Cadastre as mesmas chaves do arquivo `.env`:

- `EMAIL_TO`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`
- `SMTP_DOMAIN`

Importante: a Netlify normalmente nao usa o arquivo `.env` enviado no ZIP em producao. O mais seguro e cadastrar essas variaveis no painel da Netlify.
