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

  var processInstanceId = "";

  for (var i = 0; i < constraints.length; i++) {
    if (constraints[i].fieldName == "processInstanceId") {
      processInstanceId = constraints[i].initialValue;
    }
  }

  if (!processInstanceId || processInstanceId == "") {
    return dataset;
  }

  try {
    var formFields = getFormsFields(processInstanceId);
    var formFieldsStr = JSON.stringify(formFields || []);

    var targetState = "não encontrado";
    var targetAssignee = "não encontrado";

    var c1 = DatasetFactory.createConstraint(
      "processHistoryPK.processInstanceId",
      processInstanceId,
      processInstanceId,
      ConstraintType.MUST,
    );
    var c2 = DatasetFactory.createConstraint(
      "active",
      "true",
      "true",
      ConstraintType.MUST,
    );

    var dataset_processHistory = DatasetFactory.getDataset(
      "processHistory",
      null,
      [c1, c2],
      null,
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
      ConstraintType.MUST,
    );

    var c4 = DatasetFactory.createConstraint(
      "processTaskPK.processInstanceId",
      processInstanceId,
      processInstanceId,
      ConstraintType.MUST,
    );

    var constraint = new Array(c3, c4);

    var dataset_processTask = DatasetFactory.getDataset(
      "processTask",
      null,
      constraint,
      null,
    );

    if (dataset_processTask != null && dataset_processTask.getRowsCount() > 0) {
      targetAssignee = dataset_processTask.getValue(0, "choosedColleagueId");
    }

    dataset.addRow([
      processInstanceId,
      targetState,
      targetAssignee,
      formFieldsStr,
    ]);

    return dataset;
  } catch (e) {
    log.error(
      ">>> Erro no Dataset dsGetParams (ID: " + processInstanceId + "): " + e,
    );
    dataset.addRow([processInstanceId, "Erro", e.toString(), "[]"]);
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
    },
  };

  try {
    var response = clientService.invoke(JSON.stringify(data));
    var resultStr = response.getResult();

    if (!resultStr || resultStr.isEmpty()) throw "Resposta vazia da API";

    var result = JSON.parse(resultStr);

    if (result.message) throw result.message;

    return result.formFields || [];
  } catch (e) {
    log.error(">>> Erro em getFormsFields: " + e);
    return [];
  }
}
