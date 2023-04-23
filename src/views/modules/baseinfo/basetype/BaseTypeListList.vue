<template>
  <div>
    <el-form :inline="true" v-show="isSearchCollapse" class="query-form" ref="searchForm" :model="searchForm" @keyup.enter.native="refreshList()" @submit.native.prevent>
      <!-- 搜索框-->
      <el-form-item prop="name">
        <el-input size="small" v-model="searchForm.name" placeholder="名称" clearable></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="refreshList()" size="small">查询</el-button>
        <el-button @click="resetSearch()" size="small">重置</el-button>
      </el-form-item>
    </el-form>
    <el-row>
      <el-button v-if="hasPermission('baseinfo:basetype:baseTypeList:add')" type="primary" size="small" icon="el-icon-plus" @click="add()">新增数据</el-button>
      <!-- <el-button v-if="hasPermission('baseinfo:basetype:baseTypeList:edit')" type="warning" size="small" icon="el-icon-edit-outline" @click="edit()" :disabled="dataListSelections.length != 1" plain
        >编辑参数</el-button
      >
      <el-button v-if="hasPermission('baseinfo:basetype:baseTypeList:del')" type="danger" size="small" icon="el-icon-delete" @click="del()" :disabled="dataListSelections.length <= 0" plain
        >删除参数
      </el-button> -->
      <!-- <el-button v-if="hasPermission('baseinfo:basetype:baseTypeList:start')" type="primary" size="small" icon="el-icon-video-play" @click="start()" :disabled="dataListSelections.length <= 0">启用参数</el-button> -->
      <!-- <el-button v-if="hasPermission('baseinfo:basetype:baseTypeList:end')" type="danger" size="small" icon="el-icon-video-pause" @click="end()" :disabled="dataListSelections.length <= 0">停用参数</el-button> -->
      <el-button-group class="pull-right">
        <el-button type="default" size="small" icon="el-icon-search" @click="(isSearchCollapse = !isSearchCollapse), (isImportCollapse = false)"> </el-button>
        <el-button type="default" size="small" icon="el-icon-refresh" @click="refreshList"> </el-button>
      </el-button-group>
    </el-row>
    <el-table :data="dataList" border v-loading="loading" class="table">
      <el-table-column prop="code" show-overflow-tooltip sortable="custom" label="数据编码">
        <template slot-scope="scope">
          <el-link type="primary" :underline="false" @click="view(scope.row.id)">{{ scope.row.code }}</el-link>
        </template>
      </el-table-column>
      <el-table-column prop="name" show-overflow-tooltip sortable="custom" label="数据名称"> </el-table-column>
      <el-table-column prop="level" show-overflow-tooltip sortable="custom" label="数据层级"> </el-table-column>
      <!-- <el-table-column prop="status" show-overflow-tooltip sortable="custom" label="参数状态">
        <template slot-scope="scope">
          {{ $dictUtils.getDictLabel('enable_status', scope.row.status, '-') }}
        </template>
      </el-table-column> -->
      <el-table-column prop="createBy.name" show-overflow-tooltip sortable="custom" label="创建人"> </el-table-column>
      <el-table-column prop="createDate" show-overflow-tooltip sortable="custom" label="创建日期"> </el-table-column>
      <el-table-column prop="remark" show-overflow-tooltip sortable="custom" label="备注"> </el-table-column>
      <el-table-column fixed="right" header-align="center" align="center" width="200" label="操作">
        <template slot-scope="scope">
          <el-button v-if="hasPermission('baseinfo:basetype:baseTypeList:edit')" type="text" size="small" icon="el-icon-edit" @click="edit(scope.row.id)">修改</el-button>
          <el-button v-if="hasPermission('baseinfo:basetype:baseTypeList:del')" type="text" size="small" icon="el-icon-delete" @click="del(scope.row.id)">删除</el-button>
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
    <BaseTypeListForm ref="baseTypeListForm" @refreshDataList="refreshList"></BaseTypeListForm>
  </div>
</template>

<script>
import BaseTypeListForm from './BaseTypeListForm';
export default {
  data() {
    return {
      searchForm: {
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
    BaseTypeListForm,
  },
  activated() {
    this.refreshList();
  },
  methods: {
    // 获取数据列表
    refreshList() {
      this.loading = true;
      this.$http({
        url: '/baseinfo/basetype/baseTypeList/list',
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
    // 多选
    selectionChangeHandle(val) {
      this.dataListSelections = val;
    },

    // 排序
    sortChangeHandle(obj) {
      if (obj.order === 'ascending') {
        this.orderBy = obj.prop + ' asc';
      } else if (obj.order === 'descending') {
        this.orderBy = obj.prop + ' desc';
      } else {
        this.orderBy = '';
      }
      this.refreshList();
    },
    // 新增
    add() {
      this.$refs.baseTypeListForm.init('add', '');
    },
    // 修改
    edit(id) {
      this.$refs.baseTypeListForm.init('edit', id);
    },
    // 删除
    del(id) {
      this.$http({
        url: '/baseinfo/basetype/baseTypeList/checkBaseType',
        params: { ids: id },
      }).then(({ data }) => {
        if (data && data.success) {
          this.$confirm(`${data.msg == '操作成功' ? `删除基础参数时，基础参数及其下级配置的参数信息也将一起删除，确定删除所选项吗?` : data.msg}`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          }).then(() => {
            this.loading = true;
            this.$http({
              url: '/baseinfo/basetype/baseTypeList/delete',
              method: 'delete',
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
    // 启用参数
    start(id) {
      const flag = this.dataListSelections.find((item) => item.status === '1');
      if (flag) {
        return this.$message.info(`所选基础参数中包含已启用状态，请重新选择`);
      }
      let ids =
        id ||
        this.dataListSelections
          .map((item) => {
            return item.id;
          })
          .join(',');
      this.$confirm(`确定启用所选项吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        this.loading = true;
        this.$http({
          url: '/baseinfo/basetype/baseTypeList/start',
          method: 'get',
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
    // 停用参数
    end(id) {
      const flag = this.dataListSelections.find((item) => item.status === '0');
      if (flag) {
        return this.$message.info(`所选基础参数中包含已停用状态，请重新选择`);
      }
      let ids =
        id ||
        this.dataListSelections
          .map((item) => {
            return item.id;
          })
          .join(',');
      this.$confirm(`停用基础参数时，基础参数及其下级配置的参数信息也将一起停用，确定停用所选项吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        this.loading = true;
        this.$http({
          url: '/baseinfo/basetype/baseTypeList/end',
          method: 'get',
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
