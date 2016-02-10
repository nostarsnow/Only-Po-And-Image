ku岛只看po和只看图片的插件。
-----------------------------------  
  
因为ku岛没有只看po和只看图片的功能和api接口。所以。。。
为了方便自己也为了方便ku岛大家。同时为了练手。  
做了这么一个小插件。  
本来还想兼容A岛的。结果A岛现在的API改版了。也没有兴趣去兼容了。  
之前兼容的代码也懒得删。嘛。就这样吧。  
请不要吐槽js水平。  
测试了IE11以上的几个现代浏览器。似乎没有什么bug。大概吧。  
尽可能减少了请求数量。不会一次性全部加载串内所有回复。只会加载到填充够一页十条的程度。暂时不能自主选择每一页多少条。
  
  
### 1、使用github源。使用方法：将以下代码添加为一个书签。进入ku岛串内之后点一下即可。类似于acfunfix、有道云翻译网页版等。  
    javascript:(function(){var f=document.createElement('script');f.src='https://cdn.rawgit.com/nostarsnow/onlyPoAndImage/master/onlyPoAndImg.min.js?xl_r='+new Date().getTime();document.body.appendChild(f);})();
  
### 2、使用阿里云源。不是特别稳定。因为不是我的服务器。不过速度比上面那个好的多。使用方法：将以下代码添加为一个书签。进入ku岛串内之后点一下即可。类似于acfunfix、有道云翻译网页版等。  
    javascript:(function(){var f=document.createElement('script');f.src='http://www.yunjiayigou.com/js/lib/onlyPoAndImg.min.js?xl_r='+new Date().getTime();document.body.appendChild(f);})();