<template>
  <div>
    <el-row :gutter="16">
      <el-col :span="6">
        <el-tree
          class="filter-tree"
          :data="bridgeList"
          :props="{
              value: 'id',             // ID字段名
              label: 'name',         // 显示名称
              children: 'children'    // 子级字段名
            }"
          default-expand-all
          node-key="id"
          :highlight-current="true"
          :expand-on-click-node="false"
          @node-click="handleBridgeClick"
          ref="bridgeCategoryRef">
           <span class="custom-tree-node" slot-scope="{ node, data}">
            <span>{{ node.label }}</span>
          </span>
        </el-tree>
      </el-col>
      <el-col :span="6">
        <el-checkbox v-model="showOnlyImageExists">仅显示无图片位置</el-checkbox>
        <el-tree
          class="filter-tree"
          v-loading="comLoading"
          :data="compTreeData"
          :props="{
              value: 'id',             // ID字段名
              label: 'name',         // 显示名称
              children: 'children'    // 子级字段名
            }"
          default-expand-all
          node-key="id"
          :highlight-current="true"
          :expand-on-click-node="false"
          @node-click="handleCompClick"
          ref="compTreeDataRef">
           <span class="custom-tree-node" slot-scope="{ node, data}">
            <span>{{ node.label }}{{ !data.isLocation ? `（${data.instanceLocationCount}）` : '' }}</span>
             <i class="el-icon-picture-outline" v-if="data.isLocation && data.picturePath"></i>
          </span>
        </el-tree>
      </el-col>
      <el-col :span="6" v-if="currentLocation && !comLoading">
        <div :class="['bridge-image-group-root', currentLocation.picturePath ? 'readonly':'']">
          <el-upload ref="picturePath"
                     list-type="picture-card"
                     :action="`${this.$http.BASE_URL}/sys/file/webupload/upload?uploadPath=/bridgecomponentlocation/bridgeComponentLocation`"
                     :headers="{token: $cookie.get('token')}"
                     :on-preview="(file, fileList) => {
                        $alert(`<img style='width:100%' src=' ${(file.response && file.response.url) || file.url}'/>`,  {
                          dangerouslyUseHTMLString: true,
                          showConfirmButton: false,
                          closeOnClickModal: true,
                          customClass: 'showPic'
                        });
                    }"
                     :on-success="(response, file, fileList) => {
                       this.loading = false
                       this.comLoading = false
                       this.specifyPictureLocation(response)
                    }"
                     :before-upload="() => {
                       this.loading = true
                       this.comLoading = true
                       return true
                     }"
                     :on-remove="(file, fileList) => {
                      $http.post(`/sys/file/webupload/deleteByUrl?url=${(file.response && file.response.url) || file.url}`).then(({data}) => {
                        $message.success('图片位置删除成功！')
                        this.comLoading = true
                        this.$nextTick(() => {
                          this.comLoading = false
                          this.currentLocation.picturePath = ''
                        })
                      })
                    }"
                     :before-remove="(file, fileList) => {
                      return $confirm(`确定移除 ${file.name}？`)
                    }"
                     :file-list="currentLocation && currentLocation.picturePath ? [{
                     url: currentLocation.picturePath,
                     name: '位置图片'
                   }] : []">
            <i class="el-icon-plus"></i>
          </el-upload>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import SelectTree from '@/components/treeSelect/treeSelect'
import _ from 'lodash'

export default {
  name: 'BridgeManagement',
  data() {
    return {
      loading: false,
      comLoading: false,
      showOnlyImageExists: true,
      bridgeId: '', // 桥梁id
      compId: '', // 构建类型id
      locationId: '',
      bridgeList: [],
      compTreeData: [],
      locationList: [],
      currentLocation: null
    }
  },
  components: {
    SelectTree
  },
  methods: {
    fetchBridgeLocationTreeData() {
      this.loading = true
      this.$http({
        url: `/bridge/bridge/treeData`,
        params: { status: 1 },
        method: 'get'
      }).then(({data}) => {
        this.loading = false
        if (Array.isArray(data.bridgeList)) {
          this.bridgeList = specifyBridgeInfo(data.bridgeList)
        }
      })
    },
    fetchCompTreeData() {
      if (!this.bridgeId) {
        return
      }
      this.loading = true
      this.currentLocation = null
      this.locationList = []
      this.$http({
        url: `/bridge/bridgeBranch/treeComponentDataByBridgeBranchId2`,
        method: 'get',
        params: {
          bridgeBranchId: this.bridgeId,
          noPictureFlag: this.showOnlyImageExists ? 'true' : 'false'
        }
      }).then(({data}) => {
        this.loading = false
        this.compTreeData = specifyCompInfo(data.treeData)
      })
    },
    fetchCompLocationList() {
      this.comLoading = true
      this.$http({
        url: `/bridge/bridgeBranch/getLocationList`,
        method: 'get',
        params: {
          bridgeBranchId: this.bridgeId,
          baseComponentId: this.compId,
          noPictureFlag: this.showOnlyImageExists ? 'true' : 'false'
        }
      }).then(({data}) => {
        this.comLoading = false
        if (Array.isArray(data.locationList) && data.locationList.length > 0) {
          this.locationList = data.locationList.map(item => ({
            ...item,
            isLocation: true
          }))
          this.$refs.compTreeDataRef.updateKeyChildren(this.compId, this.locationList)
        }
      })
    },
    handleBridgeClick(data) {
      this.currentLocation = null
      this.locationList = []
      if (data.isBridge) {
        this.bridgeId = data.id
        this.fetchCompTreeData()
      }
    },
    handleCompClick(data) {
      if (data.isLocation) {
        this.comLoading = true
        this.$nextTick(() => {
          this.currentLocation = data
          this.comLoading = false
        })
      } else if (data.isLeaf) {
        this.currentLocation = null
        this.compId = data.id
        this.fetchCompLocationList()
      }
    },
    async specifyPictureLocation(response) {
      console.log('specifyPictureLocation', response)
      if (this.currentLocation && response.url) {
        const params = {
          id: this.currentLocation.id,
          picturePath: response.url
        }
        const res = await this.$http({
          url: '/bridge/bridgeComponentLocation/save',
          method: 'post',
          data: params
        })
        if (res.data.success) {
          this.$message.success('图片设置成功！')
          this.comLoading = true
          this.$nextTick(() => {
            this.comLoading = false
            this.$set(this.currentLocation, 'picturePath', response.url)
          })
        }
      }
    }
  },
  mounted() {
    this.fetchBridgeLocationTreeData()
  },
  watch: {
    showOnlyImageExists() {
      this.fetchCompTreeData()
    }
  }

}

export function specifyBridgeInfo(list) {
  return list.map(item => {
    if (Array.isArray(item.children) && item.children.length > 0) {
      return {
        ...item,
        children: specifyBridgeInfo(item.children)
      }
    } else if (Array.isArray(item.bridgeList) && item.bridgeList.length > 0) {
      return {
        ...item,
        children: item.bridgeList.map(obj => ({
          ...obj,
          isBridge: true,
          children: Array.isArray(obj.bridgeBranchList) ? obj.bridgeBranchList.map(obj2 => ({
            ...obj2,
            isBridge: true,
            isSubbridge: true
          })) : []
        }))
      }
    } else {
      return item
    }
  })
}

export function specifyCompInfo(list) {
  return list.map(item => {
    if (Array.isArray(item.children) && item.children.length > 0) {
      return {
        ...item,
        children: specifyCompInfo(item.children)
      }
    } else {
      return ({
        ...item,
        isLeaf: true //  没有子节点的节点才可以添加构建实例
      })
    }
  })
}
</script>

<style lang="scss">
.bridge-image-group-root.readonly .el-upload--picture-card {
  display: none !important;
}

</style>
