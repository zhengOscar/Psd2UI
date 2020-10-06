var g_StackScriptFolderPath = $.fileName.substr(0, $.fileName.lastIndexOf("/")+1);

if(typeof Config=="undefined"){
	$.evalFile(g_StackScriptFolderPath +"Core/Json2.jsx");
	$.evalFile(g_StackScriptFolderPath +"Core/Config.jsx");
	$.evalFile(g_StackScriptFolderPath +"Core/Terminology.jsx");
	$.evalFile(g_StackScriptFolderPath +"Core/Function.jsx");
}
$.evalFile(g_StackScriptFolderPath +"Core/ImageProcessor.jsx");

$.evalFile(g_StackScriptFolderPath +"Button/Button.jsx");


ImageProcessor.prototype.doExportCallack = function(newDoc, ly, suffix){
	doMakeButton(newDoc, ly, suffix);
}

new ImageProcessor().doRun();