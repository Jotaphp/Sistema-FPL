const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Conecta ao banco de dados
const db = new sqlite3.Database('./banco-de-dados.db', (erro) => {
    if (erro) {
        console.error('Erro ao conectar ao banco:', erro.message);
    } else {
        console.log('Conectado ao banco de dados SQLite.');
        
        // V3.0: Tabela atualizada com os novos campos
        db.run(`CREATE TABLE IF NOT EXISTS aposentadoria (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            sexo TEXT NOT NULL,
            data_nascimento TEXT NOT NULL,
            data_admissao TEXT NOT NULL,
            tempo_averbado_dias INTEGER NOT NULL,
            tipo_fila TEXT DEFAULT 'nenhuma', 
            tempo_entrega TEXT DEFAULT 'Não Determinado',
            numero_pasta TEXT,
            numero_documento TEXT,
            situacao TEXT,
            status TEXT
        )`);

        // Comandos ALTER TABLE para atualizar o banco existente sem perder dados
        db.run("ALTER TABLE aposentadoria ADD COLUMN numero_pasta TEXT", (err) => {});
        db.run("ALTER TABLE aposentadoria ADD COLUMN numero_documento TEXT", (err) => {});
        db.run("ALTER TABLE aposentadoria ADD COLUMN situacao TEXT", (err) => {});
        db.run("ALTER TABLE aposentadoria ADD COLUMN status TEXT", (err) => {});
        db.run("ALTER TABLE aposentadoria ADD COLUMN data_finalizacao TEXT", (err) => {});
        
        // Se a coluna tipo_fila já existe do V2.0, novos registros não podem mais ir para 'normal' automaticamente. 
        // O JS vai gerenciar isso, mas o ideal é que fique como 'nenhuma'.
    }
});

// CREATE - Adicionar Servidor (Atualizado V3.0)
app.post('/adicionar', (req, res) => {
    const { nome, sexo, data_nascimento, data_admissao, tempo_averbado_dias, numero_pasta, numero_documento, situacao, status } = req.body;
    const query = `INSERT INTO aposentadoria (nome, sexo, data_nascimento, data_admissao, tempo_averbado_dias, numero_pasta, numero_documento, situacao, status, tipo_fila) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'nenhuma')`;
    
    db.run(query, [nome, sexo, data_nascimento, data_admissao, tempo_averbado_dias, numero_pasta, numero_documento, situacao, status], function(erro) {
        if (erro) return res.status(400).json({ erro: erro.message });
        res.json({ mensagem: 'Registro salvo com sucesso!', id: this.lastID });
    });
});

// READ - Listar todos os Servidores
app.get('/registros', (req, res) => {
    const query = `SELECT * FROM aposentadoria`;
    db.all(query, [], (erro, linhas) => {
        if (erro) return res.status(500).json({ erro: erro.message });
        res.json(linhas);
    });
});

// UPDATE - Editar Servidor (Atualizado V3.0)
app.put('/editar/:id', (req, res) => {
    const id = req.params.id;
    const { nome, sexo, data_nascimento, data_admissao, tempo_averbado_dias, numero_pasta, numero_documento, situacao, status } = req.body;
    const query = `UPDATE aposentadoria SET nome = ?, sexo = ?, data_nascimento = ?, data_admissao = ?, tempo_averbado_dias = ?, numero_pasta = ?, numero_documento = ?, situacao = ?, status = ? WHERE id = ?`;
    
    db.run(query, [nome, sexo, data_nascimento, data_admissao, tempo_averbado_dias, numero_pasta, numero_documento, situacao, status, id], function(erro) {
        if (erro) return res.status(400).json({ erro: erro.message });
        res.json({ mensagem: 'Registro atualizado com sucesso!' });
    });
});

// DELETE - Excluir Servidor
app.delete('/deletar/:id', (req, res) => {
    const id = req.params.id;
    const query = `DELETE FROM aposentadoria WHERE id = ?`;
    
    db.run(query, [id], function(erro) {
        if (erro) return res.status(400).json({ erro: erro.message });
        res.json({ mensagem: 'Registro deletado com sucesso!' });
    });
});

// --- NOVAS ROTAS DE FLUXO (WORKFLOW V3.0) ---

// Mover para Fila de Prioridade
app.put('/mover-prioridade/:id', (req, res) => {
    const { id } = req.params;
    const query = `UPDATE aposentadoria SET tipo_fila = 'prioridade' WHERE id = ?`;
    db.run(query, [id], function(err) {
        if (err) return res.status(500).json({ erro: err.message });
        res.json({ mensagem: 'Servidor movido para Fila de Prioridade!' });
    });
});

// Mover para Fila Judicial
app.put('/mover-judicial/:id', (req, res) => {
    const { id } = req.params;
    const { tempo_entrega } = req.body;
    const query = `UPDATE aposentadoria SET tipo_fila = 'judicial', tempo_entrega = ? WHERE id = ?`;
    db.run(query, [tempo_entrega, id], function(err) {
        if (err) return res.status(500).json({ erro: err.message });
        res.json({ mensagem: 'Servidor movido para Fila Judicial!' });
    });
});

// Finalizar Servidor (Tira de qualquer fila, muda status para Finalizado e salva a data)
app.put('/finalizar/:id', (req, res) => {
    const { id } = req.params;
    const { data_finalizacao } = req.body;
    
    const query = `UPDATE aposentadoria SET tipo_fila = 'nenhuma', status = 'Finalizado', data_finalizacao = ? WHERE id = ?`;
    db.run(query, [data_finalizacao, id], function(err) {
        if (err) return res.status(500).json({ erro: err.message });
        res.json({ mensagem: 'Servidor Finalizado!' });
    });
});

// Inicia o servidor
app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000 (V3.0)');
});