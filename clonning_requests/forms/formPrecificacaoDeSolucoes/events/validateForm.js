function validateForm(form) {
    // var atividade = parseInt(getValue('WKNumState'))
    // var MODE = form.getFormMode()

    // var message = ''
    // var hasErros = false

    // function addMensagem(campo, tipo) {
    //     message += getMessage(campo, tipo)
    //     hasErros = true
    // }

    // function validarCampoObrigatorio(campo, label, tipoMensagem) {
    //     if (isEmpty(form.getValue(campo))) {
    //         addMensagem(label, tipoMensagem || 1)
    //     }
    // }

    // function validarTabelaMinimoLinhas(tablename, mensagem) {
    //     var indexes = form.getChildrenIndexes(tablename)
    //     if (!indexes || indexes.length === 0) {
    //         message += '<li>' + mensagem + '</li>'
    //         hasErros = true
    //         return []
    //     }
    //     return indexes
    // }

    // function validarCamposTabela(tablename, camposObrigatorios) {
    //     var indexes = form.getChildrenIndexes(tablename)
    //     if (!indexes || indexes.length === 0) {
    //         return
    //     }

    //     for (var i = 0; i < indexes.length; i++) {
    //         var idx = indexes[i]
    //         for (var c = 0; c < camposObrigatorios.length; c++) {
    //             var cfg = camposObrigatorios[c]
    //             var valor = form.getValue(cfg.campo + '___' + idx)
    //             if (isEmpty(valor)) {
    //                 message += '<li>' + tablename + ' (linha ' + (i + 1) + '): o campo <b>' + cfg.label + '</b> é obrigatório.</li>'
    //                 hasErros = true
    //             }
    //         }
    //     }
    // }

    // function validarSolucoesEAssociacoesDeCustos() {
    //     var indexesSolucoes = validarTabelaMinimoLinhas('solucoes', 'É necessário adicionar pelo menos uma <b>Solução</b>.')
    //     if (!indexesSolucoes || indexesSolucoes.length === 0) {
    //         return
    //     }

    //     var mapaSolucoes = {}
    //     var idsSolucoes = []

    //     for (var i = 0; i < indexesSolucoes.length; i++) {
    //         var idxSol = indexesSolucoes[i]
    //         var nomeSolucao = form.getValue('nomeSolucaoSL___' + idxSol)
    //         var qtdParticipantes = form.getValue('quantidadeParticipantesSL___' + idxSol)
    //         var idSolucao = (form.getValue('idSolucaoSL___' + idxSol) || '').trim()
    //         var referenciaSolucao = (nomeSolucao || 'linha ' + (i + 1)).trim()

    //         if (isEmpty(nomeSolucao)) {
    //             message += '<li>O campo <b>Nome da Solução</b> da solução <b>' + referenciaSolucao + '</b> é obrigatório.</li>'
    //             hasErros = true
    //         }
    //         if (isEmpty(qtdParticipantes)) {
    //             message += '<li>O campo <b>Quantidade de Participantes</b> da solução <b>' + referenciaSolucao + '</b> é obrigatório.</li>'
    //             hasErros = true
    //         }
    //         if (isEmpty(idSolucao)) {
    //             message += '<li>O campo <b>ID da Solução</b> da solução <b>' + referenciaSolucao + '</b> é obrigatório.</li>'
    //             hasErros = true
    //             continue
    //         }

    //         if (mapaSolucoes[idSolucao]) {
    //             message += '<li>Foi encontrado ID de solução duplicado: <b>' + idSolucao + '</b>.</li>'
    //             hasErros = true
    //             continue
    //         }

    //         mapaSolucoes[idSolucao] = {
    //             linha: i + 1,
    //             nome: (nomeSolucao || 'Solução').trim()
    //         }
    //         idsSolucoes.push(idSolucao)
    //     }

    //     var tabelasCusto = [
    //         {
    //             tablename: 'servicosEpecializados',
    //             label: 'Serviços Especializados',
    //             campoIdSolucao: 'idSolucaoSE',
    //             camposObrigatorios: [
    //                 { campo: 'descricaoSE', label: 'Serviço Especializado' },
    //                 { campo: 'tipoSE', label: 'Tipo' },
    //                 { campo: 'cargaHorariaSE', label: 'Carga Horária' },
    //                 { campo: 'valorSE', label: 'Valor Unitário' },
    //                 { campo: 'valorTotalSE', label: 'Valor Total' }
    //             ]
    //         },
    //         {
    //             tablename: 'materiais-didaticos',
    //             label: 'Materiais Didáticos',
    //             campoIdSolucao: 'idSolucaoMD',
    //             camposObrigatorios: [
    //                 { campo: 'descricaoMD', label: 'Material Didático' },
    //                 { campo: 'quantidadeMD', label: 'Quantidade' },
    //                 { campo: 'valorMD', label: 'Valor Unitário' },
    //                 { campo: 'valorTotalMD', label: 'Valor Total' }
    //             ]
    //         },
    //         {
    //             tablename: 'equipamentos',
    //             label: 'Equipamentos',
    //             campoIdSolucao: 'idSolucaoEP',
    //             camposObrigatorios: [
    //                 { campo: 'descricaoEP', label: 'Equipamento' },
    //                 { campo: 'quantidadeEP', label: 'Quantidade' },
    //                 { campo: 'valorEP', label: 'Valor Unitário' },
    //                 { campo: 'valorTotalEP', label: 'Valor Total' }
    //             ]
    //         },
    //         {
    //             tablename: 'alimentacao',
    //             label: 'Alimentação',
    //             campoIdSolucao: 'idSolucaoAL',
    //             camposObrigatorios: [
    //                 { campo: 'descricaoAL', label: 'Descrição' },
    //                 { campo: 'quantidadeAL', label: 'Quantidade' },
    //                 { campo: 'valorAL', label: 'Valor Unitário' },
    //                 { campo: 'valorTotalAL', label: 'Valor Total' }
    //             ]
    //         }
    //     ]

    //     var totalAssociacoesPorSolucao = {}
    //     for (var s = 0; s < idsSolucoes.length; s++) {
    //         totalAssociacoesPorSolucao[idsSolucoes[s]] = 0
    //     }

    //     for (var t = 0; t < tabelasCusto.length; t++) {
    //         var cfgTabela = tabelasCusto[t]
    //         var indexesTabela = form.getChildrenIndexes(cfgTabela.tablename)
    //         if (!indexesTabela || indexesTabela.length === 0) {
    //             continue
    //         }

    //         for (var r = 0; r < indexesTabela.length; r++) {
    //             var idxTabela = indexesTabela[r]
    //             var idSolucaoRef = (form.getValue(cfgTabela.campoIdSolucao + '___' + idxTabela) || '').trim()

    //             if (isEmpty(idSolucaoRef)) {
    //                 message += '<li>' + cfgTabela.label + ' (linha ' + (r + 1) + '): o campo <b>ID da Solução</b> é obrigatório.</li>'
    //                 hasErros = true
    //             } else if (!mapaSolucoes[idSolucaoRef]) {
    //                 message += '<li>' + cfgTabela.label + ' (linha ' + (r + 1) + '): ID da solução <b>' + idSolucaoRef + '</b> não corresponde a nenhuma solução cadastrada.</li>'
    //                 hasErros = true
    //             } else {
    //                 totalAssociacoesPorSolucao[idSolucaoRef] = (totalAssociacoesPorSolucao[idSolucaoRef] || 0) + 1
    //             }

    //             for (var c = 0; c < cfgTabela.camposObrigatorios.length; c++) {
    //                 var campoCfg = cfgTabela.camposObrigatorios[c]
    //                 var valorCampo = form.getValue(campoCfg.campo + '___' + idxTabela)
    //                 if (isEmpty(valorCampo)) {
    //                     message += '<li>' + cfgTabela.label + ' (linha ' + (r + 1) + '): o campo <b>' + campoCfg.label + '</b> é obrigatório.</li>'
    //                     hasErros = true
    //                 }
    //             }
    //         }
    //     }

    //     for (var k = 0; k < idsSolucoes.length; k++) {
    //         var idSol = idsSolucoes[k]
    //         if ((totalAssociacoesPorSolucao[idSol] || 0) === 0) {
    //             var infoSol = mapaSolucoes[idSol]
    //             message += '<li>A solução <b>' + (infoSol.nome || idSol) + '</b> (ID ' + idSol + ') não possui nenhum item de custo associado nas tabelas de custo.</li>'
    //             hasErros = true
    //         }
    //     }
    // }

    // // Início/edição da precificação
    // if (atividade == 0 || atividade == 4 || atividade == 30) {
    //     validarCampoObrigatorio('eventoSelecionado', 'Seleção do tipo de evento', 2)
    //     validarSolucoesEAssociacoesDeCustos()

    //     // validarCamposTabela("pessoas", [
    //     //     { campo: "nomePessoaCN", label: "Nome da Pessoa" },
    //     //     { campo: "tipoPessoaCN", label: "Tipo da Pessoa" },
    //     //     { campo: "idPessoaCN", label: "ID da Pessoa" },
    //     //     { campo: "idSolucaoCN", label: "ID da Solução" }
    //     // ]);

    //     // validarCamposTabela("deslocamento", [
    //     //     { campo: "localOrigemDC", label: "Origem" },
    //     //     { campo: "localDestinoDC", label: "Destino" },
    //     //     { campo: "sentidoDC", label: "Sentido" },
    //     //     { campo: "distanciaDC", label: "Distância" },
    //     //     { campo: "valorDC", label: "Valor Total" },
    //     //     { campo: "idPessoaDC", label: "ID da Pessoa" },
    //     //     { campo: "idSolucaoDC", label: "ID da Solução" }
    //     // ]);

    //     // validarCamposTabela("materiais-didaticos", [
    //     //     { campo: "descricaoMD", label: "Material Didático" },
    //     //     { campo: "quantidadeMD", label: "Quantidade" },
    //     //     { campo: "valorMD", label: "Valor Unitário" },
    //     //     { campo: "valorTotalMD", label: "Valor Total" },
    //     //     { campo: "idSolucaoMD", label: "ID da Solução" }
    //     // ]);

    //     // validarCamposTabela("equipamentos", [
    //     //     { campo: "descricaoEP", label: "Equipamento" },
    //     //     { campo: "quantidadeEP", label: "Quantidade" },
    //     //     { campo: "valorEP", label: "Valor Unitário" },
    //     //     { campo: "valorTotalEP", label: "Valor Total" },
    //     //     { campo: "idSolucaoEP", label: "ID da Solução" }
    //     // ]);

    //     // validarCamposTabela("alimentacao", [
    //     //     { campo: "descricaoAL", label: "Descrição" },
    //     //     { campo: "quantidadeAL", label: "Quantidade" },
    //     //     { campo: "valorAL", label: "Valor Unitário" },
    //     //     { campo: "valorTotalAL", label: "Valor Total" },
    //     //     { campo: "idSolucaoAL", label: "ID da Solução" }
    //     // ]);

    //     if (atividade == 0 || atividade == 4) {
    //         validarCampoObrigatorio('precificacaoRascunho', 'Enviar para aprovação?', 2)
    //     }

    //     // Quando voltar com ajuste do gerente na atividade 30
    //     if (atividade == 30) {
    //         var validacaoGerenteAnterior = form.getValue('validacaoGerente')
    //         if (String(validacaoGerenteAnterior || '').toLowerCase() == 'ajuste') {
    //             validarCampoObrigatorio('parecerDeAjusteSolicitante', 'Deseja aprovar? (Parecer do solicitante)', 2)
    //             var parecer = form.getValue('parecerDeAjusteSolicitante')
    //             if (String(parecer || '').toLowerCase() == 'cancelado') {
    //                 validarCampoObrigatorio('observacaoAjusteSolicitante', 'Observação do ajuste do solicitante', 1)
    //             }
    //         }
    //     }
    // }

    // // Validação do gerente
    // if (atividade == 5) {
    //     validarCampoObrigatorio('validacaoGerente', 'Deseja aprovar? (Gerente)', 2)

    //     var decisaoGerente = form.getValue('validacaoGerente')
    //     if (String(decisaoGerente || '').toLowerCase() == 'ajuste') {
    //         validarCampoObrigatorio('observacaoValidacaoGerente', 'Observação da validação do gerente', 1)
    //     }
    // }

    // if (hasErros) {
    //     throw "<ul style='list-style-type: disc; padding-left:90px' class='alert alert-danger'>" + message + '</ul>'
    // }

    // return true
}

function isEmpty(item) {
    return item == '' || item == undefined || item == null
}

function getMessage(texto, tipoMensagem) {
    switch (tipoMensagem) {
        case 1:
            return '<li>Campo: <b>' + texto + '</b> não pode estar vazio</li>'
        case 2:
            return '<li>Selecione uma opção em: <b>' + texto + '</b></li>'
        case 3:
            return '<li><b>' + texto + '</b></li>'
    }
}