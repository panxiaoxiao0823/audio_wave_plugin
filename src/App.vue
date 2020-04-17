<template>
  <div id="app">
    <!-- <AudioWave style="width:1080px;" ref="AudioWave" :tagChooseList="tagChooseList"></AudioWave> -->
  </div>
</template>

<script>
// import AudioWave from "./myPlugin/audio_wave/audio_wave.vue";
export default {
  name: "App",
  components: {
    //注册插件
    // AudioWave
  },
  data() {
    return {
      // tagChooseList: ["偏高","正常","偏低"],
      // audioUrl: "http://10.145.71.29:8081/file/media/12/woman/4-1585897922011787/11_48000_6811380836833764672.wav"
    };
  },
  methods: {
  },
  mounted() {
    // this.$refs.AudioWave._initAudio(this.audioUrl, []);
  }
};
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* text-align: center; */
  color: #2c3e50;
  /* margin-top: 60px; */
}
</style>
