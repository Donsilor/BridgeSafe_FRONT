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
    <el-col :span="24">
     <el-form-item label-width="0">
            <el-tabs v-model="bridgeBranchTab">
            <el-tab-pane label="bridge_component">
                  <el-button size="small" @click="addBridgeComponentRow" type="primary">新增</el-button>
                  <el-table
                  border
                  :data="inputForm.bridgeComponentList.filter(function(item){ return item.delFlag !== '1'})"
                  style="width: 100%">
                  <el-table-column
                    prop=""
                    header-align="center"
                    align="center"
                    show-overflow-tooltip
                    label="构件id">
                  </el-table-column>
                <el-table-column
                    prop="code"
                    header-align="center"
                    align="center"
                    show-overflow-tooltip
                    label="编码">
                  </el-table-column>
                <el-table-column
                    prop="name"
                    header-align="center"
                    align="center"
                    show-overflow-tooltip
                    label="名称">
                  </el-table-column>
                  <el-table-column
                    fixed="right"
                    label="操作"
                    width="150">
                    <template slot-scope="scope">
                      <el-button @click="viewBridgeComponentRow(scope.row)" type="text" size="small">查看</el-button>
                      <el-button  @click="editBridgeComponentRow(scope.row)" type="text" size="small">编辑</el-button>
                      <el-button  @click="delBridgeComponentRow(scope.row)" type="text" size="small">删除</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-tab-pane>
            </el-tabs>
           </el-form-item>
          </el-col>
        </el-row>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">关闭</el-button>
      <el-button type="primary" v-if="method != 'view'" @click="doSubmit()" v-noMoreClick>确定</el-button>
    </span>
  </el-dialog>
  <BridgeComponentForm ref="bridgeComponentForm" @addRow="saveBridgeComponentRow(arguments)"></BridgeComponentForm>
</div>
</template>

<script>
  import BridgeComponentForm from './BridgeComponentForm'
  export default {
    data () {
      return {
        title: '',
        method: '',
        visible: false,
        loading: false,
        bridgeBranchTab: '0',
        inputForm: {
          id: '',
          bridgeComponentList: [],
          code: '',
          name: '',
          remark: ''
        }
      }
    },
    components: {
      BridgeComponentForm
    },
    methods: {
      init (method, id) {
        this.method = method
        if (method === 'add') {
          this.title = `新建桥梁构件`
        } else if (method === 'edit') {
          this.title = '修改桥梁构件'
        } else if (method === 'view') {
          this.title = '查看桥梁构件'
        }
        this.visible = true
        this.loading = false
        this.$nextTick(() => {
          this.$refs.inputForm.resetFields()
          this.inputForm.id = id
          this.bridgeBranchTab = '0'
          this.inputForm.bridgeComponentList = []
          if (method === 'edit' || method === 'view') { // 修改或者查看
            this.loading = true
            this.$http({
              url: `/bridgecomponent/bridgeBranch/queryById?id=${this.inputForm.id}`,
              method: 'get'
            }).then(({data}) => {
              this.inputForm = this.recover(this.inputForm, data.bridgeBranch)
              this.loading = false
            })
          }
        })
      },
      saveBridgeComponentRow (child) {
        if (child[0] === '') {
          this.inputForm.bridgeComponentList.push(child[1])
        } else {
          this.inputForm.bridgeComponentList.forEach((item, index) => {
            if (item === child[0]) {
              this.inputForm.bridgeComponentList.splice(index, 1, child[1])
            }
          })
        }
      },
      addBridgeComponentRow (child) {
        this.$refs.bridgeComponentForm.init('add')
      },
      viewBridgeComponentRow (child) {
        this.$refs.bridgeComponentForm.init('view', child)
      },
      editBridgeComponentRow (child) {
        this.$refs.bridgeComponentForm.init('edit', child)
      },
      delBridgeComponentRow (child) {
        this.inputForm.bridgeComponentList.forEach((item, index) => {
          if (item === child && item.id === '') {
            this.inputForm.bridgeComponentList.splice(index, 1)
          } else if (item === child) {
            item.delFlag = '1'
            this.inputForm.bridgeComponentList.splice(index, 1, item)
          }
        })
      },
      // 表单提交
      doSubmit () {
        this.$refs['inputForm'].validate((valid) => {
          if (valid) {
            this.loading = true
            this.$http({
              url: `/bridgecomponent/bridgeBranch/save`,
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