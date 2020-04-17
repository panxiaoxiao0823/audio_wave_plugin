/**
 * Created by panxiaoxiao on 2020/04/13.
 */

import audioBuffer from "./audio_buffer.js";
var audioWave;
var sampleRate;
audioWave = function () {
    // audio 对象
    var audio;
    // 频谱数据
    var data = [];
    // 数据最小间隔的时间
    var gridTime = 0;
    // 频谱上两个点间X轴跨越像素
    var gridX = 1;
    //选区开始位置
    var areaStartPos = 0;
    //选区结束位置
    var areaEndPos = 0;
    //按下选区
    var dragArea = false;
    //选区的起始结束位置
    var areaInfo = {
        startPos: 0,
        endPos: 0
    };

    // 初始化
    function init(audioUrl, audio_obj) {
        clearWaveAreaFn();
        audio = audio_obj;
        audioBuffer.getBuffer(audio, audioUrl)
            .then(function (arrayBuffer) {
                var promise = $.Deferred();
                var AdContext = null;
                if (typeof webkitAudioContext != 'undefined') {
                    AdContext = webkitAudioContext;
                } else if (typeof AudioContext != 'undefined') {
                    AdContext = AudioContext;
                } else {
                    alert('你的浏览器不支持音频解析！请使用谷歌浏览器！')
                    return;
                }
                var audioCtx = new AdContext;
                var bufSrc = audioCtx.createBufferSource();
                sampleRate = 20;
                audioCtx.decodeAudioData(arrayBuffer, function (buffer) {
                    bufSrc.buffer = buffer;
                    var peak = audioBuffer.getPeak(bufSrc.buffer, bufSrc.context.sampleRate / sampleRate);
                    audioCtx.close();
                    promise.resolve(peak);
                }, function (e) {
                    audioCtx.close();
                    promise.reject(null);
                });
                return promise;
            })
            .then(function (result) {
                data = [];
                for (var index = 0; index < result.length * 2; index++) {
                    data[index] = result.data[0][index];
                }
                
                drawPic(data);
            });
    }

    //清空选区
    function clearWaveAreaFn() {
        $('.spectrumBlock').css({
            'left': 0 + 'px',
            'width': 0
        });
    }

    // 根据传入的数组绘制频谱图
    function drawPic(picData) {
        var canvas = document.getElementById('myCanvas');
        var context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.beginPath();
        context.moveTo(0, canvas.height / 2);
        context.lineTo(canvas.width, canvas.height / 2);
        context.lineWidth = 0.1;
        context.strokeStyle = 'grey';
        context.stroke();
        var maxNum = picData[0];
        var minNum = picData[0];
        for (var i = 0; i < picData.length; i++) {
            if (picData[i] > maxNum) {
                maxNum = picData[i];
            } else if (picData[i] < minNum) {
                minNum = picData[i];
            }
        }
        context.beginPath();
        gridX = canvas.width / picData.length;
        var gridY = canvas.height / (maxNum - minNum);
        context.moveTo(0, canvas.height / 2);
        var midNum = (maxNum + minNum) / 2;
        for (i = 0; i < picData.length; i++) {
            context.lineTo((i) * gridX, canvas.height / 2 - ((picData[i] - midNum) * gridY));
            context.moveTo((i) * gridX, canvas.height / 2 - ((picData[i] - midNum) * gridY));
        }
        context.lineTo((picData.length) * gridX, canvas.height / 2);
        context.strokeStyle = 'black';
        context.lineWidth = 0.5;
        context.stroke();
        // 刷新界面上的附加显示信息
        $('#max-spectrum').text(maxNum);
        $('#min-spectrum').text(minNum);
        $('#mid-spectrum').text((maxNum + minNum) / 2);
    }

    function bindKeyFn() {
        $('#canvasMark').mousedown(function (e) {
            console.log(e,'mousedown');
            
            dragArea = true;
            areaStartPos = e.offsetX + 20;
            console.log(areaStartPos);

            $('.spectrumBlock').css({
                'left': areaStartPos + 'px',
                'width': 0,
                'display': 'inline-block'
            });
        });
        $('#canvasMark').mousemove(function (e) {
            if (!dragArea) {
                return;
            }
            console.log(e,'mousemove');
            areaEndPos = e.offsetX + 20;
            if (areaStartPos < 20 || areaEndPos > (900 + 20)) {
                return;
            }
            $('.spectrumBlock').css({
                'left': areaStartPos + 'px',
                'width': areaEndPos - areaStartPos + 'px',
                'display': 'inline-block'
            });
        });

        $('#canvasMark').mouseup(function (e) {
            dragArea = false;
            if ($('.spectrumBlock').width()) {
                //有选区
                areaInfo.startPos = areaStartPos;
                areaInfo.endPos = areaEndPos;
            }
        });
    }



    return {
        areaInfo: areaInfo,
        init: init,
        bindKeyFn: bindKeyFn,
        clearWaveAreaFn:clearWaveAreaFn
    }
}();
export default audioWave;