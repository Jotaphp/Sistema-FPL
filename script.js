const formulario = document.getElementById('formulario');
const listaDados = document.getElementById('listaDados');
let idEdicao = null; 

document.addEventListener('DOMContentLoaded', consultarDados);

formulario.addEventListener('submit', async function(evento) {
    evento.preventDefault();

    const nome = document.getElementById('nome').value;
    const sexo = document.getElementById('sexo').value;
    const data_nascimento = document.getElementById('dataNascimento').value;
    const data_admissao = document.getElementById('dataAdmissao').value;
    
    // Captura os valores do tempo averbado (convertendo string para número)
    const anos = parseInt(document.getElementById('anosAverbados').value) || 0;
    const meses = parseInt(document.getElementById('mesesAverbados').value) || 0;
    const dias = parseInt(document.getElementById('diasAverbados').value) || 0;

    // CONVERSÃO PARA DIAS (Regra: Ano=365, Mês=30)
    const tempo_averbado_dias = (anos * 365) + (meses * 30) + dias;

    const registro = { nome, sexo, data_nascimento, data_admissao, tempo_averbado_dias };

    if (idEdicao === null) {
        await adicionarDado(registro);
    } else {
        await salvarEdicao(idEdicao, registro);
        idEdicao = null;
        document.querySelector('button[type="submit"]').textContent = 'Salvar Registro';
    }
    
    // Reseta o formulário e volta os valores padrão para os números
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
async function consultarDados() {
    try {
        const resposta = await fetch('http://localhost:3000/registros');
        const registros = await resposta.json();
        
        listaDados.innerHTML = '';
        
        registros.forEach(function(reg) {
            const li = document.createElement('li');
            
            const dataNascFormatada = reg.data_nascimento.split('-').reverse().join('/');
            const dataAdmFormatada = reg.data_admissao.split('-').reverse().join('/');

            li.innerHTML = `
                <div class="info-contato">
                    <strong>Nome:</strong> ${reg.nome} (${reg.sexo}) <br> 
                    <strong>Nascimento:</strong> ${dataNascFormatada} <br>
                    <strong>Admissão:</strong> ${dataAdmFormatada} <br>
                    <strong>Tempo Averbado:</strong> ${reg.tempo_averbado_dias} dias
                </div>
                <div class="acoes-contato">
                    <button class="btn-editar" onclick="prepararEdicao(${reg.id}, '${reg.nome}', '${reg.sexo}', '${reg.data_nascimento}', '${reg.data_admissao}', ${reg.tempo_averbado_dias})">Editar</button>
                    
                    <button class="btn-excluir" onclick="deletarDado(${reg.id})">Excluir</button>
                </div>
            `;
            listaDados.appendChild(li);
        });
    } catch (erro) { console.error('Erro:', erro); }
}

async function deletarDado(id) {
    if (confirm('Excluir este registro?')) {
        try {
            await fetch(`http://localhost:3000/deletar/${id}`, { method: 'DELETE' });
            consultarDados(); 
        } catch (erro) { console.error('Erro:', erro); }
    }
}

// Função UPDATE (Prepara a tela e faz a matemática reversa)
function prepararEdicao(id, nome, sexo, data_nascimento, data_admissao, tempo_averbado_dias) {
    // 1. Preenche os dados simples
    document.getElementById('nome').value = nome;
    document.getElementById('sexo').value = sexo;
    document.getElementById('dataNascimento').value = data_nascimento;
    document.getElementById('dataAdmissao').value = data_admissao;
    
    // 2. MATEMÁTICA REVERSA (Dias -> Anos, Meses, Dias)
    const anos = Math.floor(tempo_averbado_dias / 365); // Quantos anos inteiros cabem?
    const restoAnos = tempo_averbado_dias % 365;        // Quantos dias sobraram?
    
    const meses = Math.floor(restoAnos / 30);           // Quantos meses inteiros cabem no que sobrou?
    const dias = restoAnos % 30;                        // O que sobrou final são os dias.

    // 3. Preenche os campos de tempo averbado
    document.getElementById('anosAverbados').value = anos;
    document.getElementById('mesesAverbados').value = meses;
    document.getElementById('diasAverbados').value = dias;
    
    // 4. Muda o estado do sistema para "Modo Edição"
    idEdicao = id;
    document.querySelector('button[type="submit"]').textContent = 'Atualizar Registro';
    
    // 5. Rola a página para o topo suavemente (ajuda caso a lista seja muito longa)
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Função UPDATE (Envia os dados alterados para o banco)
async function salvarEdicao(id, registro) {
    try {
        await fetch(`http://localhost:3000/editar/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(registro)
        });
        consultarDados(); // Atualiza a lista na tela
    } catch (erro) {
        console.error('Erro ao atualizar no banco:', erro);
    }
}