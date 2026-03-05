# 🗂️ Sistema de Fila de Prioridade para Laudos V2.3

Um sistema web completo (Full-stack) desenvolvido para cadastrar e gerenciar dados de funcionários, servindo como base estrutural para uma futura fila de prioridade de aposentadoria.

Este projeto foi construído do zero, implementando as quatro operações fundamentais de banco de dados (CRUD - Create, Read, Update, Delete) com uma arquitetura de cliente-servidor rodando localmente.

## ✨ Funcionalidades

- **Cadastro de Servidores:** Inserção de dados detalhados (Nome, Sexo, Data de Nascimento, Data de Admissão).
- **Cálculo de Tempo Averbado:** Interface amigável para inserir Anos, Meses e Dias, com conversão automática matemática para o total de dias corridos no Back-end.
- **Listagem Dinâmica:** Visualização em tempo real dos dados armazenados no banco.
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