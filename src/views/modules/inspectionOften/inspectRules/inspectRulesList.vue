<template>
  <div>
    <el-form :inline="true" v-show="isSearchCollapse" class="query-form" ref="searchForm" :model="searchForm" @keyup.enter.native="refreshList()" @submit.native.prevent>
      <!-- 搜索框-->
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
      <el-form-item prop="name">
        <el-input size="small" v-model="searchForm.name" placeholder="制度名称" clearable></el-input>
      </el-form-item>
      <el-form-item prop="useable">
        <el-select size="small" v-model="searchForm.useable" placeholder="请选择状态" style="width: 100%">
          <el-option v-for="item in $dictUtils.getDictList('enable_status')" :key="item.value" :label="item.label" :value="item.value"> </el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="refreshList()" size="small">查询</el-button>
        <el-button @click="resetSearch()" size="small">重置</el-button>
      </el-form-item>
    </el-form>
    <el-row>
      <el-button type="primary" size="small" icon="el-icon-plus" @click="add()">新建</el-button>
      <el-button-group class="pull-right">
        <el-button type="default" size="small" icon="el-icon-search" @click="isSearchCollapse = !isSearchCollapse"> </el-button>
        <el-button type="default" size="small" icon="el-icon-refresh" @click="refreshList"> </el-button>
      </el-button-group>
    </el-row>
    <el-table :data="dataList" border @selection-change="selectionChangeHandle" v-loading="loading" size="medium" class="table">
      <el-table-column prop="code" show-overflow-tooltip sortable="custom" label="制度编码"> </el-table-column>
      <el-table-column prop="name" show-overflow-tooltip sortable="custom" label="制度名称"> </el-table-column>
      <el-table-column prop="useable" show-overflow-tooltip sortable="custom" label="制度状态">
        <template slot-scope="scope">
          <el-tag :type="scope.row.useable == '0' ? 'danger' : 'success'">
            {{ $dictUtils.getDictLabel('enable_status', scope.row.useable, '') }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="bridgeName" show-overflow-tooltip sortable="custom" label="制度项目">
        <template slot-scope="scope"> {{ scope.row.bridgeName }} {{ scope.row.bridgeBranchName }} </template>
      </el-table-column>
      <el-table-column prop="rate" show-overflow-tooltip sortable="custom" label="制度频率">
        <template slot-scope="scope"> {{ scope.row.rate }}{{ scope.row.rateUnit }} </template>
      </el-table-column>
      <el-table-column prop="orgNames" show-overflow-tooltip sortable="custom" label="巡查组"> </el-table-column>
      <el-table-column prop="createBy.name" show-overflow-tooltip sortable="custom" label="创建人"> </el-table-column>
      <el-table-column prop="createDate" show-overflow-tooltip sortable="custom" label="创建时间"> </el-table-column>
      <el-table-column prop="remark" show-overflow-tooltip sortable="custom" label="备注"> </el-table-column>
      <el-table-column header-align="center" align="center" width="300" label="操作">
        <template slot-scope="scope">
          <el-button type="text" size="small" @click="view(scope.row.id)">查看</el-button>
          <el-button :disabled="scope.row.useable === '1'" type="text" icon="el-icon-edit" size="small" @click="edit(scope.row.id)">修改</el-button>
          <el-button :disabled="scope.row.useable === '1'" type="text" icon="el-icon-delete" size="small" @click="del(scope.row.id)">删除</el-button>
          <el-button type="text" size="small" @click="task(scope.row)">生成任务</el-button>
          <el-button type="text" size="small" :disabled="scope.row.useable === '1'" @click="updateUseable1(scope.row.id)">启用</el-button>
          <el-button type="text" size="small" :disabled="scope.row.useable === '0'" @click="updateUseable0(scope.row.id)">停用</el-button>
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
    <InspectRulesDailyForm ref="inspectRulesDailyForm" @refreshDataList="refreshList"></InspectRulesDailyForm>
    <InspectRulesTaskForm ref="InspectRulesTaskForm" @refreshDataList="refreshList"></InspectRulesTaskForm>
    <InspectRulesDailyDetail ref="inspectRulesDailyDetail"></InspectRulesDailyDetail>
  </div>
</template>

<script>
import InspectRulesDailyForm from './InspectRulesDailyForm';
import InspectRulesTaskForm from './InspectRulesTaskForm';
import InspectRulesDailyDetail from './InspectRulesDailyDetail';
export default {
  data() {
    return {
      treeData: [],
      searchForm: {
        bridgeId: '',
        name: '',
        useable: '',
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
    InspectRulesDailyForm,
    InspectRulesTaskForm,
    InspectRulesDailyDetail,
  },
  activated() {
    this.refreshList();
    this.refreshTree();
  },
  methods: {
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
        url: '/routinerules/inspectRulesRoutine/list',
        method: 'get',
        params: {
          pageNo: this.pageNo,
          pageSize: this.pageSize,
          ...this.searchForm,
        },
      }).then(({ data }) => {
        if (data && data.success) {
          this.dataList = data.page.list;
          this.total = data.page.count;
          this.loading = false;
        }
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
    // 新增
    add() {
      this.$refs.inspectRulesDailyForm.init('add', '');
    },
    //查看
    view(id) {
      this.$refs.inspectRulesDailyDetail.init(id);
    },
    // 修改
    edit(id) {
      this.$refs.inspectRulesDailyForm.init('edit', id);
    },
    task(row) {
      this.$refs.InspectRulesTaskForm.init(row);
    },
    // 删除
    del(id) {
      this.$confirm(`确定删除所选项吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        this.loading = true;
        this.$http({
          url: '/routinerules/inspectRulesRoutine/delete',
          method: 'delete',
          params: { id: id },
        })
          .then(({ data }) => {
            if (data && data.success) {
              this.$message.success(data.msg);
              this.refreshList();
            }
            this.loading = false;
          })
          .catch(() => {
            this.loading = false;
          });
      });
    },
    //启用
    updateUseable1(id) {
      this.$http({
        url: '/routinerules/inspectRulesRoutine/preStartCheck',
        params: { id: id },
      }).then(({ data }) => {
        if (data && data.success) {
          this.$confirm(data.prompt || '确定启用所选项吗?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          }).then(() => {
            this.loading = true;
            this.$http({
              url: '/routinerules/inspectRulesRoutine/updateUseable',
              method: 'post',
              data: { ids: id, useable: 1 },
            })
              .then(({ data }) => {
                if (data && data.success) {
                  this.$message.success(data.msg);
                  this.refreshList();
                }
                this.loading = false;
              })
              .catch(() => {
                this.loading = false;
              });
          });
        }
      });
    },
    //启用/停用
    updateUseable0(id) {
      this.$confirm(`确定停用所选项吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        this.loading = true;
        this.$http({
          url: '/routinerules/inspectRulesRoutine/updateUseable',
          method: 'post',
          data: { ids: id, useable: 0 },
        }).then(({ data }) => {
          if (data && data.success) {
            this.$message.success(data.msg);
            this.refreshList();
          }
          this.loading = false;
        });
      });
    },
    resetSearch() {
      this.$refs.searchForm.resetFields();
      this.refreshList();
    },
  },
};
</script>