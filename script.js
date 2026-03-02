const formulario = document.getElementById('formulario');
const listaDados = document.getElementById('listaDados');
const tabelaDados = document.getElementById('tabelaDados'); // Nova referência para a tabela
let idEdicao = null;

// --- FUNÇÃO PARA RECOLHER/EXPANDIR O MENU ---
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    // O toggle liga e desliga a classe 'recolhida'
    sidebar.classList.toggle('recolhida');
}

// --- SISTEMA DE CONFIGURAÇÕES E MODO ESCURO ---

// Abre e fecha o painel de configurações
function toggleConfiguracoes() {
    const painel = document.getElementById('painel-config');
    painel.classList.toggle('aberto');
}

// Ativa ou desativa a classe do Modo Escuro
function alternarModoEscuro() {
    const btnSwitch = document.getElementById('toggle-dark-mode');
    
    if (btnSwitch.checked) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('temaSistema', 'escuro'); // Salva no navegador
    } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('temaSistema', 'claro'); // Salva no navegador
    }
}

// Verifica a preferência salva assim que a página carrega
document.addEventListener('DOMContentLoaded', () => {
    const temaSalvo = localStorage.getItem('temaSistema');
    const btnSwitch = document.getElementById('toggle-dark-mode');

    // Se a pessoa tinha deixado no escuro antes de fechar o sistema, volta escuro!
    if (temaSalvo === 'escuro') {
        document.body.classList.add('dark-mode');
        btnSwitch.checked = true;
    }
    
    // (A chamada do consultarDados() original continua aqui)
    consultarDados(); 
});

// --- SISTEMA DE NAVEGAÇÃO DO MENU ---
function navegar(idTelaAlvo) {
    // 1. Esconde todas as telas
    document.querySelectorAll('.tela').forEach(tela => tela.classList.add('oculta'));
    // 2. Tira a classe 'ativo' de todos os botões do menu
    document.querySelectorAll('.menu-btn').forEach(btn => btn.classList.remove('ativo'));
    
    // 3. Mostra a tela desejada e marca o botão como ativo
    document.getElementById(`tela-${idTelaAlvo}`).classList.remove('oculta');
    document.getElementById(`btn-${idTelaAlvo}`).classList.add('ativo');
}

// --- LÓGICA DO FORMULÁRIO ---
formulario.addEventListener('submit', async function(evento) {
    evento.preventDefault();

    const nome = document.getElementById('nome').value;
    const sexo = document.getElementById('sexo').value;
    const data_nascimento = document.getElementById('dataNascimento').value;
    const data_admissao = document.getElementById('dataAdmissao').value;
    
    const anos = parseInt(document.getElementById('anosAverbados').value) || 0;
    const meses = parseInt(document.getElementById('mesesAverbados').value) || 0;
    const dias = parseInt(document.getElementById('diasAverbados').value) || 0;

    const tempo_averbado_dias = (anos * 365) + (meses * 30) + dias;
    const registro = { nome, sexo, data_nascimento, data_admissao, tempo_averbado_dias };

    if (idEdicao === null) {
        await adicionarDado(registro);
    } else {
        await salvarEdicao(idEdicao, registro);
        idEdicao = null;
        document.getElementById('btnSalvar').textContent = 'Salvar Registro';
    }
    
    formulario.reset(); 
    document.getElementById('anosAverbados').value = '0';
    document.getElementById('mesesAverbados').value = '0';
    document.getElementById('diasAverbados').value = '0';
});

async function adicionarDado(registro) {
    try {
        await fetch('http://localhost:3000/adicionar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(registro)
        });
        consultarDados();
    } catch (erro) { console.error('Erro:', erro); }
}

// --- CÁLCULOS E RENDERIZAÇÃO ---
async function consultarDados() {
    try {
        const resposta = await fetch('http://localhost:3000/registros');
        let registros = await resposta.json();
        
        const dataHoje = new Date();
        const dataReforma = new Date('2019-11-12T00:00:00'); 

        // 1. Faz os cálculos para todos os registros
        registros.forEach(function(reg) {
            const dataNasc = new Date(reg.data_nascimento + 'T00:00:00');
            const dataAdm = new Date(reg.data_admissao + 'T00:00:00');

            const indice = (reg.sexo === 'F') ? 31025 : 34675;
            const idade = Math.floor((dataHoje - dataNasc) / (1000 * 60 * 60 * 24));
            const tempoIAE = Math.floor((dataHoje - dataAdm) / (1000 * 60 * 60 * 24));
            const tempoAverbado = reg.tempo_averbado_dias;

            let tempoEspecial = 0;
            if (dataAdm < dataReforma) {
                tempoEspecial = Math.floor((dataReforma - dataAdm) / (1000 * 60 * 60 * 24));
            }
            const tempoFicticio = (reg.sexo === 'F') ? (tempoEspecial * 0.2) : (tempoEspecial * 0.4);

            reg.pontuacaoFila = indice - (idade + tempoIAE + tempoAverbado + tempoFicticio);
        });

        // Limpa a Lista (Cadastro) e a Tabela (Fila)
        listaDados.innerHTML = '';
        tabelaDados.innerHTML = '';

        // =========================================================
        // 2. RENDERIZA A TELA DE CADASTRO (Últimos 5 adicionados)
        // =========================================================
        // Cria uma cópia da lista, ordena pelo ID (maior pro menor) e corta os 5 primeiros
        const ultimosCadastrados = [...registros].sort((a, b) => b.id - a.id).slice(0, 5);
        
        ultimosCadastrados.forEach(function(reg) {
            const dataAdmFormatada = reg.data_admissao.split('-').reverse().join('/');
            const li = document.createElement('li');
            
            li.innerHTML = `
                <div class="info-contato">
                    <h3>${reg.nome}</h3>
                    <small>Admissão: ${dataAdmFormatada} | Adicionado recentemente</small>
                </div>
                <div class="acoes-contato">
                    <button class="btn-editar" onclick="prepararEdicao(${reg.id}, '${reg.nome}', '${reg.sexo}', '${reg.data_nascimento}', '${reg.data_admissao}', ${reg.tempo_averbado_dias})">Editar</button>
                    <button class="btn-excluir" onclick="deletarDado(${reg.id})">Excluir</button>
                </div>
            `;
            listaDados.appendChild(li);
        });

        // =========================================================
        // 3. RENDERIZA A TELA DA FILA (Ordenação Matemática Completa)
        // =========================================================
        // Ordena a lista original pela pontuação calculada
        registros.sort((a, b) => a.pontuacaoFila - b.pontuacaoFila);

        registros.forEach(function(reg, posicaoIndex) {
            const dataNascFormatada = reg.data_nascimento.split('-').reverse().join('/');
            const dataAdmFormatada = reg.data_admissao.split('-').reverse().join('/');
            const pontuacaoArredondada = Math.round(reg.pontuacaoFila);
            const posicaoFila = posicaoIndex + 1;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="posicao-destaque">${posicaoFila}º</td>
                <td>${pontuacaoArredondada}</td>
                <td>${reg.nome}</td>
                <td>${reg.sexo}</td>
                <td>${dataNascFormatada}</td>
                <td>${dataAdmFormatada}</td>
                <td>${reg.tempo_averbado_dias}</td>
                <td>
                    <div class="acoes-contato">
                        <button class="btn-editar" onclick="prepararEdicao(${reg.id}, '${reg.nome}', '${reg.sexo}', '${reg.data_nascimento}', '${reg.data_admissao}', ${reg.tempo_averbado_dias})">Editar</button>
                        <button class="btn-excluir" onclick="deletarDado(${reg.id})">Excluir</button>
                    </div>
                </td>
            `;
            tabelaDados.appendChild(tr);
        });
        
    } catch (erro) { console.error('Erro:', erro); }
}

// --- EDIÇÃO E EXCLUSÃO ---
function prepararEdicao(id, nome, sexo, data_nascimento, data_admissao, tempo_averbado_dias) {
    // Leva o usuário para a tela de cadastro para editar
    navegar('cadastro'); 

    document.getElementById('nome').value = nome;
    document.getElementById('sexo').value = sexo;
    document.getElementById('dataNascimento').value = data_nascimento;
    document.getElementById('dataAdmissao').value = data_admissao;
    
    const anos = Math.floor(tempo_averbado_dias / 365); 
    const restoAnos = tempo_averbado_dias % 365;        
    const meses = Math.floor(restoAnos / 30);           
    const dias = restoAnos % 30;                        

    document.getElementById('anosAverbados').value = anos;
    document.getElementById('mesesAverbados').value = meses;
    document.getElementById('diasAverbados').value = dias;
    
    idEdicao = id;
    document.getElementById('btnSalvar').textContent = 'Atualizar Registro';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function salvarEdicao(id, registro) {
    try {
        await fetch(`http://localhost:3000/editar/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(registro)
        });
        consultarDados();
        navegar('fila'); // Após editar, volta para a fila para ver o resultado
    } catch (erro) { console.error('Erro ao atualizar:', erro); }
}

async function deletarDado(id) {
    if (confirm('Excluir este registro?')) {
        try {
            await fetch(`http://localhost:3000/deletar/${id}`, { method: 'DELETE' });
            consultarDados(); 
        } catch (erro) { console.error('Erro:', erro); }
    }
}

// --- SISTEMA DE PESQUISA NA FILA ---
document.getElementById('pesquisaNome').addEventListener('input', function() {
    // Pega o que foi digitado e transforma tudo em minúsculo para facilitar a comparação
    const termoBusca = this.value.toLowerCase();
    
    // Pega todas as linhas (tr) que estão dentro do corpo da tabela (tbody)
    const linhasTabela = document.querySelectorAll('#tabelaDados tr');

    // Passa por cada linha da tabela
    linhasTabela.forEach(function(linha) {
        // O nome está na 3ª coluna (índice 2, pois começa no 0: Pos, Índice, Nome)
        const nomeNaColuna = linha.cells[2].textContent.toLowerCase();

        // Se o nome na coluna incluir o que foi digitado, mostra a linha. Se não, esconde.
        if (nomeNaColuna.includes(termoBusca)) {
            linha.style.display = ''; // Volta a exibir (padrão)
        } else {
            linha.style.display = 'none'; // Esconde a linha
        }
    });
});