<template>
</template>

<script>
    export default {
      name: 'Analysis',
      components: {
      },
      directives: { },
      watch: {

      },
      computed: {

      },
      data () {
        return {

        }
      },
      created: function () {

      },
      activated () {
        // this.getLogSensor()
        // this.getAbnormal()
        // this.getEquipment()
        // this.getCamera()
        // this.getWorkJob()
        // setTimeout(() => {
        //   this.refreshIndexData()
        // }, 300000)
      },
      methods: {
      },
      mounted () {
      },
      destroyed () {
      }
    }
</script>
<style>
  .el-calendar {
    background-color: transparent!important;
  }
  .el-calendar-day {
    -webkit-box-sizing:border-box;
    box-sizing:border-box;
    padding:0.5rem;
    height:3rem !important;
  }
  .el-calendar__body {
    padding: 0px !important;
  }
  .echarts {
    width: 100%;
    height: 60px;
  }
  .justify-between {
    -webkit-box-pack: justify;
    -ms-flex-pack: justify;
    justify-content: space-between;
  }
  .flex {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
  }
  .text-3xl {
    font-size: 3rem;
  }

  .pt-3 {
    padding-top: 0.75rem;
  }
  .border-t {
    border-top-width: 1px;
  }
  .border-solid {
    border-style: solid;
  }
  .border-gray-300 {
    border-color: #e2e8f0;
  }
  *, *::before, *::after {
    -webkit-box-sizing: inherit;
    box-sizing: inherit;
  }
  .pl-2 {
    padding-left: 0.5rem;
  }
  .pr-1 {
    padding-right: 0.25rem;
  }
  .pl-3 {
    padding-left: 0.75rem;
  }
  .pl-6 {
    padding-left: 1.6rem;
  }


  *, *::before, *::after {
    border-width: 0;
    border-style: solid;
    border-color: #e2e8f0;
  }
  .chart-container {
    height: 60px;
    line-height: 60px;
  }
  .progress-container {
    height: 1rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .text-red-400 {
    color: #fc8181;
  }
  .text-green-400 {
    color: #68d391;
  }
  .mainbac {
    position: relative;
    background:  #090A1D;
    opacity: 1;
  }
  .el-card {
    border: 0px solid #EBEEF5!important;
    background-color: transparent!important;
    color: #303133;
    -webkit-transition: .3s;
    transition: .3s;
  }
  .el-card {
    color: #fff!important;
  }
  .el-tabs__content {
    padding: 0px!important;
  }
  .current {
    color: #ffffff;
  }
  .el-calendar__title {
    color: #fff!important;
    -ms-flex-item-align: center;
    align-self: center;
    font-size: larger;
  }
  .el-button--plain {
    background: #090D4DC9!important;
    color: #fff!important;
  }
  .cel-6-div {
    height: 23.3rem;
    margin-top: 0rem;
    margin-left: 1.75rem;
    margin-bottom: 1.75rem;
    margin-right: 1.75rem;
    border: 1px solid #212765!important;
    background: linear-gradient(180deg, #2D3366 0%, rgba(36, 40, 74, 0.58) 40%, rgba(36, 40, 74, 0.2) 100%);
    opacity: 1;
    border-radius: 6px;
  }
  .cel-6-div:before {
    content: " ";
    display: block;
    position: absolute;
    left: 0;
    width: 90%;
    border-radius: 5px;
    height: 1px;
    background: linear-gradient(90deg, rgba(6, 48, 137, 0) 0%, #409FFF 50%, rgba(6, 48, 137, 0) 100%);
    opacity: 1;
    margin-left: 1.75rem;
  }
  .el-calendar__header {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-pack: justify;
    -ms-flex-pack: justify;
    justify-content: space-between;
    padding: 0.8rem 1.25rem;
    border-bottom: 0px solid #EBEEF5!important;
  }
  .el-calendar-table thead th {
    padding-top: 0 !important;
    padding-bottom: 1rem !important;
    color: #fff!important;
    font-weight: 400;
  }
  .el-calendar-table tr td:first-child {
    border-left: 0px solid #EBEEF5!important;
    border-top: 0px solid #EBEEF5!important;
  }
  .el-calendar-table tr:first-child td {
    border-top: 0px solid #EBEEF5!important;
  }
  .el-calendar-table td {
    border-bottom: 0px solid #EBEEF5!important;
    border-right: 0px solid #EBEEF5!important;
    vertical-align: top;
    -webkit-transition: background-color .2s ease;
    transition: background-color .2s ease;
  }
  .el-calendar-day {
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    padding: 0!important;
    padding-top: 4px!important;
    height: 3rem !important;
    text-align: center;
  }
  .el-backtop, .el-calendar-table td.is-today {
    color: #05A1FF !important;
  }
  .el-calendar-table td.is-selected {
    background-color: #61A1E1!important;
  }
  .el-calendar-table td.is-selected a {
    color: #ffffff !important;
  }
  .el-calendar-table .el-calendar-day:hover {
    cursor: pointer;
    background-color: #6FB0F0;
  }
  .el-calendar-table .el-calendar-day a:hover {
    color: #ffffff !important;
  }
  .el-backtop, .el-calendar-table td.is-today {
    color: #EA746F !important;
  }
  .card-head-span {
    width: 100%;
    font-size: 1.4rem;
    line-height: 2.2rem;
  }
  .card-head-img {
    width: 1.6rem;
    height: 1.6rem;
    margin-right: 0.5rem;
  }
  .yujing-li {
    list-style-type:disc;
    font-size: 1rem;
  }
  .yujing-li::marker {
    line-height: 2rem;
    height: 2rem;
    color: #4DCAF8 !important;
  }
  .el-card {
    color: #E9EBFF !important;
  }
  .seamless-warp {
    width: 100%;
    height: calc(100% - 1rem);
    overflow: hidden;
  }
  .point {
    width: 6px;
    height: 6px;
    background: rgb(77, 202, 248) none repeat scroll 0% 0%;
    border-radius: 50%;
    opacity: 1;
    display: inline-block;
    margin-right: 0.4rem;
    margin-bottom: 0.2rem;
  }
  .qixiang-font {
    font-size: 1.25rem;
    font-family: Source Han Sans SC;
    font-weight: bold;
    line-height: 1.5rem;
    color: #409FFF;
    opacity: 1;

  }
  .el-progress-bar__outer{
    background-color:#393F5E!important;
  }
  .el-progress-bar__inner{
    background-color: unset;
    background-image: linear-gradient(to right, #4D7DF8 , #4DC7F8);
  }
  .eqactive {
    line-height: 3rem;
    background-color: rgba(255,255,255,0.05);
  }
  .eqspan {
    line-height: 3rem!important;
  }
  .turang-img {
    width: 0.8rem;
    height: 1rem;
    margin-right: 0.2rem;
  }
  .shipinborder {
    border-width: 1px!important;
    border-style: dashed!important;
    border-color: #e2e8f0!important;
  }
  .shipinpic {
    height: 12rem;
  }
  .el-calendar-table .el-calendar-day:hover {
    cursor: pointer;
    background-color: #7DB9F4!important;
  }
</style>
<style scoped lang="less">
  .analyze {
    .list {
      margin: 25px 0 0;
      padding: 0;
      list-style: none;
      li {
        margin-top: 16px;
        span {
          color: rgba(0, 0, 0, .65);
          font-size: 14px;
          line-height: 22px;

          &:first-child {
            background-color: #f5f5f5;
            border-radius: 20px;
            display: inline-block;
            font-size: 12px;
            font-weight: 600;
            margin-right: 24px;
            height: 20px;
            line-height: 20px;
            width: 20px;
            text-align: center;
          }
          &.active {
            background-color: #314659;
            color: #fff;
          }
          &:last-child {
            float: right;
          }
        }
      }
    }
    .charthead {
      line-height: 3rem;
      font-size: 1.5rem;
    }
    .top-1 {
      top: 0.55rem;
    }
    .mt-0 {
      margin-top: 0;
    }

    .m-3 {
      margin-bottom: 0rem;
    }

    .right-0 {
      right: 200px;
    }
    .absolute {
      position: absolute;
    }
    .float-left {
      float: left;
    }
    .flex {
      display: flex;
    }
    .card-panel {
      height: 108px;
      cursor: pointer;
      font-size: 12px;
      position: relative;
      overflow: hidden;
      color: #666;
      background: #ffffff;
      box-shadow: 4px 4px 40px rgba(0, 0, 0, .05);
      border-color: rgba(0, 0, 0, .05);
      &:hover {
        .card-panel-icon-wrapper {
          color: #fff;
        }
        .icon-sell {
          background: #6778fa;
        }
        .icon-people {
          background: #40c9c6;
        }
        .icon-location {
          background: #36a3f7;
        }
        .icon-visit {
          background: #f4516c;
        }
      }
      .icon-sell {
        color: #6778fa;
      }
      .icon-people {
        color: #40c9c6;
      }
      .icon-location {
        color: #36a3f7;
      }
      .icon-visit {
        color: #f4516c;
      }
      .card-panel-icon-wrapper {
        float: left;
        margin: 14px 0 0 14px;
        padding: 16px;
        transition: all 0.38s ease-out;
        border-radius: 6px;
      }
      .card-panel-icon {
        float: left;
        font-size: 48px;
      }
      .card-panel-description {
        float: right;
        font-weight: bold;
        margin: 26px;
        margin-left: 0px;
        .card-panel-text {
          line-height: 18px;
          color: rgba(0, 0, 0, 0.45);
          font-size: 16px;
          margin-bottom: 12px;
        }
        .card-panel-num {
          font-size: 20px;
        }
      }
    }
  }
  #mapIndexCl {
    z-index: 9;
    position: absolute;
    right: 25%;
    width: 200px;
    height: 200px;
    outline: none;
  }
  .mapCl {
    z-index: 10;
    position: absolute;
    right: 25%;
    outline: none;
  }
  .swiper-button-prev, .swiper-button-next {
    width: 35px;
    height: 35px;
    border-radius: 100%;
    border: 2px solid rgba(255,255,255,.5);
    background-size: 30%;
    &:hover {
      border-color: rgba(255,255,255,.8)
    }
  }
  .swiper-button-prev {
    left: 0%;
    margin-left: 0px;
  }
  .swiper-button-next {
    right: 0%;
    margin-right: 0px;
  }
  .swiper-button-next:focus{
    outline: none;
  }
  .swiper-button-prev:focus{
    outline: none;
  }
  .swiper-button-next:after, .swiper-container-rtl .swiper-button-prev:after {
    content: '';
  }
  .swiper-button-prev:after, .swiper-container-rtl .swiper-button-next:after {
    content: '';
  }
</style>
