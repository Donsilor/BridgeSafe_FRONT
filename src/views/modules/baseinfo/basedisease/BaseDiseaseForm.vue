<template>
  <div>
    <el-dialog :title="title" :close-on-click-modal="false" v-dialogDrag :visible.sync="visible">
      <el-form :model="inputForm" ref="inputForm" v-loading="loading" :class="method === 'view' ? 'readonly' : ''" :disabled="method === 'view'" label-width="120px">
        <el-row :gutter="15">
          <el-col :span="12">
            <el-form-item label="病害编码" prop="code" :rules="[{ required: true, message: '病害代码不能为空', trigger: 'blur' }]">
              <el-input v-model="inputForm.code" placeholder="请填写病害代码"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="病害名称" prop="name" :rules="[{ required: true, message: '病害名称不能为空', trigger: 'blur' }]">
              <el-input v-model="inputForm.name" placeholder="请填写病害名称"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="备注" prop="remark" :rules="[]">
              <el-input v-model="inputForm.remark" placeholder="请填写备注"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label-width="0">
              <el-tabs v-model="baseDiseaseTab">
                <el-tab-pane label="动态属性">
                  <el-button size="small" @click="addBaseDiseaseParamsRow" type="primary">新增</el-button>
                  <el-table border :data="inputForm.baseDiseaseParamsList" style="width: 100%">
                    <!-- <el-table-column prop="code" header-align="center" align="center" show-overflow-tooltip label="属性编码"> </el-table-column> -->
                    <el-table-column prop="name" header-align="center" align="center" show-overflow-tooltip label="属性名称"> </el-table-column>
                    <el-table-column prop="dailyInspectionNeed" show-overflow-tooltip label="日常巡查必填">
                      <template slot-scope="scope">
                        {{ $dictUtils.getDictLabel('yes_no', scope.row.dailyInspectionNeed, '否') }}
                      </template>
                    </el-table-column>
                    <el-table-column prop="offenInspectionNeed" show-overflow-tooltip label="经常检查必填">
                      <template slot-scope="scope">
                        {{ $dictUtils.getDictLabel('yes_no', scope.row.offenInspectionNeed, '否') }}
                      </template>
                    </el-table-column>
                    <el-table-column prop="paramType" header-align="center" align="center" show-overflow-tooltip label="属性类型"> </el-table-column>
                    <el-table-column prop="paramValue" header-align="center" align="center" show-overflow-tooltip label="属性定义"> </el-table-column>
                    <el-table-column prop="sort" show-overflow-tooltip label="显示顺序"> </el-table-column>
                    <el-table-column prop="remark" show-overflow-tooltip label="备注"> </el-table-column>
                    <el-table-column fixed="right" label="操作" width="150">
                      <template slot-scope="scope">
                        <el-button @click="editBaseDiseaseParamsRow(scope.row)" type="text" size="small">编辑</el-button>
                        <el-button @click="delBaseDiseaseParamsRow(scope.row)" type="text" size="small">删除</el-button>
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
    <BaseDiseaseParamsForm ref="baseDiseaseParamsForm" @addRow="saveBaseDiseaseParamsRow(arguments)"></BaseDiseaseParamsForm>
  </div>
</template>

<script>
import BaseDiseaseParamsForm from './BaseDiseaseParamsForm';
import SelectTree from '@/components/treeSelect/treeSelect.vue';
export default {
  data() {
    return {
      title: '',
      method: '',
      visible: false,
      loading: false,
      baseDiseaseTab: '0',
      inputForm: {
        id: '',
        baseDiseaseParamsList: [],
        code: '',
        name: '',
        status: '',
        remark: '',
      },
    };
  },
  components: {
    SelectTree,
    BaseDiseaseParamsForm,
  },
  methods: {
    init(method, id) {
      this.method = method;
      if (method === 'add') {
        this.title = `新建病害管理`;
      } else if (method === 'edit') {
        this.title = '修改病害管理';
      } else if (method === 'view') {
        this.title = '查看病害管理';
      }
      this.visible = true;
      this.loading = false;
      this.$nextTick(() => {
        this.$refs.inputForm.resetFields();
        this.inputForm.id = id;
        this.baseDiseaseTab = '0';
        this.inputForm.baseDiseaseParamsList = [];
        if (method === 'edit' || method === 'view') {
          // 修改或者查看
          this.loading = true;
          this.$http({
            url: `/basedisease/baseDisease/queryById?id=${this.inputForm.id}`,
            method: 'get',
          }).then(({ data }) => {
            this.inputForm = this.recover(this.inputForm, data.baseDisease);
            this.loading = false;
          });
        }
      });
    },
    saveBaseDiseaseParamsRow(child) {
      if (child[0] === '') {
        this.inputForm.baseDiseaseParamsList.push(child[1]);
      } else {
        this.inputForm.baseDiseaseParamsList.forEach((item, index) => {
          if (item === child[0]) {
            this.inputForm.baseDiseaseParamsList.splice(index, 1, child[1]);
          }
        });
      }
    },
    addBaseDiseaseParamsRow(child) {
      this.$refs.baseDiseaseParamsForm.init('add');
    },
    editBaseDiseaseParamsRow(child) {
      this.$refs.baseDiseaseParamsForm.init('edit', child);
    },
    delBaseDiseaseParamsRow(child) {
      this.inputForm.baseDiseaseParamsList.forEach((item, index) => {
        if (item === child) {
          this.inputForm.baseDiseaseParamsList.splice(index, 1);
        }
        // else if (item === child) {
        //   item.delFlag = '1';
        //   this.inputForm.baseDiseaseParamsList.splice(index, 1, item);
        // }
      });
    },
    // 表单提交
    doSubmit() {
      console.log(this.inputForm);
      this.$refs['inputForm'].validate((valid) => {
        if (valid) {
          this.loading = true;
          this.$http({
            url: `/basedisease/baseDisease/save`,
            method: 'post',
            contentType: 'json',
            data: this.inputForm,
          }).then(({ data }) => {
            this.loading = false;
            if (data && data.success) {
              this.visible = false;
              this.$message.success(data.msg);
              if (this.method === 'add') {
                this.$emit('refreshListAdd');
              } else {
                this.$emit('refreshDataList');
                this.$emit('refreshDataListSub', this.inputForm);
              }
            }
          });
        }
      });
    },
  },
};
</script>