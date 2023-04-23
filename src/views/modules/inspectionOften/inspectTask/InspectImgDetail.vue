<template>
  <el-dialog title="查看照片" :close-on-click-modal="false" v-dialogDrag :visible.sync="visible" width="500px">
    <el-carousel trigger="click">
      <el-carousel-item v-for="item in rowList" :key="item" style="text-align: center">
        <img :src="item" />
      </el-carousel-item>
    </el-carousel>
  </el-dialog>
</template>

<script>
export default {
  data() {
    return {
      visible: false,
      rowList: [],
    };
  },
  methods: {
    init(row) {
      this.visible = true;
      this.rowList = [row.picturePath1];
      if (row.picturePath2) {
        this.rowList.push(row.picturePath2);
      }
      if (row.picturePath3) {
        this.rowList.push(row.picturePath3);
      }
    },
  },
};
</script>

<style lang="less" scoped>
img {
  height: 100%;
}
</style>
   
