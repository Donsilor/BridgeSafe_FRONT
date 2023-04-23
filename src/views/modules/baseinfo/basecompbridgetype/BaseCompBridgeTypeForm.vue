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
            <el-form-item label="桥类型id" prop="bridgeTypeId"
                :rules="[
                  {required: true, message:'桥类型id不能为空', trigger:'blur'}
                 ]">
              <el-input v-model="inputForm.bridgeTypeId" placeholder="请填写桥类型id"     ></el-input>
           </el-form-item>
        </el-col>
        <el-col :span="12">
            <el-form-item label="桥类型名" prop="bridgeTypeName"
                :rules="[
                 ]">
              <el-input v-model="inputForm.bridgeTypeName" placeholder="请填写桥类型名"     ></el-input>
           </el-form-item>
        </el-col>
        <el-col :span="12">
            <el-form-item label="构件id" prop="comp.id"
                :rules="[
                  {required: true, message:'构件id不能为空', trigger:'blur'}
                 ]">
          <SelectTree
                      ref="comp"
                      :props="{
                          value: 'id',             // ID字段名
                          label: 'name',         // 显示名称
                          children: 'children'    // 子级字段名
                        }"

                      url="/BaseComponent/baseComponent/treeData"
                      :value="inputForm.comp.id"
                      :clearable="true"
                      :accordion="true"
                      @getValue="(value) => {inputForm.comp.id=value}"/>
           </el-form-item>
        </el-col>
        <el-col :span="12">
            <el-form-item label="构件名" prop="compName"
                :rules="[
                 ]">
              <el-input v-model="inputForm.compName" placeholder="请填写构件名"     ></el-input>
           </el-form-item>
        </el-col>
        <el-col :span="12">
            <el-form-item label="备注" prop="remark"
                :rules="[
                 ]">
              <el-input v-model="inputForm.remark" placeholder="请填写备注"     ></el-input>
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
  import SelectTree from '@/components/treeSelect/treeSelect.vue'
  export default {
    data () {
      return {
        title: '',
        method: '',
        visible: false,
        loading: false,
        inputForm: {
          id: '',
          bridgeTypeId: '',
          bridgeTypeName: '',
          comp: {
            id: ''
          },
          compName: '',
          remark: ''
        }
      }
    },
    components: {
      SelectTree
    },
    methods: {
      init (method, id) {
        this.method = method
        this.inputForm.id = id
        if (method === 'add') {
          this.title = `新建构件类型`
        } else if (method === 'edit') {
          this.title = '修改构件类型'
        } else if (method === 'view') {
          this.title = '查看构件类型'
        }
        this.visible = true
        this.loading = false
        this.$nextTick(() => {
          this.$refs.inputForm.resetFields()
          if (method === 'edit' || method === 'view') { // 修改或者查看
            this.loading = true
            this.$http({
              url: `/basecompbridgetype/baseCompBridgeType/queryById?id=${this.inputForm.id}`,
              method: 'get'
            }).then(({data}) => {
              this.inputForm = this.recover(this.inputForm, data.baseCompBridgeType)
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
              url: `/basecompbridgetype/baseCompBridgeType/save`,
              method: 'post',
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