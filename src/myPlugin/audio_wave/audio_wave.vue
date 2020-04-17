<template>
  <div id="audioSplitVue">
    <Message ref="Message" />
    <audio style="width:700px;" id="sourceAudio" :src="audioInfo.url"></audio>

    <div id="audioSplit">
      <div class="playBtn">
        <span
          @click="playPauseFn"
          v-if="!audioInfo.isPlaying"
          class="playSpan iconfont icon-bofang"
        ></span>
        <span @click="playPauseFn" v-else class="playSpan iconfont icon-suspend_icon"></span>
      </div>
      <div class="timeBox">
        <span>{{audioInfo.curTime.split('.')[0]}}</span>
        <span>/</span>
        <span>{{audioInfo.totalTime}}</span>
      </div>
      <div
        class="progressBox"
        @dblclick="changeCurTimeFn($event,'2')"
        @click.stop="changeCurTimeFn"
      >
        <div class="progress"></div>
        <div class="progressTag" @click.stop @dblclick.stop>
          <span
            class="progressTagSpan"
            v-for="(item, index) in tagList"
            :key="index+'tagSpanStart'"
            :id="'tagSpanStart'+index"
            :style="'left:'+item.startLeft+';background:'+colorList[index]"
          >
            <div
              @mousedown="dragMousedown($event,'tagSpanStart',index)"
              @mouseup="dragMouseup($event,index)"
              style="width:14px;height:25px;position: absolute;left: -7px;z-index: 100;bottom:0;"
            ></div>
            <b :style="'color:'+colorList[index]">{{item.startTime}}</b>
            <span
              :style="'color:'+colorList[index]"
              @click="item.chevronType = !item.chevronType"
              v-if="item.endTime && item.chevronType"
              class="hideBtn iconfont icon-chevron_down_circle"
            ></span>
            <span
              :style="'color:'+colorList[index]"
              @click="item.chevronType = !item.chevronType"
              v-if="item.endTime && !item.chevronType"
              class="hideBtn iconfont icon-chevron_right_circle"
            ></span>
            <span
              v-if="item.chevronType && item.endTime && !item.isPlaySection"
              @click="playPauseSectionFn(index)"
              :style="'color:'+colorList[index]"
              class="playPauseSectionBtn iconfont icon-bofang"
            ></span>
            <span
              v-if="item.chevronType && item.endTime && item.isPlaySection"
              @click="playPauseSectionFn(index)"
              :style="'color:'+colorList[index]"
              class="playPauseSectionBtn iconfont icon-suspend_icon"
            ></span>
            <span
              v-if="item.chevronType || !item.endTime"
              @click="deleteSectionFn(index)"
              :style="!item.endTime?'top:5px;left:5px;font-size:16px;':''"
              class="deleteSectionBtn iconfont icon-shanchu"
            ></span>
            <div class="selectTag select" id="select" v-if="item.chevronType && item.endTime">
              <div @click="openSelectFn(index)" class="selection no_chevron_up">
                <span class="no_chevron_up selectionValue" style="font-weight:normal;">{{item.tag}}</span>
              </div>
              <ul v-if="item.chooseTag" id="selectList">
                <li
                  @click="chooseTagFn(index,i)"
                  v-for="(v,i) in tagChooseList"
                  :key="i+'select'"
                  :class="['no_chevron_up',item.tag == v?'activeSelected':'']"
                >{{v}}</li>
              </ul>
            </div>
          </span>
          <span
            class="progressTagSpan"
            v-for="(item, index) in tagList"
            :key="index+'tagSpanEnd'"
            :id="'tagSpanEnd'+index"
            :style="'left:'+item.endLeft+';background:'+colorList[index]+';height:'+(item.endTime?'176px':'0px')"
          >
            <div
              @mousedown="dragMousedown($event,'tagSpanEnd',index)"
              @mouseup="dragMouseup($event,index)"
              style="width:14px;height:25px;position: absolute;left: -7px;z-index: 100;bottom:0;"
            ></div>
            <b :style="'color:'+colorList[index]">{{item.endTime}}</b>
          </span>
        </div>
      </div>
    </div>

    <div class="hrBorder">
      <button class="hrBorderBtn" size="small" @click="spoutMicrophoneResetFn" type="ghost">重置波形图</button>
      <div id="canvasBlock">
        <div id="canvasMark">
          <div id="canvasCover" @click.stop="changeCurTimeFn" style="z-index: 2;">
            <div id="ruler">
              <div class="line" id="processingLine"></div>
              <p class="processing-time hide"></p>
            </div>
          </div>

          <div class="spectrumBlock">
            <label id="selected-record-duration-label" style="display: none;"></label>
          </div>
          <canvas id="myCanvas" width="900" height="150"></canvas>
          <label id="max-spectrum" class="info-label"></label>
          <label id="min-spectrum" class="info-label"></label>
          <label id="mid-spectrum" class="info-label"></label>
        </div>
      </div>

      <div id="tableZebra">
        <table class="zebra">
          <thead>
            <tr>
              <th style="width:10%;">序号</th>
              <th style="width:30%;">起始时间</th>
              <th style="width:30%;">结束时间</th>
              <th style="width:30%;">标记</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item,index) in tagList" :key="index">
              <td>{{index+1}}</td>
              <td>{{item.startTime}}</td>
              <td>{{item.endTime}}</td>
              <td>{{item.tag}}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p style="font-size:12px;color:#657180;margin-left:80px;margin-top:20px;">注：双击进度条进行打点</p>
    </div>
  </div>
</template>

<script>
import AudioWave from "./audio_wave.js";
import Message from "../../components/message/message";
export default {
  name: "audio-wave",
  props: ["tagChooseList"],
  components: { Message },
  beforeDestroy() {
    this.clearTimer();
  },
  data() {
    return {
      dragObj: {
        x: 0,
        y: 0,
        l: 0,
        t: 0,
        isDown: false,
        dragDom: null,
        tagListIndex: 0,
        tagType: "1" //1为开始标记 2为结束标记
      },
      // tagChooseList: [1, 2],//当前下拉框列表
      tagType: "1", //1为打开始标记，2为打结束标记
      tagList: [
        // {
        //   startTime: "00:00.000",
        // endTime: "1:03.349",
        // tag: 2,
        // startLeft: "10%",
        // endLeft: "20%",
        // chevronType:false,
        // isPlaySection:false,
        // chooseTag:false//当前选择下拉框是否展开
        // }
      ],
      colorList: [
        "#DEB887",
        "#008B8B",
        "#708090",
        "#FFB6C1",
        "#C71585",
        "#800080",
        "#7B68EE",
        "#32CD32",
        "#0000FF",
        "#6495ED",
        "#AFEEEE",
        "#7FFFAA",
        "#BDB76B",
        "#FFA500",
        "#FF0000",
        "#000000",
        "#8B4513",
        "#DB7093",
        "#4B0082"
      ],
      audioInfo: {
        url: "",
        curTime: "0:00",
        totalTime: "0:00",
        totalTimeSecond: "0", //总时长/秒
        isPlaying: false, //是否正在播放
        audioEle: null,
        lineEle: null
      },
      timer: null,
      timerSection: null,
      progressEle: null,
      progressRatio: 0,
      progressLength: "" //当前播放进度条总长度
    };
  },
  methods: {
    //点击选择框
    openSelectFn(index) {
      this.tagList[index].chooseTag = !this.tagList[index].chooseTag;
    },
    //下拉框列表点击事件
    chooseTagFn(index, i) {
      this.tagList[index].tag = this.tagChooseList[i];
      this.tagList[index].chooseTag = false;
    },
    //清空定时器
    clearTimer() {
      if (this.timer) {
        clearInterval(this.timer);
      }
      if (this.timerSection) {
        clearInterval(this.timerSection);
      }
    },
    //重置波形图
    spoutMicrophoneResetFn() {
      this.audioInfo.audioEle.pause();
      this.audioInfo.isPlaying = false;
      //重置所有的段落的isPlaySection
      this.tagList.forEach((v, i) => {
        this.tagList[i].isPlaySection = false;
      });
      this.clearTimer();
      AudioWave.init(this.audioInfo.url, this.audioInfo.audioEle);
    },
    dragMousedown(e, ele, index) {
      //获取x坐标和y坐标
      this.dragObj.x = e.clientX;
      this.dragObj.y = e.clientY;
      this.dragObj.dragDom = document.getElementById(ele + index);
      if (ele == "tagSpanStart") {
        this.dragObj.tagType = "1";
      } else {
        this.dragObj.tagType = "2";
      }
      this.dragObj.tagListIndex = index;

      //获取左部和顶部的偏移量
      this.dragObj.l = this.dragObj.dragDom.offsetLeft;
      this.dragObj.t = this.dragObj.dragDom.offsetTop;
      //开关打开
      this.dragObj.isDown = true;
      //设置样式
      this.dragObj.dragDom.style.cursor = "move";
    },
    dragMouseup(e) {
      //开关关闭
      // var dragDom = e.target;
      this.dragObj.isDown = false;
      this.dragObj.dragDom.style.cursor = "default";
    },
    //拖拽
    dragFn() {
      var _self = this;
      //获取元素
      var x = 0;
      var y = 0;
      var l = 0;
      var t = 0;
      var isDown = false;
      //鼠标移动
      window.onmousemove = function(e) {
        if (_self.dragObj.isDown == false) {
          return;
        }
        //获取x和y
        var nx = e.clientX;
        var ny = e.clientY;
        //计算移动后的左偏移量和顶部的偏移量
        var nl = nx - (_self.dragObj.x - _self.dragObj.l);
        // var nt = ny - (_self.dragObj.y - _self.dragObj.t);

        //判断是否过边界了
        if (nl > 0 && nl < _self.progressLength) {
          _self.changeCurTimeFn({ offsetX: nl }, "3");
          _self.dragObj.dragDom.style.left = nl + "px";
          // _self.dragObj.dragDom.style.top = nt + "px";
        }
      };
    },
    //获取并检测数据是否正确
    checkTagList() {
      var value = "";
      for (var i = 0; i < this.tagList.length; i++) {
        if (this.tagList[i].endTime == "") {
          value = "当前序号为" + (i + 1) + "的音频段没有结束时间！";
          break;
        }
        if (!this.tagList[i].tag) {
          value = "当前序号为" + (i + 1) + "的音频段没有标记结果！";
          break;
        }
        if (
          Number(this.tagList[i].startLeft.split("%")[0]) >
          Number(this.tagList[i].endLeft.split("%")[0])
        ) {
          value = "当前序号为" + (i + 1) + "的音频段结束时间小于开始时间！";
          break;
        }
        this.tagList[i].isPlaySection = false;
        this.tagList[i].chevronType = false;
        this.tagList[i].chooseTag = false;
      }
      return value == "" ? true : value;
    },
    //删除当前段
    deleteSectionFn(index) {
      this.tagList.splice(index, 1);
    },
    //播放暂停段落音频
    playPauseSectionFn(index) {
      var _self = this;
      var startTime = this.turnSecondFormat(this.tagList[index].startTime);
      var endTime = this.turnSecondFormat(this.tagList[index].endTime);
      if (
        this.audioInfo.audioEle.currentTime >= startTime &&
        this.audioInfo.audioEle.currentTime < endTime - 0.2
      ) {
        //当前时间在这个段落区间内
      } else {
        //当前时间不在这个段落区间内
        this.audioInfo.audioEle.currentTime = startTime;
      }
      this.audioInfo.isPlaying = !this.audioInfo.isPlaying;
      this.tagList[index].isPlaySection = !this.tagList[index].isPlaySection;
      //其他所有的段落的isPlaySection都为false
      this.tagList.forEach((v, i) => {
        if (index != i) {
          this.tagList[i].isPlaySection = false;
        }
      });
      if (this.audioInfo.isPlaying) {
        this.audioInfo.audioEle.play();
      } else {
        this.audioInfo.audioEle.pause();
      }
      var diff = 0;
      if (this.audioInfo.isPlaying) {
        clearInterval(this.timerSection);
        this.timerSection = setInterval(() => {
          _self.audioInfo.curTime = _self.turnFormat(
            _self.audioInfo.audioEle.currentTime,
            0
          );
          _self.setProgress(_self.audioInfo.audioEle.currentTime);

          if (!_self.audioInfo.isPlaying) {
            console.log("段落暂停了，停止计时器");
            clearInterval(_self.timerSection);
          }
          diff = endTime - _self.audioInfo.audioEle.currentTime;

          if (diff <= 0.2) {
            var timerLast = setTimeout(() => {
              //增加setTimeout定时器原因：只用interval计时器时最后结束时间不准确，因为定时器有200时间间隔，故用定时器准确判断最后结束时间并停止播放
              _self.audioInfo.audioEle.currentTime = _self.turnSecondFormat(
                _self.tagList[index].endTime
              );
              _self.setProgress(_self.audioInfo.audioEle.currentTime);
              _self.audioInfo.audioEle.pause();
              _self.audioInfo.curTime = _self.tagList[index].endTime;
              _self.audioInfo.isPlaying = false;
              _self.tagList[index].isPlaySection = false;
            }, diff * 1000);

            clearInterval(_self.timerSection);
          }
        }, 200);
      }
    },
    //在当前位置打标记
    tagInFn() {
      var _self = this;
      if (this.tagList.length) {
        this.tagType =
          this.tagList[this.tagList.length - 1].endTime == "" ? "2" : "1";
      } else {
        this.tagType = "1";
      }
      if (this.tagType == "1") {
        if (this.tagList.length > 0 && this.tagList.length % 19 == 0) {
          this.colorList = this.colorList.concat(this.colorList);
        }
        this.tagList.push({
          startTime: this.audioInfo.curTime,
          endTime: "",
          tag: null,
          startLeft: (this.progressRatio * 100).toFixed(2) + "%",
          endLeft: "",
          isPlaySection: false,
          chevronType: false,
          chooseTag: false
        });
      } else {
        if (
          this.audioInfo.audioEle.currentTime <
          this.turnSecondFormat(this.tagList[this.tagList.length - 1].startTime)
        ) {
          this.$refs.Message.Message("结束时间不能小于开始时间！");
        } else {
          this.tagList[
            this.tagList.length - 1
          ].endTime = this.audioInfo.curTime;
          this.tagList[this.tagList.length - 1].endLeft =
            (this.progressRatio * 100).toFixed(2) + "%";
          this.tagList.forEach((item, index) => {
            if (_self.tagList.length - 1 == index) {
              _self.tagList[index].chevronType = true;
            } else {
              _self.tagList[index].chevronType = false;
            }
          });
        }
      }
    },
    //修改当前开始位置
    changeCurTimeFn(e, type) {
      this.progressEle.style.width = e.offsetX + "px";
      this.audioInfo.lineEle.style.left = e.offsetX + "px";
      this.progressRatio = e.offsetX / this.progressLength;
      this.progressRatio = this.progressRatio >= 1 ? 1 : this.progressRatio;
      this.audioInfo.curTime = this.turnFormat(
        this.progressRatio * this.audioInfo.totalTimeSecond,
        3
      );
      this.audioInfo.audioEle.currentTime = this.turnSecondFormat(
        this.audioInfo.curTime
      );
      if (type == "2") {
        //双击事件
        this.tagInFn();
      } else if (type == "3") {
        //拖拽事件
        this.tagDragModifyFn();
      }
    },
    //拖拽时更新当前位置
    tagDragModifyFn() {
      if (this.dragObj.tagType == "1") {
        //拖拽开始标记
        this.tagList[
          this.dragObj.tagListIndex
        ].startTime = this.audioInfo.curTime;
        this.tagList[this.dragObj.tagListIndex].startLeft =
          (this.progressRatio * 100).toFixed(2) + "%";
      } else {
        //拖拽结束标记
        this.tagList[
          this.dragObj.tagListIndex
        ].endTime = this.audioInfo.curTime;
        this.tagList[this.dragObj.tagListIndex].endLeft =
          (this.progressRatio * 100).toFixed(2) + "%";
      }
    },
    //初始化音频
    _initAudio(url, tagList) {
      var _self = this;
      this.audioInfo.url = url;
      this.audioInfo.audioEle = document.getElementById("sourceAudio");
      this.audioInfo.lineEle = document.getElementById("processingLine");
      this.progressEle = document.getElementsByClassName("progress")[0];
      this.audioInfo.audioEle.oncanplay = function(e) {
        _self.audioInfo.totalTime = _self.turnFormat(
          _self.audioInfo.audioEle.duration,
          0
        );
        _self.audioInfo.totalTimeSecond = _self.audioInfo.audioEle.duration;
        // _self.playPauseFn();
      };
      this.audioInfo.audioEle.onended = function(e) {
        _self.audioInfo.isPlaying = false;
      };
      this.progressLength = document.getElementsByClassName(
        "progressBox"
      )[0].offsetWidth;
      this.tagList = tagList;
      //清空进度条
      this.setProgress(0);

      //播放波形图
      AudioWave.init(url, this.audioInfo.audioEle);
      _self.audioInfo.audioEle.pause();
      _self.audioInfo.isPlaying = false;
      setTimeout(() => {
        _self.playPauseFn();
      }, 700);

      //清空选区
      AudioWave.clearWaveAreaFn();
    },
    //秒转换成 分:秒.毫秒
    turnFormat(time, digit) {
      var min = parseInt(time / 60);
      var second = (time % 60).toFixed(digit);
      second = second < 10 ? "0" + second : second;
      return min + ":" + second;
    },
    //分:秒.毫秒 转换成 秒
    turnSecondFormat(time) {
      var min = Number(time.toString().split(":")[0]);
      var second = Number(time.toString().split(":")[1]);
      return min * 60 + second;
    },
    //播放暂停
    playPauseFn() {
      var _self = this;
      this.audioInfo.isPlaying = !this.audioInfo.isPlaying;
      if (this.audioInfo.isPlaying) {
        this.audioInfo.audioEle.play();
      } else {
        this.audioInfo.audioEle.pause();
      }
      if (this.audioInfo.isPlaying) {
        clearInterval(this.timer);
        this.timer = setInterval(() => {
          _self.audioInfo.curTime = _self.turnFormat(
            _self.audioInfo.audioEle.currentTime,
            0
          );
          _self.setProgress(_self.audioInfo.audioEle.currentTime);
          if (!_self.audioInfo.isPlaying) {
            clearInterval(_self.timer);
          }
          if (
            _self.audioInfo.audioEle.duration ==
            _self.audioInfo.audioEle.currentTime
          ) {
            clearInterval(_self.timer);
            _self.audioInfo.curTime = _self.audioInfo.totalTime;
          }
        }, 200);
      }
    },
    //设置进度条
    setProgress(curTime) {
      this.progressRatio = (curTime / this.audioInfo.totalTimeSecond) * 1;
      this.progressRatio = this.progressRatio >= 1 ? 1 : this.progressRatio;
      this.progressEle.style.width =
        this.progressRatio * this.progressLength + "px";
      this.audioInfo.lineEle.style.left =
        this.progressRatio * this.progressLength + "px";
      //   $(".progress").animate({ width: this.progressRatio + "%" }, "slow");//不能用animate,有bug，无法停止
    },
    //播放暂停选区音频
    playPauseAreaFn(startTime, endTime) {
      var _self = this;
      if (
        this.audioInfo.audioEle.currentTime >= startTime &&
        this.audioInfo.audioEle.currentTime < endTime - 0.2
      ) {
        //当前时间在这个段落区间内
      } else {
        //当前时间不在这个段落区间内
        this.audioInfo.audioEle.currentTime = startTime;
      }
      this.audioInfo.isPlaying = !this.audioInfo.isPlaying;
      if (this.audioInfo.isPlaying) {
        this.audioInfo.audioEle.play();
      } else {
        this.audioInfo.audioEle.pause();
      }
      var diff = 0;
      if (this.audioInfo.isPlaying) {
        clearInterval(this.timerSection);
        this.timerSection = setInterval(() => {
          _self.audioInfo.curTime = _self.turnFormat(
            _self.audioInfo.audioEle.currentTime,
            0
          );
          _self.setProgress(_self.audioInfo.audioEle.currentTime);

          if (!_self.audioInfo.isPlaying) {
            console.log("段落暂停了，停止计时器");
            clearInterval(_self.timerSection);
          }
          diff = endTime - _self.audioInfo.audioEle.currentTime;

          if (diff <= 0.2) {
            var timerLast = setTimeout(() => {
              //增加setTimeout定时器原因：只用interval计时器时最后结束时间不准备，因为定时器有200时间间隔，故用定时器准确判断最后结束时间并停止播放
              _self.audioInfo.audioEle.currentTime = endTime;
              _self.setProgress(_self.audioInfo.audioEle.currentTime);
              _self.audioInfo.audioEle.pause();
              _self.audioInfo.curTime = _self.turnFormat(endTime, 0);
              _self.audioInfo.isPlaying = false;
            }, diff * 1000);

            clearInterval(_self.timerSection);
          }
        }, 200);
      }
    }
  },
  mounted() {
    var _self = this;
    //空格播放
    this.$nextTick(function() {
      document.onkeydown = function(e) {
        if (
          e.keyCode == 32 &&
          e.srcElement.nodeName != "INPUT" &&
          e.srcElement.nodeName != "TEXTAREA"
        ) {
          //判断当前波形图是否有选区，有的话则播放选区音频段，没有则播放整个音频
          if ($(".spectrumBlock").width()) {
            //有选区
            _self.playPauseAreaFn(
              ((AudioWave.areaInfo.startPos - 20) / 900) *
                _self.audioInfo.totalTimeSecond,
              ((AudioWave.areaInfo.endPos - 20) / 900) *
                _self.audioInfo.totalTimeSecond
            );
          } else {
            //没有选区，播放全部
            _self.playPauseFn();
          }
          //阻止按空格页面滚动
          if (e.preventDefault) {
            e.preventDefault();
          } else {
            window.event.returnValue = false;
          }
        }
      };
    });

    this.dragFn();
    AudioWave.bindKeyFn();

    //点击空白处
    $(document).mouseup(function(e) {
      if (!e.target.className.split(" ").includes("no_chevron_up")) {
        //点击除了类名为no_chevron_up的元素之外，收起所有下拉列表
        _self.tagList.forEach((item, index) => {
          item.chooseTag = false;
        });
      }
    });
  }
};
</script>

<style scoped lang='less'>
@import "../../../static/css/audio_wave.less";
#audioSplitVue {
  background: #f6f7f9;
  height: 680px;
  padding: 10px;
  box-shadow: 0 0 5px 5px #ccc;
  border-radius: 10px;
  position: relative;
}
#audioSplit {
  // width:90%;
  height: 32px;
  display: flex;
  align-items: center;
  .playBtn {
    padding: 0 7px;
    width: 46px;
  }
  .timeBox {
    padding: 0 7px;
    width: 94px;
  }
  .progressBox {
    cursor: pointer;
    // flex: 1;
    min-width: 300px;
    background: #ccc;
    height: 10px;
    border-radius: 5px;
    position: relative;
    width: 900px;
    z-index: 3;
    .progress {
      width: 0px;
      background: #5cadff;
      height: 10px;
      border-radius: 5px;
      position: relative;
    }
    .progressTag {
      width: 100%;
      position: absolute;
      top: 10px;
      //   background: #eee;
      // height: 200px;
      .progressTagSpan {
        display: inline-block;
        width: 2px;
        // height: 30px;
        height: 176px;
        position: absolute;
        // left: 20px;
        top: 0px;
        // background: #000;
        z-index: 3;
        b {
          position: absolute;
          bottom: -20px;
          left: -30px;
        }
        .hideBtn {
          position: absolute;
          top: 5px;
          left: 5px;
          font-size: 22px;
        }
        .playPauseSectionBtn {
          position: absolute;
          bottom: -80px;
          left: -18px;
          font-size: 22px;
        }
        // .playPauseSectionBtn:hover,
        // .hideBtn:hover {
        //   border-color: #d7dde4;
        // }
        .deleteSectionBtn {
          position: absolute;
          bottom: -80px;
          left: 10px;
          font-size: 22px;
          color: red;
        }
        .selectTag {
          position: absolute;
          bottom: -80px;
          left: 40px;
          width: 100px;
        }
      }
    }
  }
}

.hrBorder {
  // width: 90%;
  position: absolute;
  top: 34px;
  // left: 5%;
  .hrBorderBtn {
    position: absolute;
    left: 0;
    top: 30px;
    z-index: 3;
    color: #657180;
    background-color: transparent;
    border-color: #d7dde4;
    padding: 2px 7px;
    font-size: 12px;
    border-radius: 3px;
    outline: none;
  }
  .hrBorderBtn:hover {
    color: #5cadff;
    background-color: #fff;
    border-color: #5cadff;
  }
}

.select {
  display: inline-block;
  width: 100%;
  box-sizing: border-box;
  vertical-align: middle;
  color: #657180;
  font-size: 14px;
  line-height: normal;
  .selection {
    display: block;
    box-sizing: border-box;
    outline: 0;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    cursor: pointer;
    position: relative;
    background-color: #fff;
    border-radius: 4px;
    border: 1px solid #d7dde4;
    transition: all 0.2s ease-in-out;
    height: 32px;
    position: relative;
    span {
      display: block;
      height: 30px;
      line-height: 30px;
      font-size: 12px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      padding-left: 8px;
      padding-right: 24px;
    }
    .selectionValue:after {
      content: "";
      border: 5px solid transparent;
      border-top: 5px solid #9ea7b4;
      position: absolute;
      right: 5px;
      top: 13px;
    }
  }
  ul {
    width: 100px;
    transform-origin: center top;
    max-height: 200px;
    overflow: auto;
    margin: 5px 0;
    padding: 5px 0;
    background-color: #fff;
    box-sizing: border-box;
    border-radius: 4px;
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.2);
    position: absolute;
    z-index: 900;
    list-style: none;
    .activeSelected {
      color: #fff;
      background: rgba(51, 153, 255, 0.9);
    }
    li {
      margin: 0;
      line-height: normal;
      padding: 7px 16px;
      clear: both;
      color: #657180;
      font-size: 12px !important;
      white-space: nowrap;
      list-style: none;
      cursor: pointer;
      transition: background 0.2s ease-in-out;
    }
  }
}
</style>