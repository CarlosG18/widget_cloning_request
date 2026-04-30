/**
 *
 *
 * @param {string[]} fields Campos Solicitados
 * @param {Constraint[]} constraints Filtros
 * @param {string[]} sorts Campos da Ordenação
 * @returns {Dataset}
 */

function createDataset(fields, constraints, sorts) {
  var dataset = DatasetBuilder.newDataset();

  dataset.addColumn("idSolicitacao");
  dataset.addColumn("targetState");
  dataset.addColumn("targetAssignee");
  dataset.addColumn("formsFields");
  dataset.addColumn("processID");
  dataset.addColumn("anexos");

  var processInstanceId = null;

  for (var i = 0; i < constraints.length; i++) {
    if (constraints[i].fieldName == "processInstanceId") {
      processInstanceId = constraints[i].initialValue;
    }
  }

  try {
    var formsData = getFormsFields(processInstanceId);
    var formFields = formsData[0];
    var processID = formsData[1];

    var formFieldsStr = JSON.stringify(formFields || []);

    var targetState = 0;
    var targetAssignee = "não encontrado";

    var c1 = DatasetFactory.createConstraint(
      "processHistoryPK.processInstanceId",
      processInstanceId,
      processInstanceId,
      ConstraintType.MUST
    );
    var c2 = DatasetFactory.createConstraint(
      "active",
      "true",
      "true",
      ConstraintType.MUST
    );

    var dataset_processHistory = DatasetFactory.getDataset(
      "processHistory",
      null,
      [c1, c2],
      null
    );

    if (
      dataset_processHistory != null &&
      dataset_processHistory.getRowsCount() > 0
    ) {
      targetState = dataset_processHistory.getValue(0, "stateSequence");
    }

    var c3 = DatasetFactory.createConstraint(
      "choosedSequence",
      targetState,
      targetState,
      ConstraintType.MUST
    );

    var c4 = DatasetFactory.createConstraint(
      "processTaskPK.processInstanceId",
      processInstanceId,
      processInstanceId,
      ConstraintType.MUST
    );

    var constraint = new Array(c3, c4);

    var dataset_processTask = DatasetFactory.getDataset(
      "processTask",
      null,
      constraint,
      null
    );

    if (dataset_processTask != null && dataset_processTask.getRowsCount() > 0) {
      targetAssignee = dataset_processTask.getValue(
        0,
        "processTaskPK.colleagueId"
      );
    }

    //obtendo anexos
    var c_anexos = DatasetFactory.createConstraint(
      "processInstanceId",
      processInstanceId,
      processInstanceId,
      ConstraintType.MUST
    );
    var anexos = DatasetFactory.getDataset(
      "dsGetAxenosFromSolicitacao",
      null,
      [c_anexos],
      null
    );

    log.info("Número de anexos: " + anexos.getRowsCount());

    // Convertendo Dataset de anexos para array de objetos de string
    var anexosArray = [];
    if (anexos != null && anexos.getRowsCount() > 0) {
      for (var i = 0; i < anexos.getRowsCount(); i++) {
        var documentId = anexos.getValue(i, "documentId") || "";
        var fileName = anexos.getValue(i, "fileName") || "";
        var base64 = anexos.getValue(i, "base64") || "";

        var anexoObj = {
          documentId: documentId + "",
          fileName: fileName + "",
          base64: base64 + ""
        };

        anexosArray.push(anexoObj);
      }
    }

    log.info("anexosArray ->>>>>" + JSON.stringify(anexosArray));

    dataset.addRow([
      processInstanceId,
      targetState,
      targetAssignee,
      formFieldsStr,
      processID,
      JSON.stringify(anexosArray || [])
    ]);

    return dataset;
  } catch (e) {
    dataset.addRow([processInstanceId, "Erro", e.toString(), "[]", ""]);
  }
}

function getFormsFields(processInstanceId) {
  if (isNaN(processInstanceId)) throw "ID de solicitação inválido";

  var endpoint =
    "/process-management/api/v2/requests/" +
    processInstanceId +
    "?expand=formFields";
  var clientService = fluigAPI.getAuthorizeClientService();

  var data = {
    companyId: getValue("WKCompany") + "",
    serviceCode: "Fluig API",
    endpoint: endpoint,
    method: "get",
    timeoutService: "100",
    headers: {
      "Content-Type": "application/json",
    }
  };

  try {
    var response = clientService.invoke(JSON.stringify(data));
    var resultStr = response.getResult();

    if (!resultStr || resultStr.isEmpty()) throw "Resposta vazia da API";

    var result = JSON.parse(resultStr);

    if (result.message) throw result.message;

    return [result, result.processId] || [];
  } catch (e) {
    log.error(">>> Erro em getFormsFields: " + e);
    return [];
  }
}
