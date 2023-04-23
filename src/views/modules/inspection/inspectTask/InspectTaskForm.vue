<template>
  <div>
    <el-dialog :title="title" :close-on-click-modal="false" v-dialogDrag :visible.sync="visible">
      <el-form :model="inputForm" ref="inputForm" v-loading="loading" label-width="120px">
        <el-row :gutter="15">
          <el-col :span="12">
            <el-form-item label="任务编码">
              <el-input v-model="inspectRulesInstance.code" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="任务名称">
              <el-input v-model="inspectRulesInstance.name" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="任务类型">
              <el-input value="日常检查" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="项目">
              <el-input v-model="inspectRulesInstance.bridgeName + ' ' + inspectRulesInstance.bridgeBranchName" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="完成时间">
              <el-input v-model="inspectRulesInstance.factTimeStr" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="巡检人">
              <el-input v-model="inspectRulesInstance.factInspectorNames" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="审核结果"
              prop="auditResult"
              :rules="[
                {
                  required: true,
                  message: '审核结果不能为空',
                  trigger: 'blur',
                },
              ]"
            >
              <el-select v-model="inputForm.auditResult" placeholder="请选择" style="width: 100%" :disabled="method === 'view'">
                <el-option
                  v-for="item in [
                    { label: '通过', value: 'PASS' },
                    { label: '不通过', value: 'NOT_PASS' },
                    { label: ' ', value: 'UNKNOWN' },
                  ]"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="任务评分"
              prop="evaluate.id"
              :rules="[
                {
                  required: true,
                  message: '任务评分不能为空',
                  trigger: 'blur',
                },
              ]"
            >
              <el-select v-model="inputForm.evaluate.id" placeholder="请选择" style="width: 100%" :disabled="method === 'view'">
                <el-option v-for="item in evaluateList" :key="item.id" :label="item.name" :value="item.id"> </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label-width="0">
              <el-tabs v-model="inspectRulesDailyTab">
                <el-tab-pane label="巡查项目">
                  <el-table size="small" border :data="inspectRulesItemsDailyInstList" style="width: 100%">
                    <el-table-column prop="itemCode" header-align="center" align="center" show-overflow-tooltip label="编码"> </el-table-column>
                    <el-table-column prop="itemName" header-align="center" align="center" show-overflow-tooltip label="巡查项目"> </el-table-column>
                    <el-table-column prop="status" header-align="center" align="center" show-overflow-tooltip label="状态">
                      <template slot-scope="scope">
                        <span v-if="scope.row.status === 'NOT_CHECKED'">未检</span>
                        <span v-else-if="scope.row.status === 'NORMAL'">正常</span>
                        <span v-else="scope.row.status === 'ABNORMAL'">异常</span>
                      </template>
                    </el-table-column>
                    <el-table-column prop="operatorNames" header-align="center" align="center" show-overflow-tooltip label="巡查人"> </el-table-column>
                    <el-table-column prop="inspectTime" header-align="center" align="center" show-overflow-tooltip label="巡查时间"> </el-table-column>
                  </el-table>
                </el-tab-pane>
                <el-tab-pane label="打卡信息">
                  <el-table size="small" border :data="inspectRulesCheckpointsDailyInstList" style="width: 100%">
                    <el-table-column prop="checkpointCode" header-align="center" align="center" show-overflow-tooltip label="打卡点编码"> </el-table-column>
                    <el-table-column prop="checkpointName" header-align="center" align="center" show-overflow-tooltip label="打卡点名称"> </el-table-column>
                    <el-table-column prop="checkpointLocation" header-align="center" align="center" show-overflow-tooltip label="打卡位置"> </el-table-column>
                    <el-table-column prop="status" header-align="center" align="center" show-overflow-tooltip label="打卡状态">
                      <template slot-scope="scope">
                        <span v-if="scope.row.status === 'CHECKPOINT_NO'">未打卡</span>
                        <span v-else-if="scope.row.status === 'CHECKPOINT_YES'">已打卡</span>
                      </template>
                    </el-table-column>
                    <el-table-column prop="userName" header-align="center" align="center" show-overflow-tooltip label="打卡人"> </el-table-column>
                    <el-table-column prop="inspectTime" header-align="center" align="center" show-overflow-tooltip label="打卡时间"> </el-table-column>
                  </el-table>
                </el-tab-pane>
                <el-tab-pane label="病害信息">
                  <el-table size="small" border :data="inspectDailyInstanceDiseaseList" style="width: 100%">
                    <el-table-column prop="componentCode" header-align="center" align="center" show-overflow-tooltip label="构件编码"> </el-table-column>
                    <el-table-column prop="componentName" header-align="center" align="center" show-overflow-tooltip label="构件名称"> </el-table-column>
                    <el-table-column prop="componentPosName" header-align="center" align="center" show-overflow-tooltip label="构件位置"> </el-table-column>
                    <el-table-column prop="diseaseTypeName" header-align="center" align="center" show-overflow-tooltip label="病害类型"> </el-table-column>
                    <el-table-column prop="diseaseName" header-align="center" align="center" show-overflow-tooltip label="同病害"> </el-table-column>
                    <el-table-column prop="status" header-align="center" align="center" show-overflow-tooltip label="审核状态">
                      <template slot-scope="scope">
                        <div v-if="method === 'view'">
                          <span v-if="scope.row.status === 'VALID'">有效</span>
                          <span v-else-if="scope.row.status === 'INVALID'">无效</span>
                          <span v-else="scope.row.status === 'NOT_AUDIT'">未审核</span>
                        </div>
                        <el-select v-else v-model="scope.row.status" placeholder="请选择" style="width: 100%" @change="diseaseStatusChange($event, scope)">
                          <el-option
                            v-for="item in [
                              { label: '有效', value: 'VALID' },
                              { label: '无效', value: 'INVALID' },
                              { label: '未审核', value: 'NOT_AUDIT' },
                            ]"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                          >
                          </el-option>
                        </el-select>
                      </template>
                    </el-table-column>
                    <el-table-column label="操作" align="center">
                      <template slot-scope="scope">
                        <el-button @click="view(scope.row)" type="text" size="small">查看详情</el-button>
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
        <el-button v-if="method === 'audit'" type="primary" @click="allValid()" v-noMoreClick>全部有效</el-button>
        <el-button v-if="method === 'audit'" type="primary" @click="saveDisease()" v-noMoreClick>保存草稿</el-button>
        <el-button v-if="method === 'audit'" type="primary" @click="doSubmit()" v-noMoreClick>提交</el-button>
        <el-button v-if="method === 'view'" type="primary" @click="gpsView()" v-noMoreClick>查看巡查轨迹</el-button>
        <el-button @click="visible = false">关闭</el-button>
      </span>
    </el-dialog>
    <InspectTaskDetail ref="inspectTaskDetail"></InspectTaskDetail>
    <InspectGpsDetail ref="inspectGpsDetail"></InspectGpsDetail>
  </div>
</template>

<script>
import InspectTaskDetail from './InspectTaskDetail';
import InspectGpsDetail from './InspectGpsDetail';
export default {
  components: { InspectTaskDetail, InspectGpsDetail },
  data() {
    return {
      title: '',
      method: '',
      visible: false,
      loading: false,
      inspectRulesInstance: {}, //表单详情
      inspectRulesDailyTab: '0',
      evaluateList: [], //评分
      inspectRulesCheckpointsDailyInstList: [],
      inspectRulesItemsDailyInstList: [],
      inspectDailyInstanceDiseaseList: [],
      inputForm: {
        id: '',
        auditResult: '',
        evaluate: { id: '' },
      },
    };
  },
  methods: {
    init(method, row) {
      this.method = method;
      if (method === 'view') {
        this.title = `查看日常巡查任务`;
      } else if (method === 'audit') {
        this.title = '审核日常巡查任务';
      }
      this.loading = false;
      this.visible = true;
      this.$nextTick(() => {
        this.$refs.inputForm.resetFields();
        this.inputForm.id = row.id;
        this.inspectRulesDailyTab = '0';
        this.loading = true;
        if (method === 'audit') {
          this.$http({
            url: `/baseinfo/basetype/baseType/treeData`,
          }).then(({ data }) => {
            this.evaluateList = data.treeData.filter((v) => v.name == '任务评分')[0].children;
          });
        }
        if (method === 'view') {
          this.inputForm.auditResult = row.auditResult;
          this.inputForm.evaluate.id = row.evaluate?.name;
        }
        this.$http({
          url: `/dailyinspectruleinstance/inspectRulesInstance/queryById?id=${this.inputForm.id}`,
          method: 'get',
        }).then(({ data }) => {
          this.inspectRulesCheckpointsDailyInstList = data.inspectRulesCheckpointsDailyInstList;
          this.inspectRulesItemsDailyInstList = data.inspectRulesItemsDailyInstList;
          this.inspectDailyInstanceDiseaseList = data.inspectDailyInstanceDiseaseList;
          this.inspectRulesInstance = data.inspectRulesInstance;
          this.loading = false;
        });
      });
    },
    view() {
      this.$refs.inspectTaskDetail.init(this.inspectDailyInstanceDiseaseList);
    },
    //查看轨迹
    gpsView() {
      if (!this.inspectRulesInstance.factInspectorNames) {
        this.$message.error('暂无实际巡查人员，无法查看轨迹！');
      } else {
        this.$refs.inspectGpsDetail.init(this.inspectRulesInstance);
      }
    },
    allValid() {
      const arr = [];
      this.inspectDailyInstanceDiseaseList.map((item) => {
        arr.push({ ...item, status: 'VALID' });
      });
      this.inspectDailyInstanceDiseaseList = arr;
    },
    diseaseStatusChange(val, scope) {
      this.inspectDailyInstanceDiseaseList[scope.$index].status = val;
    },
    // 保存草稿
    saveDisease() {
      this.$refs['inputForm'].validate((valid) => {
        if (valid) {
          this.loading = true;
          this.$http({
            url: `/dailyinspectruleinstance/inspectRulesInstance/batchSaveDiseaseStatus`,
            method: 'post',
            data: {
              ...this.inputForm,
              inspectDailyInstanceDiseaseList: this.inspectDailyInstanceDiseaseList,
            },
          }).then(({ data }) => {
            this.loading = false;
            if (data && data.success) {
              this.$message.success(data.msg);
            }
          });
        }
      });
    },
    // 表单提交
    doSubmit() {
      this.$refs['inputForm'].validate((valid) => {
        if (valid) {
          this.loading = true;
          this.$http({
            url: `/dailyinspectruleinstance/inspectRulesInstance/audit`,
            method: 'post',
            data: {
              ...this.inputForm,
              inspectDailyInstanceDiseaseList: this.inspectDailyInstanceDiseaseList,
            },
          })
            .then(({ data }) => {
              this.loading = false;
              if (data && data.success) {
                this.visible = false;
                this.$message.success(data.msg);
                this.$emit('refreshDataList');
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
