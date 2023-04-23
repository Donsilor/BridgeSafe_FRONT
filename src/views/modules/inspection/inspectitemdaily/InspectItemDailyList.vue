<template>
  <div>
    <el-form :inline="true" v-show="isSearchCollapse" class="query-form" ref="searchForm" :model="searchForm" @keyup.enter.native="refreshList()" @submit.native.prevent>
      <!-- 搜索框-->
      <el-form-item prop="code">
        <el-input size="small" v-model="searchForm.code" placeholder="编码" clearable></el-input>
      </el-form-item>
      <el-form-item prop="name">
        <el-input size="small" v-model="searchForm.name" placeholder="名称" clearable></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="refreshList()" size="small">查询</el-button>
        <el-button @click="resetSearch()" size="small">重置</el-button>
      </el-form-item>
    </el-form>
    <el-row>
      <el-button type="primary" size="small" icon="el-icon-plus" @click="add()">新建</el-button>
      <el-button-group class="pull-right">
        <el-button type="default" size="small" icon="el-icon-search" @click="(isSearchCollapse = !isSearchCollapse), (isImportCollapse = false)"> </el-button>
        <el-button type="default" size="small" icon="el-icon-refresh" @click="refreshList"> </el-button>
      </el-button-group>
    </el-row>
    <el-table :data="dataList" border v-loading="loading" size="medium" class="table">
      <el-table-column prop="code" show-overflow-tooltip sortable="custom" label="巡查项目编码"> </el-table-column>
      <el-table-column prop="name" show-overflow-tooltip sortable="custom" label="巡查项目名称"> </el-table-column>
      <el-table-column prop="count" show-overflow-tooltip sortable="custom" label="构件类型">
        <template slot-scope="scope">
          <el-button type="text" size="small" @click="view(scope.row)">{{ scope.row.count }}</el-button>
        </template>
      </el-table-column>
      <el-table-column prop="createUserName" show-overflow-tooltip sortable="custom" label="创建人"> </el-table-column>
      <el-table-column prop="createDate" show-overflow-tooltip sortable="custom" label="创建时间"> </el-table-column>
      <el-table-column prop="remark" show-overflow-tooltip sortable="custom" label="备注"> </el-table-column>
      <el-table-column header-align="center" align="center" width="200" label="操作">
        <template slot-scope="scope">
          <el-button type="text" icon="el-icon-edit" size="small" @click="edit(scope.row)">修改</el-button>
          <el-button type="text" icon="el-icon-delete" size="small" @click="del(scope.row.id)">删除</el-button>
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
    <InspectItemDailyForm ref="inspectItemDailyForm" @refreshDataList="refreshList"></InspectItemDailyForm>
    <InspectItemDetail ref="inspectItemDetail" @refreshDataList="refreshList"></InspectItemDetail>
  </div>
</template>

<script>
import InspectItemDailyForm from './InspectItemDailyForm';
import InspectItemDetail from './InspectItemDetail';
export default {
  data() {
    return {
      searchForm: {
        code: '',
        name: '',
      },
      dataList: [],
      pageNo: 1,
      pageSize: 10,
      total: 0,
      orderBy: '',
      dataListSelections: [],
      isSearchCollapse: false,
      isImportCollapse: false,
      loading: false,
    };
  },
  components: {
    InspectItemDailyForm,
    InspectItemDetail,
  },
  activated() {
    this.refreshList();
  },
  methods: {
    // 获取数据列表
    refreshList() {
      this.loading = true;
      this.$http({
        url: '/inspectitemdaily/inspectItemDaily/list',
        method: 'get',
        params: {
          pageNo: this.pageNo,
          pageSize: this.pageSize,
          orderBy: this.orderBy,
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
    // 新增
    add() {
      this.$refs.inspectItemDailyForm.init('add', '');
    },
    // 修改
    edit(row) {
      this.$refs.inspectItemDailyForm.init('edit', row);
    },
    //查看构件
    view(row) {
      this.$refs.inspectItemDetail.init(row);
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
          url: '/inspectitemdaily/inspectItemDaily/delete',
          method: 'post',
          params: { ids: ids },
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