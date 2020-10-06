
//字符串颜色转数值数组
String.prototype.toRGB = function () {
	// 16进制颜色值的正则
	var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
	// 把颜色值变成小写
	var color = this.toLowerCase();
	if (reg.test(color)) {
		// 如果只有三位的值，需变成六位，如：#fff => #ffffff
		if (color.length === 4) {
			var colorNew = "#";
			for (var i = 1; i < 4; i += 1) {
				colorNew += color.slice(i, i + 1).concat(color.slice(i, i + 1));
			}
			color = colorNew;
		}
		
		// 处理六位的颜色值，转为RGB
		var colorChange = [];
		for (var i = 1; i < 7; i += 2) {
			colorChange.push(parseInt("0x" + color.slice(i, i + 2)));
		}
		
		return {
			r:colorChange[0],
			g:colorChange[1],
			b:colorChange[2]
		};
	
	} else {
		return {
			r:255,
			g:255,
			b:255
		};
	}
};


//获取文本大小
function getTextSize(a) {
	size = a.textItem.size;
	return Number(size);
}

//获取文本颜色
function getTextColor(a) {
	var color;
	try {
		color = a.textItem.color.rgb;
	} catch (d) {
		color = { 
			red: 0, 
			green: 0, 
			blue: 0 
		};
	}
	return { 
		red  : Math.round(color.red), 
		green: Math.round(color.green), 
		blue : Math.round(color.blue) 
	};
}

function getLineFeed() {
	if (/windows/i.test($.os)) {
		return "Windows";
	} else {
		return "Unix";
	}
}

//保存文件
function saveFile(fileName, data){
	var file = new File(fileName);
	file.encoding = "UTF8";
	file.type = "TEXT";
	file.lineFeed = getLineFeed();
	file.open("w");
	file.writeln(data);
	file.close();
}

//获取根目录，和切图目录
function getAssetsPath(fileName, preffix, suffix){
	var _fullName = fileName.substr(0, fileName.lastIndexOf(".") );
	var _path = _fullName.substr(0, _fullName.lastIndexOf("/")+1 );
	var _fileName = _fullName.replace(_path,"");
	if(_fileName.indexOf("_") != -1){
		var arr = _fileName.split("_");
		var _realPath = "";
		for(index =0,len= arr.length; index<len; index++){
			_realPath+= arr[index]+"/";
		}
		_fileName = _realPath.substr(0, _realPath.length-1);
	}
	
	return {
		documentFilePath:_fullName, 
		assetsRootPath  :_path + preffix +_fileName + suffix 
	};
}

//获取布局文件目录， 不存在则创建目录结构
function getLayoutPath(fullName, preffix){
	var _path = fullName.substr(0, fullName.lastIndexOf("/")+1 );
	var _fileName = fullName.replace(_path,"");
	var folder;
	if(_fileName.indexOf("_") != -1){
		var arr = _fileName.split("_");
		var _realPath = "";
		for(index =0,len= arr.length; index<len; index++){
			_realPath+= arr[index]+"/";
		}
		_fileName = _realPath.substr(0, _realPath.length-1);
		
		folder = Folder(_path + preffix +_fileName.substr(0, _fileName.lastIndexOf("/") ));
	}else{
		folder = Folder(_path + preffix);
	}
	if (!folder.exists) {
		folder.create();
	}
	return {
		path: _path,
		fileName: _fileName
	};
}

//检测文档状态
function checkEnviroment() {
	if (app.documents.length === 0) {
		alert("错误！请打开一个文档.");
		return false;
	}
	if (!app.activeDocument.saved) {
		a = confirm("警告，文件未保存，是否继续操作?");
		if (!a) {
			return false;
		}
	}
	return true;
}

//设置相对位置 index:0 设置x坐标  1:设置y坐标
function calculatePosition(lay1, lay2, index){
	return -lay2.bounds[index]+( (lay1.bounds[index+2] -lay1.bounds[index])-(lay2.bounds[index+2] -lay2.bounds[index]) )*0.5;
}

//导出图片
function exportImage(doc, fileName, type, quality){
	saveOption = void(0);
	nodeType = type.toLowerCase();
	if (nodeType === "png" || nodeType === "button") {
		saveOption = new PNGSaveOptions();
	} else if (nodeType === "jpg") {
		saveOption = new JPEGSaveOptions();
		saveOption.quality = quality || 12;
	} else {
		//无效类型
		return false;
	}

	folder = Folder(fileName.replace(/(.+)\/.+$/, "$1"));
	if (!folder.exists) {
		folder.create();
	}
	doc.saveAs(File(fileName), saveOption, true, Extension.LOWERCASE);
	doc.close(SaveOptions.DONOTSAVECHANGES);
	return true;
}


function getOffset(bounds) {
    for (index= 0, len = bounds.length; index < len; index++) {
        bounds[index] = parseFloat(bounds[index]);
    }
    return {
        left: bounds[0],
        top : bounds[1]
    };
}

function getSize(bounds) {
    for (index=0, len = bounds.length; index < len; index++) {
        bounds[index] = parseFloat(bounds[index]);
    }
    return {
        width : bounds[2] - bounds[0],
        height: bounds[3] - bounds[1]
    };
}

/**********photoshop 常用操作    *****************/

//填充颜色
function fillColor(color){
	
	var desc = new ActionDescriptor();
	var ref = new ActionReference();

    desc.putEnumerated( keyUsing, typeFillContents, classColor );
	
	desc.putObject( classColor, enumRGBColor, pickColor(color) );
	
    desc.putUnitDouble( keyOpacity, unitPercent, 100.000000 );
    desc.putEnumerated( classMode, typeBlendMode, enumNormal );
    
	executeAction( eventFill, desc, DialogModes.NO );
}

//创建剪贴蒙层
function createCutMask(){
    var desc = new ActionDescriptor();
    var ref = new ActionReference();
    
    ref.putEnumerated( classLayer, typeOrdinal, enumTarget );
    desc.putReference( keyNull, ref );
    
    executeAction( eventGroup, desc, DialogModes.NO );
}


//设置颜色
function pickColor(color){
	rgb = color.toRGB();
	var desc = new ActionDescriptor();
	desc.putDouble( keyRed, rgb.r );
	desc.putDouble( enumGreen, rgb.g );
	desc.putDouble( keyBlue, rgb.b );
    return desc;
}

/*********photoshop 常用操作 end *****************/ 