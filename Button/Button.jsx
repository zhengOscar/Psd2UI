
function doMakeButton(newDoc, ly, suffix){
	app.activeDocument = newDoc;
	ly.translate(-ly.bounds[0], -ly.bounds[1]);
	
	switch(suffix){
		case "_disabled":
			//去色（灰度状态）
			ly.desaturate();
			break;
		case "_highlighted":
			ly.resize(Config.highlightedScale,Config.highlightedScale,AnchorPosition.MIDDLECENTER);
			break;
		case "_normal":
			break;
	}
}