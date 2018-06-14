
/*
 * watermark preview Plugin JS Example
 * https://github.com/iamcaochong/watermark.js
 *
 * Copyright 2018, iamcaochong
 *
 * Licensed under the MIT license:
 * https://opensource.org/licenses/MIT
 */

var watermarks = {
	
	/**
	 * 
	 * @param {Object} opt
	 * 		opt.id: 父容器id，需指定具体的width和length
	 * 		opt.lean: 是否斜式水印(文字)
	 * 		opt.showbg: 是否显示(文字的)背景
	 * 		opt.fontFamily: (文字)字体
	 * 		opt.fontColor: (文字)颜色
	 * 		opt.fontSize: (文字)字号，磅值为单位
	 * 		opt.lineNumber: (文字)显示行数
	 * 		opt.fontAlpha: (文字)透明度
	 * 
	 * 
	 * 		opt.viewType: (文字)0居中 1拉伸 2平铺
	 * 		
	 */
	
	init : function(opt){
		//default value
		opt.lean=opt.lean==null?false:opt.lean;
		opt.showbg=opt.showbg==null?true:opt.showbg;
		
		opt.fontFamily=opt.fontFamily==null?"Georgia":opt.fontFamily;
		opt.fontColor=opt.fontColor==null?"#b5b5b5":opt.fontColor;
		
		opt.fontSize=isNaN(opt.fontSize)?10:opt.fontSize;
		opt.lineNumber=isNaN(opt.lineNumber)?10:opt.lineNumber;
		opt.viewType=isNaN(opt.viewType)?0:opt.viewType;
		opt.fontAlpha=isNaN(opt.fontAlpha)?50:opt.fontAlpha;
		
		
		var o = {};
		var c = document.getElementById(opt.id);
		o.width = c.offsetWidth;
		o.height = c.offsetHeight;
		o.fontSize = parseInt(opt.fontSize)*1.333;
		o.fontFamily = opt.fontFamily;
		o.lean = opt.lean;
		o.lineNumber = parseInt(opt.lineNumber);
		o.viewType = parseInt(opt.viewType);
		o.fontAlpha = 1-parseInt(opt.fontAlpha)/100;
//		console.log(o.width+'----'+o.height)
		//已知高和宽的比例，通过正弦值求倾斜角度
		var angle = Math.atan(o.height/o.width)*180/Math.PI;
		o.data={
			'l1':{x:o.width*0.125,y:o.height*0.125,deg:-angle,text:[]},
			'l2':{x:o.width*0.125,y:o.height*0.875,deg:angle,text:[]},
			'r1':{x:o.width*0.875,y:o.height*0.125,deg:angle,text:[]},
			'r2':{x:o.width*0.875,y:o.height*0.875,deg:-angle,text:[]},
			'c':{x:o.width*0.5,y:o.height*0.5,deg:-angle,text:[]},
		};
		o.points=[];
		var getCtx = function(){
			if (typeof o.ctx == 'undefined'){
				o.id = opt.id +'_canvas0';
				c.innerHTML = '<canvas id="'+o.id+'" class="watermarks_item" width="'+o.width+'" height="'+o.height+'">对不起，您的浏览器不支持Canvas</canvas>';
				o.ctx = document.getElementById(o.id).getContext("2d");
				if (opt.showbg && ! o.showImg) {
					o.ctx.fillStyle = '#b0dfe5';
					o.ctx.fillRect(0,0,o.width,o.height);
				}
			}
			o.ctx.font=o.fontSize + "px " + o.fontFamily;
			o.ctx.fillStyle = opt.fontColor;
			o.ctx.globalAlpha=o.fontAlpha;
			o.ctx.save();
			return o.ctx;
		}
		var createCanvas = function(opt1){
			var ctx = getCtx();
			var offset = ctx.measureText(opt1.text).width/2;
			ctx.save();
			ctx.translate(opt1.x, opt1.y);
			if(o.lean){
				ctx.rotate(opt1.deg*Math.PI/180);
			}
			ctx.textBaseline="middle";
			ctx.fillText(opt1.text, -offset, 0, offset*2);
			ctx.restore();
			return ctx;
		};
		
		/**
		 * 添加水印文字
		 * @param {Object} opt1
		 * 		opt1.type: 文字显示位置   --1 中间2 左上4 左下8右上16右下
		 * 		opt1.text: 文本内容
		 * 
		 */
		o.addText = function(opt1){//添加水印文字
			//default value
			opt1.type=opt1.type==null?1:opt1.type;
			var type = parseInt(opt1.type);
			switch (type){
				case 1:
					o.data.c.text.push(opt1.text);
					break;
				case 2:
					o.data.l1.text.push(opt1.text);
					break;
				case 4:
					o.data.l2.text.push(opt1.text);
					break;
				case 8:
					o.data.r1.text.push(opt1.text);
					break;
				case 16:
					o.data.r2.text.push(opt1.text);
					break;
				default:
					break;
			}
			return o;
		};
		
		/**
		 * 添加水印图片
		 * @param {Object} opt1
		 * 
		 * 		opt1.viewType: 0居中1拉伸2平铺
		 * 		opt1.imgAlpha: 图片透明度
		 * 		opt1.src: 图片链接
		 * 		opt1.layer: 0水印图片在水印文字上层显示1水印图片在水印文字底层. (注：点阵水印总是显示在最上层)
		 * 	
		 */
		o.addImage = function(opt1){//添加水印图片(暂时只支持单个)
			//default value
			opt1.layer=isNaN(opt1.layer)?1:opt1.layer;
			opt1.viewType=isNaN(opt1.viewType)?0:opt1.viewType;
			opt1.imgAlpha=isNaN(opt1.imgAlpha)?50:opt1.imgAlpha;
			var x,y,w,h;
			var layer=parseInt(opt1.layer);
			var viewType=parseInt(opt1.viewType);
			var imgAlpha=1-parseInt(opt1.imgAlpha)/100;
			o.img = new Image();
			o.showImg = true;
			o.imgSrc = opt1.src;
			o.imgOnload = function(){//图片加载完成回调函数
				getCtx();
				o.ctx.fillStyle = '#ffffff';
				o.ctx.globalAlpha=1;
				o.ctx.fillRect(0,0,o.width,o.height);
				if (layer == 0) {//img图层置于顶层
					o.ctx.restore();
					drawTxt();
				}
				o.ctx.globalAlpha = imgAlpha;
				switch(viewType){
					case 0://居中
						w = o.img.width > 0.9*o.width ? 0.9*o.width : o.img.width;
						h = o.img.height > 0.9*o.height ? 0.9*o.height : o.img.height;
						x = (o.width - w)/2;
						y = (o.height - h)/2;
						o.ctx.drawImage(o.img,x,y,w,h);
						break;
					case 1://拉伸
						w = o.width;
						h = o.height;
						x=0;
						y=0;
						o.ctx.drawImage(o.img,x,y,w,h);
						break;
					case 2://平铺
    					w = o.width;
						h = o.height;
						x=0;
						y=0;
						var ptrn = o.ctx.createPattern(o.img, 'repeat'); 
						o.ctx.fillStyle = ptrn;
						o.ctx.fillRect(x,y,w,h);
						break;
				}
				o.ctx.restore();
				if (layer == 1) {//img图层置于底层
					drawTxt();
				}
				drawPoints();
			}
			return o;
		};
		o.draw = function(){//开始画
			if (o.showImg) {
				o.img.onload = o.imgOnload;
				o.img.onerror = function(){
					o.showImg = false;
					drawTxt();
					drawPoints();
				};
				o.img.src = o.imgSrc;
			} else  {
				drawTxt();
				drawPoints();
			}
			return o;
		};
		var drawTxt = function(){//画文字
			if(o.viewType == 2){
				var txt = "";
				for (var d in o.data) {
					var arr = o.data[d]['text'];
					var opt2 = o.data[d];
					if (arr.length > 0 && d == 'c') {
						for(var i=0;i<arr.length;i++){
							txt += arr[i] + ' ';
						}
					}
				}
				if(txt.length>0){
					while (true){
						if(txt.length*o.fontSize > o.width*10){
							break;
						}
						txt = txt + txt;
					}
				}
				if(o.lineNumber){
					var segY = o.lean?o.height*2/(o.lineNumber + 1):o.height/(o.lineNumber + 1);
					var deg = o.lean?-angle:0;
					for (var i=0;i<o.lineNumber;i++) {
//						console.log(segY*(i+1))
						createCanvas({x:0,y:segY*(i+1),deg:deg,text:txt});
					}
				}
			} else {
				for (var d in o.data) {
					var arr = o.data[d]['text'];
					var opt2 = o.data[d];
					if (arr.length > 0) {
						if (d == 'c') {
							var x,y,len = arr.length;
							var seg = (o.height/2)/(len + 1);
							for(var i=0;i<len;i++){
								var opt3 = opt2;
								opt3.x = o.width/2;
								opt3.y = (o.height/4 + seg*(i+1));
								if(o.lean){
									var yy = (opt3.y - o.height*0.5)*0.5;
									var xx = yy*o.width/o.height;
									opt3.y += yy;
									opt3.x += xx;
								}
								opt3.text = arr[i];
								createCanvas(opt3);
							}
						} else{
							var txt = '';
							for(var i=0;i<arr.length;i++){
								txt += arr[i] + ' ';
							}
							opt2.text = txt;
							createCanvas(opt2);
						}
					}
				}
			}
		};
		
		/**
		 * 添加点阵水印
		 * 		注：点阵水印总是显示在最上层
		 * @param {Object} obj
		 * 
		 * 		obj.l: 点阵边长length (num),
		 *  	obj.d: 点阵每个圆的直径diameter (num),
		 *  	obj.p: 点阵间距padding (num),
		 *  	obj.color: 每个圆的填充颜色fill color of every point(string),
		 *  	obj.transparent: 圆填充透明度1-100(num),
		 *  	obj.content: 点阵内容8位16进制表示,长度为8才能填满9宫格,第一位是占位符,定位用的.value to show with length 8(string)
		 * 
		 */
		o.addPoints = function(obj){
            obj.l=isNaN(obj.l)?40:parseInt(obj.l);
            obj.d=isNaN(obj.d)?0:parseInt(obj.d);
            obj.p=isNaN(obj.p)?0:parseInt(obj.p);
            obj.transparent=isNaN(obj.transparent)?50:parseInt(obj.transparent);

			o.points = [];
			if (validLatticePointContent(obj.content)) {//检查点阵内容
				var l = obj.l;
				var r = obj.d/2;
				var p = obj.p;
				var offsetNum = (l + p)*3;
				
				for (var offsetY = 0; offsetY < o.height; offsetY += offsetNum) {
					for (var offsetX = 0; offsetX < o.width; offsetX += offsetNum) {
						pushNine(obj, {x: offsetX,y: offsetY});
					}
				}
//				drawPoints();
			}
			return o;
		}
		
		//检查点阵内容，如果长度不等于8,就返回false.
		var validLatticePointContent = function(content){
			if (content && content.length == 8) {
				return true;
			}
			return false;
		}
		
		//push each nine block box;
		var pushNine = function(obj,zeroOffset){
			var l = obj.l;
			var r = obj.d/2;
			pushOnePoint({x:0.5*l,y:0.25*l,r:r,color:obj.color,transparent:obj.transparent,offset:zeroOffset});
			pushOnePoint({x:0.25*l,y:0.5*l,r:r,color:obj.color,transparent:obj.transparent,offset:zeroOffset});
			pushOnePoint({x:0.5*l,y:0.5*l,r:r,color:obj.color,transparent:obj.transparent,offset:zeroOffset});
			pushOnePoint({x:0.5*l,y:0.75*l,r:r,color:obj.color,transparent:obj.transparent,offset:zeroOffset});
			pushOnePoint({x:0.75*l,y:0.5*l,r:r,color:obj.color,transparent:obj.transparent,offset:zeroOffset});
			var content = obj.content;
			if(content != null && content.length > 0){
				var contentChars = content.split('');
				for(var i=0; i<contentChars.length; i++){
					addLatticePoint(obj, contentChars[i], i + 1, zeroOffset);
				}
			}
		}
		var pushOnePoint = function(obj){
			o.points.push({x:obj.x + obj.offset['x'],y:obj.y + obj.offset['y'],r:obj.r,color:obj.color,transparent:obj.transparent});
		}
		var getOffset = function(obj, index){
			var l = obj.l;
			var p = obj.p;
			var offset={};
			switch (index){
				case 1:
					offset['x'] = l + p;
					offset['y'] = 0;
					break;
				case 2:
					offset['x'] = (l + p)*2;
					offset['y'] = 0;
					break;
				case 3:
					offset['x'] = 0;
					offset['y'] = l + p;
					break;
				case 4:
					offset['x'] = l + p;
					offset['y'] = l + p;
					break;
				case 5:
					offset['x'] = (l + p)*2;
					offset['y'] = l + p;
					break;
				case 6:
					offset['x'] = 0;
					offset['y'] = (l + p)*2;
					break;
				case 7:
					offset['x'] = l + p;
					offset['y'] = (l + p)*2;
					break;
				case 8:
					offset['x'] = (l + p)*2;
					offset['y'] = (l + p)*2;
					break;
				default:
					break;
			}
			return offset;
		}
		var addLatticePoint = function(obj, character, index, zeroOffset){
			if(character == null) return;
			var tempC = character.toLowerCase();
			var offset = getOffset(obj, index);
			var l = obj.l;
			var r = obj.d/2;
			var p1={};
			var p2={};
			var p3={};
			
			switch(tempC){
				case '0':
					p1['x']=0.75*l;
					p1['y']=0.25*l;
					p2['x']=0.5*l;
					p2['y']=0.5*l;
					p3['x']=0.25*l;
					p3['y']=0.75*l;
					break;
				case '1':
					p1['x']=0.25*l;
					p1['y']=0.5*l;
					p2['x']=0.5*l;
					p2['y']=0.5*l;
					p3['x']=0.75*l;
					p3['y']=0.5*l;
					break;
				case '2':
					p1['x']=0.25*l;
					p1['y']=0.25*l;
					p2['x']=0.5*l;
					p2['y']=0.5*l;
					p3['x']=0.75*l;
					p3['y']=0.75*l;
					break;
				case '3':
					p1['x']=0.25*l;
					p1['y']=0.25*l;
					p2['x']=0.25*l;
					p2['y']=0.75*l;
					p3['x']=0.75*l;
					p3['y']=0.75*l;
					break;
				case '4':
					p1['x']=0.25*l;
					p1['y']=0.25*l;
					p2['x']=0.75*l;
					p2['y']=0.25*l;
					p3['x']=0.75*l;
					p3['y']=0.75*l;
					break;
				case '5':
					p1['x']=0.5*l;
					p1['y']=0.25*l;
					p2['x']=0.5*l;
					p2['y']=0.5*l;
					p3['x']=0.75*l;
					p3['y']=0.75*l;
					break;
				case '6':
					p1['x']=0.5*l;
					p1['y']=0.25*l;
					p2['x']=0.5*l;
					p2['y']=0.5*l;
					p3['x']=0.5*l;
					p3['y']=0.75*l;
					break;
				case '7':
					p1['x']=0.5*l;
					p1['y']=0.25*l;
					p2['x']=0.5*l;
					p2['y']=0.5*l;
					p3['x']=0.25*l;
					p3['y']=0.75*l;
					break;
				case '8':
					p1['x']=0.75*l;
					p1['y']=0.25*l;
					p2['x']=0.25*l;
					p2['y']=0.25*l;
					p3['x']=0.25*l;
					p3['y']=0.75*l;
					break;
				case '9':
					p1['x']=0.75*l;
					p1['y']=0.25*l;
					p2['x']=0.75*l;
					p2['y']=0.75*l;
					p3['x']=0.25*l;
					p3['y']=0.75*l;
					break;
				case 'a':
					p1['x']=0.25*l;
					p1['y']=0.25*l;
					p2['x']=0.5*l;
					p2['y']=0.5*l;
					p3['x']=0.75*l;
					p3['y']=0.5*l;
					break;
				case 'b':
					p1['x']=0.25*l;
					p1['y']=0.75*l;
					p2['x']=0.5*l;
					p2['y']=0.5*l;
					p3['x']=0.75*l;
					p3['y']=0.5*l;
					break;
				case 'c':
					p1['x']=0.25*l;
					p1['y']=0.25*l;
					p2['x']=0.5*l;
					p2['y']=0.5*l;
					p3['x']=0.5*l;
					p3['y']=0.75*l;
					break;
				case 'd':
					p1['x']=0.75*l;
					p1['y']=0.25*l;
					p2['x']=0.5*l;
					p2['y']=0.5*l;
					p3['x']=0.5*l;
					p3['y']=0.75*l;
					break;
				case 'e':
					p1['x']=0.25*l;
					p1['y']=0.5*l;
					p2['x']=0.5*l;
					p2['y']=0.5*l;
					p3['x']=0.75*l;
					p3['y']=0.25*l;
					break;
				case 'f':
					p1['x']=0.25*l;
					p1['y']=0.5*l;
					p2['x']=0.5*l;
					p2['y']=0.5*l;
					p3['x']=0.75*l;
					p3['y']=0.75*l;
					break;
				default:
  					//do nothing;
			}
			pushOnePoint({x:p1['x'] + offset['x'],y:p1['y'] + offset['y'],r:r,color:obj.color,transparent:obj.transparent,offset:zeroOffset});
			pushOnePoint({x:p2['x'] + offset['x'],y:p2['y'] + offset['y'],r:r,color:obj.color,transparent:obj.transparent,offset:zeroOffset});
			pushOnePoint({x:p3['x'] + offset['x'],y:p3['y'] + offset['y'],r:r,color:obj.color,transparent:obj.transparent,offset:zeroOffset});
			
		}
		var drawPoints = function(){
			for(var i=0; i<o.points.length; i++){
				drawLattice(o.points[i]);
			}
		}
		var drawLattice = function(latticeObj){
			var ctx = getCtx();
			ctx.beginPath();
			ctx.arc(latticeObj.x,latticeObj.y,latticeObj.r,0,2*Math.PI);
			ctx.fillStyle=latticeObj.color;
			ctx.globalAlpha=1-latticeObj.transparent/100;
			ctx.fill();
			ctx.restore();
		}
		
		o.destroy = function(){
			var className = ".watermarks_item";
			var doms = document.getElementsByClassName(className);
			if (doms && doms.length > 0) {
				for (var i = 0; i < doms.length; i++) {
					doms[i].parentNode.removeChild(doms[i]);
				}
			}
		};
		o.clearText = function(){
			for (var d in o.data) {
				o.data[d]['text'] = [];
			}
		};
		return o;
	},
	destroy : function(){
		var className = ".watermarks_item";
		var doms = document.getElementsByClassName(className);
		if (doms && doms.length > 0) {
			for (var i = 0; i < doms.length; i++) {
				doms[i].parentNode.removeChild(doms[i]);
			}
		}
	}
}