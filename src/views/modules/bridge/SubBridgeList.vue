<template>
  <el-table
    :data="bridgeBranchList"
    border
    size="mini"
    v-loading="loading"
    class="table"
    @selection-change="handleSelectionChange">
    <el-table-column width="50" prop="code" type="index" show-overflow-tooltip label="序号"></el-table-column>
    <el-table-column
      prop="code"
      label="主辅桥编码">
    </el-table-column>
    <el-table-column
      prop="name"
      label="主辅桥名称">
    </el-table-column>
    <el-table-column
      prop="bridgeType.name"
      label="结构类型">
    </el-table-column>
    <el-table-column fixed="right" header-align="center" align="center" width="250" label="操作" v-if="!readOnly">
      <template slot-scope="scope">
        <el-button :disabled="scope.row.status == 1" size="text" @click.stop="editSubBridge(scope.row)">编辑</el-button>
        <el-divider direction="vertical"></el-divider>
        <el-button :disabled="scope.row.status == 1" size="text" @click="delSubBridge(scope.row)"> 删除</el-button>
        <el-divider direction="vertical"></el-divider>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
export default {
  name: 'SubBridgeList',
  props: {
    bridgeBranchList: Array,
    readOnly: Boolean
  },
  data() {
    return {
      loading: false,
      dataList: []
    }
  },
  methods: {
    handleCurrentRowChange(row) {
      console.log('handleCurrentRowChange, row', row)
      this.loading = true
      this.$http({
        url: `/bridge/bridge/queryById?id=${row.id}`,
        method: 'get'
      }).then(({data}) => {
        this.loading = false
      })
    },
    handleSelectionChange(val) {
      console.log('val', val)
      this.$emit('handleSelectionChange', val)
    },
    editSubBridge(val) {
      this.$emit('editSubBridge', val)
    },
    delSubBridge(val) {
      this.$emit('delSubBridge', val)
    }
  }
}
</script>

<style scoped>

</style>
