<template>
  <div>
    <el-dialog :title="title" :close-on-click-modal="false" v-dialogDrag :visible.sync="visible">
      <el-form :model="inputForm" ref="inputForm" v-loading="loading" label-width="120px">
        <el-row :gutter="15">
          <el-col :span="12" v-if="title == '修改日常巡查制度'">
            <el-form-item label="制度编码" prop="code">
              <el-input v-model="inputForm.code" placeholder="请填写制度编码" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
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
            <el-form-item prop="bridge.id" :rules="[{ required: true, message: '项目不能为空', trigger: 'blur' }]">
              <template #label>
                项目
                <el-tooltip content="变更“项目”将清空巡查组、打卡等信息" placement="top-start">
                  <i class="el-icon-question"></i>
                </el-tooltip>
              </template>
              <el-cascader
                style="width: 100%"
                ref="cascader"
                v-model="inputForm.bridge.id"
                :options="treeData"
                :show-all-levels="false"
                :props="{ expandTrigger: 'hover' }"
                filterable
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="是否打卡"
              prop="needCheckpoint"
              :rules="[
                {
                  required: true,
                  message: '是否打卡不能为空',
                  trigger: 'blur',
                },
              ]"
            >
              <el-select v-model="inputForm.needCheckpoint" placeholder="请选择" style="width: 100%">
                <el-option v-for="item in this.$dictUtils.getDictList('yes_no')" :key="item.value" :label="item.label" :value="item.value"> </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="巡查组" prop="orgIds" :rules="[{ required: true, message: '巡查组不能为空', trigger: 'blur' }]">
              <el-select multiple v-model="inputForm.orgIds" placeholder="请选择" style="width: 100%">
                <el-option v-for="item in orgIdsData" :key="item.id" :label="item.name" :value="item.id"> </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="inputForm.remark" placeholder="请填写备注"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
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
          <el-col :span="6" style="margin-left: -130px">
            <el-form-item
              prop="rateUnit"
              :rules="[
                {
                  required: true,
                  message: '请选择',
                  trigger: 'blur',
                },
              ]"
            >
              <el-select v-model="inputForm.rateUnit" placeholder="" style="width: 100%">
                <el-option v-for="item in ['天', '周', '月', '年']" :key="item" :label="item" :value="item"> </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="5" style="margin-left: -130px">
            <el-form-item><span>1次</span> </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label-width="0">
              <el-tabs v-model="inspectRulesDailyTab">
                <el-tab-pane label="巡查项目">
                  <el-button size="small" @click="addInspectRulesItemsDailyRow('巡查项目', '', inputForm.inspectRulesItemsDailyList)" type="primary">新增</el-button>
                  <el-table size="small" border :data="inputForm.inspectRulesItemsDailyList" style="width: 100%">
                    <el-table-column prop="code" header-align="center" align="center" show-overflow-tooltip label="编码"> </el-table-column>
                    <el-table-column prop="name" header-align="center" align="center" show-overflow-tooltip label="巡查项目"> </el-table-column>
                    <el-table-column prop="count" header-align="center" align="center" show-overflow-tooltip label="构件数量"> </el-table-column>
                    <el-table-column fixed="right" label="操作" width="150">
                      <template slot-scope="scope">
                        <el-button @click="delInspectRulesItemsDailyRow(scope.row, '巡查项目')" type="text" size="small">删除</el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                </el-tab-pane>
                <el-tab-pane v-if="inputForm.needCheckpoint === '1'" label="打卡列表">
                  <el-button size="small" @click="addInspectRulesItemsDailyRow('打卡列表', inputForm.bridge.id, inputForm.inspectRulesCheckpointsDailyList)" type="primary">新增</el-button>
                  <el-table size="small" border :data="inputForm.inspectRulesCheckpointsDailyList" style="width: 100%">
                    <el-table-column prop="code" header-align="center" align="center" show-overflow-tooltip label="打卡点编码"> </el-table-column>
                    <el-table-column prop="name" header-align="center" align="center" show-overflow-tooltip label="打卡点名称"> </el-table-column>
                    <el-table-column fixed="right" label="操作" width="150">
                      <template slot-scope="scope">
                        <el-button @click="delInspectRulesItemsDailyRow(scope.row)" type="text" size="small">删除</el-button>
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
        <el-button type="primary" @click="doSubmit()" v-noMoreClick>确定</el-button>
      </span>
    </el-dialog>
    <InspectRulesItemsDailyForm ref="inspectRulesItemsDailyForm" @addRow="saveInspectRulesItemsDailyRow(arguments)"></InspectRulesItemsDailyForm>
  </div>
</template>

<script>
import InspectRulesItemsDailyForm from './InspectRulesItemsDailyForm';
export default {
  data() {
    return {
      treeData: [],
      orgIdsData: [],
      title: '',
      visible: false,
      loading: false,
      inspectRulesDailyTab: '0',
      inputForm: {
        id: '',
        inspectRulesCheckpointsDailyList: [],
        inspectRulesItemsDailyList: [],
        bridge: {
          id: '',
        },
        orgIds: [],
        orgNames: '',
        code: '',
        name: '',
        rate: '',
        rateUnit: '',
        needCheckpoint: '',
        remark: '',
        useable: '',
      },
    };
  },
  components: {
    InspectRulesItemsDailyForm,
  },
  watch: {
    'inputForm.needCheckpoint': function (val) {
      if (val === '0') {
        this.inspectRulesDailyTab = '0';
      }
    },
  },
  methods: {
    changeValue(value) {
      this.inputForm.rate = /^[0-9]*$/.test(parseInt(value)) ? String(parseInt(value)).replace('.', '') : '';
    },
    async init(method, id) {
      if (method === 'add') {
        this.title = `新建日常巡查制度`;
        this.inputForm.useable = 0;
      } else if (method === 'edit') {
        this.title = '修改日常巡查制度';
      }
      await this.refreshTree();
      this.loading = false;
      this.visible = true;
      this.$nextTick(() => {
        this.$refs.inputForm.resetFields();
        this.inputForm.id = id;
        this.inspectRulesDailyTab = '0';
        this.inputForm.inspectRulesCheckpointsDailyList = [];
        this.inputForm.inspectRulesItemsDailyList = [];
        if (method === 'edit') {
          // 修改
          this.loading = true;
          this.$http({
            url: `/inspectionrulesdaily/inspectRulesDaily/queryById?id=${this.inputForm.id}`,
            method: 'get',
          }).then(({ data }) => {
            const itemDailyList = [],
              pointDailyList = [];
            this.inputForm = this.recover(this.inputForm, data.inspectRulesDaily);
            data.inspectRulesDaily.inspectRulesCheckpointsDailyList.map((item) => {
              pointDailyList.push({ ...item, code: item.checkpointCode, name: item.checkpointName, id: item.checkpointId });
            });
            data.inspectRulesDaily.inspectRulesItemsDailyList.map((item) => {
              itemDailyList.push({ ...item, code: item.itemCode, name: item.itemName, id: item.itemId });
            });
            this.inputForm.inspectRulesCheckpointsDailyList = pointDailyList;
            this.inputForm.inspectRulesItemsDailyList = itemDailyList;
            this.inputForm.orgIds = data.inspectRulesDaily.orgIds.split(',');
            const bridgeBranchId = data.inspectRulesDaily.bridge.id; //查询桥梁分支id
            //查询桥梁分支列表
            // this.$http({
            //   url: `/bridge/bridgeBranch/list`,
            //   params: { id: bridgeBranchId },
            // }).then(({ data }) => {
            //   if (data && data.success) {
            //   }
            // });
            this.$http({
              url: `/sys/office/getChildrenList`,
              params: { parentId: bridgeBranchId },
            }).then(({ data }) => {
              if (data && data.success) {
                this.orgIdsData = data.childrenList;
              }
            });
            this.loading = false;
          });
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
    saveInspectRulesItemsDailyRow(child) {
      // let obj = {};
      // const arr = [...this.inputForm[child[1]], ...child[0]];
      // let peon = arr.reduce((cur, next) => {
      //   obj[next.id] ? '' : (obj[next.id] = true && cur.push(next));
      //   return cur;
      // }, []);
      this.inputForm[child[1]] = [...this.inputForm[child[1]], ...child[0]];
    },
    addInspectRulesItemsDailyRow(name, bridgeId, propList) {
      this.$refs.inspectRulesItemsDailyForm.init(name, bridgeId, propList);
    },
    delInspectRulesItemsDailyRow(child, name) {
      if (name == '巡查项目') {
        this.inputForm.inspectRulesItemsDailyList = this.inputForm.inspectRulesItemsDailyList.filter((v) => v.id !== child.id);
      } else {
        this.inputForm.inspectRulesCheckpointsDailyList = this.inputForm.inspectRulesCheckpointsDailyList.filter((v) => v.id !== child.id);
      }
    },
    //查询巡查组
    handleChange() {
      //组合桥选择桥梁分支，非组合桥选择桥梁
      this.inputForm.orgIds = [];
      // let id = this.$refs['cascader'].getCheckedNodes()[0].data.bridge?.id || this.$refs['cascader'].getCheckedNodes()[0].data.id;
      this.inputForm.bridge.id = this.$refs['cascader'].getCheckedNodes()[0].data.id;
      this.inputForm.needCheckpoint = '';
      this.$http({
        url: `/sys/office/getChildrenList`,
        params: { parentId: this.$refs['cascader'].getCheckedNodes()[0].data.id },
      }).then(({ data }) => {
        if (data && data.success) {
          this.orgIdsData = data.childrenList;
        }
      });
    },
    // 表单提交
    doSubmit() {
      const { inspectRulesItemsDailyList, inspectRulesCheckpointsDailyList, orgIds, needCheckpoint } = this.inputForm;
      const itemDailyList = [],
        pointDailyList = [];
      if (inspectRulesItemsDailyList.length) {
        inspectRulesItemsDailyList.map((v) => itemDailyList.push({ itemId: v.id }));
      }
      if (inspectRulesCheckpointsDailyList.length) {
        inspectRulesCheckpointsDailyList.map((v) => pointDailyList.push({ checkpointId: v.id }));
      }
      this.$refs['inputForm'].validate((valid) => {
        if (valid) {
          this.loading = true;
          this.$http({
            url: `/inspectionrulesdaily/inspectRulesDaily/save`,
            contentType: 'json',
            method: 'post',
            data: {
              ...this.inputForm,
              inspectRulesItemsDailyList: itemDailyList,
              inspectRulesCheckpointsDailyList: needCheckpoint === '1' ? pointDailyList : [],
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
        }
      });
    },
  },
};
</script>