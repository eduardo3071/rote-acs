# Traduções completas após o login

## Objetivo
Fazer o botão fixo de idioma atualizar todo o aplicativo após a entrada, cobrindo português, inglês e espanhol sem alterar fluxos, dados ou regras de risco.

## Telas e elementos
- Traduzir o painel: saudação, resumo, mapa, prioridades, indicadores, unidade de saúde e ações.
- Traduzir a lista de famílias: título, busca, filtros, estados vazios e cartões.
- Traduzir detalhes da família: classificação, motivos, dados, alertas e ação de registrar visita.
- Traduzir as seis etapas da visita, validações, modo de voz, resumo e confirmação.
- Traduzir o protocolo WASH, encaminhamento e mensagens finais.
- Completar Perfil e a página de fontes/transparência, incluindo erros e janelas.
- Traduzir textos compartilhados do mapa, datas relativas, fontes de água e rótulos de risco.

## Implementação
- Centralizar todo texto visível nos dicionários existentes de `i18n`, mantendo PT-BR como base e equivalência completa em inglês e espanhol.
- Substituir textos fixos por `useT()` nos arquivos das telas e componentes, sem modificar regras de negócio.
- Manter nomes próprios, códigos IBGE/CNES, nomes de municípios e nomes de famílias sem tradução.
- Ajustar formatação de data e pluralização por idioma onde necessário.

## Verificação
- Validar a compilação.
- Entrar com a conta de demonstração, alternar PT/EN/ES e navegar pelo painel, famílias, detalhe, visita, protocolo e perfil.
- Conferir em tela de celular que não restou texto português ao selecionar EN e que os textos não se sobrepõem.
