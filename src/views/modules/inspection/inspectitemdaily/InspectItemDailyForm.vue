<template>
  <div>
    <el-dialog :title="title" :close-on-click-modal="false" v-dialogDrag :visible.sync="visible">
      <el-form :model="inputForm" ref="inputForm" v-loading="loading" :class="method === 'view' ? 'readonly' : ''" :disabled="method === 'view'">
        <el-row>
          <el-col :span="15">
            <el-form-item label="巡查项目编码" prop="code" v-if="title == '修改日常巡查项目'">
              <el-input v-model="inputForm.code" placeholder="请填写编码" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="15">
            <el-form-item label="巡查项目名称" prop="name" :rules="[{ required: true, message: '项目名称不能为空', trigger: 'blur' }]">
              <el-input v-model="inputForm.name" placeholder="请填写名称"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="15">
            <el-form-item label="巡查项目备注" prop="remark" :rules="[]">
              <el-input type="textarea" v-model="inputForm.remark" placeholder="请填写备注"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-input size="small" placeholder="输入关键字进行过滤" v-model="filterText"> </el-input>
            <el-tree
              ref="tree"
              :data="treeData"
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
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="visible = false">关闭</el-button>
        <el-button type="primary" v-if="method != 'view'" @click="doSubmit()" v-noMoreClick>确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      filterText: '',
      title: '',
      method: '',
      visible: false,
      loading: false,
      treeData: [],
      defaultChecked: [],
      inputForm: {
        id: '',
        inspectItemDailyCompList: [],
        code: '',
        name: '',
        remark: '',
      },
    };
  },
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val);
    },
  },
  methods: {
    filterNode(value, data) {
      if (!value) return true;
      return data.name.indexOf(value) !== -1;
    },
    init(method, row) {
      this.method = method;
      if (method === 'add') {
        this.title = `新建日常巡查项目`;
        this.defaultChecked = [];
      } else if (method === 'edit') {
        this.title = '修改日常巡查项目';
      }
      this.defaultChecked = [];
      this.visible = true;
      this.loading = true;
      if (method === 'add') {
        this.$http({
          url: `/inspectitemdaily/inspectItemDaily/treeDataInspectItemDaily`,
        }).then(({ data }) => {
          if (data && data.success) {
            this.treeData = data.treeData;
            this.loading = false;
          }
        });
      }
      this.$nextTick(() => {
        this.$refs.inputForm.resetFields();
        this.inputForm.id = row.id;
        this.inputForm.inspectItemDailyCompList = [];
        if (method === 'edit') {
          // 修改或者查看
          this.loading = true;
          this.$http({
            url: `/inspectitemdaily/inspectItemDaily/queryById?id=${this.inputForm.id}`,
            method: 'get',
          }).then(({ data }) => {
            this.inputForm = this.recover(this.inputForm, data.inspectItemDaily);
            this.defaultChecked = data.inspectItemDaily.inspectItemDailyCompList.map((v) => v.compId);
            this.$http({
              url: `/inspectitemdaily/inspectItemDaily/treeDataInspectItemDaily`,
              params: { extId: row.id },
            }).then(({ data }) => {
              if (data && data.success) {
                this.treeData = data.treeData;
                this.loading = false;
              }
            });
          });
        }
      });
    },
    handleCheckChange() {
      const list = this.$refs.tree.getCheckedKeys(true),
        arr = [];
      list.map((v) => arr.push({ compId: v }));
      this.inputForm.inspectItemDailyCompList = arr;
    },
    // 表单提交
    doSubmit() {
      this.$refs['inputForm'].validate((valid) => {
        if (valid) {
          this.loading = true;
          this.$http({
            url: `/inspectitemdaily/inspectItemDaily/save`,
            method: 'post',
            contentType: 'json',
            data: this.inputForm,
          }).then(({ data }) => {
            this.loading = false;
            if (data && data.success) {
              this.visible = false;
              this.$message.success(data.msg);
              this.$emit('refreshDataList');
            }
          });
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
</style>
