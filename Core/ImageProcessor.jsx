if(typeof Config=="undefined"){
	var g_StackScriptFolderPath = $.fileName.substr(0, $.fileName.lastIndexOf("/")+1);
	
	$.evalFile(g_StackScriptFolderPath +"Json2.jsx");
	$.evalFile(g_StackScriptFolderPath +"Config.jsx");
	$.evalFile(g_StackScriptFolderPath +"Terminology.jsx");
	$.evalFile(g_StackScriptFolderPath +"Function.jsx");
}


Node = function(name) {
    
    this.name = name;
    this.type = "";
    this.options = {};
    this.offset = null;
    this.size = null;
	
    this.parent = null;
    this.children = [];
};

Node.prototype.appendTo = function(p) {
	this.parent = p;	
	this.parent.children.push(this);
};

Node.prototype.calculateOffsetAndSize = function() {
    var h = i = g = f = null;
    var j = this.children;
    for (var c = 0, e = j.length; c < e; c++) {
        var b = j[c];
        if (!(b.offset && b.size)) {
            continue;
        }
        var d = b.offset.left;
        var l = b.offset.top;
        var k = b.offset.left + b.size.width;
        var a = b.offset.top + b.size.height;
        if (h === null || d < h) {
            h = d;
        }
        if (i === null || l < i) {
            i = l;
        }
        if (g === null || k > g) {
            g = k;
        }
        if (f === null || a > f) {
            f = a;
        }
    }
    if (h && i && g && f) {
        this.offset || this.offset = {};
        this.offset.left = h;
        this.offset.top = i;
        this.size || this.size = {};
        this.size.width = g - h;
        this.size.height = f - i;
    }
};

//计算列表间隔
Node.prototype.calculateSpace = function() {
	if(this.type.indexOf("gscroll")>-1){
		this.options.xSpace = Math.abs(  this.children[1].offset.left - this.children[0].offset.left ) -this.children[0].size.width;
		this.options.ySpace = Math.abs(  this.children[1].offset.top  - this.children[0].offset.top  ) -this.children[0].size.height;
		
	}else if(this.type.substr(0,1)==="h" ){
		this.options.space = Math.abs(  this.children[1].offset.left - this.children[0].offset.left ) -this.children[0].size.width;
	}else{
		this.options.space = Math.abs(  this.children[1].offset.top  - this.children[0].offset.top  ) -this.children[0].size.height;
	}
}

//清除空分组节点
Node.prototype.pruneEmptyGroups = function() {
    var index = 0;
    while (index < this.children.length) {
        var item = this.children[index];
        if (item) {
            item.pruneEmptyGroups();
            if (item.type === "group" && item.children.length === 0) {
                this.children.splice(index--, 1);
            }
        }
        index++;
    }
};


//导出json格式
Node.prototype.dump = function() {
    return {
        name: this.name,
        type: this.type,
        options: this.options,
        offset: this.offset,
        size: this.size,
		
        children: function() {
            var items = this.children;
            var result = [];
            for (var i = 0, len = items.length; i < len; i++) {
                result.push(items[i].dump());
            }
            return result;
        }.call(this)
    };
};

ImageProcessor = function(onlyButton, outputLayout){
	this.last = null;
	this.currentDocument  = null;
	this.documentFilePath ="";
	this.assetsRootPath   = "";
	this.layer = null;
	
	this.isOnlyButton = onlyButton || false;
	this.outputLayoutFile = outputLayout || false;
	
	this.assetsFolderPreffix=Config.assetsFolderPreffix;
	this.assetsFolderSuffix=Config.assetsFolderSuffix;
}

ImageProcessor.prototype.doRun = function() {
	if (!this.checkEnviroment()) {
		return;
	}
	if (!this.prepareForExport()) {
		return;
	}
	
	alert("此操作需要花费点时间，请点击[ok]继续操作.");
	startRulerUnits = app.preferences.rulerUnits;
	startTypeUnits  = app.preferences.typeUnits;

	app.preferences.rulerUnits = Units.PIXELS;
	app.preferences.typeUnits  = TypeUnits.PIXELS;
	
	try{
		this.doProcess();
	}catch(e){
		alert(e);
	}
	//this.doProcess();
	app.preferences.rulerUnits = startRulerUnits;
	app.preferences.typeUnits  = startTypeUnits;
	alert("操作完成.");
}

ImageProcessor.prototype.prepareForExport = function() {

	var paths = this.getAssetsPath(app.activeDocument.fullName+"");
	this.documentFilePath = paths.documentFilePath;
	this.assetsRootPath   = paths.assetsRootPath;

	var folder = Folder(this.assetsRootPath);
	if (folder.exists) {
		return confirm("警告！文件已存在，是否覆盖？");
	}
	return true;
}

ImageProcessor.prototype.doProcess = function() {
	this.currentDocument = app.activeDocument.duplicate();
	app.activeDocument   = this.currentDocument;
	var index = 1;

	this.last            = this.currentDocument.layers[this.currentDocument.layers.length-index];
	
	if(this.last.typename=="ArtLayer"){
		if(this.last.isBackgroundLayer){
			index +=1;
			this.last            = this.currentDocument.layers[this.currentDocument.layers.length-index];
		}
	}

	if(this.doOnReady){
		if(!this.doOnReady()){
			return;
		}
	}
	
	this.nodes = new Node("root");
	this.nodes.type = "root";
	this.nodes.size = {
		width: this.currentDocument.width.value,
		height: this.currentDocument.height.value
	};
		
	this.foreachLayers(this.currentDocument , this.currentDocument.layers      , this.nodes);
	this.currentDocument.close(SaveOptions.DONOTSAVECHANGES);
	this.nodes.offset = this.nodes.offset|| {left:0, top:0};
	if(this.outputLayoutFile){
		this.saveLayoutFile();
	}
}

ImageProcessor.prototype.readNodeTree = function(node, index){
	//if(node &&node.type=="group" && node.children.length==0) return "";
	str = "\n\r";
	if(node){
		for(var i=0;i< index;i++){
			str += "\t";
		}
		str += node.name +" >>> "+node.type;
		if(node.children){
			for(var i=0,len = node.children.length;i<len;i++){
				str +=this.readNodeTree(node.children[i], index +1);
			}
		}
	}
	return str;
}

//遍历所有图层
ImageProcessor.prototype.foreachLayers = function(doc , items, nodes){
	var isValidate = items.typename === "Layers" || items.visible;
	if(isValidate){

		if(items.typename==="Layers"){
			for(var i=items.length-1;i>-1;i--){
				this.foreachLayers(doc, items[i], nodes);
			}
			return ;
		}
		
		var typename = items.typename;
		var node = new Node(items.name);
		node.appendTo(nodes);
		
		if(typename === "LayerSet"){
			for(var i=items.layers.length-1;i>-1;i--){
				
				this.foreachLayers(doc, items.layers[i], node);
			}
		}else if(typename === "ArtLayer"){

		}
		
		if(typename ==="ArtLayer" || typename === "LayerSet"){
			var o = this.checkName(items);
			
			if(o.isValidate){
				this.layer = this.flatten(doc , items);
				
				o.offset   = this.getOffset(this.layer);
				o.size     = this.getSize(this.layer);
				
				node.name   = o.name;
				node.type   = o.type;
				node.offset = o.offset;
				node.size   = o.size;
				node.options= o.options;
				
				//公共图片不再导出
				if((!o.isPublic)){
					this.exportAsset(doc, o.type, this.layer, o);
				}
				//app.activeDocument = doc;
				this.layer.visible =false;
			}else{
				if(o){
					node.name   = o.name;
					node.type   = o.type;
					node.options= o.options;
					if(o.type === "text"){
						node.offset = o.offset;
						node.size   = o.size;
						
						items.visible = false;
					}
				}else{
					node.type = "group";
				}
			}
		}
		
		if(   node.type === "group" 
		   || node.type === "input" 
		   || node.type === "slider"  
		   || node.type.indexOf("scroll")>-1){
			node.calculateOffsetAndSize();
		}
		if(node.type.indexOf("scroll")>-1){
			node.calculateSpace();
		}
	}
}

//名字解析
ImageProcessor.prototype.checkName = function(item) {
	var match = item.name.match(/^(.+)=(.+?)(\[([a-zA-Z]+)[|]{0,1}(\d*)\])?$/);
	if (!match) {
		return false;
	}
	
	var o = {
		name      : match[1],
		type      : match[2].toLowerCase(),
		isPublic  : false,//是否是公共图片--默认Common目录
		isDynamic : false,//是否是动态设置对象
		isValidate: false,
		options   : {}
	};
	
	if (o.type === "text") {
		if (item.kind !== LayerKind.TEXT) {
			alert("Error\nInvalid text layer.\n" + item.name);
			return false;
		}
		
		o.options = {
			opacity     : parseFloat(item.opacity),
			textContents: item.textItem.contents,
			textFont    : item.textItem.font,
			textSize    : this.getTextSize(item),
			textColor   : this.getTextColor(item)
		};

		o.size   = this.getSize(item);
		o.offset = this.getOffset(item);
		
	}else if(o.type==="jpg"){
		o.isValidate = true;
		
		if(match[5]===""){
			o.options = {
				quality: 12
			}
		}else{
			o.options = {
				quality: parseInt(match[5], 10)
			}
		}
	}else if (o.type === "button") {
		o.isValidate = true;
		
		o.options = {
			buttonStates: Config.defaultButtonStates
		}
	}else if(o.type ==="png"){
		o.isValidate = true;
	}else if(o.type ==="VGScroll" || o.type ==="HGScroll"){
		if(match[5]===""){
			o.options.constraint = 3;
		}else{
			o.options.constraint = parseInt(match[5], 10);
		}
	}

	if(match[4]){
		var str = match[4].toLowerCase();
		for(var i=0,len=str.length; i<len;i++){
			switch(str[i]){
				case "d":
					//动态设置节点
					o.isDynamic = true;
					break;
				case "c":
					//属于公共图集图片
					o.isPublic = true;
					break;
			}
		}
	}
	
	if(this.isOnlyButton){
		if(o.type !=="button"){
			return false;
		}
	}
	
	return o;
}

//合并图层
ImageProcessor.prototype.flatten = function(doc, param) {
	app.activeDocument = doc;
	var mergeLayer = null;
	if (param.typename === "LayerSet") {
		mergeLayer = param.merge();
	} else {
		var layerSet = doc.layerSets.add();
		layerSet.move(this.last , ElementPlacement.PLACEAFTER);
		param.duplicate().move(layerSet, ElementPlacement.INSIDE);
		layerSet.name = param.name;
		mergeLayer = layerSet.merge();
		
		param.visible =false;
	}
	return mergeLayer;
};

ImageProcessor.prototype.exportAsset = function(doc, type, layer, node) {
    if (type === "text") {
        return;
    }
   
    if (type === "button") {
		buttonStates = node.options.buttonStates;
        for (index= 0, len = buttonStates.length; index < len; index++) {
            this.doExport(doc, type, layer, node, "_" + buttonStates[index]);
        }
    } else {
        this.doExport(doc, type, layer, node);
    }
};

ImageProcessor.prototype.doExport = function(doc,type, item,node, suffix){
	var newDoc = app.documents.add(node.size.width, node.size.height, 72, "Layer to Export", NewDocumentMode.RGB, DocumentFill.TRANSPARENT);
	app.activeDocument = doc;
	var ly = item.duplicate(newDoc, ElementPlacement.INSIDE);
	
	//外部实现
	if(this.doExportCallack){
		this.doExportCallack(newDoc,ly,suffix);
	}
	
	var fileName = this.assetsRootPath+"/"+ node.name;
	if(suffix){
		fileName += suffix;
	}

	if(!this.exportImage(newDoc, fileName, type)){
		alert("错误\n无效类型.\n" + layer.name);
		return ;
	}
}

ImageProcessor.prototype.saveLayoutFile = function(){
	res = getLayoutPath(this.documentFilePath ,Config.structurePreffix);
	this.nodes.pruneEmptyGroups();
	
	saveFile(res.path+ Config.structurePreffix +res.fileName + Config.structureSuffix + ".json" , JSON.stringify(this.nodes.dump(),null, "\t"));
	//str = this.readNodeTree(this.nodes, 0);
	//saveFile(res.path+ Config.structurePreffix +res.fileName + Config.structureSuffix + ".json" ,str);
}

ImageProcessor.prototype.checkEnviroment = function(){
	return checkEnviroment();
}

ImageProcessor.prototype.getAssetsPath = function(name){
	return getAssetsPath(name,this.assetsFolderPreffix,this.assetsFolderSuffix);
}

ImageProcessor.prototype.getSize = function(item){
	return getSize(item.bounds);
}

ImageProcessor.prototype.getOffset = function(item){
	return getOffset(item.bounds);
}

ImageProcessor.prototype.getTextSize = function(item){
	return getTextSize(item);
}

ImageProcessor.prototype.getTextColor = function(item){
	return getTextColor(item);
}

ImageProcessor.prototype.exportImage = function(doc,fileName,type){
	return exportImage(doc,fileName,type);
}