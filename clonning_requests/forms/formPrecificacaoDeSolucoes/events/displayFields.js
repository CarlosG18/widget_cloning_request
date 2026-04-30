function displayFields(form, customHTML) {
    var usuario = getValue("WKUser");
	var activity = getValue("WKNumState");
	var processo = getValue("WKNumProces");
	var doc = form.getDocumentId();
	var MODE = form.getFormMode();

	customHTML.append("<script>");
	customHTML.append("function getUser(){ return '" + usuario + "'};");
	customHTML.append("function getActivity(){ return '" + activity + "'};");
	customHTML.append("function getMode(){ return '" + MODE + "'};");
	customHTML.append("function getProcesso(){ return '" + processo + "'};");
	customHTML.append("function getDocumentId(){ return '" + doc + "'};");
	customHTML.append("</script>");

	let paineisId = [
		'complemento', 
		'validacaoGerentecontainer',
		'ajusteSolicitante',
	]

	for(let i = 0; i < paineisId.length; i++){
		form.setVisibleById(paineisId[i], false);
	}
	
	if (activity == 0 || activity == 4 || activity == 30){
		form.setVisibleById("complemento", true);
		
	}

	if (activity ==  5){
		form.setVisibleById("complemento", true);
		form.setVisibleById("validacaoGerentecontainer", true)
	}
	if (activity ==  30){
		form.setVisibleById("complemento", true);
		form.setVisibleById("validacaoGerente", true);
		form.setVisibleById("ajusteSolicitante", true);
	}

}