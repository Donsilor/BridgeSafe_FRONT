<template>
  <el-dialog title="查看检查轨迹" :close-on-click-modal="false" v-dialogDrag :visible.sync="visible" v-loading="loading">
    <el-tabs type="card" v-model="activeName" @tab-click="handleClick">
      <el-tab-pane v-for="(item, index) in rowList" :key="index" :label="item" :name="rowIds[index]"> </el-tab-pane>
    </el-tabs>
    <div id="container" style="width: 100%; height: 60vh"></div>
  </el-dialog>
</template>

<script>
// var lineArr1 = [
//   [121.61, 38.87],
//   [121.6, 38.87],
//   [121.59, 38.87],
//   [121.55, 38.86],
// ];
// var lineArr2 = [
//   [121.61, 38.87],
//   [121.6, 38.87],
// ];
export default {
  data() {
    return {
      loading: false,
      visible: false,
      data: {},
      rowList: [],
      rowIds: [],
      activeName: '',
      // firstArr: [121.61, 38.87], // 中心点/初始坐标
      lineArr: [],
    };
  },
  methods: {
    init(row) {
      this.data = row;
      this.visible = true;
      this.rowList = row.factInspectorNames?.split(',');
      this.rowIds = row.factInspectorIds?.split(',');
      this.activeName = this.rowIds[0];
      this.refreshList();
    },
    refreshList(id) {
      this.loading = true;
      this.$http({
        url: `/routineinstancegps/inspectRoutineInstanceGps/list`,
        method: 'get',
        params: {
          instanceId: this.data.id,
          'user.id': this.activeName,
          pageNo: 1,
          pageSize: 9999,
        },
      }).then(({ data }) => {
        if (data && data.success) {
          let arr = [];
          data.page.list.map((v) => {
            if (v.gpsPosition) {
              arr.push(v.gpsPosition.split(','));
            }
          });
          this.lineArr = arr;
          console.log(arr);
          setTimeout(() => {
            this.initMap();
          }, 100);
          this.loading = false;
        }
      });
    },
    handleClick(tab) {
      this.activeName = tab.name;
      this.refreshList();
    },
    // 初始化地图
    initMap() {
      var that = this;
      this.map = new AMap.Map('container', {
        resizeEnable: true, // 窗口大小调整
        // center: this.firstArr, // 中心 firstArr: [116.478935, 39.997761],
        zoom: 5,
      });
      // 添加maker
      // this.marker = new AMap.Marker({
      //   map: this.map,
      //   position: this.firstArr,
      //   icon: 'https://webapi.amap.com/images/car.png',
      //   offset: new AMap.Pixel(-26, -13), // 调整图片偏移
      //   autoRotation: true, // 自动旋转
      //   angle: -90, // 图片旋转角度
      // });
      that.initroad();
    },
    // 初始化轨迹
    initroad() {
      // 绘制还未经过的路线
      this.polyline = new AMap.Polyline({
        map: this.map,
        path: this.lineArr,
        showDir: true,
        strokeColor: '#77DDFF', // 线颜色--浅蓝色
        // strokeOpacity: 1,     //线透明度
        strokeWeight: 6, // 线宽
        // strokeStyle: "solid"  //线样式
        lineJoin: 'round', // 折线拐点的绘制样式
      });
      // 绘制路过了的轨迹
      // var passedPolyline = new AMap.Polyline({
      //   map: this.map,
      //   strokeColor: '#00BBFF', // 线颜色-深蓝色
      //   path: [
      //     [116.478935, 39.997761],
      //     [108.983569, 34.285675],
      //   ],
      //   // strokeOpacity: 1,     //线透明度
      //   strokeWeight: 6, // 线宽
      //   // strokeStyle: "solid"  //线样式
      // });
      this.map.setFitView(); // 合适的视口
    },
  },
};
</script>

<style lang="less" scoped>
</style>
   
