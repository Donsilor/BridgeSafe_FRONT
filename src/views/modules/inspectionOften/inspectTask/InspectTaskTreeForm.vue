<template>
  <div>
    <el-dialog title="变更巡查组" :close-on-click-modal="false" v-dialogDrag :visible.sync="visible">
      <el-row :gutter="15">
        <el-col :span="12">
          <el-input placeholder="输入关键字进行过滤" v-model="filterText"> </el-input>
          <el-tree
            ref="tree"
            :data="data"
            show-checkbox
            node-key="id"
            :props="{ label: 'name' }"
            default-expand-all
            :filter-node-method="filterNode"
            @check-change="handleCheckChange"
            :default-checked-keys="defaultChecked"
          >
          </el-tree>
        </el-col>
      </el-row>
      <span slot="footer" class="dialog-footer">
        <el-button @click="visible = false">关闭</el-button>
        <el-button type="primary" :loading="loading" @click="doSubmit()" v-noMoreClick>确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      filterText: '',
      defaultChecked: [],
      data: [],
      row: {},
      compIds: '',
      visible: false,
      loading: false,
    };
  },
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val);
    },
  },
  methods: {
    init(row) {
      this.row = row;
      // this.$http({
      //   url: `/sys/office/treeData`,
      // }).then(({ data }) => {
      //   if (data && data.success) {
      //     this.data = data.treeData;
      //     this.visible = true;
      //     this.loading = false;
      //     this.defaultChecked = row.planOrgIds.split(',');
      //   }
      // });
      this.$http({
        url: `/routinerulesinstance/inspectRulesInstanceRoutine/officeTreeData`,
        params: { id: row.id },
      }).then(({ data }) => {
        if (data && data.success) {
          this.data = data.treeData;
          this.visible = true;
          this.loading = false;
          this.defaultChecked = row.planOrgIds.split(',');
        }
      });
    },
    filterNode(value, data) {
      if (!value) return true;
      return data.name.indexOf(value) !== -1;
    },
    handleCheckChange() {
      this.compIds = this.$refs.tree.getCheckedKeys().join();
      //.concat(this.$refs.tree.getHalfCheckedKeys()).join()
    },
    // 表单提交
    doSubmit() {
      const compIds = this.compIds || this.defaultChecked.join();
      if (!compIds) {
        this.$message.error('请选择巡查组！');
        return;
      }
      this.loading = true;
      this.$http({
        url: `/routinerulesinstance/inspectRulesInstanceRoutine/changeOrgIds`,
        method: 'post',
        data: { id: this.row.id, planOrgIds: compIds },
      }).then(({ data }) => {
        this.loading = false;
        if (data && data.success) {
          this.visible = false;
          this.$message.success(data.msg);
          this.$emit('refreshDataList');
        }
      });
    },
  },
};
</script>