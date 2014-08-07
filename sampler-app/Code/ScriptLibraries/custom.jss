function populateFavorites(){
	try{
		if (getFavorites().length == 0){
			var newfavorites = new Array();
	        var vw:NotesView = database.getView("Documents");
			var dc:NotesDocumentCollection = vw.getAllDocumentsByKey("All~Documents");
			var doc:NotesDocument = dc.getFirstDocument();
			for (var i=0; i<2; i++){
				if (doc != null){
					newfavorites.push(doc.getUniversalID());
					doc = dc.getNextDocument();
				}
			}
			dc = vw.getAllDocumentsByKey("All~Images");
			doc = dc.getNthDocument(4);
			newfavorites.push(doc.getUniversalID());
			dc = vw.getAllDocumentsByKey("All~Presentations");
			doc = dc.getNthDocument(3);
			newfavorites.push(doc.getUniversalID());
			dc = vw.getAllDocumentsByKey("All~Spreadsheets");
			doc = dc.getNthDocument(2);
			newfavorites.push(doc.getUniversalID());
		
			setFavorites(newfavorites);
		}
	}catch(e){
	}
}