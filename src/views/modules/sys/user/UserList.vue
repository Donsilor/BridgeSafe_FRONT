<template>
  <div>
    <el-row :gutter="10">
      <el-col :span="5">
        <el-card shadow="never" :body-style="contentViewHeight">
          <el-tag closable size="small" style="margin-bottom: 5px" v-if="selectOfficeName" :disable-transitions="false" @close="handleNodeClose">
            {{ selectOfficeName }}
          </el-tag>
          <el-input placeholder="输入关键字进行过滤" size="small" v-model="filterText"> </el-input>
          <el-tree
            class="filter-tree"
            :data="officeTreeData"
            :props="{
              value: 'id', // ID字段名
              label: 'name', // 显示名称
              children: 'children', // 子级字段名
            }"
            default-expand-all
            :filter-node-method="filterNode"
            :expand-on-click-node="false"
            @node-click="handleNodeClick"
            ref="officeTree"
          >
          </el-tree>
        </el-card>
      </el-col>
      <el-col :span="19">
        <el-card shadow="never" :body-style="contentViewHeight">
          <el-form :inline="true" v-show="isSearchCollapse" class="query-form" ref="searchForm" :model="searchForm" @keyup.enter.native="refreshList()" @submit.native.prevent>
            <el-form-item prop="loginName">
              <el-input size="small" v-model="searchForm.loginName" placeholder="登录名称" clearable></el-input>
            </el-form-item>
            <el-form-item prop="name">
              <el-input size="small" v-model="searchForm.name" placeholder="用户姓名" clearable></el-input>
            </el-form-item>
            <el-form-item prop="mobile">
              <el-input size="small" v-model="searchForm.mobile" placeholder="手机号" clearable></el-input>
            </el-form-item>
            <el-form-item prop="loginFlag">
              <el-select size="small" v-model="searchForm.loginFlag" placeholder="状态" style="width: 100%">
                <el-option
                  v-for="item in [
                    { name: '启用', value: '1' },
                    { name: '停用', value: '0' },
                  ]"
                  :key="item.value"
                  :label="item.name"
                  :value="item.value"
                >
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="refreshList()" size="small">查询</el-button>
              <el-button @click="resetSearch()" size="small">重置</el-button>
            </el-form-item>
          </el-form>
          <el-row>
            <el-button v-if="hasPermission('sys:user:add')" type="primary" size="small" icon="el-icon-plus" @click="add()">新建</el-button>
            <!-- <el-button v-if="hasPermission('sys:user:edit')" type="warning" size="small" icon="el-icon-edit-outline" @click="edit()" :disabled="dataListSelections.length != 1" plain>修改</el-button>
            <el-button v-if="hasPermission('sys:user:del')" type="danger" size="small" icon="el-icon-delete" @click="del()" :disabled="dataListSelections.length <= 0" plain>删除 </el-button>
            <el-button type="primary" size="small" icon="el-icon-video-play" @click="updateUseable()" :disabled="dataListSelections.length <= 0" plain>启用 </el-button>
            <el-button type="primary" size="small" icon="el-icon-video-pause" @click="updateUseableStop()" :disabled="dataListSelections.length <= 0" plain>停用 </el-button> -->
            <el-button-group class="pull-right">
              <el-tooltip class="item" effect="dark" content="搜索" placement="top">
                <el-button type="default" size="small" icon="el-icon-search" @click="(isSearchCollapse = !isSearchCollapse), (isImportCollapse = false)"> </el-button>
              </el-tooltip>
              <el-tooltip class="item" effect="dark" content="刷新" placement="top">
                <el-button type="default" size="small" icon="el-icon-refresh" @click="refreshList"> </el-button>
              </el-tooltip>
            </el-button-group>
          </el-row>
          <el-table :data="dataList" v-loading="loading" size="medium" class="table">
            <!-- <el-table-column type="selection" header-align="center" align="center" width="50"> </el-table-column> -->
            <!-- <el-table-column prop="photo" header-align="center" align="center" min-width="80" label="头像">
              <template slot-scope="scope">
                <img :src="scope.row.photo === '' ? '/static/img/avatar.png' : scope.row.photo" style="height: 50px" />
              </template>
            </el-table-column> -->
            <el-table-column prop="loginName" sortable="custom" min-width="100" show-overflow-tooltip label="登录名称">
              <template slot-scope="scope">
                <el-link type="primary" :underline="false" v-if="hasPermission('sys:user:edit')" @click="edit(scope.row.id)">{{ scope.row.loginName }}</el-link>
                <el-link type="primary" :underline="false" v-else-if="hasPermission('sys:user:view')" @click="view(scope.row.id)">{{ scope.row.loginName }}</el-link>
                <span v-else>{{ scope.row.loginName }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="name" sortable="custom" min-width="100" show-overflow-tooltip label="用户名称"> </el-table-column>
            <el-table-column prop="mobile" sortable="custom" min-width="100" show-overflow-tooltip label="手机号"> </el-table-column>
            <el-table-column prop="loginFlag" label="状态">
              <template slot-scope="scope">
                <el-tag v-if="scope.row.loginFlag === '1'" size="small" type="success">启用</el-tag>
                <el-tag v-else-if="scope.row.loginFlag === '0'" size="small" type="danger">停用</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="company.name" sortable="custom" min-width="120" show-overflow-tooltip label="公司"> </el-table-column>
            <el-table-column prop="office.name" sortable="custom" min-width="120" show-overflow-tooltip label="部门"> </el-table-column>
            <el-table-column prop="createUserName" sortable="custom" min-width="120" show-overflow-tooltip label="创建人"> </el-table-column>
            <el-table-column prop="createDate" sortable="custom" min-width="120" show-overflow-tooltip label="创建日期"> </el-table-column>
            <el-table-column prop="remarks" sortable="custom" min-width="120" show-overflow-tooltip label="备注"> </el-table-column>
            <el-table-column fixed="right" header-align="center" align="center" width="250" label="操作">
              <template slot-scope="scope">
                <el-button v-if="hasPermission('sys:user:view')" type="text" size="small" icon="el-icon-view" @click="view(scope.row.id)">查看</el-button>
                <el-button :disabled="scope.row.loginFlag === '1'" v-if="hasPermission('sys:user:edit')" type="text" size="small" icon="el-icon-edit" @click="edit(scope.row.id)">修改</el-button>
                <el-button :disabled="scope.row.loginFlag === '1'" v-if="hasPermission('sys:user:del')" type="text" size="small" icon="el-icon-delete" @click="del(scope.row.id)">删除</el-button>
                <el-button :disabled="scope.row.loginFlag === '1'" type="text" size="small" @click="updateUseable(scope.row.id)">启用</el-button>
                <el-button :disabled="scope.row.loginFlag === '0'" type="text" size="small" @click="updateUseableStop(scope.row.id)">停用</el-button>
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
        </el-card>
      </el-col>
    </el-row>

    <!-- 弹窗, 新增 / 修改 -->
    <user-form ref="userForm" @refreshDataList="refreshList"></user-form>
  </div>
</template>

<script>
import UserForm from './UserForm';

export default {
  data() {
    return {
      searchForm: {
        loginName: '',
        name: '',
        mobile: '',
        loginFlag: '',
        company: {
          id: '',
        },
        office: {
          id: '',
        },
      },
      isShow: true,
      filterText: '',
      dataList: [],
      officeTreeData: [],
      pageNo: 1,
      pageSize: 10,
      total: 0,
      orderBy: '',
      dataListSelections: [],
      isSearchCollapse: false,
      isImportCollapse: false,
      loading: false,
      selectOfficeName: '',
    };
  },
  components: {
    UserForm,
  },
  activated() {
    this.refreshTree();
    this.refreshList();
  },
  watch: {
    filterText(val) {
      this.$refs.officeTree.filter(val);
    },
  },
  computed: {
    contentViewHeight() {
      let height = this.$store.state.common.documentClientHeight - 122;
      return { minHeight: height + 'px' };
    },
  },
  methods: {
    filterNode(value, data) {
      if (!value) return true;
      return data.name.indexOf(value) !== -1;
    },
    // 获取数据列表
    refreshList() {
      // 22年11月2日，因组织机构可见范围调整，修改为不选左侧树结点不可以刷新右侧列表，因会看到超范围的人员
      if (this.searchForm.company.id === '' && this.searchForm.office.id === '') {
        return;
      }
      this.loading = true;
      this.$http({
        url: '/sys/user/list',
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
    refreshTree() {
      this.$http({
        url: `/sys/office/treeData`,
        method: 'get',
      }).then(({ data }) => {
        this.officeTreeData = data.treeData;
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
      this.$refs.userForm.init('add', this.searchForm);
    },
    // 修改
    edit(id) {
      id =
        id ||
        this.dataListSelections.map((item) => {
          return item.id;
        })[0];
      this.$refs.userForm.init('edit', id);
    },
    // 查看
    view(id) {
      this.$refs.userForm.init('view', id);
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
          url: '/sys/user/delete',
          method: 'delete',
          params: { ids: ids },
        }).then(({ data }) => {
          this.loading = false;
          if (data && data.success) {
            this.$message.success({ dangerouslyUseHTMLString: true, message: data.msg });
            this.refreshList();
          }
        });
      });
    },
    //用户停用
    updateUseableStop(id) {
      this.$confirm(`确定停用所选项吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        this.loading = true;
        this.$http({
          method: 'post',
          url: '/sys/user/updateUseable',
          params: { ids: id, loginFlag: 0 },
        }).then(({ data }) => {
          this.loading = false;
          if (data && data.success) {
            this.$message.success({ dangerouslyUseHTMLString: true, message: data.msg });
            this.refreshList();
          }
        });
      });
    },
    //用户启用
    updateUseable(id) {
      this.$http({
        method: 'get',
        url: '/sys/user/getRoleIdByUserId',
        params: { ids: id },
      }).then(({ data }) => {
        if (data && data.code == 200) {
          this.$confirm(`${data.msg == '操作成功' ? '确定启用所选项吗?' : data.msg}`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          }).then(() => {
            this.loading = true;
            this.$http({
              method: 'post',
              url: '/sys/user/updateUseable',
              params: { ids: id, loginFlag: 1 },
            }).then(({ data }) => {
              this.loading = false;
              if (data && data.success) {
                this.$message.success({ dangerouslyUseHTMLString: true, message: data.msg });
                this.refreshList();
              }
            });
          });
        }
      });
    },
    handleSuccess(res, file) {
      if (res.success) {
        this.$message.success({ dangerouslyUseHTMLString: true, message: res.msg });
      } else {
        this.$message.error(res.msg);
      }
    },
    handleNodeClick(data) {
      if (data.type === '1') {
        this.searchForm.company.id = data.id;
        this.searchForm.office.id = '';
      } else {
        this.searchForm.company.id = '';
        this.searchForm.office.id = data.id;
      }
      this.selectOfficeName = '已选机构: ' + data.name;
      this.refreshList();
    },
    handleNodeClose() {
      this.searchForm.company.id = '';
      this.searchForm.office.id = '';
      this.selectOfficeName = '';
      this.refreshList();
    },
    resetSearch() {
      this.searchForm.company.id = '';
      this.searchForm.office.id = '';
      this.selectOfficeName = '';
      this.$refs.searchForm.resetFields();
      this.refreshList();
    },
  },
};
</script>
