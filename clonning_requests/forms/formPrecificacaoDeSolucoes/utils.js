function getDataset(datasetName, filters) {
	const constraints = [];
	if (filters) {
		for (const key in filters) {
			if (Object.prototype.hasOwnProperty.call(filters, key)) {
				constraints.push(DatasetFactory.createConstraint(key, filters[key], filters[key], ConstraintType.MUST));
			}
		}
	}
	return DatasetFactory.getDataset(datasetName, null, constraints, null);
}

function getDatasetPromise(dataset, fields, constraints, sorters) {
	return new Promise(function (resolve, reject) {
		DatasetFactory.getDataset(
			dataset,
			fields,
			constraints,
			sorters,
			{
				success: data => resolve(data),
				error: () => reject(arguments)
			}
		);
	});
}

function isEmpty(item) {
	return item === "" || item === null || typeof item === 'undefined' || (Array.isArray(item) && item.length === 0);
}

async function preencherSelect(idSelect, datasetName, columnValue, columnText, constraintField, constraintValue) {

	const select = document.getElementById(idSelect);

	if (!select) {
		console.error(`Elemento select com ID "${idSelect}" não foi encontrado.`);
		return;
	}

	const selectedValue = $(`#${idSelect}`).val()
	select.disabled = true;
	select.innerHTML = '<option value="">Carregando...</option>';

	const filters = constraintField && constraintValue ? { [constraintField]: constraintValue } : null;

	const dsReturn = await getDataset(datasetName, filters);

	if (dsReturn?.values?.length > 0) {
		const optionsHtml = dsReturn.values.map(item => `<option value="${item[columnValue]}">${item[columnText]}</option>`).join('');
		select.innerHTML = `<option value="" disabled>Selecione</option>${optionsHtml}`;
	} else {
		select.innerHTML = '<option value="">-- Nenhum item encontrado --</option>';
	}

	select.value = selectedValue;
	select.disabled = false;
}

function transfomaSpansDaPaginaEmInput() {
	$("[name=form] span[name]").each(function () {
		if ($(this).css("display") == "none") return;
		if ($(this).hasClass("inputizado")) return;

		const name = $(this).attr("name");
		const text = $(this).text();
		const id = $(this).attr("id");

		const input = $("<input>")
			.attr({
				type: "text",
				readonly: true,
				value: text,
				id: id,
				name: name,
			})
			.addClass("form-control");

		$(this).replaceWith(input);
	});
}

function showToast(texto, tipo = "info", titulo = "") {
	FLUIGC.toast({ title: titulo, message: texto, type: tipo });
}

async function buscarEnderecoPorCep(cep) {
	const url = `https://viacep.com.br/ws/${cep}/json/`

	const response = await fetch(url)

	if (!response.ok) {
		throw new Error("Erro de rede ao buscar o CEP.")
	}

	const data = await response.json()

	if (data.erro) {
		throw new Error("CEP não encontrado.")
	}

	return data
}

function calendar(elementId) {
	let mySimpleCalendar = FLUIGC.calendar(`#${elementId}`);
}

function getDocUrl(docId) {
	let constants = [DatasetFactory.createConstraint("documentId", docId, docId, ConstraintType.MUST),];
	const dsReturn = DatasetFactory.getDataset("dsGetDownloadURL", null, constants, null);

	return dsReturn.values[0]["downloadURL"];
}

function getTableData(tablename) {
	const arrJson = [];
	const arrTr = $("[tablename='" + tablename + "'] tbody tr").not(":first").toArray();

	$.each(arrTr, (i, tr) => {
		const valuesJson = {};
		const isViewMode = (typeof getMode === 'function' && getMode() === "VIEW");

		const childrenArr = isViewMode
			? $(tr).find("span").toArray()
			: $(tr).find("input, select, textarea").toArray();

		childrenArr.forEach(input => {
			let id = $(input).attr("id");
			if (!id) return;

			if (id[0] === "_") id = id.substring(1);

			let value;

			if (!isViewMode) {

				const inputType = $(input).attr("type");

				if (inputType === "checkbox") {
					value = $(input).is(":checked") ? "on" : "off";
				} else if (inputType === "file") {
					value = $(input).val();
				} else {
					value = $(input).val();
				}

			} else {
				value = $(input).text().trim();
			}
			id = id.split("___")[0];
			valuesJson[id] = value;
		});

		arrJson.push(valuesJson);
	});

	return arrJson;
}

function isDev(){
    if (window.location.hostname == 'fluighml.rn.sebrae.com.br') {
		return true;
	}
	return false;
}