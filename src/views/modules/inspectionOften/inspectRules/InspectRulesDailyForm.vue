<template>
  <div>
    <el-dialog :title="title" :close-on-click-modal="false" v-dialogDrag :visible.sync="visible">
      <el-form :model="inputForm" ref="inputForm" v-loading="loading" label-width="120px">
        <el-row>
          <el-col :span="20" v-if="title == '修改经常检查制度'">
            <el-form-item label="制度编码">
              <el-input placeholder="请填写制度编码" :value="inputForm.code" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="20">
            <el-form-item
              label="制度名称"
              prop="name"
              :rules="[
                {
                  required: true,
                  message: '制度名称不能为空',
                  trigger: 'blur',
                },
              ]"
            >
              <el-input v-model="inputForm.name" placeholder="请填写制度名称"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="制度频率 每"
              prop="rate"
              :rules="[
                {
                  required: true,
                  message: '请输入',
                  trigger: 'blur',
                },
              ]"
            >
              <el-input v-model="inputForm.rate" @input="changeValue"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12" style="margin-left: -110px">
            <el-form-item
              prop="rateUnit"
              :rules="[
                {
                  required: true,
                  message: '频率单位不能为空',
                  trigger: 'blur',
                },
              ]"
            >
              <el-select v-model="inputForm.rateUnit" placeholder="" style="width: 100%">
                <el-option v-for="item in ['天', '周', '月', '年']" :key="item" :label="item" :value="item"> </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="10" style="margin-left: -110px">
            <el-form-item><span>1次</span> </el-form-item>
          </el-col>
          <el-col :span="20">
            <el-form-item label="项目" prop="bridgeId" :rules="[{ required: true, message: '项目不能为空', trigger: 'blur' }]">
              <el-cascader
                style="width: 100%"
                ref="cascader"
                v-model="inputForm.bridgeId"
                :options="treeData"
                :show-all-levels="false"
                :props="{ expandTrigger: 'hover' }"
                filterable
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-col>
          <el-col :span="20">
            <el-form-item label="检查组" prop="orgIds" :rules="[{ required: true, message: '检查组不能为空', trigger: 'blur' }]">
              <el-select multiple v-model="inputForm.orgIds" placeholder="请选择" style="width: 100%">
                <el-option v-for="item in orgIdsData" :key="item.id" :label="item.name" :value="item.id"> </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="20">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="inputForm.remark" placeholder="请填写备注"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row class="baseTree">
          <el-col :span="20">
            <el-input size="small" placeholder="输入关键字进行过滤" v-model="filterText"> </el-input>
            <el-tree
              ref="tree"
              :data="basetreeData"
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
        <el-button type="primary" @click="doSubmit()" v-noMoreClick>确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      filterText: '',
      treeData: [],
      basetreeData: [],
      orgIdsData: [],
      title: '',
      visible: false,
      loading: false,
      defaultChecked: [],
      inputForm: {
        id: '',
        code: '',
        bridgeId: '',
        orgIds: [],
        orgNames: '',
        name: '',
        rate: '',
        rateUnit: '',
        remark: '',
        useable: '0',
        inspectRulesComponentRoutineList: [],
      },
    };
  },
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val);
    },
  },
  methods: {
    changeValue(value) {
      this.inputForm.rate = /^[0-9]*$/.test(parseInt(value)) ? String(parseInt(value)).replace('.', '') : '';
    },
    filterNode(value, data) {
      if (!value) return true;
      return data.name.indexOf(value) !== -1;
    },
    init(method, id) {
      if (method === 'add') {
        this.title = `新建经常检查制度`;
      } else if (method === 'edit') {
        this.title = '修改经常检查制度';
      }
      this.refreshTree();
      this.loading = false;
      this.visible = true;
      this.basetreeData = [];
      this.defaultChecked = [];
      this.$nextTick(() => {
        this.$refs.inputForm.resetFields();
        this.inputForm.id = id;
        if (method === 'edit') {
          // 修改
          this.loading = true;
          this.$http({
            url: `/routinerules/inspectRulesRoutine/queryById?id=${this.inputForm.id}`,
            method: 'get',
          }).then(({ data }) => {
            this.inputForm = this.recover(this.inputForm, data.inspectRulesRoutine);
            this.inputForm.orgIds = data.inspectRulesRoutine.orgIds.split(',');
            this.defaultChecked = data.inspectRulesRoutine.inspectRulesComponentRoutineList.map((v) => v.componentId);
            const bridgeBranchId = data.inspectRulesRoutine.bridgeId; //查询桥梁分支id
            this.baseTree();
            //查询桥梁分支列表
            // this.$http({
            //   url: `/bridge/bridgeBranch/list`,
            //   params: { id: bridgeBranchId },
            // }).then(({ data }) => {
            //   if (data && data.success) {
            //   }
            // });
            // 查询巡查组
            this.$http({
              url: `/sys/office/getChildrenList`,
              params: { parentId: bridgeBranchId },
            }).then(({ data }) => {
              if (data && data.success) {
                this.orgIdsData = data.childrenList;
              }
              this.loading = false;
            });
          });
        }
      });
    },
    // 获取构件类型树形列表
    baseTree() {
      this.$http({
        url: `/routinerules/inspectRulesRoutine/treeComponentData`,
        params: { id: this.inputForm.id, bridgeId: this.inputForm.bridgeId },
      }).then(({ data }) => {
        if (data && data.success) {
          this.basetreeData = data.treeData;
        }
      });
    },
    // 获取桥梁的树形列表
    refreshTree() {
      this.$http({
        url: `/bridge/bridge/treeData`,
        method: 'get',
        params: { status: 1 },
      }).then(({ data }) => {
        function rewriteKey(val) {
          val.forEach((item) => {
            item.label = item.name;
            item.value = item.id;
            if (item.bridgeList?.length) {
              item.children = item.bridgeList;
            }
            if (item.bridgeBranchList?.length) {
              item.children = item.bridgeBranchList;
            }
            if (item.children?.length || item.bridgeList?.length || item.bridgeBranchList?.length) {
              rewriteKey(item.children);
            }
          });
        }
        rewriteKey(data.bridgeList);
        this.treeData = data.bridgeList;
      });
    },
    //查询巡查组
    handleChange() {
      this.inputForm.orgIds = [];
      // let id = this.$refs['cascader'].getCheckedNodes()[0].data.bridge?.id || this.$refs['cascader'].getCheckedNodes()[0].data.id;
      this.inputForm.bridgeId = this.$refs['cascader'].getCheckedNodes()[0].data.id;
      this.$http({
        url: `/sys/office/getChildrenList`,
        params: { parentId: this.$refs['cascader'].getCheckedNodes()[0].data.id },
      }).then(({ data }) => {
        if (data && data.success) {
          this.orgIdsData = data.childrenList;
        }
      });
      this.baseTree();
    },
    //桥梁构件选择
    handleCheckChange() {
      const list = this.$refs.tree.getCheckedKeys(true),
        arr = [];
      list.map((v) => arr.push({ componentId: v }));
      this.inputForm.inspectRulesComponentRoutineList = arr;
    },
    // 表单提交
    doSubmit() {
      const { orgIds } = this.inputForm;
      this.$refs['inputForm'].validate((valid) => {
        if (valid) {
          this.loading = true;
          this.$http({
            url: `/routinerules/inspectRulesRoutine/preSaveCheck`,
            contentType: 'json',
            method: 'post',
            data: {
              id: this.inputForm.id,
              bridgeId: this.inputForm.bridgeId,
              inspectRulesComponentRoutineList: this.inputForm.inspectRulesComponentRoutineList,
            },
          }).then(({ data }) => {
            if (data && data.success) {
              this.$confirm(data.prompt || '确定保存所填项吗?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
              })
                .then(() => {
                  this.$http({
                    url: `/routinerules/inspectRulesRoutine/save`,
                    contentType: 'json',
                    method: 'post',
                    data: {
                      ...this.inputForm,
                      orgIds: orgIds.join(),
                      orgNames: this.orgIdsData
                        .filter((item) => orgIds.includes(item.id))
                        .map((v) => v.name)
                        .join(),
                    },
                  }).then(({ data }) => {
                    this.loading = false;
                    if (data && data.success) {
                      this.visible = false;
                      this.$message.success(data.msg);
                      this.$emit('refreshDataList');
                    }
                  });
                })
                .catch(() => {
                  this.loading = false;
                });
            } else {
              this.loading = false;
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
.el-row {
  width: 50%;
}
.baseTree {
  margin-left: 80px;
}
</style>