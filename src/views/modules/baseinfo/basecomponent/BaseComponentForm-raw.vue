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
            <el-form-item label="父id" prop="parent.id"
                :rules="[
                  {required: true, message:'父id不能为空', trigger:'blur'}
                 ]">
                <SelectTree
                      ref="parent"
                      :props="{
                          value: 'id',             // ID字段名
                          label: 'name',         // 显示名称
                          children: 'children'    // 子级字段名
                        }"
                      v-if="visible"
                      :url="`/basecomponent/baseComponent/treeData?extId=${inputForm.id}`"
                      :value="inputForm.parent.id"
                      :clearable="true"
                      :accordion="true"
                      @getValue="(value) => {inputForm.parent.id=value}"/>
           </el-form-item>
        </el-col>
        <el-col :span="12">
            <el-form-item label="编码" prop="code"
                :rules="[
                  {required: true, message:'编码不能为空', trigger:'blur'}
                 ]">
              <el-input v-model="inputForm.code" placeholder="请填写编码"     ></el-input>
           </el-form-item>
        </el-col>
        <el-col :span="12">
            <el-form-item label="名称" prop="name"
                :rules="[
                  {required: true, message:'名称不能为空', trigger:'blur'}
                 ]">
              <el-input v-model="inputForm.name" placeholder="请填写名称"     ></el-input>
           </el-form-item>
        </el-col>
        <el-col :span="12">
            <el-form-item label="备注" prop="remark"
                :rules="[
                 ]">
              <el-input v-model="inputForm.remark" placeholder="请填写备注"     ></el-input>
           </el-form-item>
        </el-col>
        <el-col :span="12">
            <el-form-item label="排序" prop="sort"
                :rules="[
                  {validator: validator.isNumber, trigger:'blur'}
                 ]">
              <el-input v-model="inputForm.sort" placeholder="请填写排序"     ></el-input>
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
          parent: {
            id: ''
          },
          code: '',
          name: '',
          remark: '',
          sort: ''
        }
      }
    },
    components: {
      SelectTree
    },
    methods: {
      init (method, obj) {
        this.method = method
        this.inputForm.id = obj.id
        if (method === 'add') {
          this.title = '新建构件库'
        } else if (method === 'addChild') {
          this.title = '添加下级构件库'
        } else if (method === 'edit') {
          this.title = '修改构件库'
        } else if (method === 'view') {
          this.title = '查看构件库'
        }
        this.visible = true
        this.loading = false
        this.$nextTick(() => {
          this.$refs.inputForm.resetFields()
          this.inputForm.parent.id = obj.parent.id
          this.inputForm.parent.name = obj.parent.name
          if (method === 'edit' || method === 'view') { // 修改或者查看
            this.loading = true
            this.$http({
              url: `/basecomponent/baseComponent/queryById?id=${this.inputForm.id}`,
              method: 'get'
            }).then(({data}) => {
              this.inputForm = this.recover(this.inputForm, data.baseComponent)
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
              url: `/basecomponent/baseComponent/save`,
              method: 'post',
              data: this.inputForm
            }).then(({data}) => {
              this.loading = false
              if (data && data.success) {
                this.visible = false
                this.$message.success(data.msg)
                this.$emit('refreshTree')
              }
            })
          }
        })
      }
    }
  }
</script>