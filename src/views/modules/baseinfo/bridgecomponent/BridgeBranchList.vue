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
        <!-- 导入导出-->
      <el-form :inline="true" v-show="isImportCollapse"  class="query-form" ref="importForm">
         <el-form-item>
          <el-button type="default" @click="downloadTpl()" size="small">下载模板</el-button>
         </el-form-item>
         <el-form-item prop="loginName">
            <el-upload
              class="upload-demo"
              :action="`${this.$http.BASE_URL}/bridgecomponent/bridgeBranch/import`"
              :on-success="uploadSuccess"
               :show-file-list="true">
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">只允许导入“xls”或“xlsx”格式文件！</div>
            </el-upload>
        </el-form-item>
      </el-form>
      <el-row>
        <el-button v-if="hasPermission('bridgecomponent:bridgeBranch:add')" type="primary" size="small" icon="el-icon-plus" @click="add()">新建</el-button>
        <el-button v-if="hasPermission('bridgecomponent:bridgeBranch:edit')" type="warning" size="small" icon="el-icon-edit-outline" @click="edit()"
         :disabled="dataListSelections.length != 1" plain>修改</el-button>
        <el-button v-if="hasPermission('bridgecomponent:bridgeBranch:del')" type="danger"   size="small" icon="el-icon-delete" @click="del()"
                  :disabled="dataListSelections.length <= 0" plain>删除
        </el-button>
        <el-button-group class="pull-right">
            <el-button
              type="default"
              size="small"
              icon="el-icon-search"
              @click="isSearchCollapse = !isSearchCollapse, isImportCollapse=false">
            </el-button>
            <el-button v-if="hasPermission('bridgecomponent:bridgeBranch:import')" type="default" size="small" icon="el-icon-upload2" title="导入" @click="isImportCollapse = !isImportCollapse, isSearchCollapse=false"></el-button>
            <el-button v-if="hasPermission('bridgecomponent:bridgeBranch:export')" type="default" size="small" icon="el-icon-download" title="导出" @click="exportExcel()"></el-button>
            <el-button
              type="default"
              size="small"
              icon="el-icon-refresh"
              @click="refreshList">
            </el-button>
        </el-button-group>
      </el-row>
    <el-table
      :data="dataList"
      border
      @selection-change="selectionChangeHandle"
      @sort-change="sortChangeHandle"
      v-loading="loading"
      size="medium"
      @expand-change="detail"
      class="table">
      <el-table-column
        type="selection"
        header-align="center"
        align="center"
        width="50">
      </el-table-column>
      <el-table-column type="expand">
      <template slot-scope="scope">
      <el-tabs>
            <el-tab-pane label="bridge_component">
                  <el-table
                  border
                  size="medium"
                  :data="scope.row.bridgeComponentList"
                  style="width: 100%">
                  <el-table-column
                    prop=""
                    label="构件id">
                  </el-table-column>
                <el-table-column
                    prop="code"
                    show-overflow-tooltip
                    label="编码">
                  </el-table-column>
                <el-table-column
                    prop="name"
                    show-overflow-tooltip
                    label="名称">
                  </el-table-column>
                </el-table>
              </el-tab-pane>
            </el-tabs>
      </template>
      </el-table-column>
    <el-table-column
        prop="bridge.id"
        show-overflow-tooltip
        sortable="custom"
        label="桥梁id">
            <template slot-scope="scope">
              <el-link  type="primary" :underline="false" v-if="hasPermission('bridgecomponent:bridgeBranch:edit')" @click="edit(scope.row.id)">{{scope.row.bridge.id}}</el-link>
              <el-link  type="primary" :underline="false" v-else-if="hasPermission('bridgecomponent:bridgeBranch:view')"  @click="view(scope.row.id)">{{scope.row.bridge.id}}</el-link>
              <span v-else>{{scope.row.bridge.id}}</span>
            </template>
      </el-table-column>
    <el-table-column
        prop="bridgeType.id"
        show-overflow-tooltip
        sortable="custom"
        label="桥梁类型id">
      </el-table-column>
    <el-table-column
        prop="code"
        show-overflow-tooltip
        sortable="custom"
        label="编码">
      </el-table-column>
    <el-table-column
        prop="name"
        show-overflow-tooltip
        sortable="custom"
        label="名称">
      </el-table-column>
    <el-table-column
        prop="remark"
        show-overflow-tooltip
        sortable="custom"
        label="备注">
      </el-table-column>
      <el-table-column
        header-align="center"
        align="center"
        width="200"
        label="操作">
        <template  slot-scope="scope">
          <el-button v-if="hasPermission('bridgecomponent:bridgeBranch:view')" type="text" icon="el-icon-view" size="small" @click="view(scope.row.id)">查看</el-button>
          <el-button v-if="hasPermission('bridgecomponent:bridgeBranch:edit')" type="text" icon="el-icon-edit" size="small" @click="edit(scope.row.id)">修改</el-button>
          <el-button v-if="hasPermission('bridgecomponent:bridgeBranch:del')" type="text"  icon="el-icon-delete" size="small" @click="del(scope.row.id)">删除</el-button>
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
      layout="total, sizes, prev, pager, next, jumper">
    </el-pagination>
        <!-- 弹窗, 新增 / 修改 -->
    <BridgeBranchForm  ref="bridgeBranchForm" @refreshDataList="refreshList"></BridgeBranchForm>
  </div>
</template>

<script>
  import BridgeBranchForm from './BridgeBranchForm'
  export default {
    data () {
      return {
        searchForm: {
          name: ''
        },
        dataList: [],
        pageNo: 1,
        pageSize: 10,
        total: 0,
        orderBy: '',
        dataListSelections: [],
        isSearchCollapse: false,
        isImportCollapse: false,
        loading: false
      }
    },
    components: {
      BridgeBranchForm
    },
    activated () {
      this.refreshList()
    },
    methods: {
      // 获取数据列表
      refreshList () {
        this.loading = true
        this.$http({
          url: '/bridgecomponent/bridgeBranch/list',
          method: 'get',
          params: {
            'pageNo': this.pageNo,
            'pageSize': this.pageSize,
            'orderBy': this.orderBy,
            ...this.searchForm
          }
        }).then(({data}) => {
          if (data && data.success) {
            this.dataList = data.page.list
            this.total = data.page.count
            this.loading = false
          }
        })
      },
      // 每页数
      sizeChangeHandle (val) {
        this.pageSize = val
        this.pageNo = 1
        this.refreshList()
      },
      // 当前页
      currentChangeHandle (val) {
        this.pageNo = val
        this.refreshList()
      },
      // 多选
      selectionChangeHandle (val) {
        this.dataListSelections = val
      },

    // 排序
      sortChangeHandle (obj) {
        if (obj.order === 'ascending') {
          this.orderBy = obj.prop + ' asc'
        } else if (obj.order === 'descending') {
          this.orderBy = obj.prop + ' desc'
        } else {
          this.orderBy = ''
        }
        this.refreshList()
      },
      // 新增
      add () {
        this.$refs.bridgeBranchForm.init('add', '')
      },
      // 修改
      edit (id) {
        id = id || this.dataListSelections.map(item => {
          return item.id
        })[0]
        this.$refs.bridgeBranchForm.init('edit', id)
      },
      // 查看
      view (id) {
        this.$refs.bridgeBranchForm.init('view', id)
      },
      // 删除
      del (id) {
        let ids = id || this.dataListSelections.map(item => {
          return item.id
        }).join(',')
        this.$confirm(`确定删除所选项吗?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.loading = true
          this.$http({
            url: '/bridgecomponent/bridgeBranch/delete',
            method: 'delete',
            params: {'ids': ids}
          }).then(({data}) => {
            if (data && data.success) {
              this.$message.success(data.msg)
              this.refreshList()
            }
            this.loading = false
          })
        })
      },
     // 查看详情
      detail (row) {
        this.$http.get(`/bridgecomponent/bridgeBranch/queryById?id=${row.id}`).then(({data}) => {
          this.dataList.forEach((item, index) => {
            if (item.id === row.id) {
              item.bridgeComponentList = data.bridgeBranch.bridgeComponentList
            }
          })
        })
      },
      // 导入成功
      uploadSuccess (res, file) {
        if (res.success) {
          this.$message.success({dangerouslyUseHTMLString: true,
            message: res.msg})
        } else {
          this.$message.error(res.msg)
        }
      },
      // 下载模板
      downloadTpl () {
        this.$utils.download('/bridgecomponent/bridgeBranch/import/template')
      },
      exportExcel () {
        let params = {
          ...this.searchForm
        }
        this.$utils.download('/bridgecomponent/bridgeBranch/export', params)
      },
      resetSearch () {
        this.$refs.searchForm.resetFields()
        this.refreshList()
      }
    }
  }
</script>