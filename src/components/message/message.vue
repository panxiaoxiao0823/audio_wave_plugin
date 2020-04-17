<template>
  <div id="message">
    <p class="messageBox" v-show="showErrMessage">
      <span class="iconfont icon-shanchu error"></span>
      {{errMessage}}
    </p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      showErrMessage: false,
      errMessage: "",
      timer:null
    };
  },
  methods: {
    Message(errMessage) {
      var _self = this;
      this.showErrMessage = true;
      this.errMessage = errMessage;
      clearTimeout(this.timer);
      this.timer = setTimeout(()=>{
          _self.showErrMessage = false;
          _self.errMessage = "";
      },2500)
    }
  }
};
</script>

<style scoped lang='less'>
#message {
    width: 100%;
    position: absolute;
  .messageBox {
    padding: 7px 10px;
    border: 1px solid #eee;
    color:#333;
    font-weight: 400;
    font-size:12px;
    position: absolute;
    top: 50px;
    width: 200px;
    left: calc(50% - 100px);
    background:#fff;
    z-index: 100;
    text-align: center;
    border-radius: 5px;
    box-shadow: 0px 0px 2px 2px #8c8f98;
  }
  .error{
      color:red;
      font-size: 12px;
      margin-right: 5px;
  }
}
</style>