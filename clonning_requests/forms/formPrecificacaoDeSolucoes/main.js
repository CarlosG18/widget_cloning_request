let abaAtiva = null
const TAB_PESSOAS = 'pessoas'
const TAB_PESSOAS_LEGADO = 'consultores'
const DOCUMENT_ID_PARAMETROS = isDev() ? '168324' : '1266567'

const tabelasFilhas = [
    { nome: 'servicosEpecializados', titulo: 'Custos Com Serviços Especializados', campoId: 'idSolucaoSE', campoOrigem: 'origemSE' },
    { nome: 'materiais-didaticos', titulo: 'Materiais Didáticos', campoId: 'idSolucaoMD', campoOrigem: 'origemMD' },
    { nome: 'equipamentos', titulo: 'Custo Com Equipamentos', campoId: 'idSolucaoEP', campoOrigem: 'origemEP' },
    { nome: 'alimentacao', titulo: 'Custo com Alimentação', campoId: 'idSolucaoAL', campoOrigem: 'origemAL' }
]

const CONTRATOS_MATERIAIS_DIDATICOS = {
    expediente: [
        {
            nome: 'CT.0077.22 - LM SERVGRAFICA E COPIADORA LTDA - 07.805.649/0001-29',
            documentId: isDev() ? '169036' : '767490'
        }
    ],
    impressoes: [
        {
            nome: 'CT.0169.22 - PLUGTECH DO BRASIL SERVICOS DE INFORMATICA LTDA - 09.068.094/0001-05',
            documentId: isDev() ? '169037' : '311029'
        }
    ],
    papelaria: [
        {
            nome: 'CT.0007.22 - ELIAS AVELINO DOS SANTOS EPP - 24.208.480/0001-49',
            documentId: isDev() ? '169038' : '311065'
        }
    ]
}

const CONTRATOS_EQUIPAMENTOS = [
    {
        nome: 'Equipamento - CT.0275.23 - M.COLAO - 03.058.075/0001-11',
        documentId: isDev() ? '168957' : '415622'
    }
]

const CONTRATOS_ALIMENTACAO = [
    {
        nome: 'Alimentação Natal - CT.0081.24 - ANGELINAS BUFFET LTDA - 24.155.915/0001-34',
        documentId: isDev() ? '168958' : '469073'
    },
    {
        nome: 'Alimentação Interior - CT.0223.22 - P J REFEICOES COLETIVAS LTDA - EPP - 01.611.866/0001-00',
        documentId: isDev() ? '168959' : '353188'
    },
    {
        nome: 'Alimentação Interior - CT.0222.22 - P J REFEICOES COLETIVAS LTDA - EPP - 01.611.866/0001-00',
        documentId: isDev() ? '' : '353187'
    },
    {
        nome: 'Alimentação Interior - 	CT.0221.22 - P J REFEICOES COLETIVAS LTDA - EPP - 01.611.866/0001-00',
        documentId: isDev() ? '' : '423953'
    },
    {
        nome: 'Alimentação Interior - CT.0219.22 - P J REFEICOES COLETIVAS LTDA - EPP - 01.611.866/0001-00',
        documentId: isDev() ? '' : '353083'
    },
    {
        nome: 'Alimentação Interior - 	CT.0218.22 - P J REFEICOES COLETIVAS LTDA - EPP - 01.611.866/0001-00',
        documentId: isDev() ? '' : '353062'
    },
    {
        nome: 'Alimentação Interior - CT.0217.22 - P J REFEICOES COLETIVAS LTDA - EPP - 01.611.866/0001-00',
        documentId: isDev() ? '' : '353041'
    }
]

const metadadosCamposFilhos = {}
const estadoDescontosINPorAba = {}
const cacheNomesSolucoesSebraern = {
    carregado: false,
    itens: []
}
const bloqueioNomeSolucaoPorId = {}
const nomeSolucaoAutoGeradoPorId = {}
let atualizandoInputsLucroMercado = false
let formularioSomenteLeitura = false

function isAtividadeInicial(atividade) {
    return atividade == 0 || atividade == 4
}

function podeEditarDadosSolucao(atividade) {
    return atividade == 0 || atividade == 4 || atividade == 30
}

function bloquearAlteracaoContextoEvento() {
    $('.grupoComercialRadio').prop('disabled', true)
    $('.customRadio').addClass('disabled').attr('title', 'Contexto bloqueado após atividade inicial')
}

function aplicarModoSomenteLeituraPosInicio() {
    formularioSomenteLeitura = true

    $('#btn-add-solucao').hide()
    $('.tab-close-btn').hide()
    $('.linha-inclusao-item').hide()
    $('.form-adicionar-trajeto').hide()
    $('.btn-remover-pessoa').hide()
    $('.btn-adicionar-item').hide()
    $('.btn-remover-linha').hide()

    $('#conteudo-tabelas-visuais .input-sync').attr('readonly', true)
    $('#conteudo-tabelas-visuais textarea').attr('readonly', true)
    $('#conteudo-tabelas-visuais select').prop('disabled', true)
    $('#conteudo-tabelas-visuais button').prop('disabled', true)

    $('#dadosSolucoes input, #gestaoPrecificacao input').not('[type="hidden"]').attr('readonly', true)
    $('#dadosSolucoes textarea, #gestaoPrecificacao textarea').attr('readonly', true)
    $('#dadosSolucoes select, #gestaoPrecificacao select').prop('disabled', true)
}

$(function () {
    let matriculaFluig = getUser()
    const atividade = getActivity()
    const formId = getDocumentId()
    const numProcess = getProcesso()

    console.log(`----------------------------------------`)
    console.log(`ID do formulário do processo: ${formId}`)
    console.log(`Número Fluig do processo: ${numProcess}`)
    console.log(`Atividade Atual: ${atividade}`)
    console.log(`Usuário Atual: ${matriculaFluig}`)
    console.log(`----------------------------------------`)

    if (podeEditarDadosSolucao(atividade)) {
        $('.select2Activate').select2()
    }

    $('.table-solucoes-container').hide()
    $('.table-servico-especializado-container').hide()
    $('.table-deslocamento-container').hide()
    $('.table-pessoas-container').hide()
    $('.table-materiais-didaticos-container').hide()
    $('.table-equipamentos-container').hide()
    $('.table-alimentacao-container').hide()
    $('.table-ins-container').hide()

    montarEstruturaVisualBase()
    bindSyncEvents()
    if (podeEditarDadosSolucao(atividade)) {
        inicializarComboBase()
    } else {
        prepararComboBaseSomenteLeitura()
    }
    configurarPainelGestaoSemListaIN()

    if (!isAtividadeInicial(atividade)) {
        bloquearAlteracaoContextoEvento()
    }

    if (getMode() == 'ADD' || atividade == 4 || atividade == 0) {
        carregarDadosExistentes()
        adicionarSolucao()

        if (getFluiggers().includes(matriculaFluig)) {
            matriculaFluig = isDev() ? 'maezia' : 'paulovitor'
        }

        const dsFuncionario = getDataset('dsConsultaHierarquiaFuncionario', {
            FUNCIONARIO: matriculaFluig
        })

        console.log('Dados do Funcionário')
        console.table(dsFuncionario.values)

        $('#nomeCompletoSolicitante').val(dsFuncionario.values[0]['NOMEFUNCIONARIO'])
        $('#matriculaSolicitante').val(dsFuncionario.values[0]['FUNCIONARIO'])
        $('#emailSolicitante').val(dsFuncionario.values[0]['EMAILFUNCIONARIO'])

        $('#gerenteDoSolicitante').val(dsFuncionario.values[0]['NOMEGERENTE'])
        $('#matriculaGerenteDoSolicitante').val(dsFuncionario.values[0]['GERENTE'])
        $('#emialGerente').val(dsFuncionario.values[0]['EMAILGERENTE'])

        let data = new Date().toLocaleDateString('pt-BR')
        $('#dataSolicitacao').val(data)
    }

    if (getMode() == 'MOD') {
        carregarDadosExistentes()

        if (getFluiggers().includes(matriculaFluig)) {
            matriculaFluig = isDev() ? 'maezia' : 'paulovitor'
        }

        if (!(atividade == 0 || atividade == 4 || atividade == 30)) {
            aplicarModoSomenteLeituraPosInicio()
        }

        if (atividade == 5) {
            const dsFuncionario = getDataset('dsConsultaHierarquiaFuncionario', {
                FUNCIONARIO: matriculaFluig
            })

            $('#validadorGerente').val(dsFuncionario.values[0]['NOMEFUNCIONARIO'])
            $('#matriculaValidadorGerente').val(dsFuncionario.values[0]['FUNCIONARIO'])
            $('#emailValidadorGerente').val(dsFuncionario.values[0]['EMAILFUNCIONARIO'])

            let data = new Date().toLocaleDateString('pt-BR')
            $('#dataValidacaoGerente').val(data)
        }
        if (atividade == 30) {
            let data = new Date().toLocaleDateString('pt-BR')
            $('#dataAjusteSolicitante').val(data)
        }
    }

    if (getMode() == 'VIEW') {
        carregarDadosExistentes()
        aplicarModoSomenteLeituraPosInicio()
    }
})

function getFluiggers() {
    return [
        'anderson.santos',
        'isaac.strategi',
        'pedro.isaac',
        'italo.almeida',
        'italo.monteiro',
        'ayrton',
        'AYRTON SALES',
        'jefferson.soares',
        'raul.barra',
        'miguel.melo',
        'mario.guimaraes',
        'dina.gomes'
    ]
}

function getTabelaPaiFilho(referenciaTabela) {
    const referencia = String(referenciaTabela || '').trim()
    if (!referencia) return $()

    const porTablename = $(`table[tablename="${referencia}"]`)
    if (porTablename.length) return porTablename.first()

    const porId = $(`#${referencia}`)
    if (porId.length && porId.is('table')) return porId.first()

    return $()
}

function getLinhasPaiFilho(referenciaTabela) {
    const tabela = getTabelaPaiFilho(referenciaTabela)
    if (!tabela.length) return $()
    return tabela.find('tbody tr:not(:first)')
}

function inicializarSelectComBusca(selector, placeholder) {
    if (!podeEditarDadosSolucao(getActivity())) return

    const $select = $(selector)
    if (!$select.length || typeof $select.select2 !== 'function') return

    if ($select.hasClass('select2-hidden-accessible')) {
        $select.select2('destroy')
    }

    $select.select2({
        width: '100%',
        placeholder: placeholder || 'Selecione...',
        allowClear: true
    })
}

function prepararComboBaseSomenteLeitura() {
    const select = $('#comboBase')
    if (!select.length) return

    select.off('change.comboBase')

    const valorAtual = (select.val() || '').toString().trim()
    const nomeComboAtual = ($('#nomeDoCombo').val() || '').toString().trim()

    select.find('option').not(':first').remove()

    if (valorAtual) {
        const label = nomeComboAtual || valorAtual
        select.append('<option value="' + escaparHtml(valorAtual) + '" selected>' + escaparHtml(label) + '</option>')
    }

    select.prop('disabled', true)
}

function inicializarComboBase() {
    popularSelectComboBase()

    $('#comboBase')
        .off('change.comboBase')
        .on('change.comboBase', async function () {
            const documentId = ($(this).val() || '').toString().trim()
            if (!documentId) return
            await replicarComboPredefinido(documentId)
        })
}

function popularSelectComboBase() {
    const select = $('#comboBase')
    if (!select.length) return

    select.empty().append('<option value="" disabled selected>Modelo pronto de combos</option>')

    let values = []
    try {
        const ds = getDataset('dsFormInternoLayoutDeSolucoes', { 'metadata#active': 'true', tipoDeLayout: 'Combo-Layout' })
        values = ds && ds.values ? ds.values : []
    } catch (e) {
        console.error('Erro ao consultar dsFormInternoLayoutDeSolucoes', e)
    }

    const combos = []
    const idsUnicos = new Set()

    values.forEach((item) => {
        const documentId = String(item.documentid || item.documentId || item['metadata#id'] || '').trim()
        if (!documentId || idsUnicos.has(documentId)) return

        const nomeCombo = String(item.nomeDoCombo || item.nomeCombo || item.nome_combo || `Combo ${documentId}`).trim()
        combos.push({ documentId, nomeCombo })
        idsUnicos.add(documentId)
    })

    combos.sort((a, b) => a.nomeCombo.localeCompare(b.nomeCombo, 'pt-BR'))

    combos.forEach((combo) => {
        select.append(`<option value="${combo.documentId}">${escaparHtml(combo.nomeCombo)}</option>`)
    })
}

function isEventoSebraernSelecionado() {
    return ($('#eventoSelecionado').val() || '').trim() === 'Evento-SebraeRN'
}

function getModoEntradaSebraern() {
    const valor = ($('#modoEntradaSebraern').val() || '').toString().trim().toLowerCase()
    return valor === 'solucao' ? 'solucao' : 'combo'
}

function isModoComboSebraern() {
    return getModoEntradaSebraern() === 'combo'
}

function normalizarSentidoTrajeto(valor) {
    const texto = normalizarTextoComparacao(valor)
    if (texto === 'volta') return 'volta'
    return 'ida'
}

function formatarSentidoTrajetoLabel(valor) {
    return normalizarSentidoTrajeto(valor) === 'volta' ? 'Volta' : 'Ida'
}

function isServicoGratuitoSE(valor) {
    const texto = normalizarTextoComparacao(valor)
    return texto === 'sim' || texto === 'true' || texto === '1'
}

function carregarNomesSolucoesSebraern(force) {
    if (!force && cacheNomesSolucoesSebraern.carregado) return cacheNomesSolucoesSebraern.itens

    const itens = []
    const chaves = {}

    try {
        const ds = getDataset('dsFormInternoLayoutDeSolucoes', { 'metadata#active': 'true', tipoDeLayout: 'Solucao-Layout' })
        const values = ds && ds.values ? ds.values : []

        values.forEach((item) => {
            const nome = String(item.nomeDoCombo || item.nomeSolucaoSL || item.nomeSolucao || item.nome || '').trim()
            if (!nome) return

            const chave = nome.toLowerCase()
            if (chaves[chave]) return

            itens.push(nome)
            chaves[chave] = true
        })
    } catch (e) {
        console.error('Erro ao consultar soluções SebraeRN no dsFormInternoLayoutDeSolucoes', e)
    }

    itens.sort(function (a, b) {
        return String(a || '').localeCompare(String(b || ''), 'pt-BR')
    })

    cacheNomesSolucoesSebraern.itens = itens
    cacheNomesSolucoesSebraern.carregado = true
    return itens
}

async function localizarSolucaoSebraernPorNome(nomeSolucaoSelecionada) {
    const nomeAlvo = normalizarTextoComparacao(nomeSolucaoSelecionada)
    if (!nomeAlvo) return null

    let values = []
    try {
        const ds = getDataset('dsFormInternoLayoutDeSolucoes', { 'metadata#active': 'true', tipoDeLayout: 'Solucao-Layout' })
        values = ds && ds.values ? ds.values : []
    } catch (e) {
        console.error('Erro ao consultar dsFormInternoLayoutDeSolucoes para localizar solução SebraeRN.', e)
        return null
    }

    const documentos = []
    const docsUnicos = {}

    for (let i = 0; i < values.length; i++) {
        const row = values[i]
        const docId = String(row.documentid || row.documentId || row['metadata#id'] || '').trim()
        if (!docId || docsUnicos[docId]) continue
        docsUnicos[docId] = true
        documentos.push(docId)
    }

    for (let d = 0; d < documentos.length; d++) {
        const documentId = documentos[d]
        const linhasSolucoes = await obterLinhasPaiFilhoCombo(documentId, 'solucoes')

        for (let i = 0; i < linhasSolucoes.length; i++) {
            const linha = linhasSolucoes[i]
            const nomeLinha = String(mapearCampoLinha(linha, 'nomeSolucaoSL') || '').trim()
            if (!nomeLinha) continue

            if (normalizarTextoComparacao(nomeLinha) === nomeAlvo) {
                return {
                    documentId,
                    idSolucaoOrigem: String(mapearCampoLinha(linha, 'idSolucaoSL') || '').trim(),
                    linhaPai: linha
                }
            }
        }
    }

    return null
}

function removerLinhasDaAbaPorRelacionamento(tablename, campoRelacionamento, idAba) {
    const id = String(idAba || '').trim()
    if (!id) return

    getLinhasPaiFilho(tablename).each(function () {
        const idLinha = String($(this).find(`input[name^="${campoRelacionamento}___"]`).val() || '').trim()
        if (idLinha !== id) return

        const input = $(this).find('input').first()[0]
        if (input && typeof fnWdkRemoveChild === 'function') {
            fnWdkRemoveChild(input)
        } else {
            $(this).remove()
        }
    })
}

async function aplicarSolucaoSebraernNaAba(idAba, referenciaSolucao) {
    if (!idAba || !referenciaSolucao || !referenciaSolucao.documentId || !referenciaSolucao.idSolucaoOrigem) return

    const trPai = getLinhasPaiFilho('solucoes')
        .filter(function () {
            return ($(this).find("input[name^='idSolucaoSL___']").val() || '') === idAba
        })
        .first()
    if (!trPai.length) return

    const rowIdPai = (trPai.find('input').first().attr('name') || '').split('___')[1]
    if (!rowIdPai) return

    const linhaPai = referenciaSolucao.linhaPai || {}
    const nome = String(mapearCampoLinha(linhaPai, 'nomeSolucaoSL') || '').trim()
    const descricao = String(mapearCampoLinha(linhaPai, 'descricaoSL') || '').trim()
    const participantes = String(mapearCampoLinha(linhaPai, 'quantidadeParticipantesSL') || '').trim()

    $(`input[name="nomeSolucaoSL___${rowIdPai}"]`).val(nome).trigger('change')
    $(`input[name="descricaoSL___${rowIdPai}"]`).val(descricao).trigger('change')
    $(`input[name="quantidadeParticipantesSL___${rowIdPai}"]`).val(participantes).trigger('change')

    for (let i = 0; i < tabelasFilhas.length; i++) {
        removerLinhasDaAbaPorRelacionamento(tabelasFilhas[i].nome, tabelasFilhas[i].campoId, idAba)
    }
    removerLinhasDaAbaPorRelacionamento(TAB_PESSOAS, 'idSolucaoCN', idAba)
    removerLinhasDaAbaPorRelacionamento(TAB_PESSOAS_LEGADO, 'idSolucaoCN', idAba)
    removerLinhasDaAbaPorRelacionamento('deslocamento', 'idSolucaoDC', idAba)

    const idSolucaoOrigem = referenciaSolucao.idSolucaoOrigem

    for (let i = 0; i < tabelasFilhas.length; i++) {
        const tabela = tabelasFilhas[i]
        const linhasTabela = await obterLinhasPaiFilhoCombo(referenciaSolucao.documentId, tabela.nome)

        for (let j = 0; j < linhasTabela.length; j++) {
            const linha = linhasTabela[j]
            const idOrigemLinha = String(mapearCampoLinha(linha, tabela.campoId) || '').trim()
            if (idOrigemLinha !== idSolucaoOrigem) continue

            const rowIdNovo = wdkAddChild(tabela.nome)
            preencherLinhaFilhaAPartirDataset(tabela.nome, rowIdNovo, linha, idAba, tabela.campoId)
            if (tabela.campoOrigem) {
                $(`input[name="${tabela.campoOrigem}___${rowIdNovo}"]`).val('combo').trigger('change')
            }
        }
    }

    const mapaConsultor = {}
    let primeiroConsultorNovo = ''
    const linhasConsultores = await obterLinhasPessoasCombo(referenciaSolucao.documentId)
    for (let i = 0; i < linhasConsultores.length; i++) {
        const linha = linhasConsultores[i]
        const idOrigemLinha = String(mapearCampoLinha(linha, 'idSolucaoCN') || '').trim()
        if (idOrigemLinha !== idSolucaoOrigem) continue

        const idConsultorOrigem = String(mapearCampoLinha(linha, 'idPessoaCN') || mapearCampoLinha(linha, 'idConsultorCN') || '').trim()
        const idConsultorNovo = gerarIdConsultor()
        const rowIdNovo = wdkAddChild(TAB_PESSOAS)
        if (!primeiroConsultorNovo) {
            primeiroConsultorNovo = idConsultorNovo
        }

        $(`input[name="nomePessoaCN___${rowIdNovo}"]`)
            .val(mapearCampoLinha(linha, 'nomePessoaCN') || mapearCampoLinha(linha, 'nomeConsultorCN') || 'Consultor')
            .trigger('change')
        $(`input[name="tipoPessoaCN___${rowIdNovo}"]`)
            .val(mapearCampoLinha(linha, 'tipoPessoaCN') || 'Consultor')
            .trigger('change')
        $(`input[name="bonificacaoCN___${rowIdNovo}"]`)
            .val(mapearCampoLinha(linha, 'bonificacaoCN') || '')
            .trigger('change')
        $(`input[name="custoTrajetosCN___${rowIdNovo}"]`)
            .val(mapearCampoLinha(linha, 'custoTrajetosCN') || formatarMoedaNumero(0))
            .trigger('change')
        $(`input[name="valorBonificacaoCN___${rowIdNovo}"]`)
            .val(mapearCampoLinha(linha, 'valorBonificacaoCN') || mapearCampoLinha(linha, 'bonificacaoCN') || formatarMoedaNumero(0))
            .trigger('change')
        $(`input[name="valorTotalPessoaCN___${rowIdNovo}"]`)
            .val(mapearCampoLinha(linha, 'valorTotalPessoaCN') || mapearCampoLinha(linha, 'bonificacaoCN') || formatarMoedaNumero(0))
            .trigger('change')
        $(`input[name="idPessoaCN___${rowIdNovo}"]`).val(idConsultorNovo).trigger('change')
        $(`input[name="idSolucaoCN___${rowIdNovo}"]`).val(idAba).trigger('change')
        $(`input[name="origemCN___${rowIdNovo}"]`).val('combo').trigger('change')

        if (idConsultorOrigem) {
            mapaConsultor[idConsultorOrigem] = idConsultorNovo
        }
    }

    const linhasDeslocamento = await obterLinhasPaiFilhoCombo(referenciaSolucao.documentId, 'deslocamento')
    for (let i = 0; i < linhasDeslocamento.length; i++) {
        const linha = linhasDeslocamento[i]
        const idOrigemLinha = String(mapearCampoLinha(linha, 'idSolucaoDC') || '').trim()
        if (idOrigemLinha !== idSolucaoOrigem) continue

        const idConsultorOrigem = String(mapearCampoLinha(linha, 'idPessoaDC') || mapearCampoLinha(linha, 'idConsultorDC') || '').trim()
        const idConsultorNovo = mapaConsultor[idConsultorOrigem] || primeiroConsultorNovo || ''
        const rowIdNovo = wdkAddChild('deslocamento')

        $(`input[name="localOrigemDC___${rowIdNovo}"]`)
            .val(mapearCampoLinha(linha, 'localOrigemDC') || '')
            .trigger('change')
        $(`input[name="localDestinoDC___${rowIdNovo}"]`)
            .val(mapearCampoLinha(linha, 'localDestinoDC') || '')
            .trigger('change')
        $(`input[name="sentidoDC___${rowIdNovo}"]`)
            .val(formatarSentidoTrajetoLabel(mapearCampoLinha(linha, 'sentidoDC') || 'Ida'))
            .trigger('change')
        $(`input[name="distanciaDC___${rowIdNovo}"]`)
            .val(mapearCampoLinha(linha, 'distanciaDC') || '')
            .trigger('change')
        $(`input[name="valorDC___${rowIdNovo}"]`)
            .val(mapearCampoLinha(linha, 'valorDC') || '')
            .trigger('change')
        $(`input[name="idPessoaDC___${rowIdNovo}"]`).val(idConsultorNovo).trigger('change')
        $(`input[name="idSolucaoDC___${rowIdNovo}"]`).val(idAba).trigger('change')
        $(`input[name="origemDC___${rowIdNovo}"]`).val('combo').trigger('change')
    }

    ativarAba(idAba)
}

function limparDadosAtuaisPrecificacao() {
    const tabelas = ['solucoes', 'deslocamento', TAB_PESSOAS, TAB_PESSOAS_LEGADO, 'ins', ...tabelasFilhas.map((t) => t.nome)]

    tabelas.forEach((tablename) => {
        getLinhasPaiFilho(tablename).each(function () {
            const input = $(this).find('input').first()[0]
            if (input && typeof fnWdkRemoveChild === 'function') {
                fnWdkRemoveChild(input)
            } else {
                $(this).remove()
            }
        })
    })

    $('.tab-solucao').remove()
    $('#painel-dados-pai').empty()
    tabelasFilhas.forEach((tabela) => {
        $(`#visual_${tabela.nome} tbody`).empty()
        atualizarMensagemVaziaTabela(tabela.nome)
    })

    abaAtiva = null
    $('#conteudo-tabelas-visuais').hide()

    Object.keys(bloqueioNomeSolucaoPorId).forEach(function (id) {
        delete bloqueioNomeSolucaoPorId[id]
    })

    Object.keys(nomeSolucaoAutoGeradoPorId).forEach(function (id) {
        delete nomeSolucaoAutoGeradoPorId[id]
    })
}

function resetarDadosAoTrocarContextoEvento() {
    limparDadosAtuaisPrecificacao()

    const comboBase = $('#comboBase')
    if (comboBase.length) {
        comboBase.prop('selectedIndex', 0)
        comboBase.val('')
        comboBase.trigger('change')
    }

    $('#nomeDoCombo, #descricaoDoCombo').val('').trigger('change')

    $('#rf-solucao-nome').text('-')
    $('#rf-participantes').text('0')
    $('#rf-total-proposta-num').text('R$ 0,00')
    $('#rf-preco-participante-num').text('R$ 0,00')
    $('#rf-preco-com-subsidio').text('R$ 0,00')
    $('#rf-valor-descontado').text('R$ 0,00')
    $('#rf-valor-por-pessoa').text('R$ 0,00')
    $('#rf-margem-lucro').text('0,00%').removeClass('rf-margem-positiva rf-margem-negativa').addClass('rf-margem-neutra')
    $('#valorTotalSugeridoCombo').val('R$ 0,00').trigger('change')

    atualizarCardLucroMercado(0, 0, 0, 0)

    $('#rf-in-lista').html('<p class="pd-vazio">Adicione itens de Serviços Especializados para simular a faixa de precificação (IN).</p>')
    $('#pd-lista-solucoes').html('<p class="pd-vazio">Nenhuma solução adicionada.</p>')

    $('#pd-total-desconto').text('R$ 0,00')
    $('#pd-media-in').text('R$ 0,00')
    $('#pd-bruta-total').text('R$ 0,00')
    $('#pd-desconto-total').text('R$ 0,00')
    $('#pd-num-pessoas').text('0')
    $('#pd-carga-horaria').text('0')
    $('#margemLucroGeral').val('0,00%').trigger('change')

    const margemLucroGeralEl = $('#pd-margem-lucro')
    margemLucroGeralEl.removeClass('rf-margem-positiva rf-margem-negativa rf-margem-neutra').addClass('rf-margem-neutra').text('0,00%')
}

function obterLinhasComboNoDataset(documentId) {
    const tentativas = [{ documentid: documentId }, { documentId: documentId }, { 'metadata#id': documentId }]

    for (let i = 0; i < tentativas.length; i++) {
        try {
            const ds = getDataset('dsFormInternoLayoutDeSolucoes', tentativas[i])
            if (ds && ds.values && ds.values.length) {
                return ds.values
            }
        } catch (e) {
            console.error('Erro ao consultar dsFormInternoLayoutDeSolucoes', e)
        }
    }

    return []
}

async function obterLinhasPaiFilhoCombo(documentId, tablename) {
    const nomeDataset = 'dsFormInternoLayoutDeSolucoes'

    try {
        const c1 = DatasetFactory.createConstraint('documentid', String(documentId), String(documentId), ConstraintType.MUST)
        const c2 = DatasetFactory.createConstraint('tablename', tablename, tablename, ConstraintType.MUST)
        const constraints = [c1, c2]

        const dataset = await getDatasetPromise(nomeDataset, null, constraints, null)

        if (dataset && dataset.values && dataset.values.length > 0) {
            console.log(`Foram encontrados ${dataset.values.length} registros na tabela ${tablename} (documentid: ${documentId}).`)
            return dataset.values
        }
    } catch (erro) {
        console.error(`Erro ao consultar pai-filho (${tablename}) no dataset ${nomeDataset}:`, erro)
    }

    return []
}

async function obterLinhasPessoasCombo(documentId) {
    let linhas = await obterLinhasPaiFilhoCombo(documentId, TAB_PESSOAS)
    if (!linhas.length) {
        linhas = await obterLinhasPaiFilhoCombo(documentId, TAB_PESSOAS_LEGADO)
    }
    return linhas
}

function criarLoadingFluig(textMessage = 'Carregando combo...') {
    if (typeof FLUIGC === 'undefined' || typeof FLUIGC.loading !== 'function') {
        return null
    }

    try {
        return FLUIGC.loading(window, { textMessage })
    } catch (e) {
        try {
            return FLUIGC.loading('#precificacao-de-solucoes', { textMessage })
        } catch (e2) {
            return null
        }
    }
}

async function calcularDistanciaEndPoint(trajetos = []) {
    const listaTrajetos = Array.isArray(trajetos) ? trajetos : []

    if (!listaTrajetos.length) {
        return {
            status: 'error',
            message: 'Informe ao menos um trajeto para calcular a distância.',
            data: [],
            raw: null
        }
    }

    try {
        const response = await fetch('/fluighub/rest/service/execute/distancia', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                CODCOLIGADA: '0'
            },
            body: JSON.stringify({ data: listaTrajetos })
        })

        let payload = null
        try {
            payload = await response.json()
        } catch (parseError) {
            const texto = await response.text()
            return {
                status: 'error',
                message: `Resposta inválida do endpoint de distância (HTTP ${response.status}).`,
                data: [],
                raw: texto || null
            }
        }

        if (!response.ok) {
            return {
                status: 'error',
                message: payload && payload.message ? payload.message : `Erro HTTP ${response.status} ao calcular distância.`,
                data: [],
                raw: payload
            }
        }

        if (!payload || payload.error === true || payload.code !== 200 || !Array.isArray(payload.data)) {
            return {
                status: 'error',
                message: payload && payload.message ? payload.message : 'Erro ao calcular distância no FluigHub.',
                data: [],
                raw: payload
            }
        }

        const data = payload.data.map((item) => ({
            origem: item.origem || '',
            destino: item.destino || '',
            distancia: item.distancia || ''
        }))

        console.log('Retorno da API:')
        console.log(data)
        return {
            status: 'success',
            message: 'Distância calculada com sucesso.',
            data,
            raw: payload
        }
    } catch (erro) {
        console.error('[calcularDistanciaEndPoint] Erro:', erro)
        return {
            status: 'error',
            message: erro && erro.message ? erro.message : String(erro),
            data: [],
            raw: null
        }
    }
}

function extrairTabelaDaLinhaDataset(linha) {
    return String(linha.tablename || linha.tableName || linha.tabela || linha.nomeTabela || '')
        .trim()
        .toLowerCase()
}

function mapearCampoLinha(linha, nomeCampo) {
    if (linha[nomeCampo] != null) return linha[nomeCampo]

    const alvo = nomeCampo.toLowerCase()
    const chaveEncontrada = Object.keys(linha).find((key) => {
        const k = key.toLowerCase()
        return k === alvo || k.endsWith(`_${alvo}`) || k.endsWith(`.${alvo}`)
    })
    return chaveEncontrada ? linha[chaveEncontrada] : ''
}

function normalizarChaveRelacao(valor) {
    return String(valor == null ? '' : valor)
        .trim()
        .toLowerCase()
}

function montarChaveRelacao(...valores) {
    return valores.map((v) => normalizarChaveRelacao(v)).join('||')
}

function obterCamposBaseTabela(tablename) {
    const campos = []
    const tabela = getTabelaPaiFilho(tablename)
    if (!tabela.length) return campos

    tabela.find('tbody tr:first td input').each(function () {
        const nome = ($(this).attr('name') || '').trim()
        if (nome) campos.push(nome)
    })
    return campos
}

function preencherLinhaPaiAPartirDataset(rowIdNovo, linha, novoIdSolucao) {
    const camposPai = obterCamposBaseTabela('solucoes')

    camposPai.forEach((campo) => {
        const valor = mapearCampoLinha(linha, campo)
        $(`input[name="${campo}___${rowIdNovo}"]`).val(valor).trigger('change')
    })

    $(`input[name="idSolucaoSL___${rowIdNovo}"]`).val(novoIdSolucao).trigger('change')
}

function preencherLinhaFilhaAPartirDataset(tablename, rowIdNovo, linha, idSolucaoDestino, campoIdRelacionamento) {
    const camposBase = obterCamposBaseTabela(tablename)

    camposBase.forEach((campo) => {
        const valor = mapearCampoLinha(linha, campo)
        $(`input[name="${campo}___${rowIdNovo}"]`).val(valor).trigger('change')
    })

    $(`input[name="${campoIdRelacionamento}___${rowIdNovo}"]`).val(idSolucaoDestino).trigger('change')
}

async function replicarComboPredefinido(documentId) {
    if (typeof wdkAddChild !== 'function') {
        showToast('A replicação de combo só funciona no formulário em execução.', 'warning', 'Atenção')
        return
    }

    const loading = criarLoadingFluig('Aplicando combo predefinido...')
    if (loading && typeof loading.show === 'function') {
        loading.show()
    }

    try {
        console.log('Combo Selecionado:', documentId)
        const linhasPai = await obterLinhasPaiFilhoCombo(documentId, 'solucoes')

        console.log("Retorno da consulta da tabela 'solucoes':", linhasPai)

        if (!linhasPai.length) {
            showToast('O combo selecionado não possui linhas de soluções para replicar.', 'warning', 'Atenção')
            return
        }

        limparDadosAtuaisPrecificacao()

        const mapaIdSolucao = {}
        const idsCriados = []

        linhasPai.forEach((linhaPai, idx) => {
            const rowIdNovo = wdkAddChild('solucoes')
            const idOrigem = mapearCampoLinha(linhaPai, 'idSolucaoSL') || `origem_${idx}`
            const novoIdSolucao = gerarIdSequencial()

            preencherLinhaPaiAPartirDataset(rowIdNovo, linhaPai, novoIdSolucao)
            bloqueioNomeSolucaoPorId[novoIdSolucao] = true

            mapaIdSolucao[montarChaveRelacao(idOrigem)] = novoIdSolucao
            idsCriados.push(novoIdSolucao)

            const nomeAba = $(`input[name="nomeSolucaoSL___${rowIdNovo}"]`).val() || `Solução ${idx + 1}`
            criarAba(novoIdSolucao, nomeAba)
        })

        for (const tabela of tabelasFilhas) {
            const linhasFilhas = await obterLinhasPaiFilhoCombo(documentId, tabela.nome)
            if (!linhasFilhas.length) continue

            linhasFilhas.forEach((linhaFilha) => {
                const idOrigem = mapearCampoLinha(linhaFilha, tabela.campoId) || ''
                const idSolucaoDestino = mapaIdSolucao[montarChaveRelacao(idOrigem)] || idsCriados[0]
                if (!idSolucaoDestino) return

                const rowIdNovo = wdkAddChild(tabela.nome)
                preencherLinhaFilhaAPartirDataset(tabela.nome, rowIdNovo, linhaFilha, idSolucaoDestino, tabela.campoId)
                if (tabela.campoOrigem) {
                    $(`input[name="${tabela.campoOrigem}___${rowIdNovo}"]`).val('combo').trigger('change')
                }
            })
        }

        // Replicar consultores
        const mapaIdConsultor = {}
        const mapaPrimeiroConsultorPorSolucao = {}
        const linhasConsultores = await obterLinhasPessoasCombo(documentId)
        linhasConsultores.forEach((linhaConsultor) => {
            const idConsultorOrigem = mapearCampoLinha(linhaConsultor, 'idPessoaCN') || mapearCampoLinha(linhaConsultor, 'idConsultorCN') || ''
            const idSolucaoOrigem = mapearCampoLinha(linhaConsultor, 'idSolucaoCN') || ''
            const idSolucaoDestino = mapaIdSolucao[montarChaveRelacao(idSolucaoOrigem)] || idsCriados[0]
            if (!idSolucaoDestino) return

            const idNovoConsultor = gerarIdConsultor()
            const rowId = wdkAddChild(TAB_PESSOAS)
            $(`input[name="nomePessoaCN___${rowId}"]`)
                .val(mapearCampoLinha(linhaConsultor, 'nomePessoaCN') || mapearCampoLinha(linhaConsultor, 'nomeConsultorCN') || 'Consultor')
                .trigger('change')
            $(`input[name="tipoPessoaCN___${rowId}"]`)
                .val(mapearCampoLinha(linhaConsultor, 'tipoPessoaCN') || 'Consultor')
                .trigger('change')
            $(`input[name="bonificacaoCN___${rowId}"]`)
                .val(mapearCampoLinha(linhaConsultor, 'bonificacaoCN') || '')
                .trigger('change')
            $(`input[name="custoTrajetosCN___${rowId}"]`)
                .val(mapearCampoLinha(linhaConsultor, 'custoTrajetosCN') || formatarMoedaNumero(0))
                .trigger('change')
            $(`input[name="valorBonificacaoCN___${rowId}"]`)
                .val(mapearCampoLinha(linhaConsultor, 'valorBonificacaoCN') || mapearCampoLinha(linhaConsultor, 'bonificacaoCN') || formatarMoedaNumero(0))
                .trigger('change')
            $(`input[name="valorTotalPessoaCN___${rowId}"]`)
                .val(mapearCampoLinha(linhaConsultor, 'valorTotalPessoaCN') || mapearCampoLinha(linhaConsultor, 'bonificacaoCN') || formatarMoedaNumero(0))
                .trigger('change')
            $(`input[name="idPessoaCN___${rowId}"]`).val(idNovoConsultor).trigger('change')
            $(`input[name="idSolucaoCN___${rowId}"]`).val(idSolucaoDestino).trigger('change')
            $(`input[name="origemCN___${rowId}"]`).val('combo').trigger('change')
            const chaveConsultorComSolucao = montarChaveRelacao(idConsultorOrigem, idSolucaoOrigem)
            const chaveConsultorApenas = montarChaveRelacao(idConsultorOrigem)
            mapaIdConsultor[chaveConsultorComSolucao] = idNovoConsultor
            if (!mapaIdConsultor[chaveConsultorApenas]) {
                mapaIdConsultor[chaveConsultorApenas] = idNovoConsultor
            }
            if (!mapaPrimeiroConsultorPorSolucao[idSolucaoDestino]) {
                mapaPrimeiroConsultorPorSolucao[idSolucaoDestino] = idNovoConsultor
            }
        })

        // Replicar trajetos de deslocamento
        const linhasDeslocamento = await obterLinhasPaiFilhoCombo(documentId, 'deslocamento')
        linhasDeslocamento.forEach((linhaDeslocamento) => {
            const idConsultorOrigem = mapearCampoLinha(linhaDeslocamento, 'idPessoaDC') || mapearCampoLinha(linhaDeslocamento, 'idConsultorDC') || ''
            const idSolucaoOrigem = mapearCampoLinha(linhaDeslocamento, 'idSolucaoDC') || ''
            const idSolucaoDestino = mapaIdSolucao[montarChaveRelacao(idSolucaoOrigem)] || idsCriados[0]
            const idConsultorDestino =
                mapaIdConsultor[montarChaveRelacao(idConsultorOrigem, idSolucaoOrigem)] ||
                mapaIdConsultor[montarChaveRelacao(idConsultorOrigem)] ||
                mapaPrimeiroConsultorPorSolucao[idSolucaoDestino] ||
                ''
            if (!idSolucaoDestino) return

            const rowId = wdkAddChild('deslocamento')
            $(`input[name="localOrigemDC___${rowId}"]`)
                .val(mapearCampoLinha(linhaDeslocamento, 'localOrigemDC') || '')
                .trigger('change')
            $(`input[name="localDestinoDC___${rowId}"]`)
                .val(mapearCampoLinha(linhaDeslocamento, 'localDestinoDC') || '')
                .trigger('change')
            $(`input[name="sentidoDC___${rowId}"]`)
                .val(formatarSentidoTrajetoLabel(mapearCampoLinha(linhaDeslocamento, 'sentidoDC') || 'Ida'))
                .trigger('change')
            $(`input[name="distanciaDC___${rowId}"]`)
                .val(mapearCampoLinha(linhaDeslocamento, 'distanciaDC') || '')
                .trigger('change')
            $(`input[name="valorDC___${rowId}"]`)
                .val(mapearCampoLinha(linhaDeslocamento, 'valorDC') || '')
                .trigger('change')
            $(`input[name="idPessoaDC___${rowId}"]`).val(idConsultorDestino).trigger('change')
            $(`input[name="idSolucaoDC___${rowId}"]`).val(idSolucaoDestino).trigger('change')
            $(`input[name="origemDC___${rowId}"]`).val('combo').trigger('change')
        })

        if (idsCriados.length) {
            ativarAba(idsCriados[0])
        }

        const linhasCabecalho = obterLinhasComboNoDataset(documentId)
        const linhaCabecalhoCombo = linhasCabecalho[0] || linhasPai[0] || {}

        $('#nomeDoCombo')
            .val(mapearCampoLinha(linhaCabecalhoCombo, 'nomeDoCombo') || '')
            .trigger('change')
        $('#descricaoDoCombo')
            .val(mapearCampoLinha(linhaCabecalhoCombo, 'descricaoDoCombo') || '')
            .trigger('change')

        showToast('Combo predefinido aplicado com sucesso.', 'success', 'Sucesso')
    } finally {
        if (loading && typeof loading.hide === 'function') {
            loading.hide()
        }
    }
}

function montarEstruturaVisualBase() {
    let html = `
        <div id="tabs-solucoes">
            <ul class="nav nav-tabs" id="nav-tabs-solucoes">
                <li id="btn-add-solucao">
                    <a title="Nova solução" onclick="adicionarSolucao()">
                        <i class="flaticon flaticon-add-plus icon-sm"></i>
                    </a>
                </li>
            </ul>
        </div>
        <div id="conteudo-tabelas-visuais" style="display: none;">
            <div id="dados-gerais-solucao" class="dados-gerais-solucao">
                
                <div class="row" id="painel-dados-pai"></div>
            </div>
    `

    tabelasFilhas.forEach((tabela, idx) => {
        html += `
            <div class="sub-painel-acordion">
                <div class="header-sub-painel-acordion" onclick="toggleAcordion(this)">
                    <h3>${tabela.titulo}</h3>
                    <span class="header-total-badge" id="total-header-${tabela.nome}">R$ 0,00</span>
                    <span class="accordion-icon active"><i class="flaticon flaticon-chevron-down icon-md"></i></span>
                </div>
                <div class="body-sub-painel-acordion active" style="display: block;">
                    <hr style="margin-top: 0;">
                    <div class="linha-inclusao-item" id="form_visual_${tabela.nome}"></div>
                    <div class="tabela-scroll">
                        <table class="listaItens" id="visual_${tabela.nome}" style="width: 100%;">
                            <thead><tr id="thead_visual_${tabela.nome}"></tr></thead>
                            <tbody></tbody>
                        </table>
                    </div>
                </div>
            </div>
        `

        if (idx === 0) {
            html += `
            <div class="sub-painel-acordion" id="secao-deslocamento">
                <div class="header-sub-painel-acordion" onclick="toggleAcordion(this)">
                    <h3>Despesas Com Deslocamento</h3>
                    <span class="header-total-badge" id="total-header-deslocamento">R$ 0,00</span>
                    <span class="accordion-icon active"><i class="flaticon flaticon-chevron-down icon-md"></i></span>
                </div>
                <div class="body-sub-painel-acordion active" id="body-secao-deslocamento" style="display: block;">
                    <hr style="margin-top: 0;">
                    <div id="lista-pessoas-visual"></div>
                    <div class="form-adicionar-pessoa">
                        <input type="text" class="form-control" id="input-nome-nova-pessoa" placeholder="Nome da pessoa..." />
                        <select class="form-control" id="input-tipo-nova-pessoa">
                            <option value="Consultor">Consultor</option>
                            <option value="Instrutor">Instrutor</option>
                        </select>
                        <button type="button" class="btn-adicionar-item" onclick="adicionarConsultorPeloInput()">
                            <i class="flaticon flaticon-add-plus icon-sm"></i> Adicionar Pessoa
                        </button>
                    </div>
                </div>
            </div>
            `
        }
    })

    html += `
            <div id="painel-resumo-financeiro" class="painel-resumo-financeiro">
                <div class="rf-topo">
                    <div class="rf-titulo-grupo">
                        <div class="rf-titulo-icone">
                            <i class="flaticon flaticon-invoices-check icon-md" aria-hidden="true"></i>
                        </div>
                        <div class="rf-titulo-texto">
                            <h3>RESUMO FINANCEIRO</h3>
                        </div>
                    </div>
                </div>

                <div class="rf-info-row">
                    <div class="rf-info-item">
                        <i class="flaticon flaticon-light-bulb icon-lg" aria-hidden="true"></i>
                        <div class="rf-info-text">
                            <small>Solução ativa</small>
                            <strong id="rf-solucao-nome">-</strong>
                        </div>
                    </div>
                    <div class="rf-info-item">
                        <i class="flaticon flaticon-supervisor-account icon-lg" aria-hidden="true"></i>
                        <div class="rf-info-text">
                            <small>Participantes</small>
                            <strong><span id="rf-participantes">0</span> Integrantes</strong>
                        </div>
                    </div>
                </div>

                <div class="rf-valores-e-in">
                    <div class="rf-coluna-valores">
                        <div class="rf-valores-box">
                            <small>CUSTOS DA SOLUÇÃO</small>
                            <strong id="rf-total-proposta-num">R$ 0,00</strong>
                            <div class="pd-media-in">
                                <span id="rf-label-preco-principal">Precificação sugerida</span>
                                <strong id="rf-preco-participante-num">R$ 0,00</strong>
                            </div>
                        </div>

                        <div class="rf-complementar">
                            <div class="rf-card-info">
                                <div class="rf-linha-info rf-linha-mercado" style="display: none;">
                                    <div class="rf-info-left">
                                        <span class="rf-info-icon">
                                            <i class="flaticon flaticon-cash icon-sm" aria-hidden="true"></i>
                                        </span>
                                        <span>Precificação sugerida com subsídio</span>
                                    </div>
                                    <strong id="rf-preco-com-subsidio">R$ 0,00</strong>
                                </div>
                                <div class="rf-linha-info">
                                    <div class="rf-info-left">
                                        <span class="rf-info-icon">
                                            <i class="flaticon flaticon-discount icon-sm" aria-hidden="true"></i>
                                        </span>
                                        <span id="rf-label-valor-descontado">Valor descontado da precificação sugerida</span>
                                    </div>
                                    <strong id="rf-valor-descontado">R$ 0,00</strong>
                                </div>
                                <div class="rf-linha-info rf-linha-nao-mercado">
                                    <div class="rf-info-left">
                                        <span class="rf-info-icon">
                                            <i class="flaticon flaticon-cash icon-sm" aria-hidden="true"></i>
                                        </span>
                                        <span id="rf-label-valor-pessoa">Valor por pessoa</span>
                                    </div>
                                    <strong id="rf-valor-por-pessoa">R$ 0,00</strong>
                                </div>
                                <div class="rf-linha-info rf-linha-nao-mercado">
                                    <div class="rf-info-left">
                                        <span class="rf-info-icon">
                                            <i class="flaticon flaticon-local-offer icon-sm" aria-hidden="true"></i>
                                        </span>
                                        <span id="rf-label-margem">Margem de lucro</span>
                                    </div>
                                    <strong id="rf-margem-lucro" class="rf-margem-neutra">0,00%</strong>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="rf-card-lucro-mercado" id="rf-card-lucro-mercado" style="display: none;">
                        <div class="rf-mercado-header">
                            <div class="rf-mercado-icone">
                                <i class="flaticon flaticon-local-offer icon-md" aria-hidden="true"></i>
                            </div>
                            <h4>Gestão de Lucro</h4>
                        </div>
                        <div class="rf-mercado-grid">
                            <div class="rf-mercado-field">
                                <label for="rf-lucro-percentual">MARGEM (%)</label>
                                <div class="rf-mercado-input-group">
                                    <input type="text" class="form-control" id="rf-lucro-percentual" value="0,00" />
                                    <span class="rf-mercado-addon">%</span>
                                </div>
                            </div>
                            <div class="rf-mercado-field">
                                <label for="rf-lucro-valor">VALOR DO LUCRO (R$)</label>
                                <div class="rf-mercado-input-group">
                                    <span class="rf-mercado-addon">R$</span>
                                    <input type="text" class="form-control" id="rf-lucro-valor" value="0,00" />
                                </div>
                            </div>
                            <div class="rf-mercado-field rf-mercado-field-full">
                                <label for="rf-subsidio-sebraern">SUBSÍDIO DO SEBRAERN (%)</label>
                                <div class="rf-mercado-input-group">
                                    <input type="text" class="form-control" id="rf-subsidio-sebraern" value="0,00" />
                                    <span class="rf-mercado-addon">%</span>
                                </div>
                            </div>
                        </div>
                        <div class="rf-mercado-resultados">
                            <div class="rf-mercado-rateio">
                                <div class="rf-mercado-rateio-info">
                                    <small>Sem subsídio</small>
                                    <span id="rf-mercado-rateio">Rateado para 0 integrantes</span>
                                </div>
                                <strong id="rf-mercado-valor-pessoa">R$ 0,00</strong>
                            </div>
                            <div class="rf-mercado-rateio rf-mercado-rateio-destaque">
                                <div class="rf-mercado-rateio-info">
                                    <small>Com subsídio</small>
                                    <span id="rf-mercado-subsidio-valor">Subsídio de R$ 0,00</span>
                                </div>
                                <strong id="rf-mercado-valor-pessoa-subsidio">R$ 0,00</strong>
                            </div>
                        </div>
                    </div>

                    <div class="rf-interna-in">
                        <div class="rf-tabela-wrap">
                            <h4 style="margin: 0 0 10px 0; color: #0d4f99; font-size: 16px; font-weight: 700;">Faixa de precificação (IN)</h4>
                            <div id="rf-in-lista" class="pd-lista">
                                <p class="pd-vazio">Adicione itens de Serviços Especializados para simular a faixa de precificação (IN).</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
    `

    html += `</div>`

    $('.tables').append(html)

    tabelasFilhas.forEach((tabela) => {
        let trOriginal = $(`table[tablename="${tabela.nome}"] thead tr`).first()
        let trVisual = $(`#thead_visual_${tabela.nome}`)
        const titulos = []

        trOriginal.find('th').each(function () {
            let texto = $(this).text().trim()
            if (texto && !texto.toLowerCase().includes('id da sol')) {
                titulos.push(texto)
                trVisual.append(`<th style="color: white; background-color: var(--azul); padding: 8px; white-space: nowrap;">${texto}</th>`)
            }
        })

        trVisual.append(`<th style="color: white; background-color: var(--azul); padding: 8px; text-align: center; width: 60px; white-space: nowrap;">Ação</th>`)

        const nomesBase = []
        $(`table[tablename="${tabela.nome}"] tbody tr:first td input`).each(function () {
            const nomeBase = $(this).attr('name')
            if (nomeBase && !nomeBase.toLowerCase().includes('idsolucao') && !nomeBase.toLowerCase().startsWith('origem')) {
                nomesBase.push(nomeBase)
            }
        })

        metadadosCamposFilhos[tabela.nome] = titulos.map((titulo, idx) => {
            const baseName = nomesBase[idx] || `campo${idx + 1}`
            return {
                titulo,
                baseName,
                tipo: inferirTipoCampo(titulo)
            }
        })

        renderizarFormularioEntradaTabela(tabela.nome, tabela.campoId)
        atualizarMensagemVaziaTabela(tabela.nome)
    })
}

function gerarIdConsultor() {
    let maxId = 0
    $("input[name^='idPessoaCN___']").each(function () {
        const valor = $(this).val()
        if (valor && valor.startsWith('c')) {
            const numero = parseInt(valor.substring(1), 10)
            if (!isNaN(numero) && numero > maxId) maxId = numero
        }
    })
    return 'c' + String(maxId + 1).padStart(5, '0')
}

function normalizarTipoPessoa(tipo) {
    const texto = normalizarTextoComparacao(tipo)
    if (texto.indexOf('instrutor') >= 0 || texto.indexOf('instrutoria') >= 0) return 'Instrutor'
    return 'Consultor'
}

function isInstrutor(tipo) {
    return normalizarTipoPessoa(tipo) === 'Instrutor'
}

function destinoEhNatal(destino) {
    const texto = normalizarTextoComparacao(destino)
    return /(^|\s)natal($|\s)/.test(texto)
}

function obterOrigemInicialTrajetosPessoa(idConsultor, idAba) {
    let origemInicial = ''

    $(`table[tablename="deslocamento"] tbody tr:not(:first)`).each(function () {
        if ($(this).find(`input[name^="idPessoaDC___"]`).val() !== idConsultor) return
        if ($(this).find(`input[name^="idSolucaoDC___"]`).val() !== idAba) return

        const origemLinha = normalizarLocalTrajeto($(this).find(`input[name^="localOrigemDC___"]`).val() || '')
        if (origemLinha) {
            origemInicial = origemLinha
            return false
        }
    })

    return origemInicial
}

function somarDistanciasInstrutor(idConsultor, idAba) {
    let totalKm = 0
    const origemInicial = obterOrigemInicialTrajetosPessoa(idConsultor, idAba)

    $(`table[tablename="deslocamento"] tbody tr:not(:first)`).each(function () {
        if ($(this).find(`input[name^="idPessoaDC___"]`).val() !== idConsultor) return
        if ($(this).find(`input[name^="idSolucaoDC___"]`).val() !== idAba) return

        const destino = $(this).find(`input[name^="localDestinoDC___"]`).val() || ''
        const destinoNormalizado = normalizarLocalTrajeto(destino)

        // Regra: ao retornar para o ponto de origem inicial, inicia volta.
        // Fecha o ciclo anterior e ignora este e os próximos trechos.
        if (origemInicial && destinoNormalizado && destinoNormalizado === origemInicial) {
            return false
        }

        const distancia = parseNumero($(this).find(`input[name^="distanciaDC___"]`).val() || '')
        totalKm += Number(distancia || 0)
    })

    return totalKm
}

function calcularBonificacaoPessoa(idConsultor, idAba, tipoPessoa) {
    if (!isInstrutor(tipoPessoa)) return 0

    const kmTotalInstrutor = somarDistanciasInstrutor(idConsultor, idAba)
    return kmTotalInstrutor > 0 ? Number(obterBonificacaoInstrutorPorDistanciaTotal(kmTotalInstrutor) || 0) : 0
}

function atualizarIndicadoresPessoaNoCard(idConsultor, tipoPessoa, bonificacaoValor) {
    const tipo = normalizarTipoPessoa(tipoPessoa)
    const elTipo = $(`#tipo-pessoa-${idConsultor}`)
    const elBonus = $(`#bonificacao-pessoa-${idConsultor}`)

    if (elTipo.length) elTipo.text(tipo)
    if (elBonus.length) elBonus.text(formatarMoedaNumero(Number(bonificacaoValor || 0)))
}

function obterRegistroConsultor(idConsultor, idAba) {
    const registro = { rowId: null, tipoPessoa: 'Consultor' }

    $(`table[tablename="${TAB_PESSOAS}"] tbody tr:not(:first)`).each(function () {
        if (registro.rowId) return

        const idConsultorLinha = $(this).find(`input[name^="idPessoaCN___"]`).val() || ''
        const idSolucaoLinha = $(this).find(`input[name^="idSolucaoCN___"]`).val() || ''
        if (idConsultorLinha !== idConsultor || idSolucaoLinha !== idAba) return

        const rowId = ($(this).find('input[name]').first().attr('name') || '').split('___')[1]
        registro.rowId = rowId
        registro.tipoPessoa = normalizarTipoPessoa($(this).find(`input[name^="tipoPessoaCN___"]`).val() || 'Consultor')
    })

    return registro
}

function atualizarTotaisConsultor(idConsultor, idAba) {
    const registroPessoa = obterRegistroConsultor(idConsultor, idAba)
    if (!registroPessoa.rowId) {
        return { custoTrajetos: 0, bonificacao: 0, totalConsultor: 0 }
    }

    let custoTrajetos = 0
    $(`table[tablename="deslocamento"] tbody tr:not(:first)`).each(function () {
        const idConsultorLinha = $(this).find(`input[name^="idPessoaDC___"]`).val() || ''
        const idSolucaoLinha = $(this).find(`input[name^="idSolucaoDC___"]`).val() || ''
        if (idConsultorLinha !== idConsultor || idSolucaoLinha !== idAba) return

        custoTrajetos += parseNumero($(this).find(`input[name^="valorDC___"]`).val() || 0)
    })

    const bonificacao = parseNumero($(`input[name="bonificacaoCN___${registroPessoa.rowId}"]`).val() || 0)
    const totalConsultor = custoTrajetos + bonificacao

    $(`input[name="custoTrajetosCN___${registroPessoa.rowId}"]`).val(formatarMoedaNumero(custoTrajetos)).trigger('change')
    $(`input[name="valorBonificacaoCN___${registroPessoa.rowId}"]`).val(formatarMoedaNumero(bonificacao)).trigger('change')
    $(`input[name="valorTotalPessoaCN___${registroPessoa.rowId}"]`).val(formatarMoedaNumero(totalConsultor)).trigger('change')

    $(`#custo-trajetos-pessoa-${idConsultor}`).text(formatarMoedaNumero(custoTrajetos))
    $(`#bonificacao-pessoa-total-${idConsultor}`).text(formatarMoedaNumero(bonificacao))
    $(`#total-consultor-pessoa-${idConsultor}`).text(formatarMoedaNumero(totalConsultor))

    return { custoTrajetos, bonificacao, totalConsultor }
}

function atualizarBonificacaoPessoa(idConsultor, idAba) {
    const registroPessoa = obterRegistroConsultor(idConsultor, idAba)

    if (!registroPessoa.rowId) return 0

    const bonificacao = calcularBonificacaoPessoa(idConsultor, idAba, registroPessoa.tipoPessoa)
    $(`input[name="bonificacaoCN___${registroPessoa.rowId}"]`).val(formatarMoedaNumero(bonificacao)).trigger('change')
    $(`input[name="valorBonificacaoCN___${registroPessoa.rowId}"]`).val(formatarMoedaNumero(bonificacao)).trigger('change')

    atualizarIndicadoresPessoaNoCard(idConsultor, registroPessoa.tipoPessoa, bonificacao)
    $(`#valoradicional-${idConsultor}`).val(formatarMoedaNumero(bonificacao))
    atualizarTotaisConsultor(idConsultor, idAba)

    return bonificacao
}

function adicionarConsultor(idAba, nomeConsultor, tipoPessoa) {
    if (!idAba) return
    if (formularioSomenteLeitura) return

    const nome = (nomeConsultor || 'Consultor').trim()
    const tipo = normalizarTipoPessoa(tipoPessoa)
    const idConsultor = gerarIdConsultor()

    const rowId = wdkAddChild(TAB_PESSOAS)
    $(`input[name="nomePessoaCN___${rowId}"]`).val(nome).trigger('change')
    $(`input[name="idPessoaCN___${rowId}"]`).val(idConsultor).trigger('change')
    $(`input[name="tipoPessoaCN___${rowId}"]`).val(tipo).trigger('change')
    $(`input[name="bonificacaoCN___${rowId}"]`).val(formatarMoedaNumero(0)).trigger('change')
    $(`input[name="custoTrajetosCN___${rowId}"]`).val(formatarMoedaNumero(0)).trigger('change')
    $(`input[name="valorBonificacaoCN___${rowId}"]`).val(formatarMoedaNumero(0)).trigger('change')
    $(`input[name="valorTotalPessoaCN___${rowId}"]`).val(formatarMoedaNumero(0)).trigger('change')
    $(`input[name="idSolucaoCN___${rowId}"]`).val(idAba).trigger('change')

    const lista = $('#lista-pessoas-visual')
    lista.find('.pessoa-vazio').remove()
    lista.append(renderizarCardConsultor(idConsultor, nome, idAba, false, tipo, 0))

    inicializarAutocompleteCidade(`origem-${idConsultor}`)
    inicializarAutocompleteCidade(`destino-${idConsultor}`)
}

function adicionarConsultorPeloInput() {
    const nome = ($('#input-nome-nova-pessoa').val() || '').trim()
    const tipoPessoa = ($('#input-tipo-nova-pessoa').val() || 'Consultor').trim()
    if (!nome) {
        showToast('Informe o nome da pessoa.', 'warning', 'Atenção')
        return
    }
    adicionarConsultor(abaAtiva, nome, tipoPessoa)
    $('#input-nome-nova-pessoa').val('')
    $('#input-tipo-nova-pessoa').val('Consultor')
}

function removerConsultor(idConsultorParaRemover) {
    let atividade = getActivity()

    if (atividade != 0 && atividade != 4 && atividade != 30) {
        return
    }

    $(`table[tablename="${TAB_PESSOAS}"] tbody tr:not(:first)`).each(function () {
        if ($(this).find(`input[name^="idPessoaCN___"]`).val() === idConsultorParaRemover) {
            fnWdkRemoveChild($(this).find('input')[0])
        }
    })

    $(`table[tablename="deslocamento"] tbody tr:not(:first)`).each(function () {
        if ($(this).find(`input[name^="idPessoaDC___"]`).val() === idConsultorParaRemover) {
            fnWdkRemoveChild($(this).find('input')[0])
        }
    })

    // Remove o card visual
    $(`#card-pessoa-${idConsultorParaRemover}`).remove()

    const lista = $('#lista-pessoas-visual')
    if (!lista.find('.pessoa-card').length) {
        lista.append('<p class="pessoa-vazio texto-vazio-tabela">Nenhuma pessoa adicionada.</p>')
    }

    if (abaAtiva) renderizarResumoFinanceiro(abaAtiva)
}

function renderizarCardConsultor(idConsultor, nomeConsultor, idAba, fromCombo = false, tipoPessoa = 'Consultor', bonificacao = 0) {
    const tipo = normalizarTipoPessoa(tipoPessoa)
    const bonificacaoFormatada = formatarMoedaNumero(Number(bonificacao || 0))
    const btnRemoverConsultor = fromCombo
        ? `<button type="button" class="btn-remover-pessoa btn-combo-locked" disabled title="Pessoa do combo predefinido — não pode ser removida"><i class="flaticon flaticon-trash icon-sm"></i> Remover</button>`
        : `<button type="button" class="btn-remover-pessoa" onclick="removerConsultor('${idConsultor}', '${idAba}')" title="Remover pessoa"><i class="flaticon flaticon-trash icon-sm"></i> Remover</button>`
    return `
        <div class="pessoa-card" id="card-pessoa-${idConsultor}" data-id="${idConsultor}" data-solucao="${idAba}">
            <div class="pessoa-card-header">
                <div class="pessoa-info">
                    <i class="flaticon flaticon-person icon-sm"></i>
                    <strong>${escaparHtml(nomeConsultor)}</strong>
                    <span class="pessoa-meta" id="tipo-pessoa-${idConsultor}">${escaparHtml(tipo)}</span>
                    <span class="pessoa-meta pessoa-meta-bonus">Bônus: <strong id="bonificacao-pessoa-${idConsultor}">${bonificacaoFormatada}</strong></span>
                </div>
                ${formularioSomenteLeitura ? '' : btnRemoverConsultor}
            </div>
            <div class="pessoa-trajetos-body">
                <div class="form-adicionar-trajeto" ${formularioSomenteLeitura ? 'style="display:none;"' : ''}>
                    <div class="trajeto-inputs">
                        <div class="campo-inclusao">
                            <label>Origem</label>
                            <input type="text" class="form-control" id="origem-${idConsultor}" placeholder="Ex: Natal, RN" />
                        </div>
                        <div class="campo-inclusao">
                            <label>Destino</label>
                            <input type="text" class="form-control" id="destino-${idConsultor}" placeholder="Ex: Recife, PE" />
                        </div>
                        <div class="campo-inclusao">
                            <label>Valor base por KM</label>
                            <input type="text" class="form-control" id="valorkm-${idConsultor}" readonly
                                   style="background:#f5f7f9; cursor:not-allowed;"
                                   value="${escaparHtml(obterValorBaseKmFormatado())}"
                                   placeholder="Automático" />
                        </div>
                        <div class="campo-inclusao">
                            <label>Distância (KM)</label>
                            <input type="text" class="form-control" id="distanciakm-${idConsultor}" readonly
                                   style="background:#f5f7f9; cursor:not-allowed;"
                                   placeholder="Automático" />
                        </div>
                        <div class="campo-inclusao">
                            <label>Total base x distância</label>
                            <input type="text" class="form-control" id="valortotalbase-${idConsultor}" readonly
                                   style="background:#f5f7f9; cursor:not-allowed;"
                                   placeholder="Automático" />
                        </div>
                        <div class="campo-inclusao campo-acao">
                            <label>&nbsp;</label>
                            <div style="display:flex; gap:8px;">
                                <button type="button" class="btn-adicionar-item" id="btn-calcular-trajeto-${idConsultor}" onclick="calcularTrajetoConsultor('${idConsultor}')">
                                    <i class="flaticon flaticon-calculator icon-sm"></i> Calcular
                                </button>
                                <button type="button" class="btn-adicionar-item" onclick="adicionarTrajeto('${idConsultor}', '${idAba}')">
                                    <i class="flaticon flaticon-add-plus icon-sm"></i> Adicionar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="aviso-trajeto-sentido" style="margin: 8px 0 10px; padding: 8px 10px; border-radius: 10px; border: 1px solid #f3c177; background: #fff4de; color: #8a4b08; font-size: 12px; line-height: 1.4;">
                    <i class="flaticon flaticon-info icon-xs" aria-hidden="true" style="margin-right:6px;"></i>
                    Cada trajeto considera somente um sentido (ida ou volta). Para ida e volta, cadastre dois trajetos.
                </div>
                <div class="tabela-scroll">
                    <table class="listaItens" style="width: 100%;">
                        <thead>
                            <tr>
                                <th>Origem</th>
                                <th>Destino</th>
                                <th>Sentido</th>
                                <th>Distância (km)</th>
                                <th>Valor Total</th>
                                <th style="text-align: center; width: 60px;">Ação</th>
                            </tr>
                        </thead>
                        <tbody id="tbody-trajetos-${idConsultor}">
                            <tr class="empty-state">
                                <td colspan="6" class="texto-vazio-tabela">Nenhum trajeto adicionado.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `
}

function inferirSentidoTrajetoAutomatico(idConsultor, idAba, origemAtual, destinoAtual) {
    const origemNormalizada = normalizarLocalTrajeto(origemAtual || '')
    const destinoNormalizado = normalizarLocalTrajeto(destinoAtual || '')
    const origemInicialExistente = obterOrigemInicialTrajetosPessoa(idConsultor, idAba)
    const origemInicial = origemInicialExistente || origemNormalizada

    if (origemInicial && destinoNormalizado && destinoNormalizado === origemInicial) {
        return 'Volta'
    }

    return 'Ida'
}

function destacarTrajetoOrigemInicial(idConsultor, idAba) {
    const tbody = $(`#tbody-trajetos-${idConsultor}`)
    if (!tbody.length) return

    tbody.find('tr.visual-row').removeClass('trajeto-origem-inicial')

    let rowIdOrigemInicial = ''
    $(`table[tablename="deslocamento"] tbody tr:not(:first)`).each(function () {
        if ($(this).find(`input[name^="idPessoaDC___"]`).val() !== idConsultor) return
        if ($(this).find(`input[name^="idSolucaoDC___"]`).val() !== idAba) return

        const nomePrimeiroInput = $(this).find('input').first().attr('name') || ''
        const rowId = nomePrimeiroInput.split('___')[1] || ''
        if (rowId) {
            rowIdOrigemInicial = rowId
            return false
        }
    })

    if (!rowIdOrigemInicial) return

    tbody.find(`tr.visual-row[data-rowid="${rowIdOrigemInicial}"]`).addClass('trajeto-origem-inicial')
}

async function adicionarTrajeto(idConsultor, idAba) {
    if (formularioSomenteLeitura) return
    const origem = ($(`#origem-${idConsultor}`).val() || '').trim()
    const destino = ($(`#destino-${idConsultor}`).val() || '').trim()
    const sentido = inferirSentidoTrajetoAutomatico(idConsultor, idAba, origem, destino)

    if (!origem || !destino) {
        showToast('Informe a origem e o destino.', 'warning', 'Atenção')
        return
    }

    // if (!validarFormatoLocalTrajeto(origem) || !validarFormatoLocalTrajeto(destino)) {
    //     showToast('Use o formato Cidade, UF nos campos de origem e destino (ex.: Natal, RN).', 'warning', 'Atenção')
    //     return
    // }

    const origemNormalizada = normalizarLocalTrajeto(origem)
    const destinoNormalizado = normalizarLocalTrajeto(destino)
    const chaveAtual = obterChaveTrajeto(origemNormalizada, destinoNormalizado)
    const botaoCalcular = $(`#btn-calcular-trajeto-${idConsultor}`)

    let distanciaKm = Number(botaoCalcular.data('distanciaKm') || 0)
    const chaveCacheBtn = String(botaoCalcular.data('distanciaKey') || '').trim()
    if (!distanciaKm || chaveCacheBtn !== chaveAtual) {
        showToast('Clique em Calcular antes de adicionar o trajeto.', 'warning', 'Atenção')
        return
    }

    const paramsDeslocamento = carregarParametrosDeslocamento()
    const valorBaseKm = Number(paramsDeslocamento.valorBaseKm || 0)
    if (!valorBaseKm) {
        showToast('Valor base por KM não configurado no formulário interno de parâmetros.', 'warning', 'Atenção')
        return
    }

    const valorTotal = distanciaKm * valorBaseKm
    $(`#distanciakm-${idConsultor}`).val(formatarDistanciaKm(distanciaKm))
    $(`#valortotalbase-${idConsultor}`).val(formatarMoedaNumero(distanciaKm * valorBaseKm))

    const rowId = wdkAddChild('deslocamento')
    $(`input[name="localOrigemDC___${rowId}"]`).val(origem).trigger('change')
    $(`input[name="localDestinoDC___${rowId}"]`).val(destino).trigger('change')
    $(`input[name="sentidoDC___${rowId}"]`).val(sentido).trigger('change')
    $(`input[name="distanciaDC___${rowId}"]`).val(formatarDistanciaKm(distanciaKm)).trigger('change')
    $(`input[name="valorDC___${rowId}"]`).val(formatarMoedaNumero(valorTotal)).trigger('change')
    $(`input[name="idPessoaDC___${rowId}"]`).val(idConsultor).trigger('change')
    $(`input[name="idSolucaoDC___${rowId}"]`).val(idAba).trigger('change')

    const tbody = $(`#tbody-trajetos-${idConsultor}`)
    tbody.find('tr.empty-state').remove()
    tbody.append(`
        <tr class="visual-row" data-rowid="${rowId}">
            <td>${escaparHtml(origem)}</td>
            <td>${escaparHtml(destino)}</td>
            <td>${escaparHtml(sentido)}</td>
            <td>${escaparHtml(formatarDistanciaKm(distanciaKm))}</td>
            <td>${formatarMoedaNumero(valorTotal)}</td>
            <td style="text-align: center;">
                <button type="button" class="btn btn-danger btn-sm" onclick="removerTrajeto('${idConsultor}', '${rowId}', '${idAba}')">
                    <i class="flaticon flaticon-trash icon-sm"></i>
                </button>
            </td>
        </tr>
    `)

    destacarTrajetoOrigemInicial(idConsultor, idAba)

    $(`#origem-${idConsultor}`).val('')
    $(`#destino-${idConsultor}`).val('')
    $(`#valorkm-${idConsultor}`).val(obterValorBaseKmFormatado())
    $(`#distanciakm-${idConsultor}`).val('')
    $(`#valortotalbase-${idConsultor}`).val('')
    botaoCalcular.removeData('distanciaKm').removeData('distanciaKey').attr('title', 'Calcular distância')

    atualizarBonificacaoPessoa(idConsultor, idAba)
    atualizarTotaisConsultor(idConsultor, idAba)

    renderizarResumoFinanceiro(idAba)
}

async function calcularTrajetoConsultor(idConsultor) {
    const origem = ($(`#origem-${idConsultor}`).val() || '').trim()
    const destino = ($(`#destino-${idConsultor}`).val() || '').trim()
    const campoDistanciaKm = $(`#distanciakm-${idConsultor}`)
    const campoTotalBase = $(`#valortotalbase-${idConsultor}`)
    const campoAdicional = $(`#valoradicional-${idConsultor}`)
    const botaoCalcular = $(`#btn-calcular-trajeto-${idConsultor}`)

    if (!origem || !destino) {
        showToast('Informe a origem e o destino para calcular.', 'warning', 'Atenção')
        campoDistanciaKm.val('')
        campoTotalBase.val('')
        campoAdicional.val('')
        botaoCalcular.removeData('distanciaKm').removeData('distanciaKey').attr('title', 'Calcular distância')
        return
    }

    const origemNormalizada = normalizarLocalTrajeto(origem)
    const destinoNormalizado = normalizarLocalTrajeto(destino)
    const retornoDistancia = await obterDistanciaKmTrajeto(origemNormalizada, destinoNormalizado, true)

    if (!retornoDistancia.ok) {
        showToast(retornoDistancia.message || 'Erro ao calcular distância.', 'error', 'Erro')
        campoDistanciaKm.val('')
        campoTotalBase.val('')
        campoAdicional.val('')
        botaoCalcular.removeData('distanciaKm').removeData('distanciaKey').attr('title', 'Calcular distância')
        return
    }

    const distanciaKm = Number(retornoDistancia.km || 0)
    const valorBaseKm = Number(carregarParametrosDeslocamento().valorBaseKm || 0)
    const totalBaseDistancia = valorBaseKm > 0 ? distanciaKm * valorBaseKm : 0
    const chave = obterChaveTrajeto(origemNormalizada, destinoNormalizado)

    campoDistanciaKm.val(formatarDistanciaKm(distanciaKm))
    campoTotalBase.val(totalBaseDistancia > 0 ? formatarMoedaNumero(totalBaseDistancia) : '')
    const idAba = String($(`#card-pessoa-${idConsultor}`).data('solucao') || '')
    if (idAba) {
        const bonificacaoAtual = atualizarBonificacaoPessoa(idConsultor, idAba)
        campoAdicional.val(formatarMoedaNumero(bonificacaoAtual))
    }
    botaoCalcular.data('distanciaKm', distanciaKm)
    botaoCalcular.data('distanciaKey', chave)
    botaoCalcular.attr('title', `Distância estimada: ${formatarDistanciaKm(distanciaKm)} km`)
}

function removerTrajeto(idConsultor, rowId, idAba) {
    let atividade = getActivity()

    if (atividade != 0 && atividade != 4 && atividade != 30) {
        return
    }

    const inputOculto = $(`table[tablename="deslocamento"] input[name$="___${rowId}"]`).first()
    if (inputOculto.length) fnWdkRemoveChild(inputOculto[0])

    $(`#tbody-trajetos-${idConsultor} tr[data-rowid="${rowId}"]`).remove()

    const tbody = $(`#tbody-trajetos-${idConsultor}`)
    if (!tbody.find('tr.visual-row').length) {
        tbody.append(`<tr class="empty-state"><td colspan="6" class="texto-vazio-tabela">Nenhum trajeto adicionado.</td></tr>`)
    } else {
        destacarTrajetoOrigemInicial(idConsultor, idAba)
    }

    atualizarBonificacaoPessoa(idConsultor, idAba)
    atualizarTotaisConsultor(idConsultor, idAba)

    if (abaAtiva) renderizarResumoFinanceiro(abaAtiva)
}

function renderizarSecaoDeslocamento(idAba) {
    const lista = $('#lista-pessoas-visual')
    lista.empty()

    const consultores = []
    $(`table[tablename="${TAB_PESSOAS}"] tbody tr:not(:first)`).each(function () {
        if ($(this).find(`input[name^="idSolucaoCN___"]`).val() !== idAba) return
        const idConsultor = $(this).find(`input[name^="idPessoaCN___"]`).val()
        const nome = $(this).find(`input[name^="nomePessoaCN___"]`).val() || 'Consultor'
        const tipoPessoa = $(this).find(`input[name^="tipoPessoaCN___"]`).val() || 'Consultor'
        const bonificacao = parseNumero($(this).find(`input[name^="bonificacaoCN___"]`).val() || 0)
        const fromCombo = $(this).find(`input[name^="origemCN___"]`).val() === 'combo'
        if (idConsultor) consultores.push({ idConsultor, nome, fromCombo, tipoPessoa, bonificacao })
    })

    if (!consultores.length) {
        lista.append('<p class="pessoa-vazio texto-vazio-tabela">Nenhuma pessoa adicionada.</p>')
        return
    }

    consultores.forEach(({ idConsultor, nome, fromCombo, tipoPessoa, bonificacao }) => {
        lista.append(renderizarCardConsultor(idConsultor, nome, idAba, fromCombo, tipoPessoa, bonificacao))

        if (!formularioSomenteLeitura) {
            inicializarAutocompleteCidade(`origem-${idConsultor}`)
            inicializarAutocompleteCidade(`destino-${idConsultor}`)
        }

        $(`table[tablename="deslocamento"] tbody tr:not(:first)`).each(function () {
            if ($(this).find(`input[name^="idPessoaDC___"]`).val() !== idConsultor) return
            if ($(this).find(`input[name^="idSolucaoDC___"]`).val() !== idAba) return

            const rowId = $(this).find('input').first().attr('name').split('___')[1]
            const origem = $(this).find(`input[name^="localOrigemDC___"]`).val() || ''
            const destino = $(this).find(`input[name^="localDestinoDC___"]`).val() || ''
            const sentido = formatarSentidoTrajetoLabel($(this).find(`input[name^="sentidoDC___"]`).val() || 'Ida')
            const distancia = $(this).find(`input[name^="distanciaDC___"]`).val() || ''
            const valor = $(this).find(`input[name^="valorDC___"]`).val() || ''
            const trajetoDoCombo = $(this).find(`input[name^="origemDC___"]`).val() === 'combo'
            const btnTrajeto = formularioSomenteLeitura
                ? `<button type="button" class="btn btn-secondary btn-sm" disabled title="Somente visualização"><i class="flaticon flaticon-trash icon-sm"></i></button>`
                : trajetoDoCombo
                  ? `<button type="button" class="btn btn-secondary btn-sm btn-combo-locked" disabled title="Trajeto do combo predefinido — não pode ser removido"><i class="flaticon flaticon-trash icon-sm"></i></button>`
                  : `<button type="button" class="btn btn-danger btn-sm" onclick="removerTrajeto('${idConsultor}', '${rowId}', '${idAba}')"><i class="flaticon flaticon-trash icon-sm"></i></button>`

            const tbody = $(`#tbody-trajetos-${idConsultor}`)
            tbody.find('tr.empty-state').remove()
            tbody.append(`
                <tr class="visual-row" data-rowid="${rowId}">
                    <td>${escaparHtml(origem)}</td>
                    <td>${escaparHtml(destino)}</td>
                    <td>${escaparHtml(sentido)}</td>
                    <td>${escaparHtml(distancia)}</td>
                    <td>${formatarMoedaVisual(valor)}</td>
                    <td style="text-align: center;">${btnTrajeto}</td>
                </tr>
            `)
        })

        destacarTrajetoOrigemInicial(idConsultor, idAba)

        if (fromCombo) {
            atualizarIndicadoresPessoaNoCard(idConsultor, tipoPessoa, bonificacao)
            $(`#valoradicional-${idConsultor}`).val(formatarMoedaNumero(Number(bonificacao || 0)))
            atualizarTotaisConsultor(idConsultor, idAba)
        } else {
            atualizarBonificacaoPessoa(idConsultor, idAba)
        }
    })
}

function coletarTotalDeslocamento(idAba) {
    let total = 0
    $(`table[tablename="deslocamento"] tbody tr:not(:first)`).each(function () {
        if ($(this).find(`input[name^="idSolucaoDC___"]`).val() !== idAba) return
        total += parseNumero($(this).find(`input[name^="valorDC___"]`).val() || '')
    })

    $(`table[tablename="${TAB_PESSOAS}"] tbody tr:not(:first)`).each(function () {
        if ($(this).find(`input[name^="idSolucaoCN___"]`).val() !== idAba) return
        total += parseNumero($(this).find(`input[name^="bonificacaoCN___"]`).val() || 0)
    })

    return total
}

// ── Autocomplete de cidades ──────────────────────────────────────────────────
let cidadesAutocompleteCache = null
const debounceDistanciaTrajeto = {}
const cacheDistanciaTrajeto = {}
const promessasDistanciaTrajeto = {}
const TEMPO_DEBOUNCE_DISTANCIA_MS = 900
const TTL_CACHE_DISTANCIA_MS = 30 * 60 * 1000

function carregarCidadesAutocomplete() {
    if (cidadesAutocompleteCache) return cidadesAutocompleteCache
    try {
        const ds = DatasetFactory.getDataset('dsConsultaCidades', null, null, null)
        cidadesAutocompleteCache = (ds.values || []).map(function (item) {
            return { description: item.CIDADE + ', ' + item.UF }
        })
    } catch (e) {
        console.error('Erro ao carregar cidades para autocomplete:', e)
        cidadesAutocompleteCache = []
    }
    return cidadesAutocompleteCache
}

function substringMatcherCidades(strs) {
    return function findMatches(q, cb) {
        const matches = []
        const substrRegex = new RegExp(q, 'i')
        $.each(strs, function (i, str) {
            if (substrRegex.test(str.description)) matches.push(str)
        })
        cb(matches)
    }
}

function inicializarAutocompleteCidade(inputId) {
    const $input = $(`#${inputId}`)
    if (!$input.length) return
    if ($input.data('acCidadeInit') === true) return

    const cidades = carregarCidadesAutocomplete()

    try {
        if (typeof FLUIGC !== 'undefined' && typeof FLUIGC.autocomplete === 'function') {
            FLUIGC.autocomplete(`#${inputId}`, {
                source: substringMatcherCidades(cidades),
                name: `autocidade-${inputId}`,
                displayKey: 'description',
                tagClass: 'tag-gray',
                type: 'autocomplete',
                maxTags: 1,
                allowDuplicates: false
            })
        } else if (typeof $input.autocomplete === 'function') {
            $input.autocomplete({
                source: cidades.map((c) => c.description),
                minLength: 2
            })
        }

        $input.data('acCidadeInit', true)
    } catch (e) {
        console.warn('Falha ao iniciar autocomplete de cidade:', inputId, e)
    }
}

function obterChaveTrajeto(origem, destino) {
    return `${String(origem || '')
        .trim()
        .toLowerCase()}||${String(destino || '')
        .trim()
        .toLowerCase()}`
}

function normalizarLocalTrajeto(valor) {
    const texto = String(valor || '')
        .trim()
        .replace(/\s+/g, ' ')

    if (!texto.includes(',')) return texto

    const partes = texto.split(',')
    const cidade = (partes[0] || '').trim()
    const uf = (partes[1] || '').trim().toUpperCase()
    return `${cidade} ${uf}`.trim()
}

function validarFormatoLocalTrajeto(valor) {
    const texto = normalizarLocalTrajeto(valor)
    const regex = /^[A-Za-zÀ-ÖØ-öø-ÿ'`´^~.-]+(?:\s+[A-Za-zÀ-ÖØ-öø-ÿ'`´^~.-]+)*,\s*[A-Za-z]{2}$/
    return regex.test(texto)
}

function formatarDistanciaKm(valorKm) {
    const n = Number(valorKm || 0)
    if (!n || isNaN(n)) return ''
    return n.toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })
}

async function obterDistanciaKmTrajeto(origem, destino, exibirLoading = false) {
    const origemNorm = normalizarLocalTrajeto(origem)
    const destinoNorm = normalizarLocalTrajeto(destino)
    const chave = obterChaveTrajeto(origemNorm, destinoNorm)

    const cache = cacheDistanciaTrajeto[chave]
    if (cache && Date.now() - cache.ts < TTL_CACHE_DISTANCIA_MS) {
        return { ok: true, km: cache.km, key: chave }
    }

    if (promessasDistanciaTrajeto[chave]) {
        return promessasDistanciaTrajeto[chave]
    }

    const promise = (async () => {
        let loading = null
        if (exibirLoading) {
            loading = criarLoadingFluig('Calculando distância...')
            if (loading && typeof loading.show === 'function') loading.show()
        }

        try {
            const resultado = await calcularDistanciaEndPoint([{ origem: origemNorm, destino: destinoNorm }])

            if (resultado.status !== 'success' || !resultado.data.length) {
                return { ok: false, km: 0, key: chave, message: resultado.message || 'Falha ao calcular distância.' }
            }

            const km = resultado.data[0].distancia
            console.log('Distancia da API:', km)

            if (!km || km <= 0) {
                return { ok: false, km: 0, key: chave, message: 'Distância inválida retornada pelo serviço.' }
            }

            cacheDistanciaTrajeto[chave] = { km, ts: Date.now() }
            return { ok: true, km, key: chave }
        } catch (e) {
            return { ok: false, km: 0, key: chave, message: e && e.message ? e.message : 'Erro ao consultar distância.' }
        } finally {
            if (loading && typeof loading.hide === 'function') loading.hide()
            delete promessasDistanciaTrajeto[chave]
        }
    })()

    promessasDistanciaTrajeto[chave] = promise
    return promise
}

function agendarCalculoDistanciaTrajeto(idConsultor) {
    if (debounceDistanciaTrajeto[idConsultor]) {
        clearTimeout(debounceDistanciaTrajeto[idConsultor])
    }

    debounceDistanciaTrajeto[idConsultor] = setTimeout(() => {
        calcularDistanciaTrajetoTempoReal(idConsultor)
    }, TEMPO_DEBOUNCE_DISTANCIA_MS)
}

async function calcularDistanciaTrajetoTempoReal(idConsultor) {
    const origem = ($(`#origem-${idConsultor}`).val() || '').trim()
    const destino = ($(`#destino-${idConsultor}`).val() || '').trim()
    const campoDistanciaKm = $(`#distanciakm-${idConsultor}`)
    const campoTotalBase = $(`#valortotalbase-${idConsultor}`)
    const campoAdicional = $(`#valoradicional-${idConsultor}`)
    const botaoTrajeto = $(`#btn-calcular-trajeto-${idConsultor}`)

    if (!origem || !destino) {
        campoDistanciaKm.val('')
        campoTotalBase.val('')
        campoAdicional.val('')
        botaoTrajeto.removeData('distanciaKm').removeData('distanciaKey').attr('title', 'Calcular e Adicionar')
        return
    }

    // if (!validarFormatoLocalTrajeto(origem) || !validarFormatoLocalTrajeto(destino)) {
    //     campoDistanciaKm.val('')
    //     campoTotalBase.val('')
    //     campoAdicional.val('')
    //     botaoTrajeto.removeData('distanciaKm').removeData('distanciaKey').attr('title', 'Calcular e Adicionar')
    //     return
    // }

    const origemNormalizada = normalizarLocalTrajeto(origem)
    const destinoNormalizado = normalizarLocalTrajeto(destino)
    const chave = obterChaveTrajeto(origemNormalizada, destinoNormalizado)
    const chaveNoBotao = String(botaoTrajeto.data('distanciaKey') || '').trim()
    const kmNoBotao = Number(botaoTrajeto.data('distanciaKm') || 0)

    if (chaveNoBotao === chave && kmNoBotao > 0) {
        return
    }

    const retornoDistancia = await obterDistanciaKmTrajeto(origemNormalizada, destinoNormalizado, true)
    if (!retornoDistancia.ok) {
        campoDistanciaKm.val('')
        campoTotalBase.val('')
        campoAdicional.val('')
        botaoTrajeto.removeData('distanciaKm').removeData('distanciaKey').attr('title', 'Calcular e Adicionar')
        return
    }

    const chaveAtualCampos = obterChaveTrajeto(normalizarLocalTrajeto($(`#origem-${idConsultor}`).val()), normalizarLocalTrajeto($(`#destino-${idConsultor}`).val()))
    if (chaveAtualCampos !== retornoDistancia.key) {
        return
    }

    const distanciaKm = Number(retornoDistancia.km || 0)
    const valorBaseKm = Number(carregarParametrosDeslocamento().valorBaseKm || 0)
    const totalBaseDistancia = valorBaseKm > 0 ? distanciaKm * valorBaseKm : 0
    const adicional = obterAdicionalDeslocamento(distanciaKm)

    campoDistanciaKm.val(formatarDistanciaKm(distanciaKm))
    campoTotalBase.val(totalBaseDistancia > 0 ? formatarMoedaNumero(totalBaseDistancia) : '')
    campoAdicional.val(formatarMoedaNumero(adicional))
    botaoTrajeto.data('distanciaKm', distanciaKm)
    botaoTrajeto.data('distanciaKey', chave)
    botaoTrajeto.attr('title', `Distância estimada: ${formatarDistanciaKm(distanciaKm)} km`)
}
// ──────────────────────────────────────────────────

function gerarIdSequencial() {
    let maxId = 0

    $("input[name^='idSolucaoSL___']").each(function () {
        let valor = $(this).val()
        if (valor && valor.startsWith('s')) {
            let numero = parseInt(valor.substring(1), 10)
            if (!isNaN(numero) && numero > maxId) {
                maxId = numero
            }
        }
    })

    maxId++
    return 's' + String(maxId).padStart(5, '0')
}

function adicionarSolucao() {
    let atividade = getActivity()
    if (atividade != 0 && atividade != 4 && atividade != 30) {
        return
    }

    let rowId = wdkAddChild('solucoes')
    let novoIdSequencial = gerarIdSequencial() // Gera s00001, s00002...
    let nomePadrao = 'Solução ' + parseInt(novoIdSequencial.replace('s', ''), 10)

    $('#idSolucaoSL___' + rowId).val(novoIdSequencial)
    $('#nomeSolucaoSL___' + rowId).val(nomePadrao)
    bloqueioNomeSolucaoPorId[novoIdSequencial] = false
    nomeSolucaoAutoGeradoPorId[novoIdSequencial] = true

    criarAba(novoIdSequencial, nomePadrao)
    ativarAba(novoIdSequencial)
}

function criarAba(id, nome) {
    let tabHtml = `
        <li class="nav-item tab-solucao" data-id="${id}">
            <a onclick="ativarAba('${id}')">
                <span class="tab-title">${nome}</span>
                <span class="tab-close-btn" onclick="removerSolucao(event, '${id}')">
                    <i class="flaticon flaticon-close icon-xs" aria-hidden="true"></i>
                </span>
            </a>
        </li>
    `
    $('#btn-add-solucao').before(tabHtml)
}

function ativarAba(idAbaSelecionada) {
    abaAtiva = idAbaSelecionada

    $('.tab-solucao').removeClass('tab-ativa')
    $(`.tab-solucao[data-id="${idAbaSelecionada}"]`).addClass('tab-ativa')

    $('#conteudo-tabelas-visuais').show()
    renderizarDadosTabelaPai(idAbaSelecionada)
    renderizarResumoFinanceiro(idAbaSelecionada)

    tabelasFilhas.forEach((tabela) => {
        $(`#visual_${tabela.nome} tbody`).empty()
        atualizarMensagemVaziaTabela(tabela.nome)
    })

    tabelasFilhas.forEach((tabela) => {
        $(`table[tablename="${tabela.nome}"] tbody tr:not(:first)`).each(function () {
            let idSolucaoRegistro = $(this).find(`input[name^="${tabela.campoId}___"]`).val()

            if (idSolucaoRegistro === idAbaSelecionada) {
                let rowId = $(this).find('input').first().attr('name').split('___')[1]
                renderizarLinhaVisual(tabela.nome, rowId)
            }
        })

        limparCamposEntradaTabela(tabela.nome)
    })

    renderizarSecaoDeslocamento(idAbaSelecionada)

    if (formularioSomenteLeitura) {
        aplicarModoSomenteLeituraPosInicio()
    }
}

function renderizarDadosTabelaPai(idAbaSelecionada) {
    const container = $('#painel-dados-pai')
    container.empty()

    const trPai = $(`table[tablename="solucoes"] tbody tr:not(:first)`)
        .filter(function () {
            return $(this).find("input[name^='idSolucaoSL___']").val() === idAbaSelecionada
        })
        .first()

    if (trPai.length === 0) {
        return
    }

    const rowIdPai = trPai.find('input').first().attr('name').split('___')[1]

    const nomeCampo = `nomeSolucaoSL___${rowIdPai}`
    const descricaoCampo = `descricaoSL___${rowIdPai}`
    const quantidadeCampo = `quantidadeParticipantesSL___${rowIdPai}`

    let nomeValor = $(`input[name="${nomeCampo}"]`).val() || ''
    const descricaoValor = $(`input[name="${descricaoCampo}"]`).val() || ''
    const quantidadeValor = $(`input[name="${quantidadeCampo}"]`).val() || ''
    const nomeBloqueado = bloqueioNomeSolucaoPorId[idAbaSelecionada] === true
    const permitirSelectsEdicao = podeEditarDadosSolucao(getActivity()) && !formularioSomenteLeitura
    const usarSelectNomeSebraern = permitirSelectsEdicao && isEventoSebraernSelecionado() && !nomeBloqueado

    if (usarSelectNomeSebraern && nomeSolucaoAutoGeradoPorId[idAbaSelecionada] === true && nomeValor) {
        $(`input[name="${nomeCampo}"]`).val('').trigger('change')
        $(`.tab-solucao[data-id="${idAbaSelecionada}"] .tab-title`).text('Solução')
        nomeValor = ''
    }

    let campoNomeHtml = ''
    if (usarSelectNomeSebraern) {
        const nomesSolucoes = carregarNomesSolucoesSebraern(false)
        let options = '<option value="" selected>Selecione uma solução...</option>'
        let encontrouSelecionado = false

        for (let i = 0; i < nomesSolucoes.length; i++) {
            const nomeOpcao = nomesSolucoes[i]
            const selected = nomeOpcao === nomeValor ? ' selected' : ''
            if (selected) encontrouSelecionado = true
            options += `<option value="${escaparHtml(nomeOpcao)}"${selected}>${escaparHtml(nomeOpcao)}</option>`
        }

        if (nomeValor && !encontrouSelecionado) {
            $(`input[name="${nomeCampo}"]`).val('').trigger('change')
            $(`.tab-solucao[data-id="${idAbaSelecionada}"] .tab-title`).text('Solução')
        }

        if (encontrouSelecionado) {
            options = options.replace(' selected', '')
        }

        campoNomeHtml = `
            <select class="form-control input-sync-select" data-target="${nomeCampo}" id="select-${nomeCampo}">
                ${options}
            </select>
        `
    } else {
        campoNomeHtml = `<input type="text" class="form-control input-sync" data-target="${nomeCampo}" value="${escaparHtml(nomeValor)}" ${nomeBloqueado ? 'readonly' : ''}>`
    }

    const bloco = `
        <div class="dados-gerais-container">
            <div class="linha-superior">
                <div class="form-group nome-solucao">
                    <label>Nome da Solução</label>
                    ${campoNomeHtml}
                </div>
                <div class="form-group quantidade-pessoas">
                    <label>Quantidade de Participantes</label>
                    <input type="number" min="0" step="1" class="form-control input-sync" data-target="${quantidadeCampo}" value="${quantidadeValor}">
                </div>
            </div>
            <div class="form-group descricao-solucao">
                <label>Descrição</label>
                <textarea class="form-control input-sync" data-target="${descricaoCampo}" rows="3" style="resize: vertical;">${descricaoValor}</textarea>
            </div>
        </div>
    `

    container.append(bloco)

    if (usarSelectNomeSebraern) {
        inicializarSelectComBusca(`#select-${nomeCampo}`, 'Selecione uma solução...')
    }
}

function parseNumero(valor) {
    if (valor == null) return 0
    if (typeof valor === 'number') return isNaN(valor) ? 0 : valor

    let texto = String(valor).trim()
    if (!texto) return 0

    texto = texto.replace(/R\$/gi, '').replace(/\s/g, '')

    if (texto.includes(',') && texto.includes('.')) {
        texto = texto.replace(/\./g, '').replace(',', '.')
    } else {
        texto = texto.replace(',', '.')
    }

    texto = texto.replace(/[^\d.-]/g, '')
    const numero = parseFloat(texto)
    return isNaN(numero) ? 0 : numero
}

function formatarMoedaNumero(valor) {
    const numero = Number(valor) || 0
    return numero.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatarQuantidadeResumo(valor) {
    const numero = parseNumero(valor)
    if (!numero) return '-'
    if (Number.isInteger(numero)) return String(numero)
    return numero.toLocaleString('pt-BR', { maximumFractionDigits: 2 })
}

function escaparHtml(texto) {
    return String(texto || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
}

function coletarDadosFinanceirosTabela(nomeTabela, idAbaSelecionada) {
    const campos = metadadosCamposFilhos[nomeTabela] || []
    const idxTexto = campos.findIndex((campo) => campo.tipo === 'texto')
    const idxNumero = campos.findIndex((campo) => campo.tipo === 'numero')
    const idxMoeda = campos.findIndex((campo) => campo.tipo === 'moeda')

    // mapa: nome da tabela → campo de valor total gravado
    const campoTotalPorTabela = {
        'materiais-didaticos': 'valorTotalMD',
        equipamentos: 'valorTotalEP',
        alimentacao: 'valorTotalAL',
        servicosEpecializados: 'valorTotalSE'
    }

    const itens = []
    let totalTabela = 0

    const configTabela = tabelasFilhas.find((item) => item.nome === nomeTabela)
    if (!configTabela) return { itens, totalTabela }

    $(`table[tablename="${nomeTabela}"] tbody tr:not(:first)`).each(function () {
        const idSolucaoRegistro = $(this).find(`input[name^="${configTabela.campoId}___"]`).val()
        if (idSolucaoRegistro !== idAbaSelecionada) return

        const rowId = $(this).find('input').first().attr('name').split('___')[1]
        const descricaoCampo = idxTexto >= 0 ? `${campos[idxTexto].baseName}___${rowId}` : null
        const qtdCampo = idxNumero >= 0 ? `${campos[idxNumero].baseName}___${rowId}` : null
        const valorCampo = idxMoeda >= 0 ? `${campos[idxMoeda].baseName}___${rowId}` : null

        const descricao = descricaoCampo ? ($(`input[name="${descricaoCampo}"]`).val() || '').trim() : 'Item'
        const quantidadeRaw = qtdCampo ? $(`input[name="${qtdCampo}"]`).val() : ''
        const valorUnitario = valorCampo ? parseNumero($(`input[name="${valorCampo}"]`).val()) : 0

        // usa o campo valorTotal gravado se existir; senão calcula como fallback
        let totalItem
        const campoTotal = campoTotalPorTabela[nomeTabela]
        if (campoTotal) {
            const valorTotalGravado = parseNumero($(`input[name="${campoTotal}___${rowId}"]`).val())
            totalItem = valorTotalGravado > 0 ? valorTotalGravado : valorUnitario * Math.max(parseNumero(quantidadeRaw), 1)
        } else {
            const quantidade = parseNumero(quantidadeRaw)
            totalItem = valorUnitario > 0 && quantidade > 0 ? valorUnitario * quantidade : valorUnitario
        }

        totalTabela += totalItem

        itens.push({
            descricao: descricao || 'Item',
            quantidade: quantidadeRaw,
            valorUnitario,
            totalItem
        })
    })

    return { itens, totalTabela }
}

function obterLinhaPaiSolucao(idAbaSelecionada) {
    const trPai = $(`table[tablename="solucoes"] tbody tr:not(:first)`)
        .filter(function () {
            return $(this).find("input[name^='idSolucaoSL___']").val() === idAbaSelecionada
        })
        .first()

    if (!trPai.length) {
        return { trPai: $(), rowIdPai: '' }
    }

    const primeiroInput = trPai.find('input').first().attr('name') || ''
    const rowIdPai = primeiroInput.indexOf('___') > -1 ? primeiroInput.split('___')[1] : ''
    return { trPai, rowIdPai }
}

function formatarNumeroDecimal(valor, casas) {
    const numero = Number(valor || 0)
    const quantidade = Number(casas || 2)
    return numero.toLocaleString('pt-BR', {
        minimumFractionDigits: quantidade,
        maximumFractionDigits: quantidade
    })
}

function isContextoEventoComercial() {
    return ($('#eventoSelecionado').val() || '').trim() === 'Evento-Comercial'
}

function calcularMargemLucroPercentual(custo, lucro) {
    const valorCusto = Number(custo || 0)
    const valorLucro = Number(lucro || 0)

    if (valorCusto > 0) {
        return (valorLucro / valorCusto) * 100
    }
    if (valorLucro > 0) {
        return 100
    }
    if (valorLucro < 0) {
        return -100
    }
    return 0
}

function calcularMargemContribuicaoPercentual(custoTotal, custoPrecificadoComDesconto) {
    const valorCustoTotal = Number(custoTotal || 0)
    const valorPrecificadoComDesconto = Number(custoPrecificadoComDesconto || 0)

    if (valorPrecificadoComDesconto > 0) {
        return (1 - valorCustoTotal / valorPrecificadoComDesconto) * 100
    }
    if (valorCustoTotal > 0) {
        return -100
    }
    return 0
}

function atualizarRotulosMargemPorContexto() {
    const isComercial = isContextoEventoComercial()
    const labelResumo = isComercial ? 'Margem de lucro' : 'Margem de contribuição'
    const labelGestao = isComercial ? 'Margem de Lucro (%)' : 'Margem de contribuição (%)'

    $('#rf-label-margem').text(labelResumo)
    $('#pd-label-margem').text(labelGestao)
}

function atualizarVisibilidadeResumoFinanceiroPorEvento() {
    const isComercial = isContextoEventoComercial()
    $('#rf-card-lucro-mercado').toggle(isComercial)
    $('#painel-resumo-financeiro .rf-interna-in').toggle(!isComercial)
    $('#painel-resumo-financeiro .rf-card-info').show()
    $('#painel-resumo-financeiro .rf-linha-mercado').toggle(isComercial)
    $('#painel-resumo-financeiro .rf-linha-nao-mercado').toggle(!isComercial)
    $('#rf-label-preco-principal').text(isComercial ? 'Precificação sugerida sem subsídio' : 'Precificação sugerida')
    $('#rf-label-valor-descontado').text(isComercial ? 'Subsídio do SEBRAERN' : 'Valor descontado da precificação sugerida')
    $('#rf-label-valor-pessoa').text(isComercial ? 'Valor por pessoa com subsídio' : 'Valor por pessoa')
    $('#pd-label-total-desconto').text(isComercial ? 'Receita total c/ subsídio' : 'Receita total c/ desconto')
    $('#pd-label-media-in').text(isComercial ? 'Valor por pessoa c/ subsídio' : 'Valor do combo por pessoa')
    $('#pd-label-bruta-total').text(isComercial ? 'Receita sem subsídio' : 'Receita bruta total')
    $('#pd-label-desconto-total').text(isComercial ? 'Total de subsídios do SEBRAERN' : 'Total de subsídios do SEBRAERN')
    atualizarRotulosMargemPorContexto()
}

function calcularValorSubsidioSebraern(precoSemSubsidio, percentualSubsidio) {
    const preco = Math.max(0, Number(precoSemSubsidio || 0))
    const percentual = Math.min(100, Math.max(0, Number(percentualSubsidio || 0)))
    return preco * (percentual / 100)
}

function atualizarCardLucroMercado(custoTotal, participantes, lucroValor, margemPercentual, percentualSubsidio = 0) {
    const custo = Number(custoTotal || 0)
    const qtdParticipantes = Number(participantes || 0)
    const lucro = Number(lucroValor || 0)
    const margem = Number(margemPercentual || 0)
    const subsidioPercent = Math.min(100, Math.max(0, Number(percentualSubsidio || 0)))
    const valorTotalComLucro = custo + lucro
    const valorSubsidio = calcularValorSubsidioSebraern(valorTotalComLucro, subsidioPercent)
    const valorTotalComSubsidio = Math.max(0, valorTotalComLucro - valorSubsidio)
    const valorPorPessoaSemSubsidio = qtdParticipantes > 0 ? valorTotalComLucro / qtdParticipantes : 0
    const valorPorPessoaComSubsidio = qtdParticipantes > 0 ? valorTotalComSubsidio / qtdParticipantes : 0

    const inputPercentual = document.getElementById('rf-lucro-percentual')
    const inputValor = document.getElementById('rf-lucro-valor')
    const inputSubsidio = document.getElementById('rf-subsidio-sebraern')
    const ativo = document.activeElement

    atualizandoInputsLucroMercado = true

    if (inputPercentual && ativo !== inputPercentual) {
        $('#rf-lucro-percentual').val(formatarNumeroDecimal(margem, 2))
    }

    if (inputValor && ativo !== inputValor) {
        $('#rf-lucro-valor').val(formatarNumeroDecimal(lucro, 2))
    }

    if (inputSubsidio && ativo !== inputSubsidio) {
        $('#rf-subsidio-sebraern').val(formatarNumeroDecimal(subsidioPercent, 2))
    }

    atualizandoInputsLucroMercado = false

    const sufixo = qtdParticipantes === 1 ? 'integrante' : 'integrantes'
    $('#rf-mercado-rateio').text(`Rateado para ${qtdParticipantes} ${sufixo}`)
    $('#rf-mercado-valor-pessoa').text(formatarMoedaNumero(valorPorPessoaSemSubsidio))
    $('#rf-mercado-subsidio-valor').text(`Subsídio de ${formatarMoedaNumero(valorSubsidio)}`)
    $('#rf-mercado-valor-pessoa-subsidio').text(formatarMoedaNumero(valorPorPessoaComSubsidio))
}

function renderizarResumoFinanceiro(idAbaSelecionada) {
    atualizarVisibilidadeResumoFinanceiroPorEvento()

    const dadosLinha = obterLinhaPaiSolucao(idAbaSelecionada)
    const trPai = dadosLinha.trPai
    const rowIdPai = dadosLinha.rowIdPai

    if (trPai.length === 0) {
        $('#rf-solucao-nome').text('-')
        $('#rf-participantes').text('0')
        $('#rf-preco-participante-num').text('R$ 0,00')
        $('#rf-total-proposta-num').text('R$ 0,00')
        $('#rf-preco-com-subsidio').text('R$ 0,00')
        $('#rf-valor-descontado').text('R$ 0,00')
        $('#rf-valor-por-pessoa').text('R$ 0,00')
        $('#rf-margem-lucro').text('0,00%').removeClass('rf-margem-positiva rf-margem-negativa').addClass('rf-margem-neutra')
        $('#valorTotalSugeridoCombo').val('R$ 0,00').trigger('change')
        atualizarCardLucroMercado(0, 0, 0, 0)
        renderizarPainelDescontosReceita(idAbaSelecionada, 0, 0)
        return
    }

    const nomeSolucao = $(`input[name="nomeSolucaoSL___${rowIdPai}"]`).val() || '-'
    const participantes = parseNumero($(`input[name="quantidadeParticipantesSL___${rowIdPai}"]`).val())

    const camposResumoPai = {
        servicosEpecializados: 'valorServicoEspecializadoSL',
        'materiais-didaticos': 'valorMaterialDidaticoSL',
        equipamentos: 'valorEquipamentosSL',
        alimentacao: 'valorAlimentosSL'
    }

    let custoTotal = 0
    tabelasFilhas.forEach((tabela) => {
        const { totalTabela } = coletarDadosFinanceirosTabela(tabela.nome, idAbaSelecionada)
        custoTotal += totalTabela

        const campoPai = camposResumoPai[tabela.nome]
        if (campoPai) {
            $(`input[name="${campoPai}___${rowIdPai}"]`).val(formatarMoedaNumero(totalTabela)).trigger('change')
        }

        $(`#total-header-${tabela.nome}`).text(formatarMoedaNumero(totalTabela))
        $(`#total-header-${tabela.nome}`).toggleClass('header-total-badge--vazio', totalTabela === 0)
    })

    const totalDeslocamento = coletarTotalDeslocamento(idAbaSelecionada)
    custoTotal += totalDeslocamento
    $(`input[name="valorDeslocamentoSL___${rowIdPai}"]`).val(formatarMoedaNumero(totalDeslocamento)).trigger('change')
    $('#total-header-deslocamento').text(formatarMoedaNumero(totalDeslocamento))
    $('#total-header-deslocamento').toggleClass('header-total-badge--vazio', totalDeslocamento === 0)

    const isComercial = isContextoEventoComercial()
    let precoSugerido = 0
    let precoSugeridoSemSubsidio = 0
    let valorDescontado = 0
    let lucroValor = 0
    let percentualSubsidio = 0

    if (isComercial) {
        lucroValor = parseNumero($(`input[name="valorLucroSL___${rowIdPai}"]`).val())
        percentualSubsidio = parseNumero($(`input[name="subsidioSebraernSL___${rowIdPai}"]`).val())
        const percentualInformado = parseNumero($('#rf-lucro-percentual').val())
        const subsidioDigitado = ($('#rf-subsidio-sebraern').val() || '').toString().trim()

        if (subsidioDigitado !== '') {
            percentualSubsidio = parseNumero(subsidioDigitado)
        }
        percentualSubsidio = Math.min(100, Math.max(0, Number(percentualSubsidio || 0)))

        if (!lucroValor && custoTotal > 0 && percentualInformado) {
            lucroValor = (custoTotal * percentualInformado) / 100
        }

        precoSugeridoSemSubsidio = custoTotal + lucroValor
        valorDescontado = calcularValorSubsidioSebraern(precoSugeridoSemSubsidio, percentualSubsidio)
        precoSugerido = Math.max(0, precoSugeridoSemSubsidio - valorDescontado)
        $(`input[name="valorLucroSL___${rowIdPai}"]`).val(formatarMoedaNumero(lucroValor)).trigger('change')
        $(`input[name="subsidioSebraernSL___${rowIdPai}"]`).val(formatarNumeroDecimal(percentualSubsidio, 2)).trigger('change')
    } else {
        const resumoIN = renderizarPainelDescontosReceita(idAbaSelecionada, custoTotal, participantes)
        precoSugerido = resumoIN && Number.isFinite(Number(resumoIN.precoSugerido)) ? Number(resumoIN.precoSugerido) : 0
        precoSugeridoSemSubsidio = precoSugerido
        valorDescontado = resumoIN && Number.isFinite(Number(resumoIN.descontoTotal)) ? Number(resumoIN.descontoTotal) : 0
        lucroValor = precoSugerido - custoTotal
        $(`input[name="valorLucroSL___${rowIdPai}"]`).val(formatarMoedaNumero(lucroValor)).trigger('change')
    }

    if (isComercial) {
        renderizarPainelDescontosReceita(idAbaSelecionada, custoTotal, participantes)
    }

    if (!isComercial) {
        lucroValor = precoSugerido - custoTotal
    }
    let margemLucroPercent = 0

    if (isComercial) {
        margemLucroPercent = calcularMargemLucroPercentual(custoTotal, lucroValor)
    } else {
        margemLucroPercent = calcularMargemContribuicaoPercentual(custoTotal, precoSugerido)
    }

    const margemLucroLabel = margemLucroPercent.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%'
    const margemLucroEl = $('#rf-margem-lucro')
    margemLucroEl.removeClass('rf-margem-positiva rf-margem-negativa rf-margem-neutra')
    if (margemLucroPercent > 0) {
        margemLucroEl.addClass('rf-margem-positiva')
    } else if (margemLucroPercent < 0) {
        margemLucroEl.addClass('rf-margem-negativa')
    } else {
        margemLucroEl.addClass('rf-margem-neutra')
    }

    $(`input[name="valorTotalSL___${rowIdPai}"]`).val(formatarMoedaNumero(precoSugerido)).trigger('change')

    $('#rf-solucao-nome').text(nomeSolucao)
    $('#rf-participantes').text(participantes || 0)
    $('#rf-total-proposta-num').text(formatarMoedaNumero(custoTotal))
    $('#rf-preco-participante-num').text(formatarMoedaNumero(precoSugeridoSemSubsidio))
    $('#rf-preco-com-subsidio').text(formatarMoedaNumero(precoSugerido))
    $('#rf-valor-descontado').text(formatarMoedaNumero(valorDescontado))
    $('#rf-valor-por-pessoa').text(formatarMoedaNumero(participantes > 0 ? precoSugerido / participantes : 0))
    margemLucroEl.text(margemLucroLabel)

    atualizarCardLucroMercado(custoTotal, participantes, lucroValor, margemLucroPercent, percentualSubsidio)
    atualizarCampoTotalSugeridoCombo()
}

function obterEstadoDescontoAba(idAba) {
    const chave = String(idAba || '')
    if (!estadoDescontosINPorAba[chave]) estadoDescontosINPorAba[chave] = {}
    return estadoDescontosINPorAba[chave]
}

const cacheFaixasINPrecos = {}

function obterModalidadePeloServico(descricaoServico) {
    const texto = String(descricaoServico || '').toLowerCase()
    if (!texto) return 'solucoesPresenciais'

    if (texto.includes('online') || texto.includes('ead') || texto.includes('remoto') || texto.includes('web')) {
        return 'solucoesOnline'
    }

    if (texto.includes('company') || texto.includes('in company') || texto.includes('in-company') || texto.includes('trainee')) {
        return 'company'
    }

    return 'solucoesPresenciais'
}

function normalizarModalidadeServico(tipoInformado, descricaoServico = '') {
    const tipo = String(tipoInformado || '')
        .trim()
        .toLowerCase()

    if (!tipo) return obterModalidadePeloServico(descricaoServico)

    if (tipo.includes('online') || tipo.includes('ead') || tipo.includes('remoto')) {
        return 'solucoesOnline'
    }

    if (tipo.includes('company') || tipo.includes('in company') || tipo.includes('in-company') || tipo.includes('compane')) {
        return 'company'
    }

    if (tipo.includes('presencial')) {
        return 'solucoesPresenciais'
    }

    return obterModalidadePeloServico(descricaoServico)
}

function faixaINValida(min, max, carga) {
    const minN = Number(min || 0)
    const maxN = Number(max || 0)

    if (minN <= 0 && maxN > 0) return carga <= maxN
    if (maxN <= 0 && minN > 0) return carga >= minN
    if (minN <= 0 && maxN <= 0) return true

    return carga >= minN && carga <= maxN
}

function obterConfigTabelaIN(tablename) {
    const mapa = {
        solucoesPresenciais: {
            campoDescricao: 'solucoesPC',
            campoMin: 'cargaHorariaMinimaPC',
            campoMax: 'cargaHorariaMaximaPC',
            campoValor: 'valorPC',
            campoDesconto: 'descontoPC',
            tituloPadrao: 'IN Presencial'
        },
        solucoesOnline: {
            campoDescricao: 'solucaoON',
            campoMin: 'cargaHorariaMinimaON',
            campoMax: 'cargaHorariaMaximaON',
            campoValor: 'valorON',
            campoDesconto: 'descontoON',
            tituloPadrao: 'IN Online'
        },
        company: {
            campoDescricao: 'company',
            campoMin: 'cargaHorariaMinimaCompany',
            campoMax: 'cargaHorariaMaximaCompany',
            campoValor: 'valorCompany',
            campoDesconto: 'descontoCompany',
            tituloPadrao: 'IN Company'
        }
    }
    return mapa[tablename]
}

function carregarFaixasINPrecos(tablename) {
    if (cacheFaixasINPrecos[tablename]) return cacheFaixasINPrecos[tablename]

    const cfg = obterConfigTabelaIN(tablename)
    if (!cfg) return []

    const ds = consultarDatasetParametros(tablename)
    const cols = ds.columns || []
    const vals = ds.values || []
    const faixas = []

    vals.forEach((row, idx) => {
        const descricao = valorCampoDataset(row, cols, cfg.campoDescricao) || `${cfg.tituloPadrao} ${idx + 1}`
        const min = parseNumero(valorCampoDataset(row, cols, cfg.campoMin))
        const max = parseNumero(valorCampoDataset(row, cols, cfg.campoMax))
        const valorPessoa = parseNumero(valorCampoDataset(row, cols, cfg.campoValor))
        const descontoLimite = Math.min(100, Math.max(0, parseNumero(cfg.campoDesconto ? valorCampoDataset(row, cols, cfg.campoDesconto) : 100) || 0))
        if (!valorPessoa) return

        faixas.push({ descricao, min, max, valorPessoa, descontoLimite })
    })

    faixas.sort((a, b) => a.min - b.min)
    cacheFaixasINPrecos[tablename] = faixas
    return faixas
}

function localizarFaixaIN(tablename, cargaHorariaTotal) {
    const faixas = carregarFaixasINPrecos(tablename)
    return faixas.find((f) => faixaINValida(f.min, f.max, cargaHorariaTotal)) || null
}

function localizarFaixaINEmpretec(cargaHorariaTotal) {
    const faixasPresenciais = carregarFaixasINPrecos('solucoesPresenciais')
    if (!faixasPresenciais.length) return null

    const faixasEmpretec = faixasPresenciais.filter((faixa) => normalizarTextoComparacao(faixa.descricao).indexOf('empretec') >= 0)
    const baseBusca = faixasEmpretec.length ? faixasEmpretec : faixasPresenciais

    return baseBusca.find((f) => faixaINValida(f.min, f.max, cargaHorariaTotal)) || baseBusca[0] || null
}

function escolherFaixaINPorReferencia(faixas, chMin, chMax, referenciaTexto) {
    const lista = Array.isArray(faixas) ? faixas : []
    if (!lista.length) return null

    const minRef = Number(chMin || 0)
    const maxRef = Number(chMax || 0)
    let candidatas = lista.filter((f) => Number(f.min || 0) === minRef && Number(f.max || 0) === maxRef)

    if (!candidatas.length) {
        const cargaRef = minRef > 0 ? minRef : maxRef
        candidatas = lista.filter((f) => faixaINValida(f.min, f.max, cargaRef))
    }

    if (!candidatas.length) candidatas = lista

    const ref = normalizarTextoComparacao(referenciaTexto)
    if (!ref) return candidatas[0] || null

    const tokenPorTipo = {
        consultoria: ['consultoria'],
        instrutoria: ['instrutoria', 'capacitacao'],
        palestra: ['palestra'],
        empretec: ['empretec']
    }

    let tokens = []
    if (ref.indexOf('consultoria') >= 0) tokens = tokenPorTipo.consultoria
    else if (ref.indexOf('instrutoria') >= 0 || ref.indexOf('capacitacao') >= 0) tokens = tokenPorTipo.instrutoria
    else if (ref.indexOf('palestra') >= 0) tokens = tokenPorTipo.palestra
    else if (ref.indexOf('empretec') >= 0) tokens = tokenPorTipo.empretec

    if (!tokens.length) return candidatas[0] || null

    const candidataPorToken = candidatas.find((f) => {
        const desc = normalizarTextoComparacao(f.descricao || '')
        if (!desc) return false
        for (let i = 0; i < tokens.length; i++) {
            if (desc.indexOf(tokens[i]) >= 0) return true
        }
        return false
    })

    return candidataPorToken || candidatas[0] || null
}

function obterLimiteDescontoPorFaixa(tablename, chMin, chMax, descricaoServico) {
    const isFamiliaEmpretec = normalizarTextoComparacao(descricaoServico).indexOf('familia empretec') >= 0
    let faixas = []

    if (isFamiliaEmpretec) {
        const faixasPresenciais = carregarFaixasINPrecos('solucoesPresenciais')
        const faixasEmpretec = faixasPresenciais.filter((faixa) => normalizarTextoComparacao(faixa.descricao).indexOf('empretec') >= 0)
        faixas = faixasEmpretec.length ? faixasEmpretec : faixasPresenciais
    } else {
        faixas = carregarFaixasINPrecos(tablename)
    }

    if (!faixas.length) return 100

    const faixaSelecionada = escolherFaixaINPorReferencia(faixas, chMin, chMax, descricaoServico)
    return Math.min(100, Math.max(0, Number((faixaSelecionada && faixaSelecionada.descontoLimite) || 0)))
}

function montarLabelFaixaIN(min, max, descricaoFallback = '') {
    const minN = Number(min || 0)
    const maxN = Number(max || 0)

    if (minN <= 0 && maxN > 0) return `até ${maxN}h`
    if (maxN <= 0 && minN > 0) return `${minN}h ou mais`
    if (minN <= 0 && maxN <= 0) return descricaoFallback || 'Faixa livre'
    return `${minN}h a ${maxN}h`
}

function extrairTipoServicoPrecificacao(descricaoServico, tipoServico) {
    const textoBase = normalizarTextoComparacao(`${descricaoServico || ''} ${tipoServico || ''}`)

    if (textoBase.indexOf('consultoria') >= 0) {
        return { chave: 'consultoria', titulo: 'Consultoria' }
    }

    if (textoBase.indexOf('instrutoria') >= 0 || textoBase.indexOf('capacitacao') >= 0) {
        return { chave: 'instrutoria', titulo: 'Instrutoria' }
    }

    if (textoBase.indexOf('palestra') >= 0) {
        return { chave: 'palestra', titulo: 'Palestra' }
    }

    return { chave: 'servico', titulo: 'Serviço especializado' }
}

function obterTituloModalidadeIN(modalidade) {
    return (
        {
            solucoesPresenciais: 'Presencial',
            solucoesOnline: 'Online',
            company: 'Company'
        }[modalidade] || 'IN'
    )
}

function sincronizarItensINPaiFilho(itens = [], estadoAba = {}, idAbaSelecionada = '') {
    const tabelaIns = $(`table[tablename="ins"]`)
    if (!tabelaIns.length || typeof wdkAddChild !== 'function') return
    const idAba = String(idAbaSelecionada || '').trim()
    if (!idAba) return

    const removerLinhaPaiFilho = (inputEl) => {
        if (!inputEl) return
        if (typeof fnWdkRemoveChild === 'function') {
            fnWdkRemoveChild(inputEl)
            return
        }

        // fallback defensivo para ambientes onde fnWdkRemoveChild não está disponível
        const $linha = $(inputEl).closest('tr')
        if ($linha.length) $linha.remove()
    }

    const obterRowId = (linha) => {
        const nome = (linha.find('input[name]').first().attr('name') || '').trim()
        return nome.includes('___') ? nome.split('___')[1] : null
    }

    const linhasExistentes = {}
    const descontosExistentes = {}
    tabelaIns.find('tbody tr:not(:first)').each(function () {
        const row = $(this)
        const rowId = obterRowId(row)
        if (!rowId) return

        const referenciaSolucao = ($(`input[name="solucoesINS___${rowId}"]`).val() || '').trim()
        if (referenciaSolucao !== idAba) return

        const descricao = ($(`input[name="servicoINS___${rowId}"]`).val() || '').trim()
        if (!descricao) return

        linhasExistentes[descricao] = rowId
        descontosExistentes[descricao] = Math.min(100, Math.max(0, parseNumero($(`input[name="descontoAplicadoINS___${rowId}"]`).val() || 0)))
    })

    const descricoesNovas = new Set((itens || []).map((item) => String(item.descricao || '').trim()).filter(Boolean))

    // Remove linhas órfãs (não existem mais nas INs calculadas)
    tabelaIns.find('tbody tr:not(:first)').each(function () {
        const row = $(this)
        const rowId = obterRowId(row)
        if (!rowId) return

        const referenciaSolucao = ($(`input[name="solucoesINS___${rowId}"]`).val() || '').trim()
        if (referenciaSolucao !== idAba) return

        const descricao = ($(`input[name="servicoINS___${rowId}"]`).val() || '').trim()
        if (!descricao || !descricoesNovas.has(descricao)) {
            const primeiroInput = row.find('input[name]').first()
            if (primeiroInput.length) removerLinhaPaiFilho(primeiroInput[0])
        }
    })
    ;(itens || []).forEach((item) => {
        const descricao = String(item.descricao || '').trim()
        if (!descricao) return

        let rowId = linhasExistentes[descricao]
        if (!rowId) {
            rowId = wdkAddChild('ins')
            linhasExistentes[descricao] = rowId
        }

        const limiteDesconto = Math.min(100, Math.max(0, parseNumero(item.descontoLimite != null ? item.descontoLimite : 100)))
        const descontoAplicado = Math.min(limiteDesconto, Math.max(0, parseNumero(estadoAba[item.id] != null ? estadoAba[item.id] : descontosExistentes[descricao] || 0)))
        estadoAba[item.id] = descontoAplicado
        const valorPessoaBase = Number(item.valorPessoa || 0)

        const tipo =
            {
                solucoesPresenciais: 'Presencial',
                solucoesOnline: 'Online',
                company: 'Company'
            }[String(item.modalidade || '')] || 'IN'

        const campo = (base) => `input[name="${base}___${rowId}"]`

        $(campo('servicoINS')).val(descricao).trigger('change')
        $(campo('tipoINS')).val(tipo).trigger('change')
        $(campo('chMinimaINS'))
            .val(item.chMin != null ? String(item.chMin) : '')
            .trigger('change')
        $(campo('chMaximaINS'))
            .val(item.chMax != null ? String(item.chMax) : '')
            .trigger('change')
        $(campo('descontoLimiteINS'))
            .val(String(Math.round(limiteDesconto)))
            .trigger('change')
        $(campo('descontoAplicadoINS'))
            .val(String(Math.round(descontoAplicado)))
            .trigger('change')
        $(campo('numeroPessoasINS'))
            .val(String(Number(item.participantes || 0)))
            .trigger('change')
        $(campo('solucoesINS'))
            .val(String(item.referenciaSolucao || ''))
            .trigger('change')
        $(campo('valorPorPessoaINS')).val(formatarMoedaNumero(valorPessoaBase)).trigger('change')
    })
}

function coletarItensINParaDesconto(idAbaSelecionada) {
    const idAba = String(idAbaSelecionada || '').trim()
    if (!idAba) return []

    let participantesSolucao = 0
    $(`table[tablename="solucoes"] tbody tr:not(:first)`).each(function () {
        const idSolucao = ($(this).find(`input[name^="idSolucaoSL___"]`).val() || '').trim()
        if (idSolucao !== idAba) return

        const qtd = parseNumero($(this).find(`input[name^="quantidadeParticipantesSL___"]`).val())
        participantesSolucao += qtd || 0
    })

    const agregadorCHServico = {}
    const agregadorServicosOutro = {}

    $(`table[tablename="servicosEpecializados"] tbody tr:not(:first)`).each(function () {
        const idSolucao = ($(this).find(`input[name^="idSolucaoSE___"]`).val() || '').trim()
        if (idSolucao !== idAba) return

        const gratuito = ($(this).find(`input[name^="gratuitoSE___"]`).val() || '').trim()
        if (isServicoGratuitoSE(gratuito)) return

        const descricao = ($(this).find(`input[name^="descricaoSE___"]`).val() || '').trim()
        const tipoServico = ($(this).find(`input[name^="tipoSE___"]`).val() || '').trim()
        const carga = parseNumero($(this).find(`input[name^="cargaHorariaSE___"]`).val())
        const valorTotalServico = parseNumero($(this).find(`input[name^="valorTotalSE___"]`).val())
        const origemServico = normalizarTextoComparacao($(this).find(`input[name^="origemSE___"]`).val())

        const participantes = Number(participantesSolucao || 0)
        if (!participantes) return

        const descricaoNorm = normalizarTextoComparacao(descricao)
        const isOutro = origemServico === 'outro' || descricaoNorm.indexOf('outro - ') === 0

        if (isOutro) {
            const chaveOutro = `${normalizarTextoComparacao(descricao)}@@${normalizarTextoComparacao(tipoServico)}`
            if (!agregadorServicosOutro[chaveOutro]) {
                agregadorServicosOutro[chaveOutro] = {
                    descricao: descricao || 'Outro',
                    modalidade: normalizarModalidadeServico(tipoServico, descricao),
                    participantes,
                    valorTotal: 0,
                    cargaHoraria: 0
                }
            }

            agregadorServicosOutro[chaveOutro].valorTotal += Number(valorTotalServico || 0)
            agregadorServicosOutro[chaveOutro].cargaHoraria += Number(carga || 0)
            return
        }

        if (!carga) return

        const isFamiliaEmpretec = normalizarTextoComparacao(descricao).indexOf('familia empretec') >= 0
        const modalidade = isFamiliaEmpretec ? 'solucoesPresenciais' : normalizarModalidadeServico(tipoServico, descricao)
        const tipoServicoPrecificacao = extrairTipoServicoPrecificacao(descricao, tipoServico)
        const chaveAgrupamento = `${modalidade}@@${tipoServicoPrecificacao.chave}@@${isFamiliaEmpretec ? 'familia_empretec' : 'padrao'}`

        if (!agregadorCHServico[chaveAgrupamento]) {
            agregadorCHServico[chaveAgrupamento] = {
                modalidade,
                tipoServico: tipoServicoPrecificacao,
                isFamiliaEmpretec,
                cargaHoraria: 0,
                participantes
            }
        }

        agregadorCHServico[chaveAgrupamento].cargaHoraria += carga
    })

    const itensFaixa = Object.values(agregadorCHServico)
        .map((grupo) => {
            let faixa = null
            if (grupo.isFamiliaEmpretec) {
                faixa = localizarFaixaINEmpretec(grupo.cargaHoraria)
            } else {
                const faixasModalidade = carregarFaixasINPrecos(grupo.modalidade)
                faixa = escolherFaixaINPorReferencia(faixasModalidade, grupo.cargaHoraria, grupo.cargaHoraria, grupo.tipoServico && grupo.tipoServico.chave)
            }
            if (!faixa) return null

            const valorPessoa = Number(faixa.valorPessoa || 0)
            const nomeModalidade = grupo.isFamiliaEmpretec ? 'Família Empretec' : obterTituloModalidadeIN(grupo.modalidade)
            const descricaoFaixa = montarLabelFaixaIN(faixa.min, faixa.max, faixa.descricao)
            const idItem = `${grupo.modalidade}@@${grupo.tipoServico.chave}@@${faixa.min}-${faixa.max}@@${valorPessoa}@@${grupo.isFamiliaEmpretec ? 'familia_empretec' : 'padrao'}`
            const tituloCard = grupo.isFamiliaEmpretec ? `Família Empretec - ${descricaoFaixa}` : `${grupo.tipoServico.titulo} ${nomeModalidade} - ${descricaoFaixa}`
            const descontoLimiteFaixa = obterLimiteDescontoPorFaixa(grupo.modalidade, Number(faixa.min || 0), Number(faixa.max || 0), grupo.tipoServico && grupo.tipoServico.chave)

            return {
                id: idItem,
                descricao: tituloCard,
                modalidade: grupo.modalidade,
                tipoServico: grupo.tipoServico.chave,
                chMin: Number(faixa.min || 0),
                chMax: Number(faixa.max || 0),
                cargaHoraria: Number(grupo.cargaHoraria || 0),
                participantes: Number(grupo.participantes || 0),
                qtdSolucoes: 1,
                referenciaSolucao: idAba,
                valorPessoa,
                descontoLimite: Math.min(100, Math.max(0, Number(descontoLimiteFaixa != null ? descontoLimiteFaixa : faixa.descontoLimite))),
                valorBruto: valorPessoa * Number(grupo.participantes || 0)
            }
        })
        .filter((item) => item != null)

    const itensOutros = Object.values(agregadorServicosOutro)
        .map((grupo) => {
            const participantes = Number(grupo.participantes || 0)
            const valorBruto = Number(grupo.valorTotal || 0)
            const valorPessoa = participantes > 0 ? valorBruto / participantes : 0
            if (!valorBruto || !valorPessoa) return null

            const idItem = `outro@@${normalizarTextoComparacao(grupo.descricao)}@@${grupo.modalidade}`

            return {
                id: idItem,
                descricao: grupo.descricao,
                modalidade: grupo.modalidade,
                tipoServico: 'outro',
                chMin: 0,
                chMax: 0,
                cargaHoraria: Number(grupo.cargaHoraria || 0),
                participantes,
                qtdSolucoes: 1,
                referenciaSolucao: idAba,
                valorPessoa,
                descontoLimite: 100,
                valorBruto
            }
        })
        .filter((item) => item != null)

    return [...itensFaixa, ...itensOutros].filter((item) => item.valorBruto > 0).sort((a, b) => b.valorBruto - a.valorBruto)
}

function coletarItensINDoPaiFilho() {
    const idAba = String(arguments[0] || '').trim()
    const itens = []

    $(`table[tablename="ins"] tbody tr:not(:first)`).each(function () {
        const primeiroInput = $(this).find('input[name]').first()
        const nome = (primeiroInput.attr('name') || '').trim()
        if (!nome.includes('___')) return

        const rowId = nome.split('___')[1]
        const descricao = ($(`input[name="servicoINS___${rowId}"]`).val() || '').trim()
        if (!descricao) return

        const referenciaSolucao = ($(`input[name="solucoesINS___${rowId}"]`).val() || '').trim()
        if (idAba && referenciaSolucao !== idAba) return

        const tipo = ($(`input[name="tipoINS___${rowId}"]`).val() || '').trim()
        const chMin = parseNumero($(`input[name="chMinimaINS___${rowId}"]`).val())
        const chMax = parseNumero($(`input[name="chMaximaINS___${rowId}"]`).val())
        const descontoLimiteRaw = $(`input[name="descontoLimiteINS___${rowId}"]`).val()
        const descontoAplicado = Math.min(100, Math.max(0, parseNumero($(`input[name="descontoAplicadoINS___${rowId}"]`).val())))
        const participantes = parseNumero($(`input[name="numeroPessoasINS___${rowId}"]`).val())
        const qtdSolucoes = referenciaSolucao ? 1 : 0
        const valorPessoaBase = parseNumero($(`input[name="valorPorPessoaINS___${rowId}"]`).val())

        const modalidade = normalizarModalidadeServico(tipo, descricao)
        const tipoServicoPrecificacao = extrairTipoServicoPrecificacao(descricao, '').chave
        const isFamiliaEmpretec = normalizarTextoComparacao(descricao).indexOf('familia empretec') >= 0
        const tablenameFaixa = isFamiliaEmpretec ? 'solucoesPresenciais' : modalidade
        const descontoLimiteCalculado = obterLimiteDescontoPorFaixa(tablenameFaixa, chMin, chMax, descricao)
        const descontoLimite = String(descontoLimiteRaw || '').trim() !== '' ? Math.min(100, Math.max(0, parseNumero(descontoLimiteRaw))) : Math.min(100, Math.max(0, Number(descontoLimiteCalculado)))
        const isServicoOutro = normalizarTextoComparacao(descricao).indexOf('outro - ') === 0
        const idItem = isServicoOutro
            ? `outro@@${normalizarTextoComparacao(descricao)}@@${modalidade}`
            : `${modalidade}@@${tipoServicoPrecificacao}@@${chMin}-${chMax}@@${Number(valorPessoaBase || 0)}@@${isFamiliaEmpretec ? 'familia_empretec' : 'padrao'}`
        const valorBruto = Number(valorPessoaBase || 0) * Number(participantes || 0)

        itens.push({
            id: idItem,
            rowId,
            descricao,
            modalidade,
            tipoServico: tipoServicoPrecificacao,
            chMin,
            chMax,
            cargaHoraria: 0,
            participantes,
            qtdSolucoes,
            referenciaSolucao,
            valorPessoa: valorPessoaBase,
            descontoLimite,
            descontoAplicado,
            valorBruto
        })
    })

    return itens.filter((item) => item.valorBruto > 0).sort((a, b) => b.valorBruto - a.valorBruto)
}

function atualizarItensINCalculados(idAbaSelecionada) {
    const estadoAba = obterEstadoDescontoAba(idAbaSelecionada)
    const itensCalculados = coletarItensINParaDesconto(idAbaSelecionada)
    sincronizarItensINPaiFilho(itensCalculados, estadoAba, idAbaSelecionada)
    return itensCalculados
}

function coletarTotalPessoasTodasSolucoes() {
    let total = 0

    $(`table[tablename="solucoes"] tbody tr:not(:first)`).each(function () {
        const qtd = parseNumero($(this).find(`input[name^="quantidadeParticipantesSL___"]`).val())
        total += qtd || 0
    })

    return total
}

function coletarTotaisCombo() {
    let totalValorSolucoes = 0
    let totalPessoas = 0
    let totalCargaHorariaServicos = 0

    $(`table[tablename="solucoes"] tbody tr:not(:first)`).each(function () {
        const valorSolucao = parseNumero($(this).find(`input[name^="valorTotalSL___"]`).val())
        const pessoasSolucao = parseNumero($(this).find(`input[name^="quantidadeParticipantesSL___"]`).val())

        totalValorSolucoes += valorSolucao || 0
        totalPessoas += pessoasSolucao || 0
    })

    $(`table[tablename="servicosEpecializados"] tbody tr:not(:first)`).each(function () {
        const carga = parseNumero($(this).find(`input[name^="cargaHorariaSE___"]`).val())
        totalCargaHorariaServicos += carga || 0
    })

    return {
        totalValorSolucoes,
        totalPessoas,
        totalCargaHorariaServicos
    }
}

function atualizarCampoTotalSugeridoCombo() {
    const totaisCombo = coletarTotaisCombo()
    const valor = Number((totaisCombo && totaisCombo.totalValorSolucoes) || 0)
    $('#valorTotalSugeridoCombo').val(formatarMoedaNumero(valor)).trigger('change')
}

function coletarTotaisSolucao(idAbaSelecionada) {
    const idAba = String(idAbaSelecionada || '').trim()
    let totalValorSolucoes = 0
    let totalPessoas = 0
    let totalCargaHorariaServicos = 0

    tabelasFilhas.forEach((tabela) => {
        const { totalTabela } = coletarDadosFinanceirosTabela(tabela.nome, idAba)
        totalValorSolucoes += Number(totalTabela || 0)
    })

    totalValorSolucoes += coletarTotalDeslocamento(idAba)

    $(`table[tablename="solucoes"] tbody tr:not(:first)`).each(function () {
        const idSolucao = ($(this).find(`input[name^="idSolucaoSL___"]`).val() || '').trim()
        if (idSolucao !== idAba) return

        const pessoasSolucao = parseNumero($(this).find(`input[name^="quantidadeParticipantesSL___"]`).val())
        totalPessoas += pessoasSolucao || 0
    })

    $(`table[tablename="servicosEpecializados"] tbody tr:not(:first)`).each(function () {
        const idSolucao = ($(this).find(`input[name^="idSolucaoSE___"]`).val() || '').trim()
        if (idSolucao !== idAba) return

        const carga = parseNumero($(this).find(`input[name^="cargaHorariaSE___"]`).val())
        totalCargaHorariaServicos += carga || 0
    })

    return {
        totalValorSolucoes,
        totalPessoas,
        totalCargaHorariaServicos
    }
}

function coletarTotaisBaseComboSemIN() {
    let totalBaseCombo = 0
    let totalPessoasCombo = 0

    $(`table[tablename="solucoes"] tbody tr:not(:first)`).each(function () {
        const valorServicoEspecializado = parseNumero($(this).find(`input[name^="valorServicoEspecializadoSL___"]`).val())
        const valorMaterialDidatico = parseNumero($(this).find(`input[name^="valorMaterialDidaticoSL___"]`).val())
        const valorEquipamentos = parseNumero($(this).find(`input[name^="valorEquipamentosSL___"]`).val())
        const valorAlimentos = parseNumero($(this).find(`input[name^="valorAlimentosSL___"]`).val())
        const valorDeslocamento = parseNumero($(this).find(`input[name^="valorDeslocamentoSL___"]`).val())
        const pessoasSolucao = parseNumero($(this).find(`input[name^="quantidadeParticipantesSL___"]`).val())

        totalBaseCombo += Number(valorServicoEspecializado || 0) + Number(valorMaterialDidatico || 0) + Number(valorEquipamentos || 0) + Number(valorAlimentos || 0) + Number(valorDeslocamento || 0)

        totalPessoasCombo += Number(pessoasSolucao || 0)
    })

    return {
        totalBaseCombo,
        totalPessoasCombo
    }
}

function obterIdsSolucoes() {
    const ids = []

    $(`table[tablename="solucoes"] tbody tr:not(:first)`).each(function () {
        const idSolucao = ($(this).find(`input[name^="idSolucaoSL___"]`).val() || '').trim()
        if (idSolucao) ids.push(idSolucao)
    })

    return ids
}

function atualizarItensINCalculadosTodasSolucoes() {
    const idsSolucoes = obterIdsSolucoes()
    for (let i = 0; i < idsSolucoes.length; i++) {
        atualizarItensINCalculados(idsSolucoes[i])
    }
}

function coletarResumoSolucoesParaPainelGestao() {
    const solucoes = []

    $(`table[tablename="solucoes"] tbody tr:not(:first)`).each(function () {
        const $row = $(this)
        const idSolucao = ($row.find(`input[name^="idSolucaoSL___"]`).val() || '').trim()
        if (!idSolucao) return

        const nomeSolucao = ($row.find(`input[name^="nomeSolucaoSL___"]`).val() || 'Solução').trim()
        const participantes = parseNumero($row.find(`input[name^="quantidadeParticipantesSL___"]`).val()) || 0

        const custoSolucao =
            parseNumero($row.find(`input[name^="valorServicoEspecializadoSL___"]`).val()) +
            parseNumero($row.find(`input[name^="valorMaterialDidaticoSL___"]`).val()) +
            parseNumero($row.find(`input[name^="valorEquipamentosSL___"]`).val()) +
            parseNumero($row.find(`input[name^="valorAlimentosSL___"]`).val()) +
            parseNumero($row.find(`input[name^="valorDeslocamentoSL___"]`).val())

        const itensFachetaria = coletarItensINDoPaiFilho(idSolucao)
        const precoSemDesconto = itensFachetaria.reduce((acc, item) => acc + Number(item.valorBruto || 0), 0)
        const precoComDesconto = itensFachetaria.reduce((acc, item) => {
            const descontoPercent = Math.min(100, Math.max(0, parseNumero(item.descontoAplicado || 0)))
            return acc + Number(item.valorBruto || 0) * (1 - descontoPercent / 100)
        }, 0)

        solucoes.push({
            idSolucao,
            nomeSolucao,
            participantes,
            custoSolucao: Number(custoSolucao || 0),
            precoSemDesconto: Number(precoSemDesconto || 0),
            precoComDesconto: Number(precoComDesconto || 0)
        })
    })

    return solucoes
}

function renderizarListaSolucoesPainelGestao(solucoesResumo) {
    const lista = $('#pd-lista-solucoes')
    if (!lista.length) return
    const isComercial = isContextoEventoComercial()
    const labelSemDesconto = isComercial ? 'SUGERIDA (S/ SUBS.)' : 'SUGERIDA (S/ DESC.)'
    const labelComDesconto = isComercial ? 'SUGERIDA (C/ SUBS.)' : 'SUGERIDA (C/ DESC.)'

    if (!solucoesResumo || !solucoesResumo.length) {
        lista.html('<p class="pd-vazio">Nenhuma solução adicionada.</p>')
        return
    }

    let html = ''
    solucoesResumo.forEach((solucao, idx) => {
        const classeCor = `pd-cor-${(idx % 4) + 1}`
        const participantes = Number(solucao.participantes || 0)
        const sufixoPessoa = participantes === 1 ? 'pessoa' : 'pessoas'
        const sugeridaPorPessoa = participantes > 0 ? Number(solucao.precoComDesconto || 0) / participantes : 0

        html += `
            <div class="pd-item-card pd-item-card-solucao ${classeCor}">
                <div class="pd-item-indice ${classeCor}">${idx + 1}</div>
                <div class="pd-item-conteudo">
                    <h4>${escaparHtml(solucao.nomeSolucao)} · ${participantes} ${sufixoPessoa}</h4>
                    <div class="pd-item-metricas">
                        <div>
                            <span>CUSTO</span>
                            <strong>${formatarMoedaNumero(solucao.custoSolucao)}</strong>
                        </div>
                        <div>
                            <span>${labelSemDesconto}</span>
                            <strong class="pd-bruta">${formatarMoedaNumero(solucao.precoSemDesconto)}</strong>
                        </div>
                        <div>
                            <span>${labelComDesconto}</span>
                            <strong class="pd-liquido">${formatarMoedaNumero(solucao.precoComDesconto)}</strong>
                        </div>
                        <div>
                            <span>SUGERIDA / PESSOA</span>
                            <strong>${formatarMoedaNumero(sugeridaPorPessoa)}</strong>
                        </div>
                    </div>
                </div>
            </div>
        `
    })

    lista.html(html)
}

function renderizarPainelDescontosReceita(idAbaSelecionada, custoTotal = 0, participantes = 0) {
    const listaResumo = $('#rf-in-lista')
    const isComercial = isContextoEventoComercial()

    if (isComercial) {
        const solucoesResumo = []

        $(`table[tablename="solucoes"] tbody tr:not(:first)`).each(function () {
            const $row = $(this)
            const idSolucao = ($row.find(`input[name^="idSolucaoSL___"]`).val() || '').trim()
            if (!idSolucao) return

            const nomeSolucao = ($row.find(`input[name^="nomeSolucaoSL___"]`).val() || 'Solução').trim()
            const participantesSolucao = parseNumero($row.find(`input[name^="quantidadeParticipantesSL___"]`).val()) || 0
            const custoSolucao =
                parseNumero($row.find(`input[name^="valorServicoEspecializadoSL___"]`).val()) +
                parseNumero($row.find(`input[name^="valorMaterialDidaticoSL___"]`).val()) +
                parseNumero($row.find(`input[name^="valorEquipamentosSL___"]`).val()) +
                parseNumero($row.find(`input[name^="valorAlimentosSL___"]`).val()) +
                parseNumero($row.find(`input[name^="valorDeslocamentoSL___"]`).val())

            const lucroSolucao = parseNumero($row.find(`input[name^="valorLucroSL___"]`).val())
            const percentualSubsidio = parseNumero($row.find(`input[name^="subsidioSebraernSL___"]`).val())
            const precoSemSubsidio = custoSolucao + lucroSolucao
            const valorSubsidio = calcularValorSubsidioSebraern(precoSemSubsidio, percentualSubsidio)
            const precoComSubsidio = Math.max(0, precoSemSubsidio - valorSubsidio)

            solucoesResumo.push({
                idSolucao,
                nomeSolucao,
                participantes: Number(participantesSolucao || 0),
                custoSolucao: Number(custoSolucao || 0),
                precoSemDesconto: Number(precoSemSubsidio || 0),
                precoComDesconto: Number(precoComSubsidio || 0)
            })
        })

        renderizarListaSolucoesPainelGestao(solucoesResumo)

        const receitaTotal = solucoesResumo.reduce((acc, item) => acc + Number(item.precoComDesconto || 0), 0)
        const receitaSemSubsidioTotal = solucoesResumo.reduce((acc, item) => acc + Number(item.precoSemDesconto || 0), 0)
        const custoTotalComboGestao = solucoesResumo.reduce((acc, item) => acc + Number(item.custoSolucao || 0), 0)
        const totalPessoasComboGestao = solucoesResumo.reduce((acc, item) => acc + Number(item.participantes || 0), 0)
        const valorComboPorPessoa = totalPessoasComboGestao > 0 ? receitaTotal / totalPessoasComboGestao : 0
        const lucroTotalComboGestao = receitaTotal - custoTotalComboGestao
        const subsidioTotalComboGestao = receitaSemSubsidioTotal - receitaTotal
        const cargaHorariaCombo = coletarTotaisCombo().totalCargaHorariaServicos

        let margemLucroComboGestao = 0
        if (custoTotalComboGestao > 0) {
            margemLucroComboGestao = (lucroTotalComboGestao / custoTotalComboGestao) * 100
        } else if (lucroTotalComboGestao > 0) {
            margemLucroComboGestao = 100
        } else if (lucroTotalComboGestao < 0) {
            margemLucroComboGestao = -100
        }

        const margemLucroComboGestaoLabel = margemLucroComboGestao.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%'

        $('#pd-total-desconto').text(formatarMoedaNumero(receitaTotal))
        $('#pd-media-in').text(formatarMoedaNumero(valorComboPorPessoa))
        $('#pd-bruta-total').text(formatarMoedaNumero(receitaSemSubsidioTotal))
        $('#pd-desconto-total').text(formatarMoedaNumero(subsidioTotalComboGestao))

        const margemLucroGeralEl = $('#pd-margem-lucro')
        margemLucroGeralEl.removeClass('rf-margem-positiva rf-margem-negativa rf-margem-neutra')
        if (margemLucroComboGestao > 0) {
            margemLucroGeralEl.addClass('rf-margem-positiva')
        } else if (margemLucroComboGestao < 0) {
            margemLucroGeralEl.addClass('rf-margem-negativa')
        } else {
            margemLucroGeralEl.addClass('rf-margem-neutra')
        }
        margemLucroGeralEl.text(margemLucroComboGestaoLabel)
        $('#margemLucroGeral').val(margemLucroComboGestaoLabel).trigger('change')
        $('#pd-num-pessoas').text(totalPessoasComboGestao)
        $('#pd-carga-horaria').text(`${formatarQuantidadeResumo(cargaHorariaCombo)}h`)

        if (listaResumo.length) {
            listaResumo.html('<p class="pd-vazio">Para Evento de Mercado, a faixa de precificação (IN) não se aplica.</p>')
        }

        const solucaoAtiva = solucoesResumo.find((item) => item.idSolucao === String(idAbaSelecionada || '').trim())
        const precoAtivo = solucaoAtiva ? Number(solucaoAtiva.precoComDesconto || 0) : 0
        const custoAtivo = solucaoAtiva ? Number(solucaoAtiva.custoSolucao || 0) : Number(custoTotal || 0)

        return {
            totalBaseSolucoes: custoAtivo,
            brutoTotalIN: 0,
            liquidoTotalIN: 0,
            precoSugerido: precoAtivo,
            brutoTotalCombo: receitaTotal,
            liquidoTotalCombo: receitaTotal,
            descontoTotal: 0
        }
    }

    atualizarItensINCalculadosTodasSolucoes()
    atualizarItensINCalculados(idAbaSelecionada)
    const itens = coletarItensINDoPaiFilho(idAbaSelecionada)
    const estadoAba = obterEstadoDescontoAba(idAbaSelecionada)
    const totaisSolucao = coletarTotaisSolucao(idAbaSelecionada)
    const totalPessoasSolucoes = Number(participantes || totaisSolucao.totalPessoas || 0)
    const totalBaseSolucoes = Number(custoTotal || totaisSolucao.totalValorSolucoes || 0)
    const cargaHorariaCombo = coletarTotaisCombo().totalCargaHorariaServicos

    const solucoesResumo = coletarResumoSolucoesParaPainelGestao()
    renderizarListaSolucoesPainelGestao(solucoesResumo)

    const totalPrecificacaoSugeridaComDesconto = solucoesResumo.reduce((acc, item) => acc + Number(item.precoComDesconto || 0), 0)
    const totalPrecificacaoSugeridaSemDesconto = solucoesResumo.reduce((acc, item) => acc + Number(item.precoSemDesconto || 0), 0)
    const custoTotalComboGestao = solucoesResumo.reduce((acc, item) => acc + Number(item.custoSolucao || 0), 0)
    const descontoTotalComboGestao = totalPrecificacaoSugeridaSemDesconto - totalPrecificacaoSugeridaComDesconto
    const totalPessoasComboGestao = solucoesResumo.reduce((acc, item) => acc + Number(item.participantes || 0), 0)
    const valorComboPorPessoa = totalPessoasComboGestao > 0 ? totalPrecificacaoSugeridaComDesconto / totalPessoasComboGestao : 0
    const lucroTotalComboGestao = totalPrecificacaoSugeridaComDesconto - custoTotalComboGestao
    let margemLucroComboGestao = calcularMargemContribuicaoPercentual(custoTotalComboGestao, totalPrecificacaoSugeridaComDesconto)
    const margemLucroComboGestaoLabel = margemLucroComboGestao.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%'

    $('#pd-total-desconto').text(formatarMoedaNumero(totalPrecificacaoSugeridaComDesconto))
    $('#pd-media-in').text(formatarMoedaNumero(valorComboPorPessoa))
    $('#pd-bruta-total').text(formatarMoedaNumero(totalPrecificacaoSugeridaSemDesconto))
    $('#pd-desconto-total').text(formatarMoedaNumero(descontoTotalComboGestao))
    const margemLucroGeralEl = $('#pd-margem-lucro')
    margemLucroGeralEl.removeClass('rf-margem-positiva rf-margem-negativa rf-margem-neutra')
    if (margemLucroComboGestao > 0) {
        margemLucroGeralEl.addClass('rf-margem-positiva')
    } else if (margemLucroComboGestao < 0) {
        margemLucroGeralEl.addClass('rf-margem-negativa')
    } else {
        margemLucroGeralEl.addClass('rf-margem-neutra')
    }
    margemLucroGeralEl.text(margemLucroComboGestaoLabel)
    $('#margemLucroGeral').val(margemLucroComboGestaoLabel).trigger('change')
    $('#pd-num-pessoas').text(totalPessoasComboGestao)
    $('#pd-carga-horaria').text(`${formatarQuantidadeResumo(cargaHorariaCombo)}h`)

    if (!itens.length) {
        if (listaResumo.length) {
            listaResumo.html('<p class="pd-vazio">Adicione itens de Serviços Especializados para simular a faixa de precificação (IN).</p>')
        }
        return {
            totalBaseSolucoes,
            brutoTotalIN: 0,
            liquidoTotalIN: 0,
            precoSugerido: 0,
            brutoTotalCombo: totalBaseSolucoes,
            liquidoTotalCombo: totalBaseSolucoes,
            descontoTotal: 0
        }
    }

    let html = ''
    let brutoTotalIN = 0
    let liquidoTotalIN = 0

    itens.forEach((item, idx) => {
        const classeCor = `pd-cor-${(idx % 4) + 1}`
        const limitePercent = Math.min(100, Math.max(0, parseNumero(item.descontoLimite != null ? item.descontoLimite : 100)))
        const descontoPercent = Math.min(limitePercent, Math.max(0, parseNumero(item.descontoAplicado != null ? item.descontoAplicado : estadoAba[item.id] || 0)))
        estadoAba[item.id] = descontoPercent
        const valorComDesconto = item.valorBruto * (1 - descontoPercent / 100)
        const qtdPessoasIN = Number(item.participantes || 0)
        const valorPessoaComDesconto = qtdPessoasIN > 0 ? valorComDesconto / qtdPessoasIN : 0
        const sufixoPessoa = qtdPessoasIN === 1 ? 'pessoa' : 'pessoas'

        brutoTotalIN += item.valorBruto
        liquidoTotalIN += valorComDesconto

        html += `
            <div class="pd-item-card ${classeCor}">
                <div class="pd-item-indice ${classeCor}">${idx + 1}</div>
                <div class="pd-item-conteudo">
                    <h4>${escaparHtml(item.descricao)} · ${qtdPessoasIN} ${sufixoPessoa}</h4>
                    <div class="pd-item-metricas">
                        <div>
                            <span>VAL/PESSOA</span>
                            <strong>${formatarMoedaNumero(item.valorPessoa || 0)}</strong>
                        </div>
                        <div>
                            <span>VAL/PESSOA C/ DESC.</span>
                            <strong class="pd-liquido">${formatarMoedaNumero(valorPessoaComDesconto)}</strong>
                        </div>
                        <div>
                            <span>RECEITA BRUTA</span>
                            <strong class="pd-bruta">${formatarMoedaNumero(item.valorBruto)}</strong>
                        </div>
                        <div>
                            <span>C/ DESCONTO</span>
                            <strong class="pd-liquido">${formatarMoedaNumero(valorComDesconto)}</strong>
                        </div>
                    </div>
                </div>
                <div class="pd-item-desconto">
                    <label>Subsídios do SEBRAERN (%)</label>
                    <div class="pd-desconto-input-wrap">
                        <input type="number" class="form-control input-desconto-in" min="0" max="${limitePercent}" step="1"
                               data-idaba="${escaparHtml(idAbaSelecionada)}" data-itemid="${escaparHtml(item.id)}" data-rowid="${escaparHtml(item.rowId || '')}"
                               data-limite="${escaparHtml(String(limitePercent))}"
                               title="Limite da faixa: ${escaparHtml(String(limitePercent))}%"
                               value="${descontoPercent}" />
                        <span class="pd-desconto-sufixo">%</span>
                    </div>
                </div>
            </div>
        `
    })

    const brutoTotalCombo = totalBaseSolucoes + brutoTotalIN
    const liquidoTotalCombo = totalBaseSolucoes + liquidoTotalIN
    const descontoTotal = brutoTotalIN - liquidoTotalIN
    const mediaPorSolucao = totalPessoasSolucoes > 0 ? liquidoTotalCombo / totalPessoasSolucoes : 0
    const margemEstimada = calcularMargemContribuicaoPercentual(totalBaseSolucoes, liquidoTotalCombo)

    if (listaResumo.length) {
        listaResumo.html(html)
    }

    return {
        totalBaseSolucoes,
        brutoTotalIN,
        liquidoTotalIN,
        precoSugerido: liquidoTotalIN,
        brutoTotalCombo,
        liquidoTotalCombo,
        descontoTotal
    }
}

function configurarPainelGestaoSemListaIN() {
    const listaGestao = $('#pd-lista-cards')
    if (listaGestao.length) {
        listaGestao.hide().empty()
    }

    const layoutGestao = $('#painel-descontos-receita .pd-layout')
    if (layoutGestao.length) {
        layoutGestao.css('grid-template-columns', '1fr')
    }
}

function removerSolucao(event, idAba) {
    let atividade = getActivity()

    if (atividade != 0 && atividade != 4 && atividade != 30) {
        return
    }

    event.stopPropagation()

    FLUIGC.message.confirm(
        {
            message: 'Remover esta solução e todos os itens dentro dela?',
            title: 'Confirmar Exclusão',
            labelYes: 'Remover',
            labelNo: 'Cancelar'
        },
        function (result) {
            if (result) {
                $(`table[tablename="solucoes"] tbody tr:not(:first)`).each(function () {
                    if ($(this).find(`input[name^="idSolucaoSL___"]`).val() === idAba) {
                        fnWdkRemoveChild($(this).find('input')[0])
                    }
                })
                tabelasFilhas.forEach((tabela) => {
                    $(`table[tablename="${tabela.nome}"] tbody tr:not(:first)`).each(function () {
                        if ($(this).find(`input[name^="${tabela.campoId}___"]`).val() === idAba) {
                            fnWdkRemoveChild($(this).find('input')[0])
                        }
                    })
                })

                $(`table[tablename="${TAB_PESSOAS}"] tbody tr:not(:first)`).each(function () {
                    if ($(this).find(`input[name^="idSolucaoCN___"]`).val() === idAba) {
                        fnWdkRemoveChild($(this).find('input')[0])
                    }
                })
                $(`table[tablename="deslocamento"] tbody tr:not(:first)`).each(function () {
                    if ($(this).find(`input[name^="idSolucaoDC___"]`).val() === idAba) {
                        fnWdkRemoveChild($(this).find('input')[0])
                    }
                })

                $(`.tab-solucao[data-id="${idAba}"]`).remove()
                delete bloqueioNomeSolucaoPorId[idAba]

                let abasRestantes = $('.tab-solucao')
                if (abasRestantes.length > 0) {
                    ativarAba(abasRestantes.first().data('id'))
                } else {
                    abaAtiva = null
                    $('#conteudo-tabelas-visuais').hide()
                }
            }
        }
    )
}

function adicionarLinhaFilha(nomeTabela, idCampoSolucao) {
    if (!abaAtiva) {
        showToast('Crie ou selecione uma aba de solução primeiro.', 'warning', 'Atenção')
        return
    }

    const campos = metadadosCamposFilhos[nomeTabela] || []
    const valoresEntrada = {}

    for (let i = 0; i < campos.length; i++) {
        const campo = campos[i]
        if (campo.baseName.toLowerCase().startsWith('valortotal')) continue
        const valor = ($(`#entrada_${nomeTabela}_${i}`).val() || '').trim()
        valoresEntrada[campo.baseName] = valor
    }

    const campoPrincipal = campos.length > 0 ? campos[0].baseName : null
    if (!campoPrincipal || !valoresEntrada[campoPrincipal]) {
        showToast('Informe o tipo/descrição antes de adicionar.', 'warning', 'Atenção')
        return
    }

    let rowId = wdkAddChild(nomeTabela)
    $('#' + idCampoSolucao + '___' + rowId)
        .val(abaAtiva)
        .trigger('change')

    campos.forEach((campo) => {
        const nomeCompleto = `${campo.baseName}___${rowId}`
        $(`input[name="${nomeCompleto}"]`)
            .val(valoresEntrada[campo.baseName] || '')
            .trigger('change')
    })

    const campoTotalGenerico = {
        servicosEpecializados: { total: 'valorTotalSE', valor: 'valorSE', qtd: 'cargaHorariaSE' }
    }

    const infoTotal = campoTotalGenerico[nomeTabela]
    if (infoTotal) {
        const vUnit = parseNumero(valoresEntrada[infoTotal.valor])
        const qtd = parseNumero(valoresEntrada[infoTotal.qtd]) || 1
        const total = formatarMoedaNumero(vUnit * qtd)
        $(`input[name="${infoTotal.total}___${rowId}"]`).val(total).trigger('change')
    }

    renderizarLinhaVisual(nomeTabela, rowId)
    limparCamposEntradaTabela(nomeTabela)
    renderizarResumoFinanceiro(abaAtiva)
}

function renderizarLinhaVisual(nomeTabela, rowId) {
    const trVisual = $(`<tr class="visual-row" data-rowid="${rowId}"></tr>`)
    const campos = metadadosCamposFilhos[nomeTabela] || []
    const configTabela = tabelasFilhas.find((t) => t.nome === nomeTabela)
    const origemField = configTabela?.campoOrigem ? `${configTabela.campoOrigem}___${rowId}` : null
    const isFromCombo = origemField ? $(`input[name="${origemField}"]`).val() === 'combo' : false

    campos.forEach((campo) => {
        const nomeCompleto = `${campo.baseName}___${rowId}`
        let valor = ($(`input[name="${nomeCompleto}"]`).val() || '').trim()

        if (campo.tipo === 'moeda') {
            valor = formatarMoedaVisual(valor)
        }

        const td = $('<td style="padding: 8px; border-bottom: 1px solid #ddd;"></td>').text(valor)
        trVisual.append(td)
    })

    if (isFromCombo) {
        trVisual.append(`
            <td style="text-align: center; border-bottom: 1px solid #ddd;">
                <button type="button" class="btn btn-secondary btn-sm btn-combo-locked" disabled title="Item do combo predefinido — não pode ser removido">
                    <i class="flaticon flaticon-trash icon-sm"></i>
                </button>
            </td>
        `)
    } else {
        trVisual.append(`
            <td style="text-align: center; border-bottom: 1px solid #ddd;">
                <button type="button" class="btn btn-danger btn-sm" onclick="removerLinhaFilha(this, '${nomeTabela}', '${rowId}')">
                    <i class="flaticon flaticon-trash icon-sm"></i>
                </button>
            </td>
        `)
    }

    $(`#visual_${nomeTabela} tbody tr.empty-state`).remove()
    $(`#visual_${nomeTabela} tbody`).append(trVisual)
    atualizarMensagemVaziaTabela(nomeTabela)
    renderizarResumoFinanceiro(abaAtiva)
}

function removerLinhaFilha(btnVisual, nomeTabela, rowId) {
    let atividade = getActivity()

    if (atividade != 0 && atividade != 4 && atividade != 30) {
        return
    }

    $(btnVisual).closest('tr').remove()

    let inputOculto = $(`table[tablename="${nomeTabela}"] input[name$="___${rowId}"]`).first()
    if (inputOculto.length > 0) {
        fnWdkRemoveChild(inputOculto[0])
    }

    atualizarMensagemVaziaTabela(nomeTabela)
    if (abaAtiva) renderizarResumoFinanceiro(abaAtiva)
}

function renderizarFormularioEntradaTabela(nomeTabela, idCampoSolucao) {
    if (nomeTabela === 'servicosEpecializados') {
        renderizarFormularioServicosEspecializados(idCampoSolucao)
        return
    }

    if (nomeTabela === 'materiais-didaticos') {
        renderizarFormularioMateriaisDidaticos(idCampoSolucao)
        return
    }

    if (nomeTabela === 'equipamentos') {
        renderizarFormularioEquipamentos(idCampoSolucao)
        return
    }

    if (nomeTabela === 'alimentacao') {
        renderizarFormularioAlimentacao(idCampoSolucao)
        return
    }

    const container = $(`#form_visual_${nomeTabela}`)
    const campos = metadadosCamposFilhos[nomeTabela] || []
    const colunasGrid = `repeat(${Math.max(campos.length, 1)}, minmax(160px, 1fr)) 120px`

    let html = `<div class="linha-inclusao-grid" style="grid-template-columns: ${colunasGrid};">`

    campos.forEach((campo, idx) => {
        if (campo.baseName.toLowerCase().startsWith('valortotal')) return

        html += `
            <div class="campo-inclusao campo-${campo.tipo}">
                <label>${campo.titulo}</label>
                <input
                    type="${campo.tipo === 'numero' ? 'number' : 'text'}"
                    class="form-control"
                    id="entrada_${nomeTabela}_${idx}"
                    placeholder="${idx === 0 ? 'Digite para buscar...' : ''}"
                    ${campo.tipo === 'numero' ? 'min="0" step="any"' : ''}
                    ${campo.tipo === 'moeda' ? 'oninput="mascaraMoeda(this)"' : ''}
                />
            </div>
        `
    })

    html += `
            <div class="campo-inclusao campo-acao">
                <label>&nbsp;</label>
                <button class="btn-adicionar-item" type="button" onclick="adicionarLinhaFilha('${nomeTabela}', '${idCampoSolucao}')">
                    <i class="flaticon flaticon-add-plus icon-sm"></i> Adicionar
                </button>
            </div>
        </div>
    `

    container.html(html)
}

function limparCamposEntradaTabela(nomeTabela) {
    const campos = metadadosCamposFilhos[nomeTabela] || []
    campos.forEach((_, idx) => {
        $(`#entrada_${nomeTabela}_${idx}`).val('')
    })
}

let cacheServicosEspecializados = null
let cacheParametrosDeslocamento = null

const configServicosEspecializados = [
    {
        grupo: 'Honorário',
        tablename: 'honorario',
        modoCalculo: 'hora',
        campoDescricao: 'honorario',
        campoTipoValor: 'tipoValorHN',
        campoCargaMaxima: 'cargaHorariaMaximaHN',
        campoMin: null,
        campoMax: null,
        campoValor: 'valorHoraHN'
    },
    {
        grupo: 'Família Empretec',
        tablename: 'empretect',
        tablenamesConsulta: ['empretect', 'empratec', 'empretc', 'empretec'],
        modoCalculo: 'hora',
        campoDescricao: 'tipoEP',
        campoMin: null,
        campoMax: null,
        campoValor: 'valorEP'
    }
]

function consultarDatasetParametros(tablename) {
    const ds = getDataset('dsFormInternoParametrosPrecificacao', {
        documentid: DOCUMENT_ID_PARAMETROS,
        tablename
    })

    return ds && Array.isArray(ds.values) ? ds : { columns: [], values: [] }
}

function valorCampoDataset(linha, columns, nomeCampo) {
    if (!linha) return ''
    if (Array.isArray(linha)) {
        const idx = (columns || []).indexOf(nomeCampo)
        return idx >= 0 ? String(linha[idx] || '').trim() : ''
    }
    return String(linha[nomeCampo] || '').trim()
}

function carregarParametrosDeslocamento() {
    if (cacheParametrosDeslocamento) return cacheParametrosDeslocamento

    const retorno = {
        valorBaseKm: 0,
        faixas: []
    }

    const dsPai = getDataset('dsFormInternoParametrosPrecificacao', {
        documentid: DOCUMENT_ID_PARAMETROS
    })

    if (dsPai && Array.isArray(dsPai.values) && dsPai.values.length) {
        const linhaPai = dsPai.values[0]
        retorno.valorBaseKm = parseNumero(valorCampoDataset(linhaPai, dsPai.columns || [], 'valorBaseDeslocamento'))
    }

    const dsFaixas = consultarDatasetParametros('deslocamento')
    const cols = dsFaixas.columns || []
    const vals = dsFaixas.values || []

    vals.forEach((row) => {
        const min = parseNumero(valorCampoDataset(row, cols, 'deslocamentoMinimoDL'))
        const max = parseNumero(valorCampoDataset(row, cols, 'deslocamentoMaximoDL'))
        const valor = parseNumero(valorCampoDataset(row, cols, 'valorDeslocamentoDL'))
        const tipo = valorCampoDataset(row, cols, 'tipoDeslocamentoDL')
        if (!valor) return
        retorno.faixas.push({ min, max, valor, tipo })
    })

    retorno.faixas.sort((a, b) => a.min - b.min)
    cacheParametrosDeslocamento = retorno
    return retorno
}

function faixaKmValida(faixa, km) {
    const min = Number(faixa.min || 0)
    const max = Number(faixa.max || 0)

    if (min <= 0 && max > 0) return km <= max
    if (max <= 0 && min > 0) return km >= min
    if (min <= 0 && max <= 0) return true

    return km >= min && km <= max
}

function obterAdicionalDeslocamento(km) {
    const params = carregarParametrosDeslocamento()
    const faixa = (params.faixas || []).find((f) => faixaKmValida(f, km))
    return faixa ? Number(faixa.valor || 0) : 0
}

function obterBonificacaoInstrutorPorDistanciaTotal(kmTotal) {
    const params = carregarParametrosDeslocamento()
    const faixas = params.faixas || []
    if (!faixas.length) return 0

    const faixasInstrutor = faixas.filter((f) => {
        const tipo = normalizarTextoComparacao(f.tipo || '')
        return tipo.indexOf('instrutor') >= 0 || tipo.indexOf('instrutoria') >= 0
    })

    const baseBusca = faixasInstrutor.length ? faixasInstrutor : faixas
    const faixa = baseBusca.find((f) => faixaKmValida(f, kmTotal))
    return faixa ? Number(faixa.valor || 0) : 0
}

function obterValorBaseKmFormatado() {
    const valorBase = Number(carregarParametrosDeslocamento().valorBaseKm || 0)
    return valorBase > 0 ? formatarMoedaNumero(valorBase) : ''
}

function carregarServicosEspecializadosParametros() {
    if (cacheServicosEspecializados) return cacheServicosEspecializados

    const itens = []
    const chavesUnicas = {}

    configServicosEspecializados.forEach((cfg) => {
        const tablenamesConsulta = Array.isArray(cfg.tablenamesConsulta) && cfg.tablenamesConsulta.length ? cfg.tablenamesConsulta : [cfg.tablename]

        tablenamesConsulta.forEach((nomeTabelaConsulta) => {
            const ds = consultarDatasetParametros(nomeTabelaConsulta)
            const columns = ds.columns || []
            const values = ds.values || []

            const idxDesc = columns.indexOf(cfg.campoDescricao)
            const idxValor = columns.indexOf(cfg.campoValor)
            const idxTipoValor = cfg.campoTipoValor ? columns.indexOf(cfg.campoTipoValor) : -1
            const idxCargaMaxima = cfg.campoCargaMaxima ? columns.indexOf(cfg.campoCargaMaxima) : -1

            values.forEach((row) => {
                let descricao, valorRaw, tipoValorRaw, cargaMaximaRaw

                if (Array.isArray(row)) {
                    descricao = idxDesc >= 0 ? String(row[idxDesc] || '').trim() : ''
                    valorRaw = idxValor >= 0 ? String(row[idxValor] || '').trim() : ''
                    tipoValorRaw = idxTipoValor >= 0 ? String(row[idxTipoValor] || '').trim() : ''
                    cargaMaximaRaw = idxCargaMaxima >= 0 ? String(row[idxCargaMaxima] || '').trim() : ''
                } else {
                    descricao = String(row[cfg.campoDescricao] || '').trim()
                    valorRaw = String(row[cfg.campoValor] || '').trim()
                    tipoValorRaw = cfg.campoTipoValor ? String(row[cfg.campoTipoValor] || '').trim() : ''
                    cargaMaximaRaw = cfg.campoCargaMaxima ? String(row[cfg.campoCargaMaxima] || '').trim() : ''
                }

                const valor = parseNumero(valorRaw)
                const tipoValor = normalizarTipoValorServico(tipoValorRaw)
                const cargaMaxima = parseNumero(cargaMaximaRaw)

                if (!descricao) return
                if (!valor) return

                const chaveItem = `${cfg.grupo}@@${normalizarTextoComparacao(descricao)}@@${valor}@@${tipoValor}@@${cargaMaxima}`
                if (chavesUnicas[chaveItem]) return
                chavesUnicas[chaveItem] = true

                itens.push({
                    grupo: cfg.grupo,
                    tablename: cfg.tablename,
                    modoCalculo: cfg.modoCalculo,
                    descricao,
                    valor,
                    tipoValor,
                    cargaMaxima
                })
            })
        })
    })

    itens.sort((a, b) => {
        if (a.grupo !== b.grupo) return a.grupo.localeCompare(b.grupo, 'pt-BR')
        return a.descricao.localeCompare(b.descricao, 'pt-BR')
    })

    cacheServicosEspecializados = itens
    return itens
}

function normalizarTipoValorServico(tipoInformado) {
    const tipo = String(tipoInformado || '')
        .trim()
        .toLowerCase()

    if (!tipo) return 'por_hora'
    if (tipo === 'fixo' || tipo.includes('fix')) return 'fixo'
    if (tipo.includes('hora')) return 'por_hora'

    return 'por_hora'
}

function tipoValorServicoLabel(tipoValor) {
    return tipoValor === 'fixo' ? 'Fixo' : 'Por hora'
}

function normalizarTextoComparacao(texto) {
    return String(texto || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
}

function extrairModalidadeServico(tipoServico) {
    const tipo = normalizarTextoComparacao(tipoServico)
    if (tipo.indexOf('online') >= 0 || tipo.indexOf('ead') >= 0 || tipo.indexOf('remoto') >= 0) return 'online'
    if (tipo.indexOf('company') >= 0) return 'company'
    if (tipo.indexOf('presencial') >= 0) return 'presencial'
    return ''
}

function ehDescricaoPalestra(descricao) {
    return normalizarTextoComparacao(descricao).indexOf('palestra') >= 0
}

function ehDescricaoInstrutoria(descricao) {
    const texto = normalizarTextoComparacao(descricao)
    return texto.indexOf('instrutoria') >= 0 || texto.indexOf('capacitacao') >= 0
}

function obterFaixaPalestraHonorarioPorModalidade(modalidade) {
    const itens = carregarServicosEspecializadosParametros().filter((item) => item.grupo === 'Honorário' && ehDescricaoPalestra(item.descricao))
    if (!itens.length) return null

    const mod = normalizarTextoComparacao(modalidade)
    if (mod === 'presencial' || mod === 'online') {
        const itemPreferencial = itens.find((item) => normalizarTextoComparacao(item.descricao).indexOf(mod) >= 0)
        if (itemPreferencial) return itemPreferencial
    }

    return itens[0]
}

function obterValorPalestraCompany(cargaHoraria) {
    const ds = consultarDatasetParametros('company')
    const cols = ds.columns || []
    const vals = ds.values || []
    if (!vals.length) return 0

    const idxDescricao = cols.indexOf('company')
    const idxMin = cols.indexOf('cargaHorariaMinimaCompany')
    const idxMax = cols.indexOf('cargaHorariaMaximaCompany')
    const idxValor = cols.indexOf('valorCompany')

    const faixas = []

    vals.forEach((row) => {
        let descricao = ''
        let minRaw = ''
        let maxRaw = ''
        let valorRaw = ''

        if (Array.isArray(row)) {
            descricao = idxDescricao >= 0 ? String(row[idxDescricao] || '').trim() : ''
            minRaw = idxMin >= 0 ? String(row[idxMin] || '').trim() : ''
            maxRaw = idxMax >= 0 ? String(row[idxMax] || '').trim() : ''
            valorRaw = idxValor >= 0 ? String(row[idxValor] || '').trim() : ''
        } else {
            descricao = String(row.company || '').trim()
            minRaw = String(row.cargaHorariaMinimaCompany || '').trim()
            maxRaw = String(row.cargaHorariaMaximaCompany || '').trim()
            valorRaw = String(row.valorCompany || '').trim()
        }

        const valor = parseNumero(valorRaw)
        if (!valor) return

        faixas.push({
            descricao,
            min: parseNumero(minRaw),
            max: parseNumero(maxRaw),
            valor
        })
    })

    if (!faixas.length) return 0

    const faixasPalestra = faixas.filter((f) => ehDescricaoPalestra(f.descricao))
    const baseBusca = faixasPalestra.length ? faixasPalestra : faixas
    const carga = Number(cargaHoraria || 0)
    const faixa = baseBusca.find((f) => faixaINValida(f.min, f.max, carga)) || baseBusca[0]
    return Number((faixa && faixa.valor) || 0)
}

function calcularValorServicoEspecializado(servico, tipoServico, cargaHoraria) {
    const valorServico = Number((servico && servico.faixas && servico.faixas[0] && servico.faixas[0].valor) || 0)
    const carga = Number(cargaHoraria || 0)
    const modalidade = extrairModalidadeServico(tipoServico)
    const isPalestra = ehDescricaoPalestra(servico && servico.descricao)
    const isInstrutoria = ehDescricaoInstrutoria(servico && servico.descricao)
    const grupoServico = normalizarTextoComparacao(servico && servico.grupo)
    const isFamiliaEmpretec = grupoServico.indexOf('familia empretec') >= 0

    if (!valorServico) {
        return { ok: false, mensagem: 'Serviço sem valor configurado na base de parâmetros.' }
    }

    // Regra especial: palestra company usa o mesmo valor base de palestra presencial/online
    if (isPalestra && modalidade === 'company') {
        const faixaPalestraBase = obterFaixaPalestraHonorarioPorModalidade('presencial') || obterFaixaPalestraHonorarioPorModalidade('online')
        const limitePalestraBase = Number((faixaPalestraBase && faixaPalestraBase.cargaMaxima) || 0)

        if (limitePalestraBase > 0 && carga > limitePalestraBase) {
            return {
                ok: false,
                mensagem: `A Palestra possui limite de ${limitePalestraBase}h.`
            }
        }

        const valorPalestraBase = Number((faixaPalestraBase && faixaPalestraBase.valor) || 0)
        if (!valorPalestraBase) {
            return { ok: false, mensagem: 'Não foi encontrado valor base de Palestra (Presencial/Online).' }
        }

        return {
            ok: true,
            valorUnitario: valorPalestraBase,
            valorTotal: valorPalestraBase
        }
    }

    // Regra especial: palestra/instrutoria/família empretec presencial ou online
    if (modalidade !== 'company' && (isPalestra || isInstrutoria || isFamiliaEmpretec)) {
        const faixaPalestra = obterFaixaPalestraHonorarioPorModalidade(modalidade)
        if (!faixaPalestra || !Number(faixaPalestra.valor)) {
            return {
                ok: false,
                mensagem: `Não foi possível localizar o valor da Palestra para o tipo ${tipoServico || 'informado'}.`
            }
        }

        const valorPalestra = Number(faixaPalestra.valor)
        const limitePalestra = Number(faixaPalestra.cargaMaxima || 0)

        if (isPalestra) {
            if (limitePalestra > 0 && carga > limitePalestra) {
                return {
                    ok: false,
                    mensagem: `A Palestra possui limite de ${limitePalestra}h.`
                }
            }

            return {
                ok: true,
                valorUnitario: valorPalestra,
                valorTotal: valorPalestra
            }
        }

        const horasBasePalestra = limitePalestra > 0 ? limitePalestra : 2
        const horasComplementares = Math.max(carga - horasBasePalestra, 0)
        const totalComBasePalestra = valorPalestra + horasComplementares * valorServico

        return {
            ok: true,
            valorUnitario: valorServico,
            valorTotal: totalComBasePalestra
        }
    }

    // Regra padrão dos demais serviços
    if (servico.tipoValor === 'por_hora' && Number(servico.cargaMaxima || 0) > 0 && carga > Number(servico.cargaMaxima || 0)) {
        return {
            ok: false,
            mensagem: `A carga horária máxima para este honorário é ${Number(servico.cargaMaxima || 0)}h.`
        }
    }

    const totalPadrao = servico.tipoValor === 'fixo' ? valorServico : valorServico * carga

    return {
        ok: true,
        valorUnitario: valorServico,
        valorTotal: totalPadrao
    }
}

function obterServicosEspecializadosAgrupados() {
    const itens = carregarServicosEspecializadosParametros()
    const mapa = {}

    itens.forEach((item) => {
        const key = `${item.grupo}@@${item.descricao}@@${item.tipoValor || 'por_hora'}`
        if (!mapa[key]) {
            mapa[key] = {
                key,
                grupo: item.grupo,
                descricao: item.descricao,
                modoCalculo: 'hora',
                tipoValor: item.tipoValor || 'por_hora',
                cargaMaxima: Number(item.cargaMaxima || 0),
                faixas: []
            }
        }

        const jaExiste = mapa[key].faixas.some((f) => f.valor === item.valor)
        if (!jaExiste) {
            mapa[key].faixas.push({ valor: item.valor })
        }
    })

    const servicos = Object.values(mapa)

    return servicos.sort((a, b) => {
        if (a.grupo !== b.grupo) return a.grupo.localeCompare(b.grupo, 'pt-BR')
        return a.descricao.localeCompare(b.descricao, 'pt-BR')
    })
}

function renderizarFormularioServicosEspecializados(idCampoSolucao) {
    const container = $('#form_visual_servicosEpecializados')
    const servicos = obterServicosEspecializadosAgrupados()

    const grupos = {
        Honorário: [],
        'Família Empretec': []
    }

    servicos.forEach((servico) => {
        if (!grupos[servico.grupo]) grupos[servico.grupo] = []
        grupos[servico.grupo].push(servico)
    })

    let optionsHtml = '<option value="">Selecione...</option>'
    Object.keys(grupos).forEach((grupo) => {
        if (!grupos[grupo].length) return
        optionsHtml += `<optgroup label="${escaparHtml(grupo)}">`
        grupos[grupo].forEach((servico) => {
            const sufixoTipo = servico.grupo === 'Honorário' ? ` (${tipoValorServicoLabel(servico.tipoValor)})` : ''
            optionsHtml += `<option value="${escaparHtml(servico.key)}" data-grupo="${escaparHtml(servico.grupo)}" data-desc="${escaparHtml(servico.descricao)}" data-tipo-valor="${escaparHtml(servico.tipoValor || 'por_hora')}">${escaparHtml(servico.descricao + sufixoTipo)}</option>`
        })
        optionsHtml += '</optgroup>'
    })
    optionsHtml += '<option value="__outro__">Outro</option>'

    container.html(`
        <div class="linha-inclusao-grid" style="grid-template-columns: 1fr 230px 170px 120px 130px 170px 170px 120px; align-items: end; column-gap: 12px;">
            <div class="campo-inclusao">
                <label>Serviço Especializado</label>
                <select class="form-control" id="se-select-servico" onchange="aoAlterarServicoEspecializado()">
                    ${optionsHtml}
                </select>
            </div>
            <div class="campo-inclusao" id="se-outro-wrap" style="display:none;">
                <label>Descrição do serviço</label>
                <input type="text" class="form-control" id="se-outro-descricao" placeholder="Digite o nome/descrição" oninput="aoAlterarServicoEspecializado()" />
            </div>
            <div class="campo-inclusao">
                <label>Tipo</label>
                <select class="form-control" id="se-tipo" onchange="aoAlterarServicoEspecializado()">
                    <option value="">Selecione...</option>
                    <option value="presencial">Presencial</option>
                    <option value="online">Online</option>
                    <option value="company">Company</option>
                </select>
            </div>
            <div class="campo-inclusao">
                <label>Carga Horária</label>
                <input type="number" class="form-control" id="se-carga" min="0" step="any" oninput="aoAlterarServicoEspecializado()" />
            </div>
            <div class="campo-inclusao">
                <label>Gratuito?</label>
                <select class="form-control" id="se-gratuito">
                    <option value="Não" selected>Não</option>
                    <option value="Sim">Sim</option>
                </select>
            </div>
            <div class="campo-inclusao">
                <label>Valor Unitário</label>
                <input type="text" class="form-control" id="se-valor" readonly style="background:#f5f7f9; cursor:not-allowed;" placeholder="Automático" oninput="aoAlterarServicoEspecializado()" />
            </div>
            <div class="campo-inclusao">
                <label>Valor Total (prévia)</label>
                <input type="text" class="form-control" id="se-total-previa" readonly style="background:#f5f7f9; cursor:not-allowed;" placeholder="Automático" />
            </div>
            <div class="campo-inclusao campo-acao">
                <label>&nbsp;</label>
                <button class="btn-adicionar-item" type="button" onclick="adicionarServicoEspecializadoCustom('${idCampoSolucao}')">
                    <i class="flaticon flaticon-add-plus icon-sm"></i> Adicionar
                </button>
            </div>
        </div>
    `)
}

function aoAlterarServicoEspecializado() {
    const servicos = obterServicosEspecializadosAgrupados()
    const chaveSelecionada = $('#se-select-servico').val()
    const carga = parseNumero($('#se-carga').val())
    const isOutro = chaveSelecionada === '__outro__'

    $('#se-outro-wrap').toggle(isOutro)
    $('#se-valor').prop('readonly', !isOutro)
    $('#se-valor')
        .css('background', isOutro ? '' : '#f5f7f9')
        .css('cursor', isOutro ? '' : 'not-allowed')
        .attr('placeholder', isOutro ? 'Informe o valor da hora' : 'Automático')

    $('#se-total-previa').val('')

    if (chaveSelecionada === '' || chaveSelecionada == null) {
        $('#se-outro-wrap').hide()
        $('#se-outro-descricao').val('')
        $('#se-valor').val('')
        $('#se-valor').prop('readonly', true).css('background', '#f5f7f9').css('cursor', 'not-allowed').attr('placeholder', 'Automático')
        return
    }

    if (isOutro) {
        const valorManual = parseNumero($('#se-valor').val())
        if (carga > 0 && valorManual > 0) {
            $('#se-total-previa').val(formatarMoedaNumero(valorManual * carga))
        }
        return
    }

    $('#se-valor').val('')

    const servico = servicos.find((s) => s.key === chaveSelecionada)
    if (!servico) return

    const tipoServico = ($('#se-tipo').val() || '').trim()
    if (!tipoServico) return

    const calculo = calcularValorServicoEspecializado(servico, tipoServico, carga)
    if (!calculo.ok) {
        showToast(calculo.mensagem || 'Não foi possível calcular o valor do serviço.', 'warning', 'Atenção')
        return
    }

    $('#se-valor').val(formatarMoedaNumero(calculo.valorUnitario))
    if (calculo.valorTotal > 0) {
        $('#se-total-previa').val(formatarMoedaNumero(calculo.valorTotal))
    }
}

function adicionarServicoEspecializadoCustom(idCampoSolucao) {
    if (!abaAtiva) {
        showToast('Crie ou selecione uma aba de solução primeiro.', 'warning', 'Atenção')
        return
    }

    const chaveSelecionada = $('#se-select-servico').val()
    if (chaveSelecionada === '' || chaveSelecionada == null) {
        showToast('Selecione um serviço especializado.', 'warning', 'Atenção')
        return
    }

    const isOutro = chaveSelecionada === '__outro__'

    const cargaHoraria = parseNumero($('#se-carga').val())
    if (!cargaHoraria) {
        showToast('Informe a carga horária.', 'warning', 'Atenção')
        return
    }

    const tipoServico = ($('#se-tipo').val() || '').trim()
    if (!tipoServico) {
        showToast('Selecione o tipo do serviço (Presencial, Online ou Company).', 'warning', 'Atenção')
        return
    }

    let valorUnitario = 0
    let valorTotalNumerico = 0
    let descricaoServico = ''
    let origemServico = ''

    if (isOutro) {
        const descricaoOutro = ($('#se-outro-descricao').val() || '').trim()
        if (!descricaoOutro) {
            showToast('Informe a descrição do serviço para a opção Outro.', 'warning', 'Atenção')
            return
        }

        valorUnitario = Number(parseNumero($('#se-valor').val()) || 0)
        if (!valorUnitario) {
            showToast('Informe o valor da hora no campo Valor Unitário.', 'warning', 'Atenção')
            return
        }

        valorTotalNumerico = valorUnitario * Number(cargaHoraria || 0)
        descricaoServico = `Outro - ${descricaoOutro}`
        origemServico = 'outro'
    } else {
        const servicos = obterServicosEspecializadosAgrupados()
        const servico = servicos.find((s) => s.key === chaveSelecionada)
        if (!servico) {
            showToast('Serviço selecionado não encontrado na base de parâmetros.', 'warning', 'Atenção')
            return
        }

        const calculo = calcularValorServicoEspecializado(servico, tipoServico, cargaHoraria)
        if (!calculo.ok) {
            showToast(calculo.mensagem || 'Não foi possível calcular o valor do serviço.', 'warning', 'Atenção')
            return
        }

        valorUnitario = Number(calculo.valorUnitario || 0)
        valorTotalNumerico = Number(calculo.valorTotal || 0)
        descricaoServico = `${servico.grupo} - ${servico.descricao}`
    }

    const valorTotal = formatarMoedaNumero(valorTotalNumerico)
    const gratuito = ($('#se-gratuito').val() || 'Não').trim() || 'Não'

    const rowId = wdkAddChild('servicosEpecializados')

    $(`#${idCampoSolucao}___${rowId}`).val(abaAtiva).trigger('change')
    $(`input[name="descricaoSE___${rowId}"]`).val(descricaoServico).trigger('change')
    $(`input[name="tipoSE___${rowId}"]`).val(tipoServico).trigger('change')
    $(`input[name="cargaHorariaSE___${rowId}"]`).val(cargaHoraria).trigger('change')
    $(`input[name="gratuitoSE___${rowId}"]`).val(gratuito).trigger('change')
    $(`input[name="valorSE___${rowId}"]`).val(formatarMoedaNumero(valorUnitario)).trigger('change')
    $(`input[name="valorTotalSE___${rowId}"]`).val(valorTotal).trigger('change')
    if (origemServico) {
        $(`input[name="origemSE___${rowId}"]`).val(origemServico).trigger('change')
    }

    renderizarLinhaVisual('servicosEpecializados', rowId)

    $('#se-select-servico').val('')
    $('#se-outro-descricao').val('')
    $('#se-tipo').val('')
    $('#se-carga').val('')
    $('#se-gratuito').val('Não')
    $('#se-valor').val('')
    $('#se-total-previa').val('')
    $('#se-outro-wrap').hide()
    $('#se-valor').prop('readonly', true).css('background', '#f5f7f9').css('cursor', 'not-allowed').attr('placeholder', 'Automático')

    renderizarResumoFinanceiro(abaAtiva)
}

const cacheMateriais = {}

const mapaCategoriasMateriaisDidaticos = {
    papelaria: {
        tabela: 'itens',
        campDesc: 'descricao',
        campValor: 'valor_unitario'
    },
    impressoes: {
        tabela: 'itens',
        campDesc: 'descricao',
        campValor: 'valor_unitario'
    },
    expediente: {
        tabela: 'itens',
        campDesc: 'descricao',
        campValor: 'valor_unitario'
    }
}

function carregarMateriaisCategoria(categoria, documentId) {
    const tableData = mapaCategoriasMateriaisDidaticos[categoria]
    const docId = String(documentId || '').trim()
    if (!tableData) return []
    if (!docId) return []

    const cacheKey = `${categoria}::${docId}`
    if (cacheMateriais[cacheKey]) return cacheMateriais[cacheKey]

    try {
        const constraints = [
            DatasetFactory.createConstraint('documentid', docId, docId, ConstraintType.MUST),
            DatasetFactory.createConstraint('tablename', tableData.tabela, tableData.tabela, ConstraintType.MUST),
            DatasetFactory.createConstraint('metadata#active', 'True', 'True', ConstraintType.MUST)
        ]
        const ds = DatasetFactory.getDataset('dsformInternoSolicitacaoServicoTerceirizado', null, constraints, null)

        console.warn('Tabela de materiais')
        console.table(ds.values)

        const columns = ds.columns || []
        const values = ds.values || []
        const idxDesc = columns.findIndex((col) => String(col || '').toLowerCase() === String(tableData.campDesc || '').toLowerCase())
        const idxValor = columns.findIndex((col) => String(col || '').toLowerCase() === String(tableData.campValor || '').toLowerCase())

        const itens = values
            .map((row) => {
                let descricao, valor
                if (Array.isArray(row)) {
                    descricao = idxDesc >= 0 ? String(row[idxDesc] || '').trim() : ''
                    valor = idxValor >= 0 ? String(row[idxValor] || '').trim() : ''
                } else {
                    descricao = String(row[tableData.campDesc] || row.descricao || '').trim()
                    valor = String(row[tableData.campValor] || row.valor_unitario || '').trim()
                }
                return { descricao, valor }
            })
            .filter((item) => item.descricao)

        cacheMateriais[cacheKey] = itens
        return itens
    } catch (e) {
        console.error('[MateriaisDidaticos] Erro ao carregar categoria:', categoria, e)
        return []
    }
}

function obterContratosMateriaisDidaticosPorCategoria(categoria) {
    return CONTRATOS_MATERIAIS_DIDATICOS[categoria] || []
}

function atualizarSelectContratoMateriaisDidaticos(categoria) {
    const selectContrato = $('#md-select-contrato')
    selectContrato.empty()

    if (!categoria || categoria === 'outros') {
        selectContrato.append('<option value="">Selecione o tipo primeiro</option>')
        selectContrato.prop('disabled', true)
        inicializarSelectComBusca('#md-select-contrato', 'Selecione o contrato')
        return
    }

    const contratos = obterContratosMateriaisDidaticosPorCategoria(categoria)
    if (!contratos.length) {
        selectContrato.append('<option value="">Nenhum contrato cadastrado</option>')
        selectContrato.prop('disabled', true)
        inicializarSelectComBusca('#md-select-contrato', 'Nenhum contrato cadastrado')
        return
    }

    selectContrato.append('<option value="">Selecione o contrato...</option>')
    contratos.forEach((contrato) => {
        selectContrato.append(`<option value="${escaparHtml(contrato.documentId)}">${escaparHtml(contrato.nome)}</option>`)
    })
    selectContrato.prop('disabled', false)
    inicializarSelectComBusca('#md-select-contrato', 'Selecione o contrato')
    selectContrato.val(null).trigger('change')
}

function preencherSelectMateriaisDidaticos(categoria, documentId) {
    const selectMaterial = $('#md-select-material')
    selectMaterial.empty()

    if (!categoria || !documentId) {
        selectMaterial.append('<option value="">Selecione o tipo e o contrato primeiro</option>')
        selectMaterial.prop('disabled', true)
        inicializarSelectComBusca('#md-select-material', 'Selecione o material')
        return
    }

    const itens = carregarMateriaisCategoria(categoria, documentId)
    if (!itens.length) {
        selectMaterial.append('<option value="">Nenhum item cadastrado</option>')
        selectMaterial.prop('disabled', true)
        inicializarSelectComBusca('#md-select-material', 'Nenhum item cadastrado')
        return
    }

    selectMaterial.append('<option value="">Selecione...</option>')
    itens.forEach((item, idx) => {
        selectMaterial.append($('<option></option>').val(idx).attr('data-valor', item.valor).text(item.descricao))
    })
    selectMaterial.prop('disabled', false)
    inicializarSelectComBusca('#md-select-material', 'Selecione o material')
    selectMaterial.val(null).trigger('change')
}

function renderizarFormularioMateriaisDidaticos(idCampoSolucao) {
    const container = $('#form_visual_materiais-didaticos')
    container.html(`
        <div class="linha-inclusao-grid" style="grid-template-columns: 220px 1.2fr 1fr 170px 110px 170px 120px; align-items: end; column-gap: 12px;">
            <div class="campo-inclusao">
                <label>Tipo</label>
                <select class="form-control" id="md-filtro-categoria" onchange="aoMudarCategoriaMateriaisDidaticos()">
                    <option value="">Selecione...</option>
                    <option value="papelaria">Materiais de Papelaria</option>
                    <option value="impressoes">Impressões</option>
                    <option value="expediente">Materiais de Expediente</option>
                    <option value="outros">Outros</option>
                </select>
            </div>
            <div class="campo-inclusao">
                <label>Contrato</label>
                <select class="form-control" id="md-select-contrato" onchange="aoMudarContratoMateriaisDidaticos()" disabled>
                    <option value="">Selecione o tipo primeiro</option>
                </select>
            </div>
            <div class="campo-inclusao">
                <label>Material</label>
                <select class="form-control" id="md-select-material" onchange="aoSelecionarMaterialDidatico()" disabled>
                    <option value="">Selecione o tipo e o contrato primeiro</option>
                </select>
                <input type="text" class="form-control" id="md-input-outro"
                    placeholder="Descreva o material..."
                    style="display:none; margin-top:4px;" />
            </div>
            <div class="campo-inclusao">
                <label>Valor Unitário</label>
                <input type="text" class="form-control" id="md-valor" readonly
                    style="background:#f5f7f9; cursor:not-allowed;"
                    placeholder="Automático"
                    oninput="mascaraMoeda(this); atualizarPreviaTotalMateriaisDidaticos()" />
            </div>
            <div class="campo-inclusao">
                <label>Quantidade</label>
                <input type="number" class="form-control" id="md-quantidade" min="1" step="1" value="1" oninput="atualizarPreviaTotalMateriaisDidaticos()" />
            </div>
            <div class="campo-inclusao">
                <label>Valor Total (prévia)</label>
                <input type="text" class="form-control" id="md-total-previa" readonly
                    style="background:#f5f7f9; cursor:not-allowed;"
                    placeholder="Automático" />
            </div>
            <div class="campo-inclusao campo-acao">
                <label>&nbsp;</label>
                <button class="btn-adicionar-item" type="button" onclick="adicionarMaterialDidaticoCustom('${idCampoSolucao}')">
                    <i class="flaticon flaticon-add-plus icon-sm"></i> Adicionar
                </button>
            </div>
        </div>
    `)

    inicializarSelectComBusca('#md-filtro-categoria', 'Selecione o tipo')
    inicializarSelectComBusca('#md-select-contrato', 'Selecione o contrato')
    inicializarSelectComBusca('#md-select-material', 'Selecione o material')
}

function aoMudarCategoriaMateriaisDidaticos() {
    const categoria = $('#md-filtro-categoria').val()
    const selectMaterial = $('#md-select-material')
    const inputOutro = $('#md-input-outro')

    $('#md-valor').val('')
    $('#md-total-previa').val('')
    selectMaterial.empty()
    atualizarSelectContratoMateriaisDidaticos(categoria)

    if (!categoria) {
        selectMaterial.append('<option value="">Selecione o tipo e o contrato primeiro</option>')
        selectMaterial.prop('disabled', true)
        inicializarSelectComBusca('#md-select-material', 'Selecione o material')
        inputOutro.hide()
        $('#md-valor').prop('readonly', true).css({ background: '#f5f7f9', cursor: 'not-allowed' })
        return
    }

    if (categoria === 'outros') {
        if (selectMaterial.hasClass('select2-hidden-accessible')) {
            selectMaterial.select2('destroy')
        }
        selectMaterial.hide()
        inputOutro.show().val('')
        $('#md-valor').prop('readonly', false).css({ background: '', cursor: '' }).attr('placeholder', 'Informe o valor')
        atualizarPreviaTotalMateriaisDidaticos()
        return
    }

    $('#md-valor').prop('readonly', true).css({ background: '#f5f7f9', cursor: 'not-allowed' }).attr('placeholder', 'Automático')
    selectMaterial.show()
    inputOutro.hide()
    preencherSelectMateriaisDidaticos(categoria, '')
    atualizarPreviaTotalMateriaisDidaticos()
}

function aoMudarContratoMateriaisDidaticos() {
    const categoria = ($('#md-filtro-categoria').val() || '').trim()
    const contrato = ($('#md-select-contrato').val() || '').trim()

    $('#md-valor').val('')
    $('#md-total-previa').val('')

    if (!categoria || categoria === 'outros') {
        return
    }

    preencherSelectMateriaisDidaticos(categoria, contrato)
    atualizarPreviaTotalMateriaisDidaticos()
}

function aoSelecionarMaterialDidatico() {
    const opt = $('#md-select-material option:selected')
    const valor = opt.attr('data-valor') || ''
    $('#md-valor').val(valor ? formatarMoedaVisual(valor) : '')
    atualizarPreviaTotalMateriaisDidaticos()
}

function atualizarPreviaTotalMateriaisDidaticos() {
    const valor = parseNumero($('#md-valor').val())
    const quantidade = parseNumero($('#md-quantidade').val()) || 1
    const total = valor > 0 ? valor * quantidade : 0
    $('#md-total-previa').val(total > 0 ? formatarMoedaNumero(total) : '')
}

function adicionarMaterialDidaticoCustom(idCampoSolucao) {
    if (!abaAtiva) {
        showToast('Crie ou selecione uma aba de solução primeiro.', 'warning', 'Atenção')
        return
    }

    const categoria = $('#md-filtro-categoria').val()
    if (!categoria) {
        showToast('Selecione o tipo.', 'warning', 'Atenção')
        return
    }

    let descricao = ''
    let valorRaw = ''

    if (categoria === 'outros') {
        descricao = ($('#md-input-outro').val() || '').trim()
        if (!descricao) {
            showToast('Informe a descrição do material.', 'warning', 'Atenção')
            return
        }
        valorRaw = ''
    } else {
        const contratoSelecionado = ($('#md-select-contrato').val() || '').trim()
        if (!contratoSelecionado) {
            showToast('Selecione o contrato para carregar os materiais.', 'warning', 'Atenção')
            return
        }

        const opt = $('#md-select-material option:selected')
        descricao = (opt.text() || '').trim()
        valorRaw = (opt.attr('data-valor') || '').trim()
        if (!descricao || opt.val() === '' || opt.val() == null) {
            showToast('Selecione um material.', 'warning', 'Atenção')
            return
        }
    }

    const quantidade = parseInt($('#md-quantidade').val(), 10) || 1
    const valorFormatado = valorRaw ? formatarMoedaVisual(valorRaw) : ''
    const valorNumerico = parseNumero(valorRaw)
    const valorTotal = formatarMoedaNumero(valorNumerico * quantidade)

    const rowId = wdkAddChild('materiais-didaticos')

    $(`#${idCampoSolucao}___${rowId}`).val(abaAtiva).trigger('change')
    $(`input[name="descricaoMD___${rowId}"]`).val(descricao).trigger('change')
    $(`input[name="quantidadeMD___${rowId}"]`).val(quantidade).trigger('change')
    $(`input[name="valorMD___${rowId}"]`).val(valorFormatado).trigger('change')
    $(`input[name="valorTotalMD___${rowId}"]`).val(valorTotal).trigger('change')
    $(`input[name="origemMD___${rowId}"]`).val(categoria).trigger('change')

    renderizarLinhaVisual('materiais-didaticos', rowId)

    $('#md-filtro-categoria').val(null).trigger('change')
    $('#md-select-contrato').empty().append('<option value="">Selecione o tipo primeiro</option>').prop('disabled', true)
    inicializarSelectComBusca('#md-select-contrato', 'Selecione o contrato')
    $('#md-select-contrato').val(null).trigger('change')
    $('#md-select-material').empty().append('<option value="">Selecione o tipo e o contrato primeiro</option>').prop('disabled', true).show()
    inicializarSelectComBusca('#md-select-material', 'Selecione o material')
    $('#md-select-material').val(null).trigger('change')
    $('#md-input-outro').hide().val('')
    $('#md-valor').val('')
    $('#md-quantidade').val('1')
    $('#md-total-previa').val('')

    renderizarResumoFinanceiro(abaAtiva)
}

let _cacheEquipamentosPorContrato = {}

function carregarEquipamentos(documentId) {
    const docId = String(documentId || '').trim()
    if (!docId) return []
    if (_cacheEquipamentosPorContrato[docId]) return _cacheEquipamentosPorContrato[docId]
    try {
        const c1 = DatasetFactory.createConstraint('documentid', docId, docId, ConstraintType.MUST)
        const c2 = DatasetFactory.createConstraint('tablename', 'itens', 'itens', ConstraintType.MUST)
        const c3 = DatasetFactory.createConstraint('metadata#active', 'True', 'True', ConstraintType.MUST)
        const constraints = new Array(c3, c1, c2)
        const ds = DatasetFactory.getDataset('dsformInternoSolicitacaoServicoTerceirizado', null, constraints, null)

        const columns = ds.columns || []
        const valores = ds.values || []

        console.log(`[Equipamentos] docId ${docId} | colunas:`, JSON.stringify(columns))
        console.log(`[Equipamentos] docId ${docId} | total linhas:`, valores.length)

        const idxDesc = columns.indexOf('descricao')
        const idxValor = columns.indexOf('valor_unitario')
        const idxUnd = columns.indexOf('und')

        const itens = valores
            .map((row) => {
                let descricao, valor, und
                if (Array.isArray(row)) {
                    descricao = idxDesc >= 0 ? String(row[idxDesc] || '').trim() : ''
                    valor = idxValor >= 0 ? String(row[idxValor] || '').trim() : ''
                    und = idxUnd >= 0 ? String(row[idxUnd] || '').trim() : ''
                } else {
                    descricao = String(row.descricao || '').trim()
                    valor = String(row.valor_unitario || '').trim()
                    und = String(row.und || '').trim()
                }
                return { descricao, valor, und }
            })
            .filter((item) => item.descricao)

        _cacheEquipamentosPorContrato[docId] = itens
        return itens
    } catch (e) {
        console.error('[Equipamentos] Erro ao carregar:', e)
        return []
    }
}

function renderizarFormularioEquipamentos(idCampoSolucao) {
    const container = $('#form_visual_equipamentos')
    let opcoesContratoHtml = '<option value="">Selecione o contrato...</option>'
    CONTRATOS_EQUIPAMENTOS.forEach((contrato) => {
        opcoesContratoHtml += `<option value="${escaparHtml(contrato.documentId)}">${escaparHtml(contrato.nome)}</option>`
    })
    opcoesContratoHtml += '<option value="outros">Outros</option>'

    container.html(`
        <div class="linha-inclusao-grid" style="grid-template-columns: 1.2fr 1fr 170px 110px 110px 170px 120px; align-items: end; column-gap: 12px;">
            <div class="campo-inclusao">
                <label>Contrato</label>
                <select class="form-control" id="ep-select-contrato" onchange="aoSelecionarContratoEquipamentos()">
                    ${opcoesContratoHtml}
                </select>
            </div>
            <div class="campo-inclusao">
                <label>Equipamento</label>
                <select class="form-control" id="ep-select-equipamento" onchange="aoSelecionarEquipamento()" disabled>
                    <option value="">Selecione o contrato primeiro</option>
                </select>
                <input type="text" class="form-control" id="ep-input-outro"
                    placeholder="Descreva o equipamento..."
                    style="display:none; margin-top:4px;" />
            </div>
            <div class="campo-inclusao">
                <label>Valor Unitário</label>
                <input type="text" class="form-control" id="ep-valor" readonly
                    style="background:#f5f7f9; cursor:not-allowed;"
                    placeholder="Automático"
                    oninput="mascaraMoeda(this); atualizarPreviaTotalEquipamentos()" />
            </div>
            <div class="campo-inclusao">
                <label>Quantidade</label>
                <input type="number" class="form-control" id="ep-quantidade" min="1" step="1" value="1" oninput="atualizarPreviaTotalEquipamentos()" />
            </div>
            <div class="campo-inclusao">
                <label>Diária</label>
                <input type="number" class="form-control" id="ep-carga" min="0" step="any" placeholder="Qtd" oninput="atualizarPreviaTotalEquipamentos()" />
            </div>
            <div class="campo-inclusao">
                <label>Valor Total (prévia)</label>
                <input type="text" class="form-control" id="ep-total-previa" readonly
                    style="background:#f5f7f9; cursor:not-allowed;"
                    placeholder="Automático" />
            </div>
            <div class="campo-inclusao campo-acao">
                <label>&nbsp;</label>
                <button class="btn-adicionar-item" type="button" onclick="adicionarEquipamentoCustom('${idCampoSolucao}')">
                    <i class="flaticon flaticon-add-plus icon-sm"></i> Adicionar
                </button>
            </div>
        </div>
    `)

    inicializarSelectComBusca('#ep-select-contrato', 'Selecione o contrato')
    inicializarSelectComBusca('#ep-select-equipamento', 'Selecione o equipamento')
}

function aoSelecionarContratoEquipamentos() {
    const documentId = ($('#ep-select-contrato').val() || '').toString().trim()
    const selectEquipamento = $('#ep-select-equipamento')
    const inputOutro = $('#ep-input-outro')

    selectEquipamento.empty()
    inputOutro.hide().val('')
    $('#ep-valor').val('')
    $('#ep-total-previa').val('')

    if (!documentId) {
        selectEquipamento.append('<option value="">Selecione o contrato primeiro</option>')
        selectEquipamento.prop('disabled', true)
        if (selectEquipamento.hasClass('select2-hidden-accessible')) {
            selectEquipamento.select2('destroy')
        }
        selectEquipamento.show()
        inicializarSelectComBusca('#ep-select-equipamento', 'Selecione o equipamento')
        $('#ep-valor').prop('readonly', true).css({ background: '#f5f7f9', cursor: 'not-allowed' }).attr('placeholder', 'Automático')
        return
    }

    if (documentId === 'outros') {
        if (selectEquipamento.hasClass('select2-hidden-accessible')) {
            selectEquipamento.select2('destroy')
        }
        selectEquipamento.hide().prop('disabled', true)
        inputOutro.show().val('')
        $('#ep-valor').prop('readonly', false).css({ background: '', cursor: '' }).attr('placeholder', 'Informe o valor')
        atualizarPreviaTotalEquipamentos()
        return
    }

    $('#ep-valor').prop('readonly', true).css({ background: '#f5f7f9', cursor: 'not-allowed' }).attr('placeholder', 'Automático')
    selectEquipamento.show()

    const itens = carregarEquipamentos(documentId)
    if (!itens.length) {
        selectEquipamento.append('<option value="">Nenhum equipamento cadastrado</option>')
        selectEquipamento.prop('disabled', true)
        inicializarSelectComBusca('#ep-select-equipamento', 'Nenhum equipamento cadastrado')
        return
    }

    selectEquipamento.append('<option value="">Selecione...</option>')
    itens.forEach((item, idx) => {
        selectEquipamento.append(`<option value="${idx}" data-valor="${escaparHtml(item.valor)}" data-und="${escaparHtml(item.und)}">${escaparHtml(item.descricao)}</option>`)
    })

    selectEquipamento.prop('disabled', false)
    inicializarSelectComBusca('#ep-select-equipamento', 'Selecione o equipamento')
    selectEquipamento.val(null).trigger('change')
}

function aoSelecionarEquipamento() {
    const opt = $('#ep-select-equipamento option:selected')
    const valor = opt.attr('data-valor') || ''
    $('#ep-valor').val(valor ? formatarMoedaVisual(valor) : '')
    atualizarPreviaTotalEquipamentos()
}

function atualizarPreviaTotalEquipamentos() {
    const valor = parseNumero($('#ep-valor').val())
    const quantidade = parseNumero($('#ep-quantidade').val()) || 1
    const diaria = parseNumero($('#ep-carga').val()) || 1
    const total = valor > 0 ? valor * quantidade * diaria : 0
    $('#ep-total-previa').val(total > 0 ? formatarMoedaNumero(total) : '')
}

function adicionarEquipamentoCustom(idCampoSolucao) {
    if (!abaAtiva) {
        showToast('Crie ou selecione uma aba de solução primeiro.', 'warning', 'Atenção')
        return
    }

    const contratoSelecionado = ($('#ep-select-contrato').val() || '').toString().trim()
    if (!contratoSelecionado) {
        showToast('Selecione o contrato para carregar os equipamentos.', 'warning', 'Atenção')
        return
    }

    let descricao = ''
    let valorRaw = ''

    if (contratoSelecionado === 'outros') {
        descricao = ($('#ep-input-outro').val() || '').trim()
        if (!descricao) {
            showToast('Informe a descrição do equipamento.', 'warning', 'Atenção')
            return
        }
        valorRaw = ($('#ep-valor').val() || '').trim()
        if (parseNumero(valorRaw) <= 0) {
            showToast('Informe o valor unitário do equipamento.', 'warning', 'Atenção')
            return
        }
    } else {
        const opt = $('#ep-select-equipamento option:selected')
        descricao = (opt.text() || '').trim()
        if (!descricao || opt.val() === '' || opt.val() == null) {
            showToast('Selecione um equipamento.', 'warning', 'Atenção')
            return
        }
        valorRaw = (opt.attr('data-valor') || '').trim()
    }

    const quantidade = parseInt($('#ep-quantidade').val(), 10) || 1
    const cargaHoraria = ($('#ep-carga').val() || '').trim()
    const valorNumerico = parseNumero(valorRaw)
    const valorFormatado = valorNumerico > 0 ? formatarMoedaNumero(valorNumerico) : ''
    const diariasEP = parseNumero(cargaHoraria) || 1
    const valorTotal = formatarMoedaNumero(valorNumerico * quantidade * diariasEP)

    const rowId = wdkAddChild('equipamentos')

    $(`#${idCampoSolucao}___${rowId}`).val(abaAtiva).trigger('change')
    $(`input[name="descricaoEP___${rowId}"]`).val(descricao).trigger('change')
    $(`input[name="quantidadeEP___${rowId}"]`).val(quantidade).trigger('change')
    $(`input[name="cargaHorariaEP___${rowId}"]`).val(cargaHoraria).trigger('change')
    $(`input[name="valorEP___${rowId}"]`).val(valorFormatado).trigger('change')
    $(`input[name="valorTotalEP___${rowId}"]`).val(valorTotal).trigger('change')

    renderizarLinhaVisual('equipamentos', rowId)

    $('#ep-select-contrato').val(null).trigger('change')
    $('#ep-select-equipamento').empty().append('<option value="">Selecione o contrato primeiro</option>').prop('disabled', true).show()
    inicializarSelectComBusca('#ep-select-equipamento', 'Selecione o equipamento')
    $('#ep-select-equipamento').val(null).trigger('change')
    $('#ep-input-outro').hide().val('')
    $('#ep-valor').val('')
    $('#ep-quantidade').val('1')
    $('#ep-carga').val('')
    $('#ep-total-previa').val('')

    renderizarResumoFinanceiro(abaAtiva)
}

let _cacheAlimentacaoPorContrato = {}

function carregarAlimentacao(documentId) {
    const docId = String(documentId || '').trim()
    if (!docId) return []
    if (_cacheAlimentacaoPorContrato[docId]) return _cacheAlimentacaoPorContrato[docId]
    try {
        const c1 = DatasetFactory.createConstraint('documentid', docId, docId, ConstraintType.MUST)
        const c2 = DatasetFactory.createConstraint('tablename', 'itens', 'itens', ConstraintType.MUST)
        const c3 = DatasetFactory.createConstraint('metadata#active', 'True', 'True', ConstraintType.MUST)
        const constraints = new Array(c3, c1, c2)
        const ds = DatasetFactory.getDataset('dsformInternoSolicitacaoServicoTerceirizado', null, constraints, null)

        const columns = ds.columns || []
        const valores = ds.values || []

        const idxDesc = columns.indexOf('descricao')
        const idxValor = columns.indexOf('valor_unitario')

        const itens = valores
            .map((row) => {
                let descricao, valor
                if (Array.isArray(row)) {
                    descricao = idxDesc >= 0 ? String(row[idxDesc] || '').trim() : ''
                    valor = idxValor >= 0 ? String(row[idxValor] || '').trim() : ''
                } else {
                    descricao = String(row.descricao || '').trim()
                    valor = String(row.valor_unitario || '').trim()
                }
                return { descricao, valor }
            })
            .filter((item) => item.descricao)

        _cacheAlimentacaoPorContrato[docId] = itens
        return itens
    } catch (e) {
        console.error('[Alimentacao] Erro ao carregar:', e)
        return []
    }
}

function renderizarFormularioAlimentacao(idCampoSolucao) {
    const container = $('#form_visual_alimentacao')
    let opcoesContratoHtml = '<option value="">Selecione o contrato...</option>'
    CONTRATOS_ALIMENTACAO.forEach((contrato) => {
        opcoesContratoHtml += `<option value="${escaparHtml(contrato.documentId)}">${escaparHtml(contrato.nome)}</option>`
    })
    opcoesContratoHtml += '<option value="outros">Outros</option>'

    container.html(`
        <div class="linha-inclusao-grid" style="grid-template-columns: 1.2fr 1fr 170px 110px 110px 170px 120px; align-items: end; column-gap: 12px;">
            <div class="campo-inclusao">
                <label>Contrato</label>
                <select class="form-control" id="al-select-contrato" onchange="aoSelecionarContratoAlimentacao()">
                    ${opcoesContratoHtml}
                </select>
            </div>
            <div class="campo-inclusao">
                <label>Descrição</label>
                <select class="form-control" id="al-select-item" onchange="aoSelecionarAlimentacao()" disabled>
                    <option value="">Selecione o contrato primeiro</option>
                </select>
                <input type="text" class="form-control" id="al-input-outro"
                    placeholder="Descreva o item..."
                    style="display:none; margin-top:4px;" />
            </div>
            <div class="campo-inclusao">
                <label>Valor Unitário</label>
                <input type="text" class="form-control" id="al-valor" readonly
                    style="background:#f5f7f9; cursor:not-allowed;"
                    placeholder="Automático"
                    oninput="mascaraMoeda(this); atualizarPreviaTotalAlimentacao()" />
            </div>
            <div class="campo-inclusao">
                <label>Quantidade</label>
                <input type="number" class="form-control" id="al-quantidade" min="1" step="1" value="1" oninput="atualizarPreviaTotalAlimentacao()" />
            </div>
            <div class="campo-inclusao">
                <label>Diária</label>
                <input type="number" class="form-control" id="al-diaria" min="0" step="1" placeholder="Qtd" oninput="atualizarPreviaTotalAlimentacao()" />
            </div>
            <div class="campo-inclusao">
                <label>Valor Total (prévia)</label>
                <input type="text" class="form-control" id="al-total-previa" readonly
                    style="background:#f5f7f9; cursor:not-allowed;"
                    placeholder="Automático" />
            </div>
            <div class="campo-inclusao campo-acao">
                <label>&nbsp;</label>
                <button class="btn-adicionar-item" type="button" onclick="adicionarAlimentacaoCustom('${idCampoSolucao}')">
                    <i class="flaticon flaticon-add-plus icon-sm"></i> Adicionar
                </button>
            </div>
        </div>
    `)

    inicializarSelectComBusca('#al-select-contrato', 'Selecione o contrato')
    inicializarSelectComBusca('#al-select-item', 'Selecione o item')
}

function aoSelecionarContratoAlimentacao() {
    const documentId = ($('#al-select-contrato').val() || '').toString().trim()
    const selectAlimentacao = $('#al-select-item')
    const inputOutro = $('#al-input-outro')

    selectAlimentacao.empty()
    inputOutro.hide().val('')
    $('#al-valor').val('')
    $('#al-total-previa').val('')

    if (!documentId) {
        selectAlimentacao.append('<option value="">Selecione o contrato primeiro</option>')
        selectAlimentacao.prop('disabled', true)
        if (selectAlimentacao.hasClass('select2-hidden-accessible')) {
            selectAlimentacao.select2('destroy')
        }
        selectAlimentacao.show()
        inicializarSelectComBusca('#al-select-item', 'Selecione o item')
        $('#al-valor').prop('readonly', true).css({ background: '#f5f7f9', cursor: 'not-allowed' }).attr('placeholder', 'Automático')
        return
    }

    if (documentId === 'outros') {
        if (selectAlimentacao.hasClass('select2-hidden-accessible')) {
            selectAlimentacao.select2('destroy')
        }
        selectAlimentacao.hide().prop('disabled', true)
        inputOutro.show().val('')
        $('#al-valor').prop('readonly', false).css({ background: '', cursor: '' }).attr('placeholder', 'Informe o valor')
        atualizarPreviaTotalAlimentacao()
        return
    }

    $('#al-valor').prop('readonly', true).css({ background: '#f5f7f9', cursor: 'not-allowed' }).attr('placeholder', 'Automático')
    selectAlimentacao.show()

    const itens = carregarAlimentacao(documentId)
    if (!itens.length) {
        selectAlimentacao.append('<option value="">Nenhum item cadastrado</option>')
        selectAlimentacao.prop('disabled', true)
        inicializarSelectComBusca('#al-select-item', 'Nenhum item cadastrado')
        return
    }

    selectAlimentacao.append('<option value="">Selecione...</option>')
    itens.forEach((item, idx) => {
        selectAlimentacao.append(`<option value="${idx}" data-valor="${escaparHtml(item.valor)}">${escaparHtml(item.descricao)}</option>`)
    })

    selectAlimentacao.prop('disabled', false)
    inicializarSelectComBusca('#al-select-item', 'Selecione o item')
    selectAlimentacao.val(null).trigger('change')
}

function aoSelecionarAlimentacao() {
    const opt = $('#al-select-item option:selected')
    const valor = opt.attr('data-valor') || ''
    $('#al-valor').val(valor ? formatarMoedaVisual(valor) : '')
    atualizarPreviaTotalAlimentacao()
}

function atualizarPreviaTotalAlimentacao() {
    const valor = parseNumero($('#al-valor').val())
    const quantidade = parseNumero($('#al-quantidade').val()) || 1
    const diaria = parseNumero($('#al-diaria').val()) || 1
    const total = valor > 0 ? valor * quantidade * diaria : 0
    $('#al-total-previa').val(total > 0 ? formatarMoedaNumero(total) : '')
}

function adicionarAlimentacaoCustom(idCampoSolucao) {
    if (!abaAtiva) {
        showToast('Crie ou selecione uma aba de solução primeiro.', 'warning', 'Atenção')
        return
    }

    const contratoSelecionado = ($('#al-select-contrato').val() || '').toString().trim()
    if (!contratoSelecionado) {
        showToast('Selecione o contrato para carregar os itens de alimentação.', 'warning', 'Atenção')
        return
    }

    let descricao = ''
    let valorRaw = ''

    if (contratoSelecionado === 'outros') {
        descricao = ($('#al-input-outro').val() || '').trim()
        if (!descricao) {
            showToast('Informe a descrição do item de alimentação.', 'warning', 'Atenção')
            return
        }
        valorRaw = ($('#al-valor').val() || '').trim()
        if (parseNumero(valorRaw) <= 0) {
            showToast('Informe o valor unitário do item de alimentação.', 'warning', 'Atenção')
            return
        }
    } else {
        const opt = $('#al-select-item option:selected')
        descricao = (opt.text() || '').trim()
        if (!descricao || opt.val() === '' || opt.val() == null) {
            showToast('Selecione um item.', 'warning', 'Atenção')
            return
        }
        valorRaw = (opt.attr('data-valor') || '').trim()
    }

    const quantidade = parseInt($('#al-quantidade').val(), 10) || 1
    const diaria = ($('#al-diaria').val() || '').trim()
    const valorNumerico = parseNumero(valorRaw)
    const valorFormatado = valorNumerico > 0 ? formatarMoedaNumero(valorNumerico) : ''
    const diariasAL = parseNumero(diaria) || 1
    const valorTotal = formatarMoedaNumero(valorNumerico * quantidade * diariasAL)

    const rowId = wdkAddChild('alimentacao')

    $(`#${idCampoSolucao}___${rowId}`).val(abaAtiva).trigger('change')
    $(`input[name="descricaoAL___${rowId}"]`).val(descricao).trigger('change')
    $(`input[name="quantidadeAL___${rowId}"]`).val(quantidade).trigger('change')
    $(`input[name="cargaHorariaAL___${rowId}"]`).val(diaria).trigger('change')
    $(`input[name="valorAL___${rowId}"]`).val(valorFormatado).trigger('change')
    $(`input[name="valorTotalAL___${rowId}"]`).val(valorTotal).trigger('change')

    renderizarLinhaVisual('alimentacao', rowId)

    $('#al-select-contrato').val(null).trigger('change')
    $('#al-select-item').empty().append('<option value="">Selecione o contrato primeiro</option>').prop('disabled', true).show()
    inicializarSelectComBusca('#al-select-item', 'Selecione o item')
    $('#al-select-item').val(null).trigger('change')
    $('#al-input-outro').hide().val('')
    $('#al-valor').val('')
    $('#al-quantidade').val('1')
    $('#al-diaria').val('')
    $('#al-total-previa').val('')

    renderizarResumoFinanceiro(abaAtiva)
}

function atualizarMensagemVaziaTabela(nomeTabela) {
    const tbody = $(`#visual_${nomeTabela} tbody`)
    const totalColunas = $(`#thead_visual_${nomeTabela} th`).length || 1
    const possuiLinhas = tbody.find('tr.visual-row').length > 0

    tbody.find('tr.empty-state').remove()

    if (!possuiLinhas) {
        tbody.append(`
            <tr class="empty-state">
                <td colspan="${totalColunas}" class="texto-vazio-tabela">Nenhum item adicionado.</td>
            </tr>
        `)
    }
}

function inferirTipoCampo(titulo) {
    const texto = String(titulo || '').toLowerCase()

    if (texto.includes('valor')) {
        return 'moeda'
    }

    if (
        texto.includes('quantidade') ||
        texto.includes('carga') ||
        texto.includes('tempo') ||
        texto.includes('distância') ||
        texto.includes('distancia') ||
        texto.includes('diária') ||
        texto.includes('diaria')
    ) {
        return 'numero'
    }

    return 'texto'
}

function formatarMoedaVisual(valor) {
    if (!valor) return ''

    const texto = String(valor).trim()
    if (texto.startsWith('R$')) return texto

    let normalizado = texto.replace(/\./g, '').replace(',', '.')
    normalizado = normalizado.replace(/[^\d.-]/g, '')
    const numero = parseFloat(normalizado)

    if (isNaN(numero)) return texto

    return numero.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function bindSyncEvents() {
    $(document).on('input', '.input-sync', function () {
        let targetName = $(this).data('target')
        $(`input[name="${targetName}"]`).val($(this).val()).trigger('change')

        if (targetName && String(targetName).startsWith('nomeSolucaoSL___')) {
            const novoTitulo = $(this).val() || 'Solução'
            $(`.tab-solucao[data-id="${abaAtiva}"] .tab-title`).text(novoTitulo)
            if (abaAtiva) {
                nomeSolucaoAutoGeradoPorId[abaAtiva] = false
            }
        }

        if (abaAtiva) {
            renderizarResumoFinanceiro(abaAtiva)
        }
    })

    $(document).on('change', '.input-sync-select', async function () {
        const $select = $(this)
        let targetName = $select.data('target')
        const valorSelecionado = ($select.val() || '').toString()
        $(`input[name="${targetName}"]`).val(valorSelecionado).trigger('change')

        if (targetName && String(targetName).startsWith('nomeSolucaoSL___')) {
            const novoTitulo = valorSelecionado || 'Solução'
            $(`.tab-solucao[data-id="${abaAtiva}"] .tab-title`).text(novoTitulo)
            if (abaAtiva) {
                nomeSolucaoAutoGeradoPorId[abaAtiva] = false
            }

            const podeCarregarBaseSebraern = isEventoSebraernSelecionado() && bloqueioNomeSolucaoPorId[abaAtiva] !== true && !!valorSelecionado
            if (podeCarregarBaseSebraern) {
                if ($select.data('carregandoSolucaoSebraern') === true) return

                $select.data('carregandoSolucaoSebraern', true)
                let loading = null
                try {
                    loading = criarLoadingFluig('Carregando dados da solução...')
                    if (loading && typeof loading.show === 'function') {
                        loading.show()
                    }

                    const referencia = await localizarSolucaoSebraernPorNome(valorSelecionado)
                    if (!referencia) {
                        showToast('Não foi possível localizar a solução selecionada no dataset.', 'warning', 'Atenção')
                    } else {
                        await aplicarSolucaoSebraernNaAba(abaAtiva, referencia)
                    }
                } finally {
                    if (loading && typeof loading.hide === 'function') {
                        loading.hide()
                    }
                    $select.data('carregandoSolucaoSebraern', false)
                }
                return
            }
        }

        if (abaAtiva) {
            renderizarResumoFinanceiro(abaAtiva)
        }
    })

    $(document).on('change', '.grupoComercialRadio', function () {
        if (!isAtividadeInicial(getActivity())) {
            var contextoAtualBloqueado = ($('#eventoSelecionado').val() || '').trim()
            $('.grupoComercialRadio').prop('checked', false)
            if (contextoAtualBloqueado) {
                $('.grupoComercialRadio').each(function () {
                    if (($(this).val() || '').trim() === contextoAtualBloqueado) {
                        $(this).prop('checked', true)
                    }
                })
            }
            return
        }

        const contextoAnterior = ($('#eventoSelecionado').val() || '').trim()
        const novoContexto = ($(this).val() || '').trim()

        if (contextoAnterior && contextoAnterior !== novoContexto) {
            resetarDadosAoTrocarContextoEvento()
        }

        $('.grupoComercialRadio').not(this).prop('checked', false)
        $('.customRadio').removeClass('selected')
        $(this).closest('.customRadio').addClass('selected')
        $('#eventoSelecionado').val(novoContexto).trigger('change')
        aplicarVisibilidadeEvento(novoContexto)
        if (abaAtiva) {
            renderizarResumoFinanceiro(abaAtiva)
        }
    })

    $(document).on('click', '.customRadio', function (e) {
        if (!isAtividadeInicial(getActivity())) return
        if ($(e.target).is('input[type="radio"]')) return
        $(this).find('input[type="radio"]').prop('checked', true).trigger('change')
    })

    $(document).on('change', '#comboBase', function () {
        const val = $(this).val()
        if (val) {
            abrirPainelSolucoes()
        } else if (isEventoSebraernSelecionado() && isModoComboSebraern()) {
            fecharPainelSolucoes()
        }
    })

    $(document).on('change', '#modoEntradaSebraern', function () {
        if (!isAtividadeInicial(getActivity())) return
        if (!isEventoSebraernSelecionado()) return

        const modoSelecionado = getModoEntradaSebraern()

        if (modoSelecionado === 'solucao') {
            const comboBase = $('#comboBase')
            if (comboBase.length && comboBase.val()) {
                resetarDadosAoTrocarContextoEvento()
                comboBase.prop('selectedIndex', 0)
                comboBase.val('')
            }
        }

        aplicarVisibilidadeEvento('Evento-SebraeRN', false)
    })

    $(document)
        .off('input.lucroMercado change.lucroMercado blur.lucroMercado', '#rf-lucro-percentual, #rf-lucro-valor, #rf-subsidio-sebraern')
        .on('input.lucroMercado change.lucroMercado blur.lucroMercado', '#rf-lucro-percentual, #rf-lucro-valor, #rf-subsidio-sebraern', function () {
            if (!abaAtiva || !isContextoEventoComercial() || atualizandoInputsLucroMercado) return

            const dadosLinha = obterLinhaPaiSolucao(abaAtiva)
            const rowIdPai = dadosLinha.rowIdPai
            if (!rowIdPai) return

            const totaisSolucao = coletarTotaisSolucao(abaAtiva)
            const custoTotal = Number(totaisSolucao.totalValorSolucoes || 0)

            let lucroValor = 0
            if (this.id === 'rf-lucro-percentual') {
                const margemInformada = parseNumero($('#rf-lucro-percentual').val())
                lucroValor = custoTotal > 0 ? (custoTotal * margemInformada) / 100 : 0
            } else {
                lucroValor = parseNumero($('#rf-lucro-valor').val())
            }

            $(`input[name="valorLucroSL___${rowIdPai}"]`).val(formatarMoedaNumero(lucroValor)).trigger('change')
            const subsidioPercentual = Math.min(100, Math.max(0, parseNumero($('#rf-subsidio-sebraern').val())))
            $(`input[name="subsidioSebraernSL___${rowIdPai}"]`).val(formatarNumeroDecimal(subsidioPercentual, 2)).trigger('change')
            renderizarResumoFinanceiro(abaAtiva)
        })

    $(document)
        .off('input.descontoIN change.descontoIN blur.descontoIN', '.input-desconto-in')
        .on('input.descontoIN', '.input-desconto-in', function () {
            const $input = $(this)
            const idAba = String($input.data('idaba') || '')
            const itemId = String($input.data('itemid') || '')
            const rowId = String($input.data('rowid') || '')
            if (!idAba || !itemId) return

            const limiteData = Math.min(100, Math.max(0, parseNumero($input.data('limite'))))
            let limite = limiteData
            if (rowId) {
                const limiteLinhaRaw = $(`input[name="descontoLimiteINS___${rowId}"]`).val()
                if (limiteLinhaRaw != null && String(limiteLinhaRaw).trim() !== '') {
                    const limiteLinha = Math.min(100, Math.max(0, parseNumero(limiteLinhaRaw)))
                    limite = Math.min(limiteData, limiteLinha)
                }
            }

            $input.attr('max', String(limite)).data('limite', limite)

            let valorDigitado = parseNumero($input.val())
            if (valorDigitado < 0) valorDigitado = 0

            const sincronizarValorDesconto = function (valorNumerico, renderizarResumo) {
                const valorFinal = Math.round(Math.min(limite, Math.max(0, parseNumero(valorNumerico))))
                $input.val(valorFinal)

                const estadoAba = obterEstadoDescontoAba(idAba)
                estadoAba[itemId] = valorFinal

                if (rowId) {
                    $(`input[name="descontoAplicadoINS___${rowId}"]`).val(String(valorFinal)).trigger('change')
                }

                if (renderizarResumo && abaAtiva) renderizarResumoFinanceiro(abaAtiva)
            }

            const timeoutAnterior = $input.data('limiteTimeout')
            if (timeoutAnterior) {
                clearTimeout(timeoutAnterior)
                $input.removeData('limiteTimeout')
            }

            if (valorDigitado > limite) {
                if (!$input.data('limiteAlertado')) {
                    showToast(`O desconto máximo permitido para esta faixa é ${limite}%.`, 'warning', 'Limite de desconto')
                    $input.data('limiteAlertado', true)
                }

                const timeout = setTimeout(function () {
                    sincronizarValorDesconto(limite, false)
                }, 900)

                $input.data('limiteTimeout', timeout)
                return
            }

            $input.data('limiteAlertado', false)
            sincronizarValorDesconto(valorDigitado, false)
        })
        .on('change.descontoIN blur.descontoIN', '.input-desconto-in', function () {
            const $input = $(this)
            const idAba = String($input.data('idaba') || '')
            const itemId = String($input.data('itemid') || '')
            const rowId = String($input.data('rowid') || '')
            if (!idAba || !itemId) return

            const timeoutAnterior = $input.data('limiteTimeout')
            if (timeoutAnterior) {
                clearTimeout(timeoutAnterior)
                $input.removeData('limiteTimeout')
            }

            const limiteData = Math.min(100, Math.max(0, parseNumero($input.data('limite'))))
            let limite = limiteData
            if (rowId) {
                const limiteLinhaRaw = $(`input[name="descontoLimiteINS___${rowId}"]`).val()
                if (limiteLinhaRaw != null && String(limiteLinhaRaw).trim() !== '') {
                    const limiteLinha = Math.min(100, Math.max(0, parseNumero(limiteLinhaRaw)))
                    limite = Math.min(limiteData, limiteLinha)
                }
            }

            let valor = parseNumero($input.val())
            valor = Math.min(limite, Math.max(0, valor))

            const valorFinal = Math.round(valor)
            $input.attr('max', String(limite)).data('limite', limite).val(valorFinal).data('limiteAlertado', false)

            const estadoAba = obterEstadoDescontoAba(idAba)
            estadoAba[itemId] = valorFinal

            if (rowId) {
                $(`input[name="descontoAplicadoINS___${rowId}"]`).val(String(valorFinal)).trigger('change')
            }

            if (abaAtiva) renderizarResumoFinanceiro(abaAtiva)
        })

    const valorSalvo = $('#eventoSelecionado').val()
    if (valorSalvo) {
        $('.grupoComercialRadio').each(function () {
            if ($(this).val() === valorSalvo) {
                $(this).prop('checked', true)
                $(this).closest('.customRadio').addClass('selected')
            }
        })
        aplicarVisibilidadeEvento(valorSalvo, true)
    }
}

function aplicarVisibilidadeEvento(valor, restaurando) {
    const isSebraern = valor === 'Evento-SebraeRN'
    const isComercial = valor === 'Evento-Comercial'

    if (isSebraern) {
        $('.form-group-modo-sebraern').slideDown(250)

        const usandoCombo = isModoComboSebraern()
        if (usandoCombo) {
            $('.form-group-combo-base').slideDown(250)
            if (restaurando && $('#comboBase').val()) {
                abrirPainelSolucoes()
            } else if (!restaurando) {
                fecharPainelSolucoes()
            }
        } else {
            $('.form-group-combo-base').slideUp(250)
            abrirPainelSolucoes()
        }
    } else if (isComercial) {
        $('.form-group-modo-sebraern').slideUp(250)
        $('.form-group-combo-base').slideUp(250)
        abrirPainelSolucoes()
    } else {
        $('.form-group-modo-sebraern').hide()
        $('.form-group-combo-base').hide()
        fecharPainelSolucoes()
    }

    atualizarVisibilidadeResumoFinanceiroPorEvento()

    if (abaAtiva) {
        renderizarDadosTabelaPai(abaAtiva)
        renderizarResumoFinanceiro(abaAtiva)
    }
}

function abrirPainelSolucoes() {
    const painel = $('.sub-painel-default')
    if (painel.hasClass('painel-aberto')) return
    painel.css({ display: 'block', overflow: 'hidden', height: 0, opacity: 0 })
    painel.addClass('painel-aberto')
    const altura = painel[0].scrollHeight
    painel.animate({ height: altura, opacity: 1 }, 350, function () {
        $(this).css({ height: '', overflow: '' })
    })
}

function fecharPainelSolucoes() {
    const painel = $('.sub-painel-default')
    if (!painel.hasClass('painel-aberto')) return
    painel.animate({ height: 0, opacity: 0 }, 280, function () {
        $(this).css({ display: 'none', height: '', opacity: '' })
        $(this).removeClass('painel-aberto')
    })
}

function carregarDadosExistentes() {
    let temAbas = false
    let primeiroId = null

    $("table[tablename='solucoes'] tbody tr:not(:first)").each(function () {
        let id = $(this).find("input[name^='idSolucaoSL___']").val()
        let nome = $(this).find("input[name^='nomeSolucaoSL___']").val() || 'Solução'

        if (id) {
            criarAba(id, nome)
            if (!primeiroId) primeiroId = id
            temAbas = true
        }
    })

    if (temAbas) {
        abrirPainelSolucoes()
        ativarAba(primeiroId)
    }
}

function toggleAcordion(elemento) {
    let body = $(elemento).next('.body-sub-painel-acordion')
    let icon = $(elemento).find('.accordion-icon')

    if (body.hasClass('active')) {
        body.removeClass('active').slideUp(180)
        icon.removeClass('active')
    } else {
        body.addClass('active').slideDown(180)
        icon.addClass('active')
    }
}

function mascaraMoeda(campo) {
    let valor = campo.value
    valor = valor.replace(/\D/g, '')

    if (valor.length === 0) {
        campo.value = ''
        return
    }

    valor = (valor / 100).toFixed(2) + ''
    valor = valor.replace('.', ',')
    valor = valor.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')
    campo.value = 'R$ ' + valor
}
