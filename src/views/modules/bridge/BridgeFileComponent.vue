<template>
  <el-table
    :data="fileList"
    border
    size="mini"
    v-loading="loading"
    class="table"
    @selection-change="handleSelectionChange">
    <el-table-column width="50" prop="code" type="index" show-overflow-tooltip label="序号" v-if="readOnly"></el-table-column>
    <el-table-column
      type="selection"
      width="55" v-else>
    </el-table-column>
    <el-table-column
      prop="fileType.name"
      label="档案类型">
    </el-table-column>
    <el-table-column
      prop="fileAlias"
      label="档案别名">
    </el-table-column>
    <el-table-column
      prop="fileName"
      label="文件">
      <template slot-scope="scope">
        <a class="download-link" :href="scope.row.filePath" download target="_blank">
          <span>{{scope.row.fileName}}</span>
        </a>
      </template>
    </el-table-column>
    <el-table-column
      prop="updateDate"
      label="上传时间">
    </el-table-column>
  </el-table>
</template>

<script>
export default {
  props: {
    fileList: Array,
    readOnly: Boolean
  },
  data() {
    return {
      loading: false,
    }
  },
  methods: {
    handleSelectionChange(val) {
      this.$emit('handleSelectionChange', val)
    }
  }
}
</script>

<style scoped>
.download-link {
  cursor: pointer;
}
</style>
