PSD导出切图及界面布局文件生成
================

命名方式
---------------

1.用英文或者拼音命名，不要用中文
2.功能模块下有子功能模块,psd文件命名带“_”，
	如公会里的商店  Guild_Mall.psd
3.规范
```go
    格式	                说明
    name=PNG	         导出PNG图片
    name=JPG	         导出JPG图片
    name=Text	         文本字段
    name=Input           输入框
    name=Button	         导出为按钮图片，默认为常态图片
    name=Slider	         标记为滚动滑块
    name=HGScroll	     水平网格布局标识
    name=VGScroll	     垂直网格布局标识
    name=VScroll	     垂直布局标识
    name=HScroll	     水平布局标识
    name=PNG[DC]	     D:动态设置图片  C:公共图集图片，不导出
    name=JPG[|10]	     导出品质为10 的JPG图片
    name=VGScroll[|3]  	 垂直网格布局标识，固定3列
```
   
导出路径
---------------

1.切图导出都在Art/Atlas目录下
	如 Guild_Mall.psd， 切图在Art/Atlas/Guild/Mall下Guild.psd 切图在Art/UI/Guild下
2.布局文件目录Layout
	如Guild.psd 导出文件为 Layout/Guild.json
	
资源管理
---------------

*psd 源文件提交美术仓库
*Art和Layout导出后直接拷贝到指定仓库提交给程序

## 打赏作者

![](https://inews.gtimg.com/newsapp_bt/0/12589853810/641)