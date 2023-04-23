<template>
  <div>
    <el-dialog title="审核日常巡查任务" :close-on-click-modal="false" v-dialogDrag :visible.sync="visible">
      <el-form :model="inputForm" ref="inputForm" v-loading="loading" label-width="120px">
        <el-row :gutter="15">
          <el-col :span="12">
            <el-form-item
              label="审核结果"
              prop="auditResult"
              :rules="[
                {
                  required: true,
                  message: '审核结果不能为空',
                  trigger: 'blur',
                },
              ]"
            >
              <el-select v-model="inputForm.auditResult" placeholder="请选择" style="width: 100%">
                <el-option
                  v-for="item in [
                    { label: '通过', value: 'PASS' },
                    { label: '不通过', value: 'NOT_PASS' },
                  ]"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="任务评分"
              prop="evaluate.id"
              :rules="[
                {
                  required: true,
                  message: '任务评分不能为空',
                  trigger: 'blur',
                },
              ]"
            >
              <el-select v-model="inputForm.evaluate.id" placeholder="请选择" style="width: 100%">
                <el-option v-for="item in evaluateList" :key="item.id" :label="item.name" :value="item.id"> </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="doSubmit()" v-noMoreClick>提交</el-button>
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
      evaluateList: [], //评分
      inputForm: {
        id: '',
        auditResult: '',
        evaluate: { id: '' },
      },
    };
  },
  methods: {
    init(row) {
      this.inputForm.id = row.id;
      this.$http({
        url: `/baseinfo/basetype/baseType/treeData`,
        method: 'get',
      }).then(({ data }) => {
        this.evaluateList = data.treeData.filter((v) => v.name == '任务评分')[0].children;
      });
      this.visible = true;
      this.$nextTick(() => {
        this.$refs.inputForm.resetFields();
      });
    },
    // 表单提交
    doSubmit() {
      this.$refs['inputForm'].validate((valid) => {
        if (valid) {
          this.loading = true;
          this.$http({
            url: `/dailyinspectruleinstance/inspectRulesInstance/audit`,
            params: this.inputForm,
          })
            .then(({ data }) => {
              this.loading = false;
              if (data && data.success) {
                this.visible = false;
                this.$message.success(data.msg);
                this.$emit('refreshDataList');
              }
            })
            .catch(() => {
              this.loading = false;
            });
        }
      });
    },
  },
};
</script>
