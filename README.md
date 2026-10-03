# RoteACS - HackaNation

FASE 1 — Identidade Visual e Design System

O que fazer: antes de qualquer tela, definir as cores, fontes e componentes base. O Lovable vai criar um arquivo de tema que todas as telas importam.

Prompt para colar:

Crie o design system de um aplicativo mobile chamado RoteACS — Roteamento de Agentes Comunitários de Saúde. O app roda em campo com luz solar intensa e telas baratas, então o contraste precisa ser alto.

Paleta de cores: fundo principal #0A0F1E (azul-marinho quase preto), fundo de cards #111827, elementos elevados #1C2537, bordas #1E2D45, cor primária azul ciano #16A8FF, primária escura #0877D1, risco alto vermelho #FF5263, risco médio amarelo #FFC83D, risco baixo verde #19D98B, texto principal #F0F4FF, texto secundário #7B92B2, texto mudo #3D5170.

Fonte Inter do Google Fonts. Tamanhos: título grande 28px bold, título médio 22px bold, subtítulo 18px semibold, corpo 15px regular, pequeno 13px regular, rótulo 11px semibold maiúsculo com espaçamento de letras.

Espaçamentos 4, 8, 16, 24, 32. Bordas arredondadas 8, 12, 16 e pill 100.

Crie um componente RiskBadge que recebe um número de 0 a 100 e exibe um círculo de 52×52px com borda de 2px colorida e fundo 13% opaco. De 70 a 100 usa vermelho #FF5263, de 40 a 69 usa amarelo #FFC83D, de 0 a 39 usa verde #19D98B. O número aparece em bold 20px na cor da borda.

O que checar: fundo escuro, RiskBadge mostra 87 vermelho, 55 amarelo, 23 verde. Se as três cores aparecerem certas, avança.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://rote-acs.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/17ed2fa4-7152-4046-a245-91cde43c2498).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
