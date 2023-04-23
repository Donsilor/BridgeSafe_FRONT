<template>
  <el-dialog title="查看桥梁" :close-on-click-modal="false" :close-on-press-escape="false" width="70%" :visible.sync="visible">
    <div class="detail-root">
      <div class="detail-item">桥梁编码：{{ bridge.code }}</div>
      <div class="detail-item">桥梁名称：{{ bridge.name }}</div>
      <div class="detail-item">结构类型：{{ bridge.baseTypeName }}</div>
      <div class="detail-item">归属区域：{{ `${bridge.provinceName}/${bridge.cityName}/${bridge.districtName}` }}</div>
      <div class="detail-item">养护类型：{{ bridge.maintainTypeName }}</div>
      <div class="detail-item">养护等级：{{ bridge.maintainLevelName }}</div>
      <div class="detail-item">道路名称：{{ bridge.roadName }}</div>
      <div class="detail-item">道路等级：{{ bridge.roadLevelName }}</div>
      <div class="detail-item">管理单位：{{ bridge.manageOrg.name }}</div>
      <div class="detail-item">养护单位：{{ bridge.maintainOrg.name }}</div>
      <div class="detail-item">建设单位：{{ bridge.buildOrg.name }}</div>
      <div class="detail-item">设计单位：{{ bridge.designOrg.name }}</div>
      <div class="detail-item">监理单位：{{ bridge.supervisorOrg.name }}</div>
      <div class="detail-item">施工单位：{{ bridge.constructOrg.name }}</div>
      <div class="detail-item">建成时间：{{ bridge.tuiltDate }}</div>
      <div class="detail-item">总造价（万元）：{{ bridge.totalCost }}</div>
      <div class="detail-item">跨跃位置：{{ bridge.stepOver }}</div>
      <div class="detail-item">设计荷载：{{ bridge.designLoadName }}</div>
      <div class="detail-item">限载标准（t）：{{ bridge.loadLimit }}</div>
      <div class="detail-item">限高（m）：{{ bridge.heightLimit }}</div>
      <div class="detail-item">桥梁跨数（跨）：{{ bridge.bridgeSpan }}</div>
      <div class="detail-item">桥面面积（m²）：{{ bridge.bridgeArea }}</div>
      <div class="detail-item">桥梁总长（m）：{{ bridge.bridgeLong }}</div>
      <div class="detail-item">备注：{{ bridge.remark }}</div>
    </div>
    <el-tabs v-model="activeName">
      <el-tab-pane label="主辅桥" name="tab1" v-if="bridge.baseTypeId === enableSubbridgeTypeId">
        <SubBridgeList :bridgeBranchList="bridgeBranchList" :readOnly="true"/>
      </el-tab-pane>
      <el-tab-pane label="图片" name="tab2">
        <div class="image-wrapper">
          <el-image class="detail-image" v-for="(image, index) in bridgePicturesList" :src="image.imagePath" :preview-src-list="bridgePicturesList.map(item => item.imagePath)">
            <div slot="placeholder" class="image-slot placeholder">
              <span class="dot">加载中...</span>
            </div>
          </el-image>
        </div>
        <div v-if="bridgePicturesList.length === 0">无图片</div>
      </el-tab-pane>
      <el-tab-pane label="档案" name="tab3">
        <BridgeFileComponent :fileList="bridgeFilesList" :readOnly="true"/>
      </el-tab-pane>
    </el-tabs>
    <span slot="footer" class="dialog-footer">
        <el-button @click="visible = false">关闭</el-button>
      </span>
  </el-dialog>
</template>

<script>
import SubBridgeList from './SubBridgeList'
import BridgeFileComponent from './BridgeFileComponent'

const EnableSubbridgeTypeId = 'dd5db36c86c948f29986e09f3d79f38c' // 有主辅桥的桥梁类型
const BASE_URL = process.env.VUE_APP_SOURCE_URL

export default {
  data() {
    return {
      activeName: '',
      enableSubbridgeTypeId: EnableSubbridgeTypeId,
      bridge: {},
      bridgeBranchList: [],
      bridgePicturesList: [],
      bridgeFilesList: [],
      visible: false,
    }
  },
  components: {
    SubBridgeList,
    BridgeFileComponent,
  },
  methods: {
    async init(id) {
      const bridge = await this.fetchDetail(id)
      if (!bridge) {
        return
      }
      this.bridge = bridge
      this.bridgeBranchList = bridge.bridgeBranchList
      this.bridgePicturesList = bridge.bridgePicturesList.map(image => ({
        ...image,
        imagePath: BASE_URL.slice(0, -1) + image.imagePath
      }))
      this.bridgeFilesList = bridge.bridgeFilesList
      if (this.bridge.baseTypeId !== this.enableSubbridgeTypeId) {
        this.activeName = 'tab2'
      } else {
        this.activeName = 'tab1'
      }
      this.visible = true
    },
    async fetchDetail(id) {
      if (!id) {
        return
      }
      this.loading = true
      return this.$http({
        url: `/bridge/bridge/queryById?id=${id}`,
        method: 'get'
      }).then(({data}) => {
        this.loading = false
        if (data.success) {
          return data.bridge
        } else {
          return ''
        }
      }).catch(e => {
        return ''
      })
    },
  }

}
</script>

<style lang="scss">
.detail-root {
  width: 100%;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  .detail-item {
    min-width: 33.3%;
    padding-bottom: 12px;
  }
}
.image-wrapper {
  display: flex;
  align-items: center;
}
.detail-image {
  margin-right: 10px;
  width: 150px;
  height: 150px;
  border-radius: 5px;
  .placeholder {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}

</style>
