;(function () {
    const fallbackTabelasFilhas = [
        { nome: 'servicosEpecializados', titulo: 'Custos Com Serviços Especializados', campoId: 'idSolucaoSE' },
        { nome: 'deslocamento', titulo: 'Despesas Com Deslocamento', campoId: 'idSolucaoDC' },
        { nome: 'materiais-didaticos', titulo: 'Materiais Didáticos', campoId: 'idSolucaoMD' },
        { nome: 'equipamentos', titulo: 'Custo Com Equipamentos', campoId: 'idSolucaoEP' },
        { nome: 'alimentacao', titulo: 'Custo com Alimentação', campoId: 'idSolucaoAL' }
    ]

    function obterTabelaPaiFilho(referenciaTabela) {
        const referencia = String(referenciaTabela || '').trim()
        if (!referencia) return $()

        const porTablename = $(`table[tablename="${referencia}"]`)
        if (porTablename.length) return porTablename.first()

        const porId = $(`#${referencia}`)
        if (porId.length && porId.is('table')) return porId.first()

        return $()
    }

    function obterConfiguracaoTabelas() {
        return fallbackTabelasFilhas.filter((cfg) => obterTabelaPaiFilho(cfg.nome).length)
    }

    function escaparHtml(texto) {
        return String(texto || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;')
    }

    function parseNumeroLocal(valor) {
        if (typeof window.parseNumero === 'function') {
            return window.parseNumero(valor)
        }

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

    function formatarMoeda(valor) {
        const numero = Number(valor) || 0
        return numero.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    }

    function formatarQuantidade(valor) {
        const numero = parseNumeroLocal(valor)
        if (!numero) return '-'
        if (Number.isInteger(numero)) return String(numero)
        return numero.toLocaleString('pt-BR', { maximumFractionDigits: 2 })
    }

    function inferirTipoCampoLocal(titulo) {
        const texto = String(titulo || '').toLowerCase()

        if (texto.includes('valor') || texto.includes('diária') || texto.includes('diaria')) {
            return 'moeda'
        }

        if (texto.includes('quantidade') || texto.includes('carga') || texto.includes('tempo') || texto.includes('distância') || texto.includes('distancia')) {
            return 'numero'
        }

        return 'texto'
    }

    function obterMetadadosTabela(nomeTabela) {
        const tabela = obterTabelaPaiFilho(nomeTabela)
        if (!tabela.length) return []

        const titulos = []
        tabela.find('thead th').each(function () {
            const titulo = ($(this).text() || '').trim()
            if (!titulo || titulo.toLowerCase().includes('id da sol')) return
            titulos.push(titulo)
        })

        const nomesBase = []
        tabela.find('tbody tr:first td input').each(function () {
            const nomeBase = (($(this).attr('name') || '').trim() || '').split('___')[0]
            if (!nomeBase || nomeBase.toLowerCase().includes('idsolucao')) return
            nomesBase.push(nomeBase)
        })

        return titulos.map((titulo, idx) => ({
            titulo,
            tipo: inferirTipoCampoLocal(titulo),
            baseName: nomesBase[idx] || ''
        }))
    }

    function obterRowPaiDaSolucao(idSolucao) {
        const tabelaSolucoes = obterTabelaPaiFilho('solucoes')
        if (!tabelaSolucoes.length) return $()

        return tabelaSolucoes.find('tbody tr:not(:first)').filter(function () {
            return ($(this).find("input[name^='idSolucaoSL___']").val() || '') === idSolucao
        })
    }

    function coletarDadosTabela(nomeTabela, idSolucao) {
        const config = obterConfiguracaoTabelas().find((t) => t.nome === nomeTabela)
        if (!config) return null

        const tabela = obterTabelaPaiFilho(nomeTabela)
        if (!tabela.length) return null

        const metadados = obterMetadadosTabela(nomeTabela)
        const idxTexto = metadados.findIndex((campo) => campo.tipo === 'texto')
        const idxNumero = metadados.findIndex((campo) => campo.tipo === 'numero')
        const idxMoeda = metadados.findIndex((campo) => campo.tipo === 'moeda')

        const tituloDescricao = idxTexto >= 0 ? metadados[idxTexto].titulo : 'Descrição'
        const tituloQuantidade = idxNumero >= 0 ? metadados[idxNumero].titulo : 'Quantidade'
        const tituloValor = idxMoeda >= 0 ? metadados[idxMoeda].titulo : 'Valor'

        const linhas = []
        let totalTabela = 0

        tabela.find('tbody tr:not(:first)').each(function () {
            const idRegistro = ($(this).find(`input[name^="${config.campoId}___"]`).val() || '').trim()
            if (idRegistro !== idSolucao) return

            const rowId = ($(this).find('input').first().attr('name') || '').split('___')[1]
            if (!rowId) return

            const inputSemId = $(this)
                .find('input')
                .filter(function () {
                    const n = (($(this).attr('name') || '').trim() || '').toLowerCase()
                    return n && !n.includes('idsolucao')
                })

            const obterValorPorCampo = (idx) => {
                if (idx < 0) return ''
                const campo = metadados[idx] || {}
                if (campo.baseName) {
                    const v = $(`input[name="${campo.baseName}___${rowId}"]`).val()
                    if (v != null && String(v).trim() !== '') return String(v).trim()
                }
                const porIndice = inputSemId.eq(idx).val()
                return porIndice != null ? String(porIndice).trim() : ''
            }

            const descricao = idxTexto >= 0 ? obterValorPorCampo(idxTexto) : 'Item'
            const quantidadeRaw = idxNumero >= 0 ? obterValorPorCampo(idxNumero) : ''
            const valorRaw = idxMoeda >= 0 ? obterValorPorCampo(idxMoeda) : ''

            const quantidade = parseNumeroLocal(quantidadeRaw)
            const valorUnitario = parseNumeroLocal(valorRaw)

            // mapa: tabela → campo valorTotal gravado
            const campoTotalPorTabela = {
                'materiais-didaticos': 'valorTotalMD',
                equipamentos: 'valorTotalEP',
                alimentacao: 'valorTotalAL',
                servicosEpecializados: 'valorTotalSE'
            }
            const campoTotal = campoTotalPorTabela[nomeTabela]
            let totalItem
            if (campoTotal) {
                const vtGravado = parseNumeroLocal($(`input[name="${campoTotal}___${rowId}"]`).val())
                totalItem = vtGravado > 0 ? vtGravado : valorUnitario * Math.max(quantidade, 1)
            } else {
                totalItem = quantidade > 0 && valorUnitario > 0 ? quantidade * valorUnitario : valorUnitario
            }

            totalTabela += totalItem

            linhas.push([descricao || 'Item', formatarQuantidade(quantidadeRaw), formatarMoeda(valorUnitario), formatarMoeda(totalItem)])
        })

        if (!linhas.length) return null

        return {
            titulo: config.titulo,
            colunas: [tituloDescricao, tituloQuantidade, tituloValor, 'Total'],
            linhas,
            totalTabela
        }
    }

    function coletarResumoDaSolucao(idSolucao) {
        const trPai = obterRowPaiDaSolucao(idSolucao).first()
        if (!trPai.length) return null

        const rowId = (trPai.find('input').first().attr('name') || '').split('___')[1]
        if (!rowId) return null

        const nomeSolucao = ($(`input[name="nomeSolucaoSL___${rowId}"]`).val() || '').trim() || `Solução ${idSolucao}`
        const participantes = parseNumeroLocal($(`input[name="quantidadeParticipantesSL___${rowId}"]`).val())

        const margemTela = ($('#rf-margem').text() || '37').replace('%', '').trim()
        const margem = parseNumeroLocal(margemTela) || 37

        const tabelas = []
        let custoTotal = 0

        obterConfiguracaoTabelas().forEach((tabela) => {
            const dadosTabela = coletarDadosTabela(tabela.nome, idSolucao)
            if (!dadosTabela) return
            tabelas.push(dadosTabela)
            custoTotal += dadosTabela.totalTabela || 0
        })

        const valorTotalDigitado = parseNumeroLocal($(`input[name="valorTotalSL___${rowId}"]`).val())
        const valorTotal = valorTotalDigitado > 0 ? valorTotalDigitado : custoTotal * (1 + margem / 100)
        const precoSugerido = participantes > 0 ? valorTotal / participantes : 0

        return {
            idSolucao,
            dataGeracao: new Date().toLocaleString('pt-BR'),
            nomeSolucao,
            participantes: formatarQuantidade(participantes),
            modulos: '1',
            precoSugerido: formatarMoeda(precoSugerido),
            valorTotal: formatarMoeda(valorTotal),
            custoTotal: formatarMoeda(custoTotal),
            margem: `${margem.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}%`,
            tabelas
        }
    }

    function montarResumoHTML(dados) {
        return `
            <div style="width: 794px; font-family: Arial, sans-serif; color: #222; background: #fff; padding: 20px 24px; box-sizing: border-box;">
                <div style="border-bottom: 2px solid #0072c6; padding: 12px 0 10px 0;">
                    <span style="font-size: 28px; color: #0072c6; font-weight: bold;">SEBRAE</span>
                    <span style="float: right; font-size: 22px; font-weight: bold;">Memória de Cálculo</span>
                    <div style="font-size: 12px; color: #888; margin-top: 4px;">Gerado em: ${escaparHtml(dados.dataGeracao)}</div>
                </div>

                <div style="margin-top: 16px; font-size: 16px; font-weight: bold;">Dados da Solução</div>
                <div style="font-size: 14px; margin-bottom: 10px; line-height: 1.6;">
                    Solução: ${escaparHtml(dados.nomeSolucao)} &nbsp;&nbsp; Participantes: ${escaparHtml(dados.participantes)} &nbsp;&nbsp; Módulos/Dias: ${escaparHtml(dados.modulos)}
                </div>

                <div style="display: flex; margin-bottom: 18px;">
                    <div style="background: #0072c6; color: #fff; padding: 18px 24px; border-radius: 8px 0 0 8px; flex: 1;">
                        <div style="font-size: 12px; text-transform: uppercase;">Preço sugerido (por participante)</div>
                        <div style="font-size: 28px; font-weight: bold; margin-top: 4px;">${escaparHtml(dados.precoSugerido)}</div>
                    </div>
                    <div style="background: #1a1a1a; color: #fff; padding: 18px 24px; border-radius: 0 8px 8px 0; flex: 1;">
                        <div style="font-size: 12px; text-transform: uppercase;">Valor total da proposta</div>
                        <div style="font-size: 28px; font-weight: bold; margin-top: 4px;">${escaparHtml(dados.valorTotal)}</div>
                        <div style="font-size: 13px; margin-top: 8px; line-height: 1.4;">
                            Custo total<br>
                            <span style="font-size: 18px; font-weight: bold;">${escaparHtml(dados.custoTotal)}</span><br>
                            Margem (REB): ${escaparHtml(dados.margem)}
                        </div>
                    </div>
                </div>

                ${dados.tabelas
                    .map(
                        (tab) => `
                    <div style="font-size: 15px; font-weight: bold; color: #0072c6; margin-top: 16px;">${escaparHtml(tab.titulo)}</div>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 12px;">
                        <thead>
                            <tr>
                                ${tab.colunas.map((col) => `<th style="border-bottom: 1px solid #ccc; text-align: left; padding: 6px 8px; background: #f7f7f7;">${escaparHtml(col)}</th>`).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            ${tab.linhas
                                .map(
                                    (linha) => `
                                <tr>
                                    ${linha.map((cell) => `<td style="padding: 6px 8px; border-bottom: 1px solid #eee;">${escaparHtml(cell)}</td>`).join('')}
                                </tr>
                            `
                                )
                                .join('')}
                        </tbody>
                    </table>
                `
                    )
                    .join('')}
            </div>
        `
    }

    async function adicionarSecaoNoPdf(pdf, elemento, usarPaginaAtual) {
        const canvas = await html2canvas(elemento, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff'
        })

        const imgData = canvas.toDataURL('image/png')
        const pageWidth = pdf.internal.pageSize.getWidth()
        const pageHeight = pdf.internal.pageSize.getHeight()
        const margem = 20
        const larguraUtil = pageWidth - margem * 2
        const alturaUtil = pageHeight - margem * 2

        const alturaImagem = (canvas.height * larguraUtil) / canvas.width
        let alturaRestante = alturaImagem
        let deslocamento = 0
        let primeira = true

        while (alturaRestante > 0) {
            if (!(usarPaginaAtual && primeira)) {
                pdf.addPage()
            }

            const y = margem - deslocamento
            pdf.addImage(imgData, 'PNG', margem, y, larguraUtil, alturaImagem, undefined, 'FAST')

            alturaRestante -= alturaUtil
            deslocamento += alturaUtil
            primeira = false
            usarPaginaAtual = false
        }
    }

    function obterIdsSolucoes() {
        const ids = []
        const tabelaSolucoes = obterTabelaPaiFilho('solucoes')
        if (!tabelaSolucoes.length) return ids

        tabelaSolucoes.find("tbody tr:not(:first) input[name^='idSolucaoSL___']").each(function () {
            const id = ($(this).val() || '').trim()
            if (id) ids.push(id)
        })
        return ids
    }

    function criarContainerTemporario() {
        const container = document.createElement('div')
        container.id = 'container-resumo-pdf'
        container.style.position = 'fixed'
        container.style.left = '-99999px'
        container.style.top = '0'
        container.style.width = '794px'
        container.style.background = '#fff'
        document.body.appendChild(container)
        return container
    }

    function criarLoading(texto) {
        if (typeof FLUIGC === 'undefined' || typeof FLUIGC.loading !== 'function') {
            return null
        }

        try {
            return FLUIGC.loading(window, { textMessage: texto })
        } catch (e) {
            return null
        }
    }

    async function gerarResumoPDFTodasSolucoes() {
        if (!window.html2canvas || !window.jspdf || !window.jspdf.jsPDF) {
            showToast('Bibliotecas de PDF não foram carregadas.', 'danger', 'Erro')
            return
        }

        const ids = obterIdsSolucoes()
        if (!ids.length) {
            showToast('Nenhuma solução encontrada para gerar o resumo.', 'warning', 'Atenção')
            return
        }

        const loading = criarLoading('Gerando PDF de resumo...')
        if (loading && typeof loading.show === 'function') loading.show()

        let container = null

        try {
            const dadosResumos = ids.map(coletarResumoDaSolucao).filter(Boolean)
            if (!dadosResumos.length) {
                showToast('Não foi possível montar os dados do resumo.', 'warning', 'Atenção')
                return
            }

            container = criarContainerTemporario()
            dadosResumos.forEach((dados) => {
                const secao = document.createElement('section')
                secao.className = 'resumo-pdf-section'
                secao.innerHTML = montarResumoHTML(dados)
                container.appendChild(secao)
            })

            const pdf = new window.jspdf.jsPDF({
                orientation: 'portrait',
                unit: 'pt',
                format: 'a4'
            })

            const secoes = container.querySelectorAll('.resumo-pdf-section')
            for (let i = 0; i < secoes.length; i++) {
                await adicionarSecaoNoPdf(pdf, secoes[i], i === 0)
            }

            const nomeCombo = ($('#nomeDoCombo').val() || '').trim()
            const nomeArquivo = (nomeCombo ? `Resumo_${nomeCombo}` : 'Resumo_Precificacao').replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '')

            pdf.save(`${nomeArquivo}.pdf`)
            showToast('PDF gerado com sucesso.', 'success', 'Sucesso')
        } catch (erro) {
            console.error('Erro ao gerar PDF de resumo:', erro)
            showToast('Ocorreu um erro ao gerar o PDF.', 'danger', 'Erro')
        } finally {
            if (container && container.parentNode) {
                container.parentNode.removeChild(container)
            }

            if (loading && typeof loading.hide === 'function') {
                loading.hide()
            }
        }
    }

    window.gerarResumoPDFTodasSolucoes = gerarResumoPDFTodasSolucoes

    $(document).on('click', '#btnGerarPDFResumo', async function () {
        await gerarResumoPDFTodasSolucoes()
    })
})()
