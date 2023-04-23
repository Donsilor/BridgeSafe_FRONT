<template>
  <el-dialog :title="title" :close-on-click-modal="false" v-dialogDrag :visible.sync="visible">
    <el-form :model="inputForm" ref="inputForm" :class="method === 'view' ? 'readonly' : ''" :disabled="method === 'view'" @keyup.enter.native="doSubmit()" label-width="120px">
      <el-row :gutter="15">
        <el-col :span="12">
          <el-form-item label="构件名称" prop="name" :rules="[{ required: true, message: '构件名称不能为空', trigger: 'blur' }]">
            <el-input v-model="inputForm.name" placeholder="请填写构件名称"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="构件位置" prop="location.location" :rules="[{ required: true, message: '构件位置不能为空', trigger: 'blur' }]">
            <el-input v-model="inputForm.location.location" placeholder="请填写构件位置"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="构件编码" prop="code" :rules="[{ required: true, message: '构件编码不能为空', trigger: 'blur' }]">
            <el-input v-model="inputForm.code" placeholder="请填写构件编码"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="备注" prop="remark" :rules="[]">
            <el-input v-model="inputForm.remark"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">关闭</el-button>
      <el-button v-if="method !== 'view'" type="primary" @click="doSubmit()">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  data() {
    return {
      title: '',
      method: '',
      visible: false,
      oldInputForm: '',
      inputForm: {
        id: '',
        code: '',
        name: '',
        location: {
          location: '',
        },
        remark: '',
      },
    };
  },
  methods: {
    init(method, obj) {
      this.method = method;
      if (method === 'add') {
        this.title = `新建构件`;
      } else if (method === 'edit') {
        this.title = '修改构件';
      } else if (method === 'view') {
        this.title = '查看';
      }
      this.visible = true;
      this.$nextTick(() => {
        this.$refs.inputForm.resetFields();
        this.inputForm.id = '';
        this.oldInputForm = '';
        if (method === 'edit' || method === 'view') {
          // 修改或者查看
          this.oldInputForm = obj;
          this.inputForm = JSON.parse(JSON.stringify(obj));
        }
      });
    },
    // 表单提交
    doSubmit() {
      this.$refs['inputForm'].validate((valid) => {
        if (valid) {
          this.$emit('addRow', this.oldInputForm, JSON.parse(JSON.stringify(this.inputForm)));
          this.visible = false;
        }
      });
    },
  },
};
</script>
