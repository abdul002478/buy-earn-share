## Mudanças

### 1. Linha do cliente (perfil)

- Adicionar novo quadradinho "Linha do cliente" na grade de ícones do perfil (`src/routes/perfil.tsx`) com ícone Headphones/MessageCircle.
- Ao clicar, abre um diálogo com 2 opções:
  - **WhatsApp (contato)**: `https://wa.me/258858601038`
  - **Grupo WhatsApp**: `https://chat.whatsapp.com/LNoznGUnplRF9aVBlQrc3V?mode=gi_t`
  - **Telegram**: marcado como "em breve" (aguardando link), botão desabilitado.

### 2. Tipografia global (`src/styles.css`)

- Forçar `text-transform: uppercase` em todo o `body` para que todas as letras fiquem maiúsculas.
- Padronizar tamanho base e harmonizar tamanhos de texto (reduzir variação): aplicar regra geral para que títulos/parágrafos usem tamanhos próximos.
- Ajustar `DigitalNumber` (`src/components/DigitalNumber.tsx`):
  - Cor: preto carregado (`#000` / `oklch(0.1 0 0)`).
  - Peso: bold/black.
  - Tamanho ligeiramente maior (de ex. 1em → 1.15–1.25em).
  - Garantir uso consistente nos lugares onde aparece valor.

### 3. Tema âmbar — sem vermelho

- Verificar `src/styles.css` e qualquer uso de classes/cores que produzam tom avermelhado (ex. `--destructive`, gradientes que puxem para vermelho) e suavizar para tom âmbar/laranja queimado quando aplicável a elementos não-críticos.
- Garantir que `AdidasCarousel`, cor dos de produtos, ícones e botões mantenham as cores atuais (sem alterações destrutivas).não é para serem afetados com a com amarela

### 4. Ícone de visualizar senha em todas as telas

- `src/routes/login.tsx`: substituir `Field` interno pelo componente `AuthField` (que já tem botão de olho) OU adicionar lógica de `show/hide` com ícone Eye/EyeOff dentro do mesmo input de senha.
- Verificar `src/routes/forgot-password.tsx` — se houver campo de nova senha, aplicar mesmo padrão.
- Cadastro já usa `AuthField` (✓ já tem).

### 5. Números pretos em toda a plataforma

- Atualizar `DigitalNumber.tsx` para usar cor preta carregada por padrão.
- Garantir que valores de saldo, renda, preços usem `<DigitalNumber>` (revisar `index.tsx`, `perfil.tsx`, `carteira.tsx`, `produtos.tsx`, `admin.tsx`).

## Arquivos afetados

- `src/routes/perfil.tsx` — novo quadradinho "Linha do cliente" + diálogo
- `src/components/DigitalNumber.tsx` — cor preta, maior, bold
- `src/styles.css` — `text-transform: uppercase` global, harmonizar tamanhos
- `src/routes/login.tsx` — ícone olho na senha
- `src/routes/forgot-password.tsx` — ícone olho (se aplicável)
- `src/routes/produtos.tsx`, `carteira.tsx`, `index.tsx`, `admin.tsx` — usar `DigitalNumber` onde faltar

## Observações

- O link de Telegram ainda não foi fornecido — botão fica desabilitado com label "Em breve".
- Uppercase global pode afetar legibilidade em campos de input; manter `inputs` em case normal via regra `input, textarea { text-transform: none }`.