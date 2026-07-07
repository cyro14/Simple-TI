let bd = {
    clientes: JSON.parse(localStorage.getItem('clientes')) || [],
    pecas: JSON.parse(localStorage.getItem('pecas')) || [],
    servicos: JSON.parse(localStorage.getItem('servicos')) || [],
    catalogoServicos: JSON.parse(localStorage.getItem('catalogoServicos')) || []
};

let osAtualModal = null; // Armazena a OS selecionada para os modais

function salvarBD() {
    localStorage.setItem('clientes', JSON.stringify(bd.clientes));
    localStorage.setItem('pecas', JSON.stringify(bd.pecas));
    localStorage.setItem('servicos', JSON.stringify(bd.servicos));
    localStorage.setItem('catalogoServicos', JSON.stringify(bd.catalogoServicos));
    atualizarTelas();
}

// --- Navegação ---
function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('nav button').forEach(btn => btn.classList.remove('active'));

    document.getElementById(tabId).classList.add('active');
    event.currentTarget.classList.add('active');

    if (tabId !== 'historico') document.getElementById('busca-input').value = '';
    atualizarTelas();
}

function verHistoricoCliente(clienteId) {
    const cliente = bd.clientes.find(c => c.id === clienteId);
    if (cliente) {
        document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('nav button').forEach(btn => btn.classList.remove('active'));

        document.getElementById('historico').classList.add('active');
        document.querySelector('nav button:nth-child(4)').classList.add('active'); // Botão histórico

        document.getElementById('busca-input').value = cliente.nome;
        buscarHistorico();
    }
}

// --- Cadastros ---
document.getElementById('form-cliente').addEventListener('submit', (e) => {
    e.preventDefault();
    const nome = document.getElementById('cli-nome').value;
    const telefone = document.getElementById('cli-telefone').value;
    const descricao = document.getElementById('cli-detalhes') ? document.getElementById('cli-detalhes').value : '';
    bd.clientes.push({ id: Date.now(), nome, telefone, descricao });
    salvarBD();
    e.target.reset();
});

document.getElementById('form-peca').addEventListener('submit', (e) => {
    e.preventDefault();
    const nome = document.getElementById('peca-nome').value;
    const custo = parseFloat(document.getElementById('peca-custo').value);
    const descricao = document.getElementById('peca-detalhes') ? document.getElementById('peca-detalhes').value : '';
    bd.pecas.push({ id: Date.now(), nome, custo, descricao });
    salvarBD();
    e.target.reset();
});

document.getElementById('form-os').addEventListener('submit', (e) => {
    e.preventDefault();
    bd.servicos.push({
        id: Date.now(),
        clienteId: parseInt(document.getElementById('os-cliente').value),
        tipo: document.getElementById('os-tipo').value,
        cabo: document.getElementById('os-cabo').checked,
        defeito: document.getElementById('os-defeito').value,
        observacoes: document.getElementById('os-observacoes') ? document.getElementById('os-observacoes').value : '',
        status: 'Aberto',
        pecasUsadas: [],
        servicosPrestados: [],
        dataAbertura: new Date().toLocaleDateString('pt-BR'),
        dataAgendada: document.getElementById('os-data-agendada') ? document.getElementById('os-data-agendada').value : null,
        dataConclusao: null
    });
    salvarBD();
    e.target.reset();
});

document.getElementById('form-catalogo-servico').addEventListener('submit', (e) => {
    e.preventDefault();
    const nome = document.getElementById('cat-servico-nome').value;
    const preco = parseFloat(document.getElementById('cat-servico-preco').value);
    const descricao = document.getElementById('cat-servico-detalhes') ? document.getElementById('cat-servico-detalhes').value : '';
    bd.catalogoServicos.push({ id: Date.now(), nome, preco, descricao });
    salvarBD();
    e.target.reset();
});

// --- Modais e Adição de Itens ---
function abrirModalPeca(osId) {
    osAtualModal = osId;
    document.getElementById('modal-peca').style.display = 'block';
    document.getElementById('busca-peca-modal').value = '';
    filtrarPecasModal(); // Mostra todas ao abrir
}

function fecharModalPeca() {
    document.getElementById('modal-peca').style.display = 'none';
}

function filtrarPecasModal() {
    const termo = document.getElementById('busca-peca-modal').value.toLowerCase();
    const lista = document.getElementById('lista-pecas-modal');

    const pecasFiltradas = bd.pecas.filter(p => p.nome.toLowerCase().includes(termo));

    if (pecasFiltradas.length === 0) {
        lista.innerHTML = '<li>Nenhuma peça encontrada.</li>';
        return;
    }

    lista.innerHTML = pecasFiltradas.map(p => `
        <li class="clickable" onclick="confirmarAdicaoPeca(${p.id})">
            <strong>${p.nome}</strong> <span>R$ ${p.custo.toFixed(2)}</span>
        </li>
    `).join('');
}

function excluirCliente(id) { if (confirm("Excluir este cliente?")) { bd.clientes = bd.clientes.filter(c => c.id !== id); salvarBD(); } }
function excluirPeca(id) { if (confirm("Excluir esta peça?")) { bd.pecas = bd.pecas.filter(p => p.id !== id); salvarBD(); } }
function excluirServicoCat(id) { if (confirm("Excluir este serviço?")) { bd.catalogoServicos = bd.catalogoServicos.filter(s => s.id !== id); salvarBD(); } }
function excluirOS(id) { if (confirm("Excluir esta OS permanentemente?")) { bd.servicos = bd.servicos.filter(s => s.id !== id); salvarBD(); } }

function reabrirOS(osId) {
    const os = bd.servicos.find(s => s.id === osId);
    if (os) {
        os.status = 'Aberto';
        os.dataConclusao = null;
        salvarBD();
    }
}

function confirmarAdicaoPeca(pecaId) {
    const peca = bd.pecas.find(p => p.id === pecaId);
    const os = bd.servicos.find(s => s.id === osAtualModal);
    if (peca && os) {
        let precoSugerido = prompt(`Peça: ${peca.nome}\nPreço Base: R$ ${peca.custo.toFixed(2)}\n\nDigite o valor que será cobrado nesta OS:`, peca.custo);
        if (precoSugerido !== null) {
            if (!os.pecasUsadas) os.pecasUsadas = [];
            os.pecasUsadas.push({ ...peca, precoCobrado: parseFloat(precoSugerido.replace(',', '.')) });
            salvarBD();
            fecharModalPeca();
        }
    }
}

function abrirModalServico(osId) {
    osAtualModal = osId;
    document.getElementById('modal-servico').style.display = 'block';
    document.getElementById('busca-servico-modal').value = '';
    filtrarServicosModal();
}
function fecharModalServico() { document.getElementById('modal-servico').style.display = 'none'; }

function filtrarServicosModal() {
    const termo = document.getElementById('busca-servico-modal').value.toLowerCase();
    const lista = document.getElementById('lista-servicos-modal');
    const filtrados = bd.catalogoServicos.filter(s => s.nome.toLowerCase().includes(termo));

    lista.innerHTML = filtrados.map(s => `
        <li class="clickable" onclick="confirmarAdicaoServico(${s.id})">
            <strong>${s.nome}</strong> <span>R$ ${s.preco.toFixed(2)}</span>
        </li>
    `).join('');
}

function confirmarAdicaoServico(servicoId) {
    const servico = bd.catalogoServicos.find(s => s.id === servicoId);
    const os = bd.servicos.find(s => s.id === osAtualModal);
    if (servico && os) {
        let precoSugerido = prompt(`Serviço: ${servico.nome}\nPreço Base: R$ ${servico.preco.toFixed(2)}\n\nDigite o valor que será cobrado nesta OS:`, servico.preco);
        if (precoSugerido !== null) {
            if (!os.servicosPrestados) os.servicosPrestados = [];
            os.servicosPrestados.push({ ...servico, precoCobrado: parseFloat(precoSugerido.replace(',', '.')) });
            salvarBD();
            fecharModalServico();
        }
    }
}

function concluirOS(osId) {
    const os = bd.servicos.find(s => s.id === osId);
    if (os) {
        os.status = 'Concluído';
        os.dataConclusao = new Date().toLocaleDateString('pt-BR');
        salvarBD();
    }
}

function verDetalhes(titulo, detalhes) {
    document.getElementById('detalhes-titulo').innerText = titulo;
    document.getElementById('detalhes-texto').innerText = detalhes && detalhes !== "undefined" ? detalhes : 'Nenhuma descrição informada.';
    document.getElementById('modal-detalhes').style.display = 'block';
}

function quickAddPeca() {
    const nome = document.getElementById('quick-peca-nome').value;
    const custo = parseFloat(document.getElementById('quick-peca-custo').value);
    if (nome && !isNaN(custo)) {
        const novaPeca = { id: Date.now(), nome, custo, descricao: 'Criada via atalho rápido' };
        bd.pecas.push(novaPeca);
        salvarBD();
        confirmarAdicaoPeca(novaPeca.id); // Já adiciona à OS
    }
}

function quickAddCliente() {
    const nome = prompt("Nome do Novo Cliente:");
    if (!nome) return; // Se cancelar ou deixar em branco, não faz nada

    const telefone = prompt("Telefone do Cliente (Opcional):") || "";

    // Cria o cliente e joga no banco
    const novoCliente = { id: Date.now(), nome: nome, telefone: telefone, descricao: 'Criado via atalho rápido na OS' };
    bd.clientes.push(novoCliente);
    salvarBD(); // Isso já vai chamar o atualizarTelas() internamente

    // Força o select a já ficar com este cliente selecionado para poupar tempo
    document.getElementById('os-cliente').value = novoCliente.id;
}

function quickAddServico() {
    const nome = document.getElementById('quick-serv-nome').value;
    const preco = parseFloat(document.getElementById('quick-serv-preco').value);
    if (nome && !isNaN(preco)) {
        const novoServico = { id: Date.now(), nome, preco, descricao: 'Criado via atalho rápido' };
        bd.catalogoServicos.push(novoServico);
        salvarBD();
        confirmarAdicaoServico(novoServico.id); // Já adiciona à OS
    }
}

// Função de Detalhes Corrigida (Busca pela ID para não quebrar o texto)
function verDetalhes(tipo, id) {
    let item;
    if (tipo === 'cliente') item = bd.clientes.find(i => i.id === id);
    if (tipo === 'peca') item = bd.pecas.find(i => i.id === id);
    if (tipo === 'servico') item = bd.catalogoServicos.find(i => i.id === id);

    if (item) {
        document.getElementById('detalhes-titulo').innerText = item.nome;
        document.getElementById('detalhes-texto').innerText = item.descricao ? item.descricao : 'Nenhuma descrição detalhada cadastrada.';
        document.getElementById('modal-detalhes').style.display = 'block';
    }
}

// Funções de Edição
function editarCliente(id) {
    let c = bd.clientes.find(x => x.id === id);
    if (c) {
        c.nome = prompt("Editar Nome:", c.nome) || c.nome;
        c.telefone = prompt("Editar Telefone:", c.telefone) || c.telefone;
        c.descricao = prompt("Editar Detalhes:", c.descricao || "") || c.descricao;
        salvarBD();
    }
}

function editarPeca(id) {
    let p = bd.pecas.find(x => x.id === id);
    if (p) {
        p.nome = prompt("Editar Nome da Peça:", p.nome) || p.nome;
        let novoCusto = prompt("Editar Custo (R$):", p.custo);
        if (novoCusto !== null && !isNaN(parseFloat(novoCusto.replace(',', '.')))) {
            p.custo = parseFloat(novoCusto.replace(',', '.'));
        }
        p.descricao = prompt("Editar Detalhes:", p.descricao || "") || p.descricao;
        salvarBD();
    }
}

function editarServicoCat(id) {
    let s = bd.catalogoServicos.find(x => x.id === id);
    if (s) {
        s.nome = prompt("Editar Nome do Serviço:", s.nome) || s.nome;
        let novoPreco = prompt("Editar Preço Padrão (R$):", s.preco);
        if (novoPreco !== null && !isNaN(parseFloat(novoPreco.replace(',', '.')))) {
            s.preco = parseFloat(novoPreco.replace(',', '.'));
        }
        s.descricao = prompt("Editar Detalhes:", s.descricao || "") || s.descricao;
        salvarBD();
    }
}

function imprimirOS(osId) {
    const os = bd.servicos.find(s => s.id === osId);
    const cliente = bd.clientes.find(c => c.id === os.clienteId) || { nome: 'Desconhecido' };

    let itensHtml = (os.pecasUsadas || []).map(p => `<li>🔧 Peça: ${p.nome} - R$ ${(p.precoCobrado ?? p.custo).toFixed(2)}</li>`).join('');
    itensHtml += (os.servicosPrestados || []).map(s => `<li>⚙️ Serviço: ${s.nome} - R$ ${(s.precoCobrado ?? s.preco).toFixed(2)}</li>`).join('');

    const total = (os.pecasUsadas || []).reduce((s, p) => s + (p.precoCobrado ?? p.custo), 0) +
        (os.servicosPrestados || []).reduce((s, serv) => s + (serv.precoCobrado ?? serv.preco), 0);

    const janela = window.open('', '', 'width=800,height=600');
    janela.document.write(`
        <html><head><title>Impressão OS #${os.id}</title></head><body style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Ordem de Serviço #${os.id.toString().slice(-4)}</h2>
            <hr>
                <p><strong>Cliente:</strong> <a class="client-link" onclick="verHistoricoCliente(${cliente.id})">${cliente.nome}</a></p>
                <p><strong>Equipamento:</strong> ${os.tipo || 'Não especificado'} ${os.cabo ? '<span style="color:#2980b9; font-weight:bold;">🔌 (Acompanha Cabo/Carregador)</span>' : ''}</p>
                <p><strong>Defeito:</strong> ${os.defeito}</p>
                <p style="background: #fff3cd; padding: 4px; border-radius: 4px; margin: 5px 0;">
                    <strong>Obs:</strong> ${os.observacoes || '<i>Nenhuma</i>'} 
                    <span style="cursor:pointer; font-size:0.8rem; color:#d35400; font-weight:bold; float:right;" onclick="editarObservacaoOS(${os.id})">✏️ Editar</span>
                </p>
                <p><strong>Abertura:</strong> ${os.dataAbertura}</p>
                ${os.dataConclusao ? `<p><strong>Conclusão:</strong> ${os.dataConclusao}</p>` : ''}
            <br><h3>Itens Executados</h3>
            <ul style="line-height: 1.8;">${itensHtml || '<li>Nenhum item adicionado</li>'}</ul>
            <hr>
            <h3>Total: R$ ${total.toFixed(2)}</h3>
            <br><br><br><br>
            <p style="text-align: center;">____________________________________________________<br>Assinatura do Cliente</p>
            <script>window.print(); window.close();</script>
        </body></html>
    `);
}

function removerPecaOS(osId, index) {
    if (confirm("Remover esta peça da OS?")) {
        let os = bd.servicos.find(s => s.id === osId);
        if (os) { os.pecasUsadas.splice(index, 1); salvarBD(); }
    }
}

function removerServicoOS(osId, index) {
    if (confirm("Remover este serviço da OS?")) {
        let os = bd.servicos.find(s => s.id === osId);
        if (os) { os.servicosPrestados.splice(index, 1); salvarBD(); }
    }
}

function editarObservacaoOS(osId) {
    let os = bd.servicos.find(s => s.id === osId);
    if (os) {
        let novaObs = prompt("Observações da OS:", os.observacoes || "");
        if (novaObs !== null) { os.observacoes = novaObs; salvarBD(); }
    }
}

function gerarRelatorio() {
    const dataInicioStr = document.getElementById('rel-data-inicio').value;
    const dataFimStr = document.getElementById('rel-data-fim').value;
    const clienteId = document.getElementById('rel-cliente').value;

    let osFiltradas = bd.servicos.filter(s => s.status === 'Concluído' && s.dataConclusao);

    // Converte a data salva "DD/MM/YYYY" para timestamp comparável
    const parseData = (dStr) => { const [d, m, y] = dStr.split('/'); return new Date(y, m - 1, d).getTime(); };

    if (dataInicioStr) osFiltradas = osFiltradas.filter(s => parseData(s.dataConclusao) >= new Date(dataInicioStr + 'T00:00:00').getTime());
    if (dataFimStr) osFiltradas = osFiltradas.filter(s => parseData(s.dataConclusao) <= new Date(dataFimStr + 'T23:59:59').getTime());
    if (clienteId) osFiltradas = osFiltradas.filter(s => s.clienteId === parseInt(clienteId));

    let totalPecas = 0, totalServicos = 0, totalGeral = 0;

    osFiltradas.forEach(os => {
        let tPecas = (os.pecasUsadas || []).reduce((sum, p) => sum + (p.precoCobrado ?? p.custo), 0);
        let tServs = (os.servicosPrestados || []).reduce((sum, s) => sum + (s.precoCobrado ?? s.preco), 0);
        totalPecas += tPecas; totalServicos += tServs; totalGeral += (tPecas + tServs);
    });

    document.getElementById('resultado-relatorio').innerHTML = `
        <div style="background: #20bf6b; color: white; padding: 20px; border-radius: 8px; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h3>Resumo do Período Filtrado</h3>
            <p>OS Finalizadas: <strong>${osFiltradas.length}</strong></p>
            <div style="display: flex; justify-content: space-around; margin-top: 15px; background: rgba(0,0,0,0.2); padding: 15px; border-radius: 6px; flex-wrap: wrap; gap: 10px;">
                <div><span style="font-size: 0.9rem;">Receita Peças:</span><br><strong>R$ ${totalPecas.toFixed(2)}</strong></div>
                <div><span style="font-size: 0.9rem;">Receita Serviços:</span><br><strong>R$ ${totalServicos.toFixed(2)}</strong></div>
                <div><span style="font-size: 0.9rem;">Faturamento Total:</span><br><strong style="font-size: 1.3rem;">R$ ${totalGeral.toFixed(2)}</strong></div>
            </div>
        </div>
    `;
}

// --- Renderização ---
function atualizarTelas() {
    // Listagens
    document.getElementById('lista-clientes').innerHTML = bd.clientes.map(c => `
        <li>
            <div>
                <strong><a class="client-link" onclick="verHistoricoCliente(${c.id})">📋 ${c.nome}</a></strong> 
                <span style="font-size: 0.8rem; cursor:pointer; color: #7f8c8d; margin-left: 10px;" onclick="verDetalhes('cliente', ${c.id})">🔍 Detalhes</span>
            </div>
            <span>
                ${c.telefone} 
                <button class="btn-edit" onclick="editarCliente(${c.id})" title="Editar">✏️</button>
                <button class="btn-danger" onclick="excluirCliente(${c.id})" title="Excluir">X</button>
            </span>
        </li>`).join('');

    document.getElementById('lista-pecas').innerHTML = bd.pecas.map(p => `
        <li>
            <div>
                ${p.nome} <span style="font-size: 0.8rem; cursor:pointer; color: #7f8c8d;" onclick="verDetalhes('peca', ${p.id})">🔍 Detalhes</span>
            </div>
            <span>
                R$ ${p.custo.toFixed(2)} 
                <button class="btn-edit" onclick="editarPeca(${p.id})" title="Editar">✏️</button>
                <button class="btn-danger" onclick="excluirPeca(${p.id})" title="Excluir">X</button>
            </span>
        </li>`).join('');

    document.getElementById('lista-catalogo-servicos').innerHTML = bd.catalogoServicos.map(s => `
        <li>
            <div>
                ${s.nome} <span style="font-size: 0.8rem; cursor:pointer; color: #7f8c8d;" onclick="verDetalhes('servico', ${s.id})">🔍 Detalhes</span>
            </div>
            <span>
                R$ ${s.preco.toFixed(2)} 
                <button class="btn-edit" onclick="editarServicoCat(${s.id})" title="Editar">✏️</button>
                <button class="btn-danger" onclick="excluirServicoCat(${s.id})" title="Excluir">X</button>
            </span>
        </li>`).join('');

    // --- CORREÇÃO: ATUALIZA OS DOIS DROPDOWNS DE CLIENTES ---
    const selectOs = document.getElementById('os-cliente');
    if (selectOs) {
        selectOs.innerHTML = '<option value="">Selecione o Cliente</option>' + bd.clientes.map(c => `<option value="${c.id}">${c.nome}</option>`).join('');
    }

    const selectRel = document.getElementById('rel-cliente');
    if (selectRel) {
        selectRel.innerHTML = '<option value="">Todos os Clientes</option>' + bd.clientes.map(c => `<option value="${c.id}">${c.nome}</option>`).join('');
    }
    // --------------------------------------------------------

    // Calendário
    let inputCalendario = document.getElementById('calendario-filtro');
    if (!inputCalendario.value) {
        inputCalendario.value = new Date().toISOString().split('T')[0]; // Define hoje como padrão YYYY-MM-DD
    }
    const [ano, mes, dia] = inputCalendario.value.split('-');
    const dataFiltradaBR = `${dia}/${mes}/${ano}`;

    // OS Abertas
    renderizarOS(bd.servicos.filter(s => s.status === 'Aberto'), 'lista-os-abertas');

    // OS Agendadas para a data do calendário
    renderizarOS(bd.servicos.filter(s => s.status === 'Aberto' && s.dataAgendada === inputCalendario.value), 'lista-os-agendadas');

    // OS Finalizadas na data do calendário
    renderizarOS(bd.servicos.filter(s => s.status === 'Concluído' && s.dataConclusao === dataFiltradaBR), 'lista-os-finalizadas');

    buscarHistorico();
}

function renderizarOS(servicos, containerId) {
    const container = document.getElementById(containerId);
    if (servicos.length === 0) {
        container.innerHTML = '<p style="color:#7f8c8d; grid-column: 1 / -1;">Nenhuma OS nesta categoria.</p>';
        return;
    }

    container.innerHTML = servicos.map(os => {
        const cliente = bd.clientes.find(c => c.id === os.clienteId) || { id: null, nome: 'Excluído/Desconhecido' };

        // Proteção para dados antigos
        const pecas = os.pecasUsadas || [];
        const servicosPrestados = os.servicosPrestados || [];

        const totalOriginal = pecas.reduce((sum, p) => sum + p.custo, 0) + servicosPrestados.reduce((sum, s) => sum + s.preco, 0);
        const totalCobrado = pecas.reduce((sum, p) => sum + (p.precoCobrado ?? p.custo), 0) + servicosPrestados.reduce((sum, s) => sum + (s.precoCobrado ?? s.preco), 0);

        const htmlPecas = pecas.map((p, idx) => `
            <div class="item-linha">
                <span>🔧 ${p.nome} ${os.status === 'Aberto' ? `<b style="color:#e74c3c; cursor:pointer; margin-left:8px;" onclick="removerPecaOS(${os.id}, ${idx})" title="Remover item">X</b>` : ''}</span>
                <span>R$ ${(p.precoCobrado ?? p.custo).toFixed(2)}</span>
            </div>`).join('');

        const htmlServicos = servicosPrestados.map((s, idx) => `
            <div class="item-linha">
                <span>⚙️ ${s.nome} ${os.status === 'Aberto' ? `<b style="color:#e74c3c; cursor:pointer; margin-left:8px;" onclick="removerServicoOS(${os.id}, ${idx})" title="Remover item">X</b>` : ''}</span>
                <span>R$ ${(s.precoCobrado ?? s.preco).toFixed(2)}</span>
            </div>`).join('');

        let diferencaStr = '';
        if (totalCobrado < totalOriginal) diferencaStr = `<p style="color: #e74c3c; font-size: 0.85rem;">Desconto: R$ ${(totalOriginal - totalCobrado).toFixed(2)}</p>`;
        else if (totalCobrado > totalOriginal) diferencaStr = `<p style="color: #f39c12; font-size: 0.85rem;">Acréscimo: R$ ${(totalCobrado - totalOriginal).toFixed(2)}</p>`;

        return `
            <div class="os-card ${os.status === 'Concluído' ? 'concluido' : ''}">
                <div style="display: flex; justify-content: space-between;">
                    <strong>OS #${os.id.toString().slice(-4)}</strong>
                    <span style="background:${os.status === 'Concluído' ? '#20bf6b' : '#fa8231'}; color:white; padding: 2px 8px; border-radius: 12px; font-size: 0.8rem;">${os.status}</span>
                </div>
                <hr>
                <p><strong>Cliente:</strong> <a class="client-link" onclick="verHistoricoCliente(${cliente.id})">${cliente.nome}</a></p>
                <p><strong>Equipamento:</strong> ${os.tipo || 'Não especificado'} ${os.cabo ? '<span style="color:#2980b9; font-weight:bold;">🔌 (Acompanha Cabo/Carregador)</span>' : ''}</p>
                <p><strong>Defeito:</strong> ${os.defeito}</p>
                <p style="background: #fff3cd; padding: 4px; border-radius: 4px; margin: 5px 0;">
                    <strong>Obs:</strong> ${os.observacoes || '<i>Nenhuma</i>'} 
                    <span style="cursor:pointer; font-size:0.8rem; color:#d35400; font-weight:bold; float:right;" onclick="editarObservacaoOS(${os.id})">✏️ Editar</span>
                </p>
                <p><strong>Abertura:</strong> ${os.dataAbertura}</p>
                ${os.dataConclusao ? `<p><strong>Conclusão:</strong> ${os.dataConclusao}</p>` : ''}
                
                <div style="margin-top: 10px;">${htmlPecas}${htmlServicos}</div>
                <hr>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    ${diferencaStr}
                    <p style="font-size: 1.1rem; flex-grow: 1; text-align: right;"><strong>Total: R$ ${totalCobrado.toFixed(2)}</strong></p>
                </div>
                
                <div class="btn-group">
                    <button class="btn-action" style="background:#555" onclick="imprimirOS(${os.id})" title="Imprimir Recibo">🖨️</button>
                    ${os.status === 'Aberto' ? `
                        <button class="btn-action" style="background:#4b7bec" onclick="abrirModalPeca(${os.id})">+ Peça</button>
                        <button class="btn-action" style="background:#a55eea" onclick="abrirModalServico(${os.id})">+ Serviço</button>
                        <button class="btn-action" style="background:#20bf6b" onclick="concluirOS(${os.id})">Concluir</button>
                    ` : `
                        <button class="btn-warning" onclick="reabrirOS(${os.id})">🔄 Reabrir</button>
                    `}
                    <button class="btn-danger" style="flex: 0.2;" title="Excluir OS" onclick="excluirOS(${os.id})">🗑️</button>
                </div>
            </div>
        `;
    }).join('');
}

function buscarHistorico() {
    const termo = document.getElementById('busca-input').value.toLowerCase();
    if (!termo) {
        document.getElementById('resultado-busca').innerHTML = '';
        return;
    }

    const resultados = bd.servicos.filter(os => {
        const cliente = bd.clientes.find(c => c.id === os.clienteId);
        const nomeCliente = cliente ? cliente.nome.toLowerCase() : '';
        return nomeCliente.includes(termo) || os.defeito.toLowerCase().includes(termo);
    });

    renderizarOS(resultados, 'resultado-busca');
}

// Fechar modais ao clicar fora
window.onclick = function (event) {
    if (event.target == document.getElementById('modal-peca')) fecharModalPeca();
    if (event.target == document.getElementById('modal-servico')) fecharModalServico();
}

atualizarTelas();