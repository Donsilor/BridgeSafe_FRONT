<template>
  <div>
    <el-row :gutter="16">
      <el-col :span="4">
        <el-tree
          class="filter-tree"
          :data="bridgeCategoryList"
          :props="{
              value: 'id',             // ID字段名
              label: 'name',         // 显示名称
              children: 'children'    // 子级字段名
            }"
          default-expand-all
          node-key="id"
          :highlight-current="true"
          :expand-on-click-node="false"
          @node-click="handleNodeClick"
          ref="bridgeCategoryRef">
           <span class="custom-tree-node" slot-scope="{ node, data}">
            <span>{{ node.label }}</span>
            <span>
               <el-button type="text" class="tree-item-button"
                          @click="() => editTreeNode(data)">
                 设置
               </el-button>
            </span>
          </span>
        </el-tree>
      </el-col>
      <el-col :span="20">
        <el-input
          placeholder="构件类型名称模糊查询"
          v-model="filterText">
        </el-input>
        <el-tree
          class="filter-tree"
          :data="dataList"
          :props="{
              value: 'id',             // ID字段名
              label: 'name',         // 显示名称
              children: 'children'    // 子级字段名
            }"
          default-expand-all
          node-key="id"
          :highlight-current="true"
          :expand-on-click-node="false"
          :filter-node-method="filterNode"
          ref="compTreeRef">
           <span class="custom-tree-node" slot-scope="{ node, data}">
            <span>{{ node.label }}</span>
          </span>
        </el-tree>
      </el-col>
    </el-row>
    <el-dialog
      title="设置构件类型"
      :close-on-click-modal="false"
      v-dialogDrag
      :visible.sync="categoryVisible">
      <div class="content">
        <el-input
          placeholder="构件类型名称模糊查询"
          v-model="filterEditDialogText">
        </el-input>
        <el-tree
          class="filter-tree"
          :data="rawDataList"
          :props="{
              value: 'id',             // ID字段名
              label: 'name',         // 显示名称
              children: 'children'    // 子级字段名
            }"
          default-expand-all
          node-key="id"
          show-checkbox
          :highlight-current="true"
          :default-expand-all="true"
          :default-checked-keys="selectedIdList"
          :expand-on-click-node="false"
          :filter-node-method="filterNode"
          ref="compTreeEditDialogRef">
           <span class="custom-tree-node" slot-scope="{ node, data}">
            <span>{{ node.label }} （{{data.selectedLeafChildCount || 0}}）</span>
          </span>
        </el-tree>
      </div>
      <span slot="footer" class="dialog-footer">
          <el-button @click="categoryVisible = false">关闭</el-button>
          <el-button type="primary" @click="doBridgeTypeSubmit()" v-noMoreClick>确定</el-button>
        </span>
    </el-dialog>
  </div>
</template>

<script>
import SelectTree from '@/components/treeSelect/treeSelect'
import _ from 'lodash'

export default {
  name: 'BaseCompBridgeSetting',
  data() {
    return {
      loading: false,
      categoryVisible: false,
      selectedCategoryKey: null,
      filterText: '',
      filterEditDialogText: '',
      compIds: '',
      bridgeCategoryList: [], // 桥梁类型列表
      rawDataList: [], // 构件库列表数据
      dataList: [], // 构件库列表数据
      selectedIdList: [],
    }
  },
  components: {
    SelectTree
  },
  methods: {
// 获取桥梁类型接口  页面初始化时获取一次即可
    fetchBridgeCategoryList() {
      this.$http({
        // url: `/baseinfo/basetype/baseType/treeData`,
        url: `/baseinfo/basetype/baseType/treeDataByCode`,
        params:{code : 101}
      }).then(({data}) => {
        if (Array.isArray(data.treeData)) {
          this.bridgeCategoryList = data.treeData
          const compIds = _.flatMapDeep(data.treeData, flatNested).map(item => item.id).join(',')
          this.compIds = compIds
          if (data.treeData.length > 0 && Array.isArray(data.treeData[0].children) && data.treeData[0].children.length > 0) {
            // 等待组件渲染时间 然后高亮选中第一个节点
            setTimeout(() => {
              const selectedCategoryKey = data.treeData[0].children[0].id
              this.$refs.bridgeCategoryRef.setCurrentKey(selectedCategoryKey)
              this.selectedCategoryKey = selectedCategoryKey
              this.fetchCompListDataWithCategory()
            }, 200)
          }
        }
      })
    },
    filterNode(value, data) {
      if (!value) return true
      return data.name.indexOf(value) !== -1
    },
    fetchCompListDataWithCategory() {
      if (!this.selectedCategoryKey) {
        return
      }
      this.loading = true
      this.$http({
        url: `/basecomponent/baseComponent/treeDataByBridgeType?bridgeTypeId=${this.selectedCategoryKey}`,
        method: 'get'
      }).then(({data}) => {
        this.loading = false
        if (Array.isArray(data.treeData)) {
          this.rawDataList = data.treeData
          this.dataList = getCountNotEmpty(data.treeData)
          this.selectedIdList = _.flatMapDeep(data.treeData, flatNested).filter(item => item.selected).map(item => item.id)
        }
      })
    },
    handleNodeClick(data) {
      this.selectedCategoryKey = data.id
      this.fetchCompListDataWithCategory()
    },
    editTreeNode(data) {
      this.categoryVisible = true
    },
    doBridgeTypeSubmit() {
      if (!this.selectedCategoryKey) {
        this.$message.warning('请先选择一个桥梁类型')
        return
      }
      const params = {
        bridgeTypeId: this.selectedCategoryKey,
        compIds: this.$refs.compTreeEditDialogRef.getCheckedNodes(true).map(item => item.id).join(',') || ''
      }
      this.loading = true
      this.$http({
        url: `/basecompbridgetype/baseCompBridgeType/saveCompBridgeType`,
        method: 'post',
        data: params
      }).then(({data}) => {
        this.loading = false
        this.categoryVisible = false
        if (data.success) {
          this.fetchCompListDataWithCategory()
          this.$message.success('设置成功！')
        }
      })
    }
  },
  mounted() {
    this.fetchBridgeCategoryList()
  },
  watch: {
    filterText(val) {
      this.$refs.compTreeRef.filter(val)
    },
    filterEditDialogText(val) {
      this.$refs.compTreeEditDialogRef.filter(val)
    }
  }
}

// 拉平嵌套的数组
function flatNested(comp) {
  if (Array.isArray(comp.children) && comp.children.length > 0) {
    return [comp, _.flatMapDeep(comp.children, flatNested)]
  }
  return comp
}

function getCountNotEmpty(list) {
  if (!Array.isArray(list)) {
    return []
  }
  return list.filter(item => item.selectedLeafChildCount > 0).map(item => ({
    ...item,
    children: getCountNotEmpty(item.children)
  }))
}
</script>

<style scoped>

</style>
