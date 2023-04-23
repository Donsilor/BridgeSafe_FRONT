<template>
  <el-dialog
    :title="title"
    :close-on-click-modal="false"
    v-dialogDrag
    :visible.sync="visible">
    <el-form :model="inputForm" ref="inputForm" @keyup.enter.native="doSubmit()"
             label-width="160px">
      <el-row  :gutter="15">
        <el-col :span="16">
          <el-form-item label="构件数量" prop="batchCount"
                        :rules="[
                  {required: true, message:'构件数量不能为空', trigger:'blur'}
                 ]">
            <el-input-number v-model="inputForm.batchCount" placeholder="请填写构件数量"     ></el-input-number>
          </el-form-item>
        </el-col>
        <el-col :span="16">
          <el-form-item label="构件名称（前缀）" prop="namePrefix"
                        :rules="[
                  {required: true, message:'构件名称（前缀）不能为空', trigger:'blur'}
                 ]">
            <el-input v-model="inputForm.namePrefix" placeholder="请填写构件名称（前缀）"     ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="16">
          <el-form-item label="构件编码（前缀）" prop="codePrefix"
                        :rules="[
                  {required: true, message:'构件编码（前缀）不能为空', trigger:'blur'}
                 ]">
            <el-input v-model="inputForm.codePrefix" placeholder="请填写构件编码（前缀）"     ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="16">
          <el-form-item label="构件位置" prop="location.location"
                        :rules="[
                  {required: true, message:'构件位置不能为空', trigger:'blur'}
                 ]">
            <el-input v-model="inputForm.location.location" placeholder="请填写构件位置"     ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="16">
          <el-form-item label="备注" prop="remark"
                        :rules="[
                 ]">
            <el-input v-model="inputForm.remark" ></el-input>
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
  data () {
    return {
      title: '批量新增',
      method: '',
      visible: false,
      oldInputForm: '',
      inputForm: {
        namePrefix: '',
        codePrefix: '',
        batchCount: 1,
        location: {
          location: ''
        },
        remark: ''
      }
    }
  },
  methods: {
    init (method, obj) {
      this.visible = true
      this.$nextTick(() => {
        this.$refs.inputForm.resetFields()
        this.inputForm.id = ''
        this.oldInputForm = ''
      })
    },
    // 表单提交
    doSubmit () {
      this.$refs['inputForm'].validate((valid) => {
        if (valid) {
          this.$emit('addRow', this.oldInputForm, JSON.parse(JSON.stringify(this.inputForm)))
          this.visible = false
        }
      })
    }
  }
}
</script>
