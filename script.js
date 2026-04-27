const formulario = document.getElementById('formulario');
let idEdicao = null;
let dadosGlobais = []; // Guarda todos os dados em memória para facilitar a edição
let ordenacaoAtual = { coluna: 'numero_pasta', direcao: 'asc' };

// --- NAVEGAÇÃO E CONFIGURAÇÕES ---
function toggleSidebar() { document.getElementById('sidebar').classList.toggle('recolhida'); }
function toggleConfiguracoes() { document.getElementById('painel-config').classList.toggle('aberto'); }

function alternarModoEscuro() {
    const btn = document.getElementById('toggle-dark-mode');
    const logoPrincipal = document.getElementById('logo-principal');

    if (btn.checked) {
        // LIGA MODO ESCURO
        document.body.classList.add('dark-mode');
        localStorage.setItem('temaSistema', 'escuro'); 
        
        // Troca APENAS a logo principal para a versão escura
        if(logoPrincipal) logoPrincipal.src = "img/LogoEscuroFPL.png";
    } else {
        // LIGA MODO CLARO
        document.body.classList.remove('dark-mode');
        localStorage.setItem('temaSistema', 'claro'); 
        
        // Troca APENAS a logo principal para a versão clara
        if(logoPrincipal) logoPrincipal.src = "img/LogoClaroFPL.png";
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const logoPrincipal = document.getElementById('logo-principal');

    if (localStorage.getItem('temaSistema') === 'escuro') {
        document.body.classList.add('dark-mode');
        const btnSwitch = document.getElementById('toggle-dark-mode');
        if(btnSwitch) btnSwitch.checked = true;
        
        // Garante que a logo principal carregue escura
        if(logoPrincipal) logoPrincipal.src = "img/LogoEscuroFPL.png";
    } else {
        // Garante a logo principal clara por padrão
        if(logoPrincipal) logoPrincipal.src = "img/LogoClaroFPL.png";
    }
    
    consultarDados(); 
});

function navegar(idTelaAlvo) {
    document.querySelectorAll('.tela').forEach(tela => tela.classList.add('oculta'));
    document.querySelectorAll('.menu-btn').forEach(btn => btn.classList.remove('ativo'));
    document.getElementById(`tela-${idTelaAlvo}`).classList.remove('oculta');
    const btnMenu = document.getElementById(`btn-${idTelaAlvo}`);
    if(btnMenu) btnMenu.classList.add('ativo');
}

// --- LÓGICA DO FORMULÁRIO (V3.0) ---
formulario.addEventListener('submit', async function(evento) {
    evento.preventDefault();

    const registro = {
        numero_pasta: document.getElementById('numeroPasta').value,
        numero_documento: document.getElementById('numeroDocumento').value,
        situacao: document.getElementById('situacao').value,
        status: document.getElementById('status').value,
        nome: document.getElementById('nome').value,
        sexo: document.getElementById('sexo').value,
        data_nascimento: document.getElementById('dataNascimento').value,
        data_admissao: document.getElementById('dataAdmissao').value,
        tempo_averbado_dias: (parseInt(document.getElementById('anosAverbados').value) || 0) * 365 + 
                             (parseInt(document.getElementById('mesesAverbados').value) || 0) * 30 + 
                             (parseInt(document.getElementById('diasAverbados').value) || 0),
        tempo_entrega: document.getElementById('editTempoEntrega').value,
        data_finalizacao: document.getElementById('editDataFinalizacao').value
    };

    if (idEdicao === null) {
        await adicionarDado(registro);
    } else {
        await salvarEdicao(idEdicao, registro);
        idEdicao = null;
        document.getElementById('btnSalvar').textContent = 'Salvar Registro';
    } 
    formulario.reset();
    document.getElementById('editDataFinalizacao').disabled = true;
    document.getElementById('editTempoEntrega').disabled = true;
});

async function adicionarDado(registro) {
    try {
        await fetch('http://localhost:3000/adicionar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(registro)
        });
        consultarDados();
        navegar('servidores'); // Vai para a tela de servidores ao salvar
    } catch (erro) { console.error('Erro:', erro); }
}

// --- CONSULTA E CÁLCULO GERAL ---
async function consultarDados() {
    try {
        const resposta = await fetch('http://localhost:3000/registros');
        dadosGlobais = await resposta.json();
        
        const dataHoje = new Date();
        const dataReforma = new Date('2019-11-12T00:00:00'); 

        dadosGlobais.forEach(reg => {
            const dataNasc = new Date(reg.data_nascimento + 'T00:00:00');
            const dataAdm = new Date(reg.data_admissao + 'T00:00:00');
            const indice = (reg.sexo === 'F') ? 31025 : 34675;
            const idade = Math.floor((dataHoje - dataNasc) / (1000 * 60 * 60 * 24));
            const tempoIAE = Math.floor((dataHoje - dataAdm) / (1000 * 60 * 60 * 24));
            
            let tempoEspecial = 0;
            if (dataAdm < dataReforma) {
                tempoEspecial = Math.floor((dataReforma - dataAdm) / (1000 * 60 * 60 * 24));
            }
            const tempoFicticio = (reg.sexo === 'F') ? (tempoEspecial * 0.2) : (tempoEspecial * 0.4);

            reg.pontuacaoFila = indice - (idade + tempoIAE + reg.tempo_averbado_dias + tempoFicticio);
        });

        renderizarServidores();
        renderizarFilaPrioridade();
        renderizarFilaJudicial();

    } catch (erro) { console.error('Erro:', erro); }
}

// =========================================================
// RENDERIZAÇÃO DAS TELAS V3.0
// =========================================================
// --- FUNÇÃO PARA GERAR O TEXTO CLICÁVEL (TOOLTIP) ---
function gerarTooltipNome(reg) {
    // Agora ele retorna apenas o nome, mas avisa o JS para acionar o balão quando o mouse passar
    return `<span class="nome-tooltip" onmousemove="mostrarTooltipMouse(event, ${reg.id})" onmouseleave="esconderTooltipMouse()">${reg.nome}</span>`;
}

// --- FUNÇÕES DE CONTROLE DO BALÃO FLUTUANTE ---
function mostrarTooltipMouse(evento, id) {
    const tooltip = document.getElementById('tooltip-global');
    if (!tooltip) return;

    // Busca as informações completas do servidor usando o ID
    const reg = dadosGlobais.find(r => r.id === id);
    if(!reg) return;

    // Calcula a idade e formata as datas
    const dataNasc = new Date(reg.data_nascimento + 'T00:00:00');
    const dataHoje = new Date();
    let idadeAnos = dataHoje.getFullYear() - dataNasc.getFullYear();
    if (dataHoje.getMonth() < dataNasc.getMonth() || (dataHoje.getMonth() === dataNasc.getMonth() && dataHoje.getDate() < dataNasc.getDate())) { idadeAnos--; }
    
    const dataNascBR = reg.data_nascimento.split('-').reverse().join('/');
    const dataAdmBR = reg.data_admissao.split('-').reverse().join('/');

    // Preenche o balão com os dados
    tooltip.innerHTML = `
        <b>Nome:</b> ${reg.nome}<br>
        <b>Idade:</b> ${idadeAnos} anos<br>
        <b>Situação:</b> ${reg.situacao || '-'}<br>
        <b>Status:</b> ${reg.status || 'Não Feito'}<br>
        <b>Nascimento:</b> ${dataNascBR}<br>
        <b>Admissão:</b> ${dataAdmBR}<br>
        <b>Nº Documento:</b> ${reg.numero_documento || '-'}<br>
        <b>Nº Pasta:</b> ${reg.numero_pasta || '-'}
    `;

    // Deixa o balão visível
    tooltip.style.visibility = 'visible';
    tooltip.style.opacity = '1';

    // Calcula a posição do mouse (com 15px de distância para a setinha não ficar em cima do balão)
    let x = evento.clientX + 15;
    let y = evento.clientY + 15;

    // Inteligência para não deixar o balão vazar da tela pela direita ou por baixo
    const rect = tooltip.getBoundingClientRect();
    if (x + rect.width > window.innerWidth) x = evento.clientX - rect.width - 15;
    if (y + rect.height > window.innerHeight) y = evento.clientY - rect.height - 15;

    tooltip.style.left = x + 'px';
    tooltip.style.top = y + 'px';
}

function esconderTooltipMouse() {
    const tooltip = document.getElementById('tooltip-global');
    if (tooltip) {
        tooltip.style.visibility = 'hidden';
        tooltip.style.opacity = '0';
    }
}
function ordenarServidores(coluna) {
    // Se a pessoa clicou na mesma coluna que já estava ordenada, inverte a direção
    if (ordenacaoAtual.coluna === coluna) {
        ordenacaoAtual.direcao = ordenacaoAtual.direcao === 'asc' ? 'desc' : 'asc';
    } else {
        // Se clicou em uma nova coluna, começa ordenando do menor pro maior (A-Z)
        ordenacaoAtual.coluna = coluna;
        ordenacaoAtual.direcao = 'asc';
    }
    renderizarServidores(); // Refaz a tabela com a nova ordem
}

function obterClasseStatus(statusStr) {
    if (statusStr === 'Não Feito') return 'status-nao-feito';
    if (statusStr === 'Para Atualizar') return 'status-para-atualizar';
    if (statusStr === 'Finalizado') return 'status-finalizado';
    return '';
}

function renderizarServidores() {
    const tbody = document.getElementById('lista-servidores');
    if (!tbody) return;
    tbody.innerHTML = '';

    // Copia os dados para podermos ordenar sem quebrar a memória original
    let servidores = [...dadosGlobais];

    // --- NOVA ORDENAÇÃO INTELIGENTE ---
    servidores.sort((a, b) => {
        let valorA = a[ordenacaoAtual.coluna] || "";
        let valorB = b[ordenacaoAtual.coluna] || "";
        
        // O "numeric: true" faz a mágica de entender que a pasta "10" vem depois da "2"
        let comparacao = valorA.toString().localeCompare(valorB.toString(), undefined, { numeric: true, sensitivity: 'base' });
        
        return ordenacaoAtual.direcao === 'asc' ? comparacao : -comparacao;
    });
    // -----------------------------------

    servidores.forEach(reg => {
        const tr = document.createElement('tr');
        const badgeClass = obterClasseStatus(reg.status);
        
        let htmlBtnPrioridade = '';
        if (reg.tipo_fila === 'prioridade') {
            htmlBtnPrioridade = `<button disabled style="background-color: #95a5a6; cursor: not-allowed;" class="btn-prioridade">Na Prioridade</button>`;
        } else if (reg.tipo_fila === 'judicial') {
            htmlBtnPrioridade = `<button disabled style="background-color: #95a5a6; cursor: not-allowed;" class="btn-prioridade">Na Judicial</button>`;
        } else {
            htmlBtnPrioridade = `<button onclick="moverParaPrioridade(${reg.id})" class="btn-prioridade">Prioridade</button>`;
        }

      tr.innerHTML = `
            <td><b>${reg.numero_pasta || '-'}</b></td>
            <td>${reg.numero_documento || '-'}</td>
            <td>${gerarTooltipNome(reg)}</td>
            <td>${reg.situacao || '-'}</td>
            <td><span class="badge-status ${badgeClass}">${reg.status || 'Não Feito'}</span></td>
            <td style="color: #666; font-size: 14px;">${reg.data_finalizacao || '-'}</td>
            <td>
                <div class="acoes-contato">
                    ${htmlBtnPrioridade}
                    <button class="btn-editar" onclick="prepararEdicao(${reg.id})">Editar</button>
                    <button class="btn-excluir" onclick="deletarDado(${reg.id})">Excluir</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderizarFilaPrioridade() {
    const tbody = document.getElementById('tabelaDadosPrioridade');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    // Filtra apenas a fila de Prioridade e ordena pela pontuação matemática
    const filaPrioridade = dadosGlobais.filter(d => d.tipo_fila === 'prioridade');
    filaPrioridade.sort((a, b) => a.pontuacaoFila - b.pontuacaoFila);

    filaPrioridade.forEach((reg, index) => {
        const dataNascFormatada = reg.data_nascimento.split('-').reverse().join('/');
        const dataAdmFormatada = reg.data_admissao.split('-').reverse().join('/');

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="posicao-destaque">${index + 1}º</td>
            <td>${Math.round(reg.pontuacaoFila)}</td>
            <td>${gerarTooltipNome(reg)}</td>
            <td>${reg.sexo}</td>
            <td>${dataNascFormatada}</td>
            <td>${dataAdmFormatada}</td>
            <td>${reg.tempo_averbado_dias}</td>
            <td>
                <div class="acoes-contato">
                    <button onclick="finalizarServidor(${reg.id}, '${reg.nome}')" class="btn-finalizar">✔️ Finalizar</button>
                    <button onclick="moverParaJudicial(${reg.id}, '${reg.nome}')" class="btn-judicial">⚖️ Judicial</button>
                    <button class="btn-editar" onclick="prepararEdicao(${reg.id})">Editar</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderizarFilaJudicial() {
    const tbody = document.getElementById('lista-fila-judicial');
    if (!tbody) return;
    tbody.innerHTML = '';

    let filaJudicial = dadosGlobais.filter(d => d.tipo_fila === 'judicial');
    filaJudicial.sort((a, b) => {
        function conv(d) {
            if (!d || d === "Não Determinado") return new Date('2099-12-31'); 
            let p = d.split('/'); return p.length === 3 ? new Date(`${p[2]}-${p[1]}-${p[0]}`) : new Date('2099-12-31'); 
        }
        return conv(a.tempo_entrega) - conv(b.tempo_entrega);
    });

    filaJudicial.forEach((reg, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="posicao-destaque">${index + 1}º</td>
            <td>${gerarTooltipNome(reg)}</td>
            <td style="font-weight: bold; color: ${reg.tempo_entrega === 'Não Determinado' ? '#666' : '#d9534f'};">${reg.tempo_entrega}</td>
            <td>
                <div class="acoes-contato">
                    <button onclick="finalizarServidor(${reg.id}, '${reg.nome}')" class="btn-finalizar">✔️ Finalizar</button>
                    <button class="btn-editar" onclick="prepararEdicao(${reg.id})">Editar</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// =========================================================
// AÇÕES E WORKFLOW
// =========================================================

function prepararEdicao(id) {
    const reg = dadosGlobais.find(r => r.id === id);
    if (!reg) return;

    navegar('cadastro'); 
    
    // CAMPOS QUE SERÃO DESTRANCADOS NA EDIÇÃO
    const fieldFinalizacao = document.getElementById('editDataFinalizacao');
    const fieldEntrega = document.getElementById('editTempoEntrega');
    
    fieldFinalizacao.disabled = false;
    fieldEntrega.disabled = false;

    // Preenche com os dados atuais do banco
    fieldFinalizacao.value = reg.data_finalizacao || '';
    fieldEntrega.value = reg.tempo_entrega || '';

    // Outros campos existentes...
    document.getElementById('numeroPasta').value = reg.numero_pasta || '';
    document.getElementById('numeroDocumento').value = reg.numero_documento || '';
    document.getElementById('situacao').value = reg.situacao || 'Ativo';
    document.getElementById('status').value = reg.status || 'Não Feito';
    document.getElementById('nome').value = reg.nome;
    document.getElementById('sexo').value = reg.sexo;
    document.getElementById('dataNascimento').value = reg.data_nascimento;
    document.getElementById('dataAdmissao').value = reg.data_admissao;
    
    document.getElementById('anosAverbados').value = Math.floor(reg.tempo_averbado_dias / 365);
    document.getElementById('mesesAverbados').value = Math.floor((reg.tempo_averbado_dias % 365) / 30);
    document.getElementById('diasAverbados').value = (reg.tempo_averbado_dias % 365) % 30;
    
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
        alert('Servidor atualizado! Ele permanece na mesma fila em que estava.');
    } catch (erro) { console.error('Erro ao atualizar:', erro); }
}

async function deletarDado(id) {
    if (confirm('Atenção: Isso apagará o servidor do banco de dados definitivamente. Continuar?')) {
        try {
            await fetch(`http://localhost:3000/deletar/${id}`, { method: 'DELETE' });
            consultarDados(); 
        } catch (erro) { console.error('Erro:', erro); }
    }
}

// --- FUNÇÕES DE TRANSIÇÃO ENTRE FILAS ---

async function moverParaPrioridade(id) {
    try {
        await fetch(`http://localhost:3000/mover-prioridade/${id}`, { method: 'PUT' });
        consultarDados();
        alert('Servidor adicionado à Fila de Prioridade!');
    } catch (e) { console.error(e); }
}

async function moverParaJudicial(id, nome) {
    let dataInput = prompt(`Mover ${nome} para a Fila Judicial.\nDigite a data limite de entrega (ex: 15/10/2026):`);
    if (dataInput === null) return; 
    if (dataInput.trim() === "") dataInput = "Não Determinado";

    try {
        await fetch(`http://localhost:3000/mover-judicial/${id}`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tempo_entrega: dataInput })
        });
        consultarDados(); 
    } catch (e) { console.error(e); }
}

async function finalizarServidor(id, nome) {
    // Pede a data para o usuário
    let dataInput = prompt(`Finalizar o processo de ${nome}?\n\nDigite a data de finalização (ex: 27/04/2026) ou deixe em branco para usar a data de HOJE:`);
    
    // Se a pessoa clicou em "Cancelar", interrompe a ação
    if (dataInput === null) return; 

    // Se deixou em branco, o sistema preenche com a data de hoje automaticamente
    if (dataInput.trim() === "") {
        const hoje = new Date();
        dataInput = hoje.toLocaleDateString('pt-BR');
    }

    try {
        await fetch(`http://localhost:3000/finalizar/${id}`, { 
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data_finalizacao: dataInput })
        });
        consultarDados();
    } catch (e) { console.error(e); }
}

// --- PESQUISA E EXPORTAÇÃO ---
document.getElementById('pesquisaNomeServidor')?.addEventListener('input', function() {
    const termoBusca = this.value.toLowerCase();
    const linhas = document.querySelectorAll('#lista-servidores tr');
    linhas.forEach(linha => {
        const txtLinha = linha.textContent.toLowerCase();
        linha.style.display = txtLinha.includes(termoBusca) ? '' : 'none';
    });
});

document.getElementById('pesquisaNomePrioridade')?.addEventListener('input', function() {
    const termoBusca = this.value.toLowerCase();
    const linhas = document.querySelectorAll('#tabelaDadosPrioridade tr');
    linhas.forEach(linha => {
        const txtLinha = linha.textContent.toLowerCase();
        linha.style.display = txtLinha.includes(termoBusca) ? '' : 'none';
    });
});

function exportarParaExcel() {
    // Agora busca a tabela específica dentro da tela de prioridade
    const tabela = document.querySelector('#tela-prioridade .tabela-excel');
    if (!tabela) return alert("Tabela não encontrada.");

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
    link.setAttribute("download", `Fila_Prioridade_${new Date().toISOString().split('T')[0]}.csv`);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}