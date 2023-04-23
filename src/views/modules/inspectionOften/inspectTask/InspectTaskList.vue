<template>
  <div>
    <el-form :inline="true" v-show="isSearchCollapse" class="query-form" ref="searchForm" :model="searchForm" @keyup.enter.native="refreshList()" @submit.native.prevent>
      <!-- 搜索框-->
      <el-form-item prop="code">
        <el-input size="small" v-model="searchForm.code" placeholder="任务编码" clearable></el-input>
      </el-form-item>
      <el-form-item prop="name">
        <el-input size="small" v-model="searchForm.name" placeholder="任务名称" clearable></el-input>
      </el-form-item>
      <el-form-item prop="bridgeId">
        <el-cascader
          size="small"
          ref="cascader"
          v-model="searchForm.bridgeId"
          :options="treeData"
          :show-all-levels="false"
          :props="{ expandTrigger: 'hover' }"
          @change="handleChange"
          placeholder="请选择桥梁"
        ></el-cascader>
      </el-form-item>
      <el-form-item prop="checkStatus">
        <el-select size="small" v-model="searchForm.checkStatus" placeholder="检查状态" style="width: 100%">
          <el-option
            v-for="item in [
              { name: '未检', value: 'NOT_CHECKED' },
              { name: '正常', value: 'NORMAL' },
              { name: '异常', value: 'ABNORMAL' },
            ]"
            :key="item.value"
            :label="item.name"
            :value="item.value"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item prop="auditResult">
        <el-select size="small" v-model="searchForm.auditResult" placeholder="审核结果" style="width: 100%">
          <el-option
            v-for="item in [
              { name: '通过', value: 'PASS' },
              { name: '不通过', value: 'NOT_PASS' },
              { name: '未知', value: 'UNKNOWN' },
            ]"
            :key="item.value"
            :label="item.name"
            :value="item.value"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item prop="evaluateId">
        <el-select size="small" v-model="searchForm.evaluateId" placeholder="任务评分" style="width: 100%">
          <el-option
            v-for="item in [
              { name: '良好', value: '0563351dd80843869424a2db1fc94993' },
              { name: '优秀', value: '5f4779740584458d8d1e6c0f2df46f4e' },
            ]"
            :key="item.value"
            :label="item.name"
            :value="item.value"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item prop="planTime">
        <el-date-picker size="small" v-model="planTime" type="daterange" range-separator="至" start-placeholder="计划开始日期" end-placeholder="计划结束日期"> </el-date-picker>
      </el-form-item>
      <el-form-item prop="factTime">
        <el-date-picker size="small" v-model="factTime" type="daterange" range-separator="至" start-placeholder="完成开始日期" end-placeholder="完成结束日期"> </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="refreshList()" size="small">查询</el-button>
        <el-button @click="resetSearch()" size="small">重置</el-button>
      </el-form-item>
    </el-form>
    <el-row>
      <el-button :disabled="dataListSelections.length <= 0" type="primary" size="small" @click="del()">批量删除</el-button>
      <el-button :disabled="dataListSelections.length <= 0" type="primary" size="small" @click="batchAllot()">批量分配</el-button>
      <el-button :disabled="dataListSelections.length <= 0" type="primary" size="small" @click="batchTerminate()">批量召回</el-button>
      <el-button-group class="pull-right">
        <el-button type="default" size="small" icon="el-icon-search" @click="(isSearchCollapse = !isSearchCollapse), (isImportCollapse = false)"> </el-button>
        <el-button type="default" size="small" icon="el-icon-refresh" @click="refreshList"> </el-button>
      </el-button-group>
    </el-row>
    <br />
    <el-row>
      <el-tabs v-model="activeName" type="card" @tab-click="handleClick">
        <el-tab-pane label="待分配" name="WAIT_FOR_ALLOT"></el-tab-pane>
        <el-tab-pane label="待检查" name="WAIT_FOR_INSPECT"></el-tab-pane>
        <el-tab-pane label="检查中" name="INSPECTING"></el-tab-pane>
        <el-tab-pane label="待审核" name="WAIT_FOR_AUDIT"></el-tab-pane>
        <el-tab-pane label="已完成" name="COMPLETE"></el-tab-pane>
        <el-tab-pane label="已召回" name="STOP"></el-tab-pane>
      </el-tabs>
    </el-row>
    <el-table table-layout="auto" :data="dataList" border @selection-change="selectionChangeHandle" v-loading="loading" class="tableAuto">
      <el-table-column type="selection" header-align="center" align="center" width="50"> </el-table-column>
      <el-table-column prop="code" label="任务编码" :width="flexWidth('code', dataList, '任务编码')"> </el-table-column>
      <el-table-column prop="name" label="任务名称" :width="flexWidth('name', dataList, '任务名称')"> </el-table-column>
      <el-table-column label="任务状态" width="100">{{ activeLabel }}</el-table-column>
      <el-table-column prop="bridgeName" label="任务项目" width="200">
        <template slot-scope="scope"> {{ scope.row.bridgeName }} {{ scope.row.bridgeBranchName }} </template>
      </el-table-column>
      <el-table-column prop="maintainOrgName" label="养护单位" width="150"> </el-table-column>
      <el-table-column prop="checkStatus" label="检查状态" :width="flexWidth('checkStatus', dataList, '检查状态')">
        <template slot-scope="scope">
          <span v-if="scope.row.checkStatus === 'NOT_CHECKED'">未检</span>
          <span v-else-if="scope.row.checkStatus === 'NORMAL'">正常</span>
          <span v-else="scope.row.checkStatus === 'ABNORMAL'">异常</span>
        </template>
      </el-table-column>
      <el-table-column prop="planOrgNames" label="计划检查组" :width="flexWidth('planOrgNames', dataList, '计划检查组')"> </el-table-column>
      <el-table-column prop="planInspectorNames" label="计划检查人员" :width="flexWidth('planInspectorNames', dataList, '计划检查人员')"> </el-table-column>
      <el-table-column prop="planTimeStr" label="计划任务时间" width="330">
        <template slot-scope="scope"> {{ scope.row.planStartTime }}至{{ scope.row.planEndTime }} </template>
      </el-table-column>
      <el-table-column prop="factEndTime" label="检查结束时间" :width="flexWidth('factEndTime', dataList, '检查结束时间')"> </el-table-column>
      <el-table-column prop="factInspectorNames" label="实际检查人员" :width="flexWidth('factInspectorNames', dataList, '实际检查人员')"> </el-table-column>
      <el-table-column prop="completionRate" label="任务完成度" :width="flexWidth('completionRate', dataList, '任务完成度')">
        <template slot-scope="scope">
          {{ scope.row.completionRate ? (scope.row.completionRate * 100).toFixed(2) + '%' : '' }}
        </template>
      </el-table-column>
      <el-table-column prop="auditResult" label="审核结果" :width="flexWidth('auditResult', dataList, '审核结果')">
        <template slot-scope="scope">
          <span v-if="scope.row.auditResult === 'PASS'">通过</span>
          <span v-else-if="scope.row.auditResult === 'NOT_PASS'">不通过</span>
          <span v-else="scope.row.auditResult === 'UNKNOWN'"></span>
        </template>
      </el-table-column>
      <el-table-column prop="evaluateName" label="任务评分" :width="flexWidth('evaluate.name', dataList, '任务评分')"> </el-table-column>
      <el-table-column prop="createBy.name" label="创建人" :width="flexWidth('createBy.name', dataList, '创建人')"> </el-table-column>
      <el-table-column prop="createDate" label="创建时间" :width="flexWidth('createDate', dataList, '创建时间')"> </el-table-column>
      <el-table-column prop="remark" label="备注" :width="flexWidth('remark', dataList, '备注')"> </el-table-column>
      <el-table-column fixed="right" header-align="center" align="center" :width="activeLabel == '待分配' ? 210 : 100" label="操作">
        <template slot-scope="scope">
          <el-button type="text" size="small" @click="view(scope.row)">查看</el-button>
          <el-button v-if="activeLabel == '待分配'" type="text" icon="el-icon-delete" size="small" @click="del(scope.row.id)">删除</el-button>
          <el-button v-if="activeLabel == '待分配'" type="text" size="small" @click="batchAllot(scope.row.id)">分配</el-button>
          <el-button v-if="activeLabel == '待检查' || activeLabel == '检查中'" type="text" size="small" @click="batchTerminate(scope.row.id)">召回</el-button>
          <el-button v-if="activeLabel == '待审核'" type="text" size="small" @click="audit(scope.row)">审核</el-button>
          <el-button v-if="activeLabel == '待分配'" type="text" size="small" @click="changeOrgIds(scope.row)">变更巡查组</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      @size-change="sizeChangeHandle"
      @current-change="currentChangeHandle"
      :current-page="pageNo"
      :page-sizes="[10, 20, 50, 100]"
      :page-size="pageSize"
      :total="total"
      background
      layout="total, sizes, prev, pager, next, jumper"
    >
    </el-pagination>
    <!-- 弹窗, 新增 / 修改 -->
    <InspectTaskForm ref="inspectTaskForm" @refreshDataList="refreshList"></InspectTaskForm>
    <InspectTaskFormSim ref="inspectTaskFormSim" @refreshDataList="refreshList"></InspectTaskFormSim>
    <InspectTaskTreeForm ref="inspectTaskTreeForm" @refreshDataList="refreshList"></InspectTaskTreeForm>
  </div>
</template>
<script>
import moment from 'moment';
import InspectTaskForm from './InspectTaskForm';
import InspectTaskFormSim from './InspectTaskFormSim';
import InspectTaskTreeForm from './InspectTaskTreeForm';
export default {
  data() {
    return {
      activeName: 'WAIT_FOR_ALLOT',
      activeLabel: '待分配',
      treeData: [],
      planTime: '',
      factTime: '',
      searchForm: {
        code: '',
        name: '',
        bridgeId: '',
        checkStatus: '',
        auditResult: '',
        evaluateId: '',
      },
      dataList: [],
      pageNo: 1,
      pageSize: 10,
      total: 0,
      dataListSelections: [],
      isSearchCollapse: false,
      loading: false,
    };
  },
  components: {
    InspectTaskForm,
    InspectTaskFormSim,
    InspectTaskTreeForm,
  },
  activated() {
    this.refreshList();
    this.refreshTree();
  },
  methods: {
    handleClick(tab) {
      this.activeName = tab.name;
      this.activeLabel = tab.label;
      this.refreshList();
    },
    //桥选择
    handleChange() {
      this.searchForm.bridgeId = this.$refs['cascader'].getCheckedNodes()[0].value;
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
            if (item.children?.length || item.bridgeList?.length) {
              rewriteKey(item.children);
            }
          });
        }
        rewriteKey(data.bridgeList);
        this.treeData = data.bridgeList;
      });
    },
    // 获取数据列表
    refreshList() {
      this.loading = true;
      this.$http({
        url: '/routinerulesinstance/inspectRulesInstanceRoutine/list',
        method: 'get',
        params: {
          pageNo: this.pageNo,
          pageSize: this.pageSize,
          orderBy: 'a.plan_end_time',
          status: this.activeName,
          ...this.searchForm,
          planStartTime: this.planTime[0] && moment(this.planTime[0]).format('YYYY-MM-DD'),
          planEndTime: this.planTime[0] && moment(this.planTime[1]).format('YYYY-MM-DD'),
          factStartTime: this.factTime[0] && moment(this.factTime[0]).format('YYYY-MM-DD'),
          factEndTime: this.factTime[0] && moment(this.factTime[1]).format('YYYY-MM-DD'),
        },
      })
        .then(({ data }) => {
          if (data && data.success) {
            this.dataList = data.page.list;
            this.total = data.page.count;
            this.loading = false;
          }
        })
        .catch(() => {
          this.loading = false;
        });
    },
    // 每页数
    sizeChangeHandle(val) {
      this.pageSize = val;
      this.pageNo = 1;
      this.refreshList();
    },
    // 当前页
    currentChangeHandle(val) {
      this.pageNo = val;
      this.refreshList();
    },
    // 多选
    selectionChangeHandle(val) {
      this.dataListSelections = val;
    },
    changeOrgIds(row) {
      this.$refs.inspectTaskTreeForm.init(row);
    },
    // 删除
    del(id) {
      let ids =
        id ||
        this.dataListSelections
          .map((item) => {
            return item.id;
          })
          .join(',');
      this.$confirm(`确定删除所选项吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        this.loading = true;
        this.$http({
          url: '/routinerulesinstance/inspectRulesInstanceRoutine/batchDelete',
          method: 'delete',
          params: { ids: ids },
        })
          .then(({ data }) => {
            if (data && data.success) {
              this.$message.success('删除成功');
              this.refreshList();
            }
            this.loading = false;
          })
          .catch(() => {
            this.loading = false;
          });
      });
    },
    batchAllot(id) {
      let ids =
        id ||
        this.dataListSelections
          .map((item) => {
            return item.id;
          })
          .join(',');
      this.$http({
        url: '/routinerulesinstance/inspectRulesInstanceRoutine/preAllotCheck',
        params: { ids: ids },
      })
        .then(({ data }) => {
          if (data && data.success) {
            this.$confirm(`${typeof data.msg === 'object' ? data.msg.join() : '确定分配所选项吗?'} `, '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning',
            }).then(() => {
              this.loading = true;
              this.$http({
                url: '/routinerulesinstance/inspectRulesInstanceRoutine/batchAllot',
                method: 'post',
                params: { ids: ids },
              })
                .then(({ data }) => {
                  if (data && data.success) {
                    this.$message.success('分配成功');
                    this.refreshList();
                  }
                  this.loading = false;
                })
                .catch(() => {
                  this.loading = false;
                });
            });
          }
          this.loading = false;
        })
        .catch(() => {
          this.loading = false;
        });
    },
    batchTerminate(id) {
      let ids =
        id ||
        this.dataListSelections
          .map((item) => {
            return item.id;
          })
          .join(',');
      this.$confirm(`任务召回后将自动终止，是否继续对所选项执行召回操作?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        this.loading = true;
        this.$http({
          url: '/routinerulesinstance/inspectRulesInstanceRoutine/batchTerminate',
          method: 'post',
          params: { ids: ids },
        })
          .then(({ data }) => {
            if (data && data.success) {
              this.$message.success('召回成功');
              this.refreshList();
            }
            this.loading = false;
          })
          .catch(() => {
            this.loading = false;
          });
      });
    },
    audit(row) {
      // 1.无病害走简易审核
      // 2.有病害 病害是否审核打开走复杂审核
      // 3.有病害 病害是否审核关闭走简单审核
      this.$http({
        url: '/syssetting/sysSetting/getlist',
      }).then(({ data }) => {
        if (data && data.success) {
          const value = data.list.filter((v) => v.code === 'routine_auto_audit')[0].value1;
          if (row.diseaseCount) {
            if (value === '1') {
              this.$refs.inspectTaskForm.init('audit', row);
            } else {
              this.$refs.inspectTaskFormSim.init(row);
            }
          }
        }
      });
    },
    //查看
    view(row) {
      this.$refs.inspectTaskForm.init('view', row);
    },
    resetSearch() {
      this.$refs.searchForm.resetFields();
      this.planTime = '';
      this.factTime = '';
      this.refreshList();
    },
  },
};
</script>