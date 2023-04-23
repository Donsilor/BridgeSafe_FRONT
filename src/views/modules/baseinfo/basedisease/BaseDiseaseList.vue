<template>
  <div>
    <el-form :inline="true" v-show="isSearchCollapse" class="query-form" ref="searchForm" :model="searchForm" @keyup.enter.native="refreshList()" @submit.native.prevent>
      <!-- 搜索框-->
      <el-form-item prop="name">
        <el-input size="small" v-model="searchForm.name" placeholder="病害类型名称" clearable></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="refreshList()" size="small">查询</el-button>
        <el-button @click="resetSearch()" size="small">重置</el-button>
      </el-form-item>
    </el-form>
    <el-row>
      <el-button v-if="hasPermission('basedisease:baseDisease:add')" type="primary" size="small" icon="el-icon-plus" @click="add()">新建</el-button>
      <el-button-group class="pull-right">
        <el-button type="default" size="small" icon="el-icon-search" @click="(isSearchCollapse = !isSearchCollapse), (isImportCollapse = false)"> </el-button>
        <el-button type="default" size="small" icon="el-icon-refresh" @click="refreshList"> </el-button>
      </el-button-group>
    </el-row>
    <el-table :data="dataList" border v-loading="loading" size="medium" @row-click="rowClick" class="table">
      <el-table-column prop="code" show-overflow-tooltip sortable="custom" label="病害类型编码"> </el-table-column>
      <el-table-column prop="name" show-overflow-tooltip sortable="custom" label="病害类型名称"> </el-table-column>
      <el-table-column prop="baseComponentDiseaseList" show-overflow-tooltip sortable="custom" label="构件类型">
        <template slot-scope="scope">
          {{ scope.row.baseComponentDiseaseList.map((v) => v.compName).join() }}
        </template>
      </el-table-column>
      <el-table-column prop="createUserName" show-overflow-tooltip sortable="custom" label="创建人"> </el-table-column>
      <el-table-column prop="createDate" show-overflow-tooltip sortable="custom" label="创建日期"> </el-table-column>
      <el-table-column prop="remark" show-overflow-tooltip sortable="custom" label="备注"> </el-table-column>
      <el-table-column header-align="center" align="center" width="250" label="操作">
        <template slot-scope="scope">
          <el-button v-if="hasPermission('basedisease:baseDisease:edit')" type="text" icon="el-icon-edit" size="small" @click="edit(scope.row.id)">修改</el-button>
          <el-button v-if="hasPermission('basedisease:baseDisease:del')" type="text" icon="el-icon-delete" size="small" @click="del(scope.row.id)">删除</el-button>
          <el-button type="text" icon="el-icon-setting" size="small" @click="setting(scope.row)">设置构件类型</el-button>
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
    <BaseDiseaseForm ref="baseDiseaseForm" @refreshListAdd="refreshListAdd" @refreshDataList="refreshList" @refreshDataListSub="rowClick"></BaseDiseaseForm>
    <BaseDiseaseTreeForm ref="BaseDiseaseTreeForm" @refreshDataList="refreshList"></BaseDiseaseTreeForm>
    <!-- 子表格 -->
    <div style="color: #409eff">动态属性表</div>
    <el-table :data="dataListSub" border v-loading="loading" size="medium" class="table">
      <el-table-column prop="code" show-overflow-tooltip label="属性编码"> </el-table-column>
      <el-table-column prop="name" show-overflow-tooltip label="属性名称"> </el-table-column>
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
      <el-table-column prop="paramType" show-overflow-tooltip label="属性类型"> </el-table-column>
      <el-table-column prop="paramValue" show-overflow-tooltip label="属性定义"> </el-table-column>
      <el-table-column prop="sort" show-overflow-tooltip label="显示顺序"> </el-table-column>
      <el-table-column prop="remark" show-overflow-tooltip label="备注"> </el-table-column>
      <el-table-column prop="createUserName" show-overflow-tooltip label="创建人"> </el-table-column>
      <el-table-column prop="createDate" show-overflow-tooltip label="创建日期"> </el-table-column>
    </el-table>
  </div>
</template>

<script>
import BaseDiseaseForm from './BaseDiseaseForm';
import BaseDiseaseTreeForm from './BaseDiseaseTreeForm';
export default {
  data() {
    return {
      searchForm: {
        name: '',
      },
      dataList: [],
      dataListSub: [],
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
    BaseDiseaseForm,
    BaseDiseaseTreeForm,
  },
  activated() {
    this.refreshList();
  },
  methods: {
    refreshListAdd() {
      this.loading = true;
      this.$http({
        url: '/basedisease/baseDisease/list',
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
          this.$http({
            url: '/basedisease/baseDisease/listParams',
            method: 'get',
            params: {
              pageNo: 1,
              pageSize: 1000,
              'disease.id': data.page.list[0].id,
            },
          }).then(({ data }) => {
            if (data && data.success) {
              this.dataListSub = data.page.list;
            }
          });
          this.loading = false;
        }
      });
    },
    // 获取数据列表
    refreshList() {
      this.loading = true;
      this.$http({
        url: '/basedisease/baseDisease/list',
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
    //获取子表格列表
    rowClick(row) {
      this.$http({
        url: '/basedisease/baseDisease/listParams',
        method: 'get',
        params: {
          pageNo: 1,
          pageSize: 1000,
          'disease.id': row.id,
        },
      }).then(({ data }) => {
        if (data && data.success) {
          this.dataListSub = data.page.list;
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
      this.$refs.baseDiseaseForm.init('add', '');
    },
    // 修改
    edit(id) {
      id =
        id ||
        this.dataListSelections.map((item) => {
          return item.id;
        })[0];
      this.$refs.baseDiseaseForm.init('edit', id);
    },
    setting(row) {
      this.$refs.BaseDiseaseTreeForm.init(row);
    },
    // 删除
    del(id) {
      this.$http({
        url: '/basedisease/baseDisease/preDeleteCheck',
        params: { diseaseId: id },
      }).then(({ data }) => {
        if (data && data.success) {
          this.$confirm(data.msg == '操作成功' ? `确定删除所选项吗?` : data.msg, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          }).then(() => {
            this.loading = true;
            this.$http({
              url: '/basedisease/baseDisease/delete',
              method: 'post',
              params: { ids: id },
            }).then(({ data }) => {
              if (data && data.success) {
                this.$message.success(data.msg);
                this.refreshList();
              }
              this.loading = false;
            });
          });
        }
      });
    },
    resetSearch() {
      this.$refs.searchForm.resetFields();
      this.refreshList();
    },
  },
};
</script>