<template>
  <div>
    <el-dialog title="查看经常检查制度" :close-on-click-modal="false" v-dialogDrag :visible.sync="visible">
      <el-form :model="inputForm" ref="inputForm" v-loading="loading" label-width="120px">
        <el-row>
          <el-col :span="20">
            <el-form-item label="制度编码 : ">
              {{ inputForm.code }}
            </el-form-item>
          </el-col>
          <el-col :span="20">
            <el-form-item label="制度名称 : ">
              {{ inputForm.name }}
            </el-form-item>
          </el-col>
          <el-col :span="20">
            <el-form-item label="制度频率(1次) : ">{{ inputForm.rate }} {{ inputForm.rateUnit }} </el-form-item>
          </el-col>
          <el-col :span="20">
            <el-form-item label="项目 : "> {{ inputForm.bridgeName }} {{ inputForm.bridgeBranchName }} </el-form-item>
          </el-col>
          <el-col :span="20">
            <el-form-item label="巡查组 : ">
              {{ inputForm.orgNames }}
            </el-form-item>
          </el-col>
          <el-col :span="20">
            <el-form-item label="备注 : ">
              {{ inputForm.remark }}
            </el-form-item>
          </el-col>
        </el-row>
        <el-row class="baseTree">
          <el-col :span="20">
            <el-tree ref="tree" :data="basetreeData" show-checkbox node-key="id" :props="{ label: 'name' }" default-expand-all :filter-node-method="filterNode" :default-checked-keys="defaultChecked">
            </el-tree>
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
      basetreeData: [],
      visible: false,
      loading: false,
      defaultChecked: [],
      inputForm: {},
    };
  },
  methods: {
    filterNode(value, data) {
      if (!value) return true;
      return data.name.indexOf(value) !== -1;
    },
    init(id) {
      this.visible = true;
      this.$nextTick(() => {
        this.$http({
          url: `/routinerules/inspectRulesRoutine/queryById?id=${id}`,
          method: 'get',
        }).then(({ data }) => {
          this.inputForm = data.inspectRulesRoutine;
          this.defaultChecked = data.inspectRulesRoutine.inspectRulesComponentRoutineList.map((v) => v.componentId);
          this.baseTree();
        });
      });
    },
    // 获取构件类型树形列表
    baseTree() {
      this.loading = true;
      this.$http({
        url: `/routinerules/inspectRulesRoutine/treeComponentData`,
        params: { id: this.inputForm.id, bridgeId: this.inputForm.bridgeId },
      }).then(({ data }) => {
        if (data && data.success) {
          this.basetreeData = data.treeData;
          this.loading = false;
        }
      });
    },
  },
};
</script>
<style scoped>
.el-form {
  display: flex;
}
.el-row {
  width: 50%;
}
.baseTree {
  margin-left: 80px;
}
</style>