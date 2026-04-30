function createDataset(fields, constraints, sorts) {
    var dataset = DatasetBuilder.newDataset();

    // Definir estrutura do dataset
    dataset.addColumn("documentId");
    dataset.addColumn("fileName");
    dataset.addColumn("base64");

    var processInstanceId = null;

    // Obter o processInstanceId dinamicamente dos constraints
    if (constraints != null) {
        for (var i = 0; i < constraints.length; i++) {
            if (constraints[i].fieldName == "processInstanceId") {
                processInstanceId = constraints[i].initialValue;
                break;
            }
        }
    }

    // Validação de segurança para ID vazio
    if (processInstanceId == "") {
        log.error("dsGetAnexosFromSolicitacao: processInstanceId não fornecido");
        return dataset;
    }

    try {
        // Consulta o dataset interno de anexos do processo
        var c1 = DatasetFactory.createConstraint(
            "processAttachmentPK.processInstanceId",
            processInstanceId,
            processInstanceId,
            ConstraintType.MUST
        );
        
        var dsAttachments = DatasetFactory.getDataset("processAttachment", null, [c1], null);

        if (dsAttachments != null && dsAttachments.getRowsCount() > 0) {
            var docService = fluigAPI.getDocumentService(); // Serviço SDK para manipular documentos [7, 8]

            for (var j = 1; j < dsAttachments.getRowsCount(); j++) {
                var documentId = dsAttachments.getValue(j, "documentId");
                var version = dsAttachments.getValue(j, "version");

                // Consulta o dataset 'document' para obter o nome físico e descrição real
                var constraintDocId = DatasetFactory.createConstraint("documentPK.documentId", documentId, documentId, ConstraintType.MUST);
                var constraintVersion = DatasetFactory.createConstraint("documentPK.version", version, version, ConstraintType.MUST);
                var dsDocument = DatasetFactory.getDataset("document", null, [constraintDocId, constraintVersion], null);

                var fileName = "";
                var base64 = "";

                if (dsDocument != null && dsDocument.getRowsCount() > 0) {
                    fileName = dsDocument.getValue(0, "phisicalFile"); // Nome real do arquivo no volume [10]
                }

                // 4. Obtenção do conteúdo físico e conversão para Base64 [11, 12]
                try {
                    // O método getDocumentContentAsBytes retorna um array de bytes (byte[]) [12]
                    var bytes = docService.getDocumentContentAsBytes(parseInt(documentId));
                    if (bytes != null) {
                        // Utiliza a classe Java para converter o array de bytes em String Base64 [11, 13]
                        base64 = java.util.Base64.getEncoder().encodeToString(bytes);
                    }
                } catch (e) {
                    base64 = "Erro na conversão: " + e.message;
                }

                dataset.addRow([
                    documentId,
                    fileName,
                    base64
                ]);
            }
        }
    } catch (error) {
        dataset.addRow(["Erro", error.toString(), "", "", ""]);
    }

    return dataset;
}