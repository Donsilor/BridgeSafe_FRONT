<template>
  <el-dialog title="修改显示顺序" :close-on-click-modal="false" v-dialogDrag :visible.sync="visible">
    <el-form :model="inputForm" ref="inputForm" @keyup.enter.native="doSubmit()" label-width="120px">
      <el-row :gutter="15">
        <el-col :span="12">
          <el-form-item label="显示顺序" prop="sort" :rules="[{ required: true, message: '显示顺序不能为空', trigger: 'blur' }]"> <el-input v-model="inputForm.sort"></el-input></el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">关闭</el-button>
      <el-button type="primary" :loading="loading" @click="doSubmit()">确定</el-button>
    </span>
  </el-dialog>
</template>
<script>
export default {
  data() {
    return {
      visible: false,
      loading: false,
      inputForm: {
        id: '',
        sort: '',
      },
    };
  },
  methods: {
    init(row) {
      this.visible = true;
      this.inputForm = row;
    },
    // 表单提交
    doSubmit() {
      this.$refs['inputForm'].validate((valid) => {
        if (valid) {
          this.loading = true;
          this.$http({
            url: `/basedisease/baseDisease/updateSort`,
            method: 'post',
            data: {
              baseComponentId: this.inputForm.id,
              sort: this.inputForm.sort,
            },
          })
            .then(({ data }) => {
              this.loading = false;
              if (data && data.success) {
                this.visible = false;
                this.$message.success(data.msg);
                this.$emit('refreshList');
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