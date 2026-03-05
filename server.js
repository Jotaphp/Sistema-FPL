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
        
        // Nova tabela com os campos da aposentadoria já incluindo a fila judicial
        db.run(`CREATE TABLE IF NOT EXISTS aposentadoria (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            sexo TEXT NOT NULL,
            data_nascimento TEXT NOT NULL,
            data_admissao TEXT NOT NULL,
            tempo_averbado_dias INTEGER NOT NULL,
            tipo_fila TEXT DEFAULT 'normal',
            tempo_entrega TEXT DEFAULT 'Não Determinado'
        )`);

        // Tenta atualizar o banco de dados antigo adicionando as colunas (ignora se já existirem)
        db.run("ALTER TABLE aposentadoria ADD COLUMN tipo_fila TEXT DEFAULT 'normal'", (err) => {});
        db.run("ALTER TABLE aposentadoria ADD COLUMN tempo_entrega TEXT DEFAULT 'Não Determinado'", (err) => {});
    }
});

// CREATE - Adicionar Servidor
app.post('/adicionar', (req, res) => {
    const { nome, sexo, data_nascimento, data_admissao, tempo_averbado_dias } = req.body;
    const query = `INSERT INTO aposentadoria (nome, sexo, data_nascimento, data_admissao, tempo_averbado_dias) VALUES (?, ?, ?, ?, ?)`;
    
    db.run(query, [nome, sexo, data_nascimento, data_admissao, tempo_averbado_dias], function(erro) {
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

// UPDATE - Editar Servidor
app.put('/editar/:id', (req, res) => {
    const id = req.params.id;
    const { nome, sexo, data_nascimento, data_admissao, tempo_averbado_dias } = req.body;
    const query = `UPDATE aposentadoria SET nome = ?, sexo = ?, data_nascimento = ?, data_admissao = ?, tempo_averbado_dias = ? WHERE id = ?`;
    
    db.run(query, [nome, sexo, data_nascimento, data_admissao, tempo_averbado_dias, id], function(erro) {
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

// ROTA ESPECIAL: Mover para Fila Judicial
app.put('/mover-judicial/:id', (req, res) => {
    const { id } = req.params;
    const { tempo_entrega } = req.body;
    
    const query = `UPDATE aposentadoria SET tipo_fila = 'judicial', tempo_entrega = ? WHERE id = ?`;
    db.run(query, [tempo_entrega, id], function(err) {
        if (err) return res.status(500).json({ erro: err.message });
        res.json({ mensagem: 'Servidor movido para Fila Judicial!' });
    });
});

// Inicia o servidor
app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});