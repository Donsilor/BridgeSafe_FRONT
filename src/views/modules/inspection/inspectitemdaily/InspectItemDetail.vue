<template>
  <div>
    <el-dialog title="查看" :close-on-click-modal="false" v-dialogDrag :visible.sync="visible">
      <el-form ref="inputForm" v-loading="loading">
        <el-row>
          <el-col :span="24">
            <el-tree ref="tree" :data="treeData" show-checkbox node-key="id" :props="{ label: 'name' }" default-expand-all :default-checked-keys="defaultChecked"> </el-tree>
          </el-col>
        </el-row>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="visible = false">关闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      visible: false,
      loading: false,
      treeData: [],
      defaultChecked: [],
    };
  },
  methods: {
    init(row) {
      this.visible = true;
      this.$http({
        url: `/inspectitemdaily/inspectItemDaily/treeDataInspectItemDaily`,
        params: { extId: row.id },
      }).then(({ data }) => {
        if (data && data.success) {
          this.treeData = data.treeData;
        }
      });
      this.$nextTick(() => {
        this.loading = true;
        this.$http({
          url: `/inspectitemdaily/inspectItemDaily/queryById?id=${row.id}`,
          method: 'get',
        }).then(({ data }) => {
          this.defaultChecked = data.inspectItemDaily.inspectItemDailyCompList.map((v) => v.compId);
          this.loading = false;
        });
      });
    },
  },
};
</script>
    <style scoped>
.el-form {
  display: flex;
}
</style>