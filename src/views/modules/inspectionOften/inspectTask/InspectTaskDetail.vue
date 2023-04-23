<template>
  <el-dialog title="病害详情查看" :close-on-click-modal="false" v-dialogDrag :visible.sync="visible" v-loading="loading">
    <el-tabs v-model="activeName" @tab-click="handleClick" class="page">
      <el-tab-pane v-for="item in rowList" :key="item.id" :label="item.diseaseTypeName" :name="item.id">
        <div class="diseaseList">
          <div>构件名称: {{ data.componentName }}</div>
          <div>构件位置: {{ data.componentPosName }}</div>
          <div>病害类型: {{ data.diseaseTypeName }}</div>
          <div>病害创建时间: {{ data.createDate }}</div>
          <div>同病害: {{ data.diseaseName }}</div>
          <div>病害结束期: {{ data.diseaseEndTime }}</div>
          <div>
            病害审核状态:
            {{
              [
                { label: '有效', value: 'VALID' },
                { label: '无效', value: 'INVALID' },
                { label: '未审核', value: 'NOT_AUDIT' },
              ].filter((v) => data.status == v.value)[0].label
            }}
          </div>
          <div>病害描述: {{ data.diseaseDesc }}</div>
          <div v-for="(item, i) in data.inspectDailyInstanceDiseasePropertyList" :key="i">动态属性{{ `${i + 1}: ${item.remark}` }}</div>
        </div>
        <div>图片: <img v-if="data.picturePath1" :src="data.picturePath1" /><img v-if="data.picturePath2" :src="data.picturePath2" /><img v-if="data.picturePath3" :src="data.picturePath3" /></div>
        <br /><br />
        <div>视频: <video v-if="data.videoPath1" :src="data.videoPath1" controls="controls" /></div>
      </el-tab-pane>
    </el-tabs>
  </el-dialog>
</template>

<script>
export default {
  data() {
    return {
      loading: false,
      visible: false,
      data: {},
      rowList: [],
      activeName: '',
    };
  },
  methods: {
    init(list) {
      this.rowList = list;
      this.activeName = list[0].id;
      this.refreshList();
    },
    refreshList() {
      this.visible = true;
      this.loading = true;
      this.$http({
        url: `/routineinstancedisease/inspectRoutineInstanceDisease/queryById?id=${this.activeName}`,
        method: 'get',
      })
        .then(({ data }) => {
          if (data && data.success) {
            this.data = data.inspectRoutineInstanceDisease;
            this.loading = false;
          }
        })
        .catch(() => {
          this.loading = false;
        });
    },
    handleClick(tab) {
      this.activeName = tab.name;
      this.refreshList();
    },
  },
};
</script>

<style lang="less" scoped>
.page {
  color: #424242;
  font-size: 15px;
  .diseaseList {
    display: flex;
    flex-wrap: wrap;
    margin-top: 20px;
    & > div {
      width: 50%;
      margin-bottom: 25px;
    }
  }
  img {
    width: 165px;
    height: 165px;
    vertical-align: top;
    margin-left: 20px;
    border-radius: 10px;
  }
  video {
    width: 460px;
    height: 220px;
    vertical-align: top;
    margin-left: 20px;
    border-radius: 10px;
  }
}
</style>
   
