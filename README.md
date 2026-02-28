# 🗂️ Sistema de Fila de Prioridade para Laudos Técnicos (V1)

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

1. **Clone o repositório:**
   ```bash
   git clone [https://github.com/SEU_USUARIO/sistema-aposentadoria.git](https://github.com/SEU_USUARIO/sistema-aposentadoria.git)
