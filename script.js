const formulario = document.getElementById('formulario');
const listaDados = document.getElementById('listaDados');
const tabelaDados = document.getElementById('tabelaDados'); // Tabela Fila Completa
let idEdicao = null;

// --- FUNÇÃO PARA RECOLHER/EXPANDIR O MENU ---
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('recolhida');
}

// --- SISTEMA DE CONFIGURAÇÕES E MODO ESCURO ---
function toggleConfiguracoes() {
    const painel = document.getElementById('painel-config');
    painel.classList.toggle('aberto');
}

function alternarModoEscuro() {
    const btnSwitch = document.getElementById('toggle-dark-mode');
    if (btnSwitch.checked) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('temaSistema', 'escuro'); 
    } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('temaSistema', 'claro'); 
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const temaSalvo = localStorage.getItem('temaSistema');
    const btnSwitch = document.getElementById('toggle-dark-mode');

    if (temaSalvo === 'escuro') {
        document.body.classList.add('dark-mode');
        if(btnSwitch) btnSwitch.checked = true;
    }
    consultarDados(); 
});

// --- SISTEMA DE NAVEGAÇÃO DO MENU ---
function navegar(idTelaAlvo) {
    document.querySelectorAll('.tela').forEach(tela => tela.classList.add('oculta'));
    document.querySelectorAll('.menu-btn').forEach(btn => btn.classList.remove('ativo'));
    
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

// --- CÁLCULOS PRINCIPAIS ---
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

        // 2. Separa e Renderiza as Telas
        renderizarCadastro(registros);
        renderizarFilaCompleta(registros);
        renderizarFilaJudicial(registros);

    } catch (erro) { console.error('Erro:', erro); }
}

// =========================================================
// FUNÇÕES DE RENDERIZAÇÃO DAS TELAS
// =========================================================

function renderizarCadastro(registros) {
    listaDados.innerHTML = '';
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
}

function renderizarFilaCompleta(registros) {
    tabelaDados.innerHTML = '';
    
    // Filtra apenas a fila NORMAL e ordena pela pontuação
    const filaNormal = registros.filter(d => d.tipo_fila !== 'judicial');
    filaNormal.sort((a, b) => a.pontuacaoFila - b.pontuacaoFila);

    filaNormal.forEach(function(reg, index) {
        const dataNascFormatada = reg.data_nascimento.split('-').reverse().join('/');
        const dataAdmFormatada = reg.data_admissao.split('-').reverse().join('/');
        const pontuacaoArredondada = Math.round(reg.pontuacaoFila);

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="posicao-destaque">${index + 1}º</td>
            <td>${pontuacaoArredondada}</td>
            <td>${reg.nome}</td>
            <td>${reg.sexo}</td>
            <td>${dataNascFormatada}</td>
            <td>${dataAdmFormatada}</td>
            <td>${reg.tempo_averbado_dias}</td>
            <td>
                <div class="acoes-contato">
                    <button onclick="moverParaJudicial(${reg.id}, '${reg.nome}')" class="btn-judicial" title="Mover para Fila Judicial">⚖️ Judicial</button>
                    <button class="btn-editar" onclick="prepararEdicao(${reg.id}, '${reg.nome}', '${reg.sexo}', '${reg.data_nascimento}', '${reg.data_admissao}', ${reg.tempo_averbado_dias})">Editar</button>
                    <button class="btn-excluir" onclick="deletarDado(${reg.id})">Excluir</button>
                </div>
            </td>
        `;
        tabelaDados.appendChild(tr);
    });
}

function renderizarFilaJudicial(registros) {
    const tbodyJudicial = document.getElementById('lista-fila-judicial');
    if (!tbodyJudicial) return;
    tbodyJudicial.innerHTML = '';

    // Filtra APENAS quem é judicial
    let filaJudicial = registros.filter(d => d.tipo_fila === 'judicial');

    // Ordena pela data mais próxima
    filaJudicial.sort((a, b) => {
        function converterParaData(dataBR) {
            if (!dataBR || dataBR === "Não Determinado") return new Date('2099-12-31'); 
            const partes = dataBR.split('/');
            if (partes.length !== 3) return new Date('2099-12-31');
            return new Date(`${partes[2]}-${partes[1]}-${partes[0]}`); 
        }
        return converterParaData(a.tempo_entrega) - converterParaData(b.tempo_entrega);
    });

    filaJudicial.forEach((reg, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="posicao-destaque">${index + 1}º</td>
            <td>${reg.nome}</td>
            <td style="font-weight: bold; color: ${reg.tempo_entrega === 'Não Determinado' ? '#666' : '#d9534f'};">
                ${reg.tempo_entrega}
            </td>
        `;
        tbodyJudicial.appendChild(tr);
    });
}

// --- EDIÇÃO E EXCLUSÃO ---
function prepararEdicao(id, nome, sexo, data_nascimento, data_admissao, tempo_averbado_dias) {
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

// --- SISTEMA DE PESQUISA NAS FILAS ---

// Pesquisa Fila Completa
document.getElementById('pesquisaNome')?.addEventListener('input', function() {
    const termoBusca = this.value.toLowerCase();
    const linhasTabela = document.querySelectorAll('#tabelaDados tr');

    linhasTabela.forEach(function(linha) {
        const nomeNaColuna = linha.cells[2].textContent.toLowerCase();
        if (nomeNaColuna.includes(termoBusca)) {
            linha.style.display = ''; 
        } else {
            linha.style.display = 'none'; 
        }
    });
});

// --- FUNÇÃO MOVER PARA JUDICIAL ---
async function moverParaJudicial(id, nome) {
    let dataInput = prompt(`Mover ${nome} para a Fila Judicial.\n\nDigite a data limite de entrega (ex: 15/10/2026) ou deixe em branco para "Não Determinado":`);
    
    if (dataInput === null) return; 

    if (dataInput.trim() === "") {
        dataInput = "Não Determinado";
    }

    try {
        await fetch(`http://localhost:3000/mover-judicial/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tempo_entrega: dataInput })
        });
        consultarDados(); 
    } catch (erro) { console.error('Erro ao mover:', erro); }
}

// --- FUNÇÃO PARA EXPORTAR A TABELA PARA EXCEL (CSV) ---
function exportarParaExcel() {
    const tabela = document.querySelector('.tabela-excel');
    if (!tabela) {
        alert("Nenhuma tabela encontrada para exportar.");
        return;
    }

    let csv = [];
    let csvContent = "\uFEFF"; 
    
    const linhas = tabela.querySelectorAll('tr');
    
    for (let i = 0; i < linhas.length; i++) {
        let linhaArray = [];
        const colunas = linhas[i].querySelectorAll('th, td');
        
        for (let j = 0; j < colunas.length - 1; j++) {
            let dado = colunas[j].innerText.replace(/(\r\n|\n|\r)/gm, "").trim();
            if (dado.includes(';') || dado.includes('"')) {
                dado = '"' + dado.replace(/"/g, '""') + '"';
            }
            linhaArray.push(dado);
        }
        csv.push(linhaArray.join(';'));
    }

    csvContent += csv.join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    const dataHoje = new Date().toISOString().split('T')[0];
    link.setAttribute("download", `Fila_Prioridade_${dataHoje}.csv`);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}