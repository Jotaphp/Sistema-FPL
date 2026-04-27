# 🗂️ Sistema de Fila de Prioridade para Laudos V3.0

Um sistema web completo (Full-stack) desenvolvido para cadastrar e gerenciar dados de funcionários, servindo como base estrutural para uma futura fila de prioridade de aposentadoria.

Este projeto foi construído do zero e completamente moldavel.

## ✨ Funcionalidades

- **Cadastro de Servidores:** Inserção de dados detalhados.
- **Cálculo Dinâmico:** Utiliza das informações para fazer cálculos para aposentadoria especial.
- **Listagem Dinâmica:** Visualização em tempo real dos dados armazenados no banco.
- **3 Listas:** Separação das informações mais críticas e utilizável.
- **Edição com Engenharia Reversa:** Capacidade de editar registros existentes, onde o sistema recalcula os dias totais de volta para Anos, Meses e Dias na interface do usuário.
- **Exclusão Segura:** Remoção de registros com confirmação de segurança.

## 🛠️ Tecnologias Utilizadas

**Front-end:**
- HTML5 (Estrutura e semântica)
- CSS3 (Estilização e Flexbox)
- JavaScript Vanilla (Lógica de requisições assíncronas com `fetch API` e manipulação do DOM)

**Back-end:**
- Node.js (Ambiente de execução)
- Express.js (Criação do servidor e rotas da API RESTful)
- CORS (Liberação de comunicação entre portas locais)

**Banco de Dados:**
- SQLite3 (Banco de dados relacional leve e embutido)

## Atualizações
**Versão 3.0**
- Extenção dos dados no cadastro
- Implementação da "Tabela Mãe" com todas as informações
- Polimento e otimização dos códigos

**Versão 2.3**
- Implementação de nova tela, fila judicial
- Organização e Limpeza dos códigos

**Versão 2.2**
- Implementação da função de exportação para documento (.csv)

**Versão 2.1**
- Implementação de painel de configurações
- Nova identidae visual do sistema
- Dark Mode

**Versão 2.0**
- Funções de fila e cadastro em conjunto com Banco de Dados
- Banco de dados local
- Correções de problemas de recarga de telas
- Criação de tela principal com botões de navegação

**Versão 1.0**
- Sistema de Fila de Prioridades para Laudos foi criado
- Criação de tela de cadastro de servidor
- Criação de tela de fila (tabela organizada)
- Criação de menu lateral para navegação