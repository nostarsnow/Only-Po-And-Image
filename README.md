ku岛和A岛只看po和只看图片的插件。
-----------------------------------  

> 2016-06-23 更新。ku岛V2版本接口和图片地址的更改。顺便A岛https覆盖。无法以下面的方式来加载插件。只得通过油猴或者手动F12在console里输入代码才可以。就这样。
  
因为两个岛没有只看po和只看图片的功能和api接口。所以。。。
为了方便自己也为了方便大家。同时为了练手。  
做了这么一个小插件。     
请不要吐槽js水平。  
测试了IE11以上的几个现代浏览器。似乎没有什么bug。大概吧。  
尽可能减少了请求数量。不会一次性全部加载串内所有回复。只会加载到填充够一页十条的程度。~~所以也有可能一个串有1000页。但是因为po的发言都不够十条。反而会把1000页都加载出来的情况。尽量手动取舍吧。只在po连载较多或图片较多的串里使用~~  
暂时不能自主选择每一页多少条。
  
  
### 1、使用github源。使用方法：将以下代码添加为一个书签。进入ku岛或A岛串内之后点一下即可。类似于acfunfix、有道云翻译网页版等。  
    javascript:(function(){var f=document.createElement('script');f.src='https://cdn.rawgit.com/nostarsnow/onlyPoAndImage/master/onlyPoAndImg.min.js?xl_r='+new Date().getTime();document.body.appendChild(f);})();
  
### 2、使用阿里云源。不是特别稳定。因为不是我的服务器。不过速度比上面那个好的多。使用方法：将以下代码添加为一个书签。进入ku岛或A岛串内之后点一下即可。类似于acfunfix、有道云翻译网页版等。  
    javascript:(function(){var f=document.createElement('script');f.src='http://nostar.jinboran.com/ns/Only-Po-And-Image/onlyPoAndImg.min.js?xl_r='+new Date().getTime();document.body.appendChild(f);})();