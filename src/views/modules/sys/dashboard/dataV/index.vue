<template>
  <div class="home-page">
    <div class="home-time wrapper">{{ date }}{{ time }}</div>
    <div class="home-loaction wrapper">中国-辽宁省-大连市</div>
    <img class="home-top" src="~@/assets/img/home-top.png" />
    <img class="home-left" src="~@/assets/img/home-left.png" />
    <img class="home-right" src="~@/assets/img/home-right.png" />
    <img class="home-bottom" src="~@/assets/img/home-bottom.png" />
    <div class="home-img">
      <div class="home-icon1" @click="homeiconimg1 = !homeiconimg1"></div>
      <img v-if="homeiconimg1" class="home-icon-img1" src="~@/assets/img/home-icon1.png" />
      <div class="home-icon2" @click="homeiconimg2 = !homeiconimg2"></div>
      <img v-if="homeiconimg2" class="home-icon-img2" src="~@/assets/img/home-icon2.png" />
    </div>

    <!-- <img src="~@/assets/img/home-img.gif"/> -->
    <!-- <div class="home-item">
      <div>{{ data.daily1 }}/{{ data.daily2 }}</div>
      <el-progress type="circle" :percentage="data.daily3" color="#A24ADD">中式快餐</el-progress>
    </div>
    <div class="home-item">
      <div id="myChart" :style="{ width: '300px', height: '300px' }"></div>
    </div> -->
  </div>
</template>

<script>
// let echarts = require('echarts/lib/echarts');
// // 引入柱状图组件
// require('echarts/lib/chart/bar');
// // 引入提示框和title组件
// require('echarts/lib/component/tooltip');
// require('echarts/lib/component/title');

export default {
  data() {
    return {
      date: '',
      time: '',
      homeiconimg1: false,
      homeiconimg2: false,
    };
  },
  mounted() {
    this.getdate();
    this.timer = setInterval(() => {
      this.getdate();
    }, 3000);
  },
  // activated() {
  //   this.$http({
  //     url: `/dashboardpc/reportDashboardPc/queryById`,
  //     params: { id: 1 },
  //   }).then(({ data }) => {
  //     if (data && data.success) {
  //       this.data = data.reportDashboardPc;
  //       this.diseaseMaintainJson = JSON.parse(data.reportDashboardPc.diseaseMaintainJson.replace('\\', ''));
  //       this.drawLine();
  //     }
  //   });
  // },
  methods: {
    drawLine() {
      // 基于准备好的dom，初始化echarts实例
      let myChart = echarts.init(document.getElementById('myChart'));
      // 绘制图表
      myChart.setOption({
        xAxis: {
          data: ['一月', '二月', '三月', '四月', '五月', '六月', '七月'],
        },
        yAxis: {},
        series: [
          {
            type: 'bar',
            data: [23, 24, 18, 25, 27, 28, 25],
            data: [
              this.diseaseMaintainJson.Jan.defend,
              this.diseaseMaintainJson.Feb.defend,
              this.diseaseMaintainJson.Mar.defend,
              this.diseaseMaintainJson.Apr.defend,
              this.diseaseMaintainJson.May.defend,
              this.diseaseMaintainJson.Jun.defend,
              this.diseaseMaintainJson.Jul.defend,
            ],
            itemStyle: {
              normal: {
                color: new echarts.graphic.LinearGradient(
                  0,
                  1,
                  0,
                  0,
                  [
                    {
                      offset: 0,
                      color: '#12A2B3', // 0% 处的颜色
                    },
                    {
                      offset: 1,
                      color: '#4CF0FA', // 100% 处的颜色
                    },
                  ],
                  false,
                ),
              },
            },
          },
          {
            type: 'bar',
            data: [
              this.diseaseMaintainJson.Jan.disease,
              this.diseaseMaintainJson.Feb.disease,
              this.diseaseMaintainJson.Mar.disease,
              this.diseaseMaintainJson.Apr.disease,
              this.diseaseMaintainJson.May.disease,
              this.diseaseMaintainJson.Jun.disease,
              this.diseaseMaintainJson.Jul.disease,
            ],
            itemStyle: {
              normal: {
                color: new echarts.graphic.LinearGradient(
                  0,
                  1,
                  0,
                  0,
                  [
                    {
                      offset: 0,
                      color: '#6E71F9', // 0% 处的颜色
                    },
                    {
                      offset: 1,
                      color: '#A7AAFC', // 100% 处的颜色
                    },
                  ],
                  false,
                ),
              },
            },
          },
        ],
      });
    },
    getdate: function () {
      let time = new Date();
      let year = time.getFullYear();
      let month = time.getMonth() + 1;
      let day = time.getDate();
      this.getTime();
      this.date = year + '-' + month + '-' + day + ' ';
    },
    getTime: function () {
      let weeks = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
      let time = new Date();
      let hour = time.getHours();
      let minutes = time.getMinutes();
      let week = weeks[time.getDay()];
      if (minutes < 10) {
        minutes = '0' + minutes;
      }
      this.time = hour + ':' + minutes + ' ' + week;
    },
  },
};
</script>

<style lang="less" scoped>
.home-page {
  position: relative;
  width: 100%;
  height: calc(100vh - 120px);
  background-color: #02162a;
  .home-img {
    margin: 0 auto;
    width: 1400px;
    height: 100%;
    background: url('~@/assets/img/home-location.gif') no-repeat;
    background-size: 100% 100%;
    position: relative;
    .home-icon1 {
      width: 100px;
      height: 100px;
      color: red;
      position: absolute;
      z-index: 1;
      bottom: 28%;
      left: 30%;
      cursor: pointer;
    }
    .home-icon-img1 {
      position: absolute;
      width: 210px;
      height: 125px;
      z-index: 1;
      bottom: calc(28% - 100px);
      left: calc(30% - 50px);
    }
    .home-icon2 {
      width: 100px;
      height: 100px;
      color: red;
      position: absolute;
      z-index: 1;
      top: 32%;
      right: 21.4%;
      cursor: pointer;
    }
    .home-icon-img2 {
      position: absolute;
      width: 210px;
      height: 125px;
      z-index: 1;
      top: calc(32% - 80px);
      right: calc(21.4% + 13px);
    }
  }
  .home-top {
    width: 98%;
    position: absolute;
    top: 0;
    left: 1%;
    z-index: 1;
  }
  .home-left {
    height: 88%;
    position: absolute;
    left: 10px;
    bottom: 20px;
    z-index: 1;
  }
  .home-right {
    height: 88%;
    position: absolute;
    right: 20px;
    bottom: 20px;
    z-index: 1;
  }
  .home-bottom {
    width: 45%;
    position: absolute;
    bottom: 20px;
    left: 50%;
    margin-left: -22.5%;
    z-index: 1;
  }
  .wrapper {
    font-weight: 400;
    color: #f2cb4c;
    font-size: 16px;
    letter-spacing: 2px;
    position: absolute;
    z-index: 1;
  }
  .home-time {
    top: 6.5vh;
    left: 4vw;
  }
  .home-loaction {
    top: 6.5vh;
    right: 6vw;
  }
}
</style>

