<template>
<div>
  <el-dialog
    :title="title"
    :close-on-click-modal="false"
    v-dialogDrag
    :visible.sync="visible">
    <el-form :model="inputForm" ref="inputForm" v-loading="loading" :class="method==='view'?'readonly':''"  :disabled="method==='view'"
             label-width="120px">
      <el-row  :gutter="15">
        <el-col :span="12">
            <el-form-item label="打卡点编码" prop="code"
                :rules="[
                  {required: true, message:'编码不能为空', trigger:'blur'}
                 ]">
              <el-input v-model="inputForm.code" placeholder="请填写编码"     ></el-input>
           </el-form-item>
        </el-col>
        <el-col :span="12">
            <el-form-item label="打卡点名称" prop="name"
                :rules="[
                 ]">
              <el-input v-model="inputForm.name" placeholder="请填写名称"     ></el-input>
           </el-form-item>
        </el-col>
        <el-col :span="12">
            <el-form-item label="打卡点位置" prop="location"
                :rules="[
                 ]">
              <el-input v-model="inputForm.location" placeholder="请填写位置"     ></el-input>
           </el-form-item>
        </el-col>
        <el-col :span="12">
            <el-form-item label="备注" prop="remark"
                :rules="[
                 ]">
          <el-input type="textarea" v-model="inputForm.remark" placeholder="请填写备注"     ></el-input>
           </el-form-item>
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
    data () {
      return {
        title: '',
        method: '',
        visible: false,
        loading: false,
        inputForm: {
          id: '',
          bridgeId: '',
          code: '',
          name: '',
          location: '',
          remark: ''
        }
      }
    },
    components: {
    },
    methods: {
      init (method, id) {
        this.method = method
        if (method === 'add') {
          this.title = '新建打卡点'
          this.inputForm.bridgeId =id
          this.inputForm.id =''
        } else if (method === 'edit') {
          this.title = '修改打卡点'
           this.inputForm.id =id
        }
        this.visible = true
        this.loading = false
        this.$nextTick(() => {
          this.$refs.inputForm.resetFields()
          if (method === 'edit') { // 修改
            this.loading = true
            this.$http({
              url: `/inspection/inspectCheckpoint/queryById?id=${this.inputForm.id}`,
              method: 'get'
            }).then(({data}) => {
              this.inputForm = this.recover(this.inputForm, data.inspectCheckpoint)
              this.loading = false
            })
          }
        })
      },
      // 表单提交
      doSubmit () {
        this.$refs['inputForm'].validate((valid) => {
          if (valid) {
            this.loading = true
            this.$http({
              url: `/inspection/inspectCheckpoint/save`,
              method: 'post',
              contentType:'json',
              data: this.inputForm
            }).then(({data}) => {
              this.loading = false
              if (data && data.success) {
                this.visible = false
                this.$message.success(data.msg)
                this.$emit('refreshDataList')
              }
            })
          }
        })
      }
    }
  }
</script>