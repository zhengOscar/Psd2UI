
function doMakeButton(newDoc, ly, lockedIcon, suffix){
	if(suffix==="_disabled"){
		icon = lockedIcon.duplicate(newDoc, ElementPlacement.INSIDE);
	}
	
	app.activeDocument = newDoc;
	ly.translate(-ly.bounds[0], -ly.bounds[1]);
	
	switch(suffix){
		case "_disabled":
			mask = app.activeDocument.artLayers.add();
			mask.fillOpacity = Config.fillOpacity;
			
			mask.move(icon, ElementPlacement.PLACEAFTER);
			app.activeDocument.activeLayer = mask;
			
			fillColor("#FFFFFF");
			createCutMask();
		
			icon.translate(calculatePosition(ly, icon,0) , calculatePosition(ly, icon,1));
			
			break;
		case "_highlighted":
			ly.resize(Config.highlightedScale,Config.highlightedScale,AnchorPosition.MIDDLECENTER);
			break;
		case "_normal":
			break;
	}
}