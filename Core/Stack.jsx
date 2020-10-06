//堆处理

function Stack(){
	this.data = [];
	this.size = 0;
	
}

Stack.prototype.push = function(item){
	this.data[this.size++] = item;
}

Stack.prototype.pop = function(){
	return this.data[--this.size];
}

Stack.prototype.peek = function(){
	return this.data[this.size-1];
}

Stack.prototype.clear = function(){
	this.size = 0;
	this.data = [];
}