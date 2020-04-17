# audio_wave_plugin

> A Vue.js component，used for segment audio.
> 音频切分插件，可展示波形图，分段播放，选区播放等

![avatar](https://pic.downk.cc/item/5e9838e8c2a9a83be5791209.png)

## Build Setup

``` 
# install plugin
npm install audio_wave_plugin --save

# using tutorials
	main.js:
	import audioWave from 'audio_wave_plugin';
	Vue.use(audioWave);

	yourPage.vue:  
	# 要引用的页面
	<template>
	  <div id="yourPage">
		<audio-wave style="width:1080px" ref="AudioWave" :tagChooseList="tagChooseList"></audio-wave>
	  </div>
	</template>
	<script>
	export default {
	  data() {
		return {
		  tagChooseList:["偏高","正常","偏低"],//下拉数组
		  audioUrl:
			"http://kolber.github.io/audiojs/demos/mp3/juicy.mp3"
		};
	  },
	  mounted() {
		this.$refs.AudioWave._initAudio(this.audioUrl, []);
	  }
	};
	</script>

```

## attentions
> * 组件最小宽度为1080px

> * 双击进度条打点切分

> * 左上角播放按钮播放全部音频，每个音频段播放按钮播放当前段音频内容

> * 空格播放：波形图上有选区时播放选区内容，没有选区时播放全部音频

> * 重置波形图：清除波形图选区，重新加载波形图

## api
1.初始化组件，第一个参数为音频url，第二个参数是分段的数组，分段为空时传[]

`this.$refs.AudioWave._initAudio(url,sectionList);`

sectionList格式：
````
    [
        {
            startTime: "0:00.420",//音频段开始时间，分:秒.毫秒
            endTime: "0:01.180",//音频段结束时间，分:秒.毫秒
            tag: 1,//当前标记内容
            startLeft: "8.67%",
            endLeft: "24.33%",
            isPlaySection: false,//音频段播放按钮
            chevronType: false,//音频段是否展开
            chooseTag: false//音频段展开框中选择框是否展开
        }
    ];
````

2.获取当前切分内容
````
var tagList = this.$refs.AudioWave.tagList;
console.log(tagList);
````

3.获取当前切分内容前检测tagList值是否满足要求
````
console.log( this.$refs.AudioWave.checkTagList() );
````
* （1）每个音频段必须有结束标签
* （2）每个音频段结束时间必须大于开始时间
* （3）每个音频段必须有标记内容（即下拉框必须有内容值）
> 返回值有两种：
* true;    //检测通过
* 错误字符串;   //返回具体检测不通过原因

