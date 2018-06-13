watermark.js
========
[![License][license-badge]][license-badge-url]

### Usage ###

```html
<script src="watermark.js" charset="utf-8"></script>
```

This code creates a watermark preview, with text image and Lattice points.

```javascript
watermarks.init({id:'demo_div',lean:true,fontSize:20,fontFamily:'Georgia',fontColor:'black'})
		.addText({text:'center content',type:1})
		.addText({text:'upper left content',type:2})
		.addText({text:'bottom left content',type:4})
		.addText({text:'upper right content',type:8})
		.addText({text:'bottom right content',type:16})
		.addImage({viewType: 2,imgAlpha: 50,layer:1, src:"https://avatars1.githubusercontent.com/ml/89?s=106&v=4"})
		.addPoints({l:40,d:3,p:0,color:'#b5b5b5',transparent:50, content:'01234568'})
		.draw();
```