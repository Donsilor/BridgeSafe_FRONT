<template>
  <div>
      <el-form :inline="true" v-show="isSearchCollapse" class="query-form" ref="searchForm" :model="searchForm" @keyup.enter.native="refreshList()" @submit.native.prevent>
            <!-- 搜索框-->
         <el-form-item prop="bridgeTypeId">
                <el-input size="small" v-model="searchForm.bridgeTypeId" placeholder="桥类型id" clearable></el-input>
         </el-form-item>
         <el-form-item prop="bridgeTypeName">
                <el-input size="small" v-model="searchForm.bridgeTypeName" placeholder="桥类型名" clearable></el-input>
         </el-form-item>
         <el-form-item prop="comp.id">
            <SelectTree
                  ref="comp.id"
                  :props="{
                      value: 'id',             // ID字段名
                      label: 'name',         // 显示名称
                      children: 'children'    // 子级字段名
                    }"
                  size="small"
                  url="/BaseComponent/baseComponent/treeData"
                  :value="searchForm.comp.id"
                  :clearable="true"
                  :accordion="true"
                  @getValue="(value) => {searchForm.comp.id=value}"/>
         </el-form-item>
         <el-form-item prop="compName">
                <el-input size="small" v-model="searchForm.compName" placeholder="构件名" clearable></el-input>
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
              :action="`${this.$http.BASE_URL}/basecompbridgetype/baseCompBridgeType/import`"
              :on-success="uploadSuccess"
               :show-file-list="true">
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">只允许导入“xls”或“xlsx”格式文件！</div>
            </el-upload>
        </el-form-item>
      </el-form>
      <el-row>
        <el-button v-if="hasPermission('basecompbridgetype:baseCompBridgeType:add')" type="primary" size="small" icon="el-icon-plus" @click="add()">新建</el-button>
        <el-button v-if="hasPermission('basecompbridgetype:baseCompBridgeType:edit')" type="warning" size="small" icon="el-icon-edit-outline" @click="edit()"
         :disabled="dataListSelections.length != 1" plain>修改</el-button>
        <el-button v-if="hasPermission('basecompbridgetype:baseCompBridgeType:del')" type="danger"   size="small" icon="el-icon-delete" @click="del()"
                  :disabled="dataListSelections.length <= 0" plain>删除
        </el-button>
        <el-button-group class="pull-right">
            <el-button
              type="default"
              size="small"
              icon="el-icon-search"
              @click="isSearchCollapse = !isSearchCollapse, isImportCollapse=false">
            </el-button>
            <el-button v-if="hasPermission('basecompbridgetype:baseCompBridgeType:import')" type="default" size="small" icon="el-icon-upload2" title="导入" @click="isImportCollapse = !isImportCollapse, isSearchCollapse=false"></el-button>
            <el-button v-if="hasPermission('basecompbridgetype:baseCompBridgeType:export')" type="default" size="small" icon="el-icon-download" title="导出" @click="exportExcel()"></el-button>
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
      size="medium"
      @selection-change="selectionChangeHandle"
      @sort-change="sortChangeHandle"
      v-loading="loading"
      class="table">
      <el-table-column
        type="selection"
        header-align="center"
        align="center"
        width="50">
      </el-table-column>
    <el-table-column
        prop="bridgeTypeId"
        show-overflow-tooltip
        sortable="custom"
        label="桥类型id">
            <template slot-scope="scope">
              <el-link  type="primary" :underline="false" v-if="hasPermission('basecompbridgetype:baseCompBridgeType:edit')" @click="edit(scope.row.id)">{{scope.row.bridgeTypeId}}</el-link>
              <el-link  type="primary" :underline="false" v-else-if="hasPermission('basecompbridgetype:baseCompBridgeType:view')"  @click="view(scope.row.id)">{{scope.row.bridgeTypeId}}</el-link>
              <span v-else>{{scope.row.bridgeTypeId}}</span>
            </template>
      </el-table-column>
    <el-table-column
        prop="bridgeTypeName"
        show-overflow-tooltip
        sortable="custom"
        label="桥类型名">
      </el-table-column>
      <el-table-column
        prop=""
        show-overflow-tooltip
        sortable="custom"
        label="构件id">
      </el-table-column>
    <el-table-column
        prop="compName"
        show-overflow-tooltip
        sortable="custom"
        label="构件名">
      </el-table-column>
    <el-table-column
        prop="remark"
        show-overflow-tooltip
        sortable="custom"
        label="备注">
      </el-table-column>
    <el-table-column
        prop="createBy.id"
        show-overflow-tooltip
        sortable="custom"
        label="创建人">
      </el-table-column>
    <el-table-column
        prop="updateDate"
        show-overflow-tooltip
        sortable="custom"
        label="修改时间">
      </el-table-column>
      <el-table-column
        header-align="center"
        align="center"
        fixed="right"
        width="200"
        label="操作">
        <template  slot-scope="scope">
          <el-button v-if="hasPermission('basecompbridgetype:baseCompBridgeType:view')" type="text" icon="el-icon-view" size="small" @click="view(scope.row.id)">查看</el-button>
          <el-button v-if="hasPermission('basecompbridgetype:baseCompBridgeType:edit')" type="text" icon="el-icon-edit" size="small" @click="edit(scope.row.id)">修改</el-button>
          <el-button v-if="hasPermission('basecompbridgetype:baseCompBridgeType:del')" type="text"  icon="el-icon-delete" size="small" @click="del(scope.row.id)">删除</el-button>
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
    <BaseCompBridgeTypeForm  ref="baseCompBridgeTypeForm" @refreshDataList="refreshList"></BaseCompBridgeTypeForm>
  </div>
</template>

<script>
  import BaseCompBridgeTypeForm from './BaseCompBridgeTypeForm'
  import SelectTree from '@/components/treeSelect/treeSelect.vue'
  export default {
    data () {
      return {
        searchForm: {
          bridgeTypeId: '',
          bridgeTypeName: '',
          comp: {
            id: ''
          },
          compName: ''
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
      SelectTree,
      BaseCompBridgeTypeForm
    },
    activated () {
      this.refreshList()
    },
    methods: {
      // 获取数据列表
      refreshList () {
        this.loading = true
        this.$http({
          url: '/basecompbridgetype/baseCompBridgeType/list',
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
        this.$refs.baseCompBridgeTypeForm.init('add', '')
      },
      // 修改
      edit (id) {
        id = id || this.dataListSelections.map(item => {
          return item.id
        })[0]
        this.$refs.baseCompBridgeTypeForm.init('edit', id)
      },
      // 查看
      view (id) {
        this.$refs.baseCompBridgeTypeForm.init('view', id)
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
            url: '/basecompbridgetype/baseCompBridgeType/delete',
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
        this.$utils.download('/basecompbridgetype/baseCompBridgeType/import/template')
      },
      exportExcel () {
        let params = {
          ...this.searchForm
        }
        this.$utils.download('/basecompbridgetype/baseCompBridgeType/export', params)
      },
      resetSearch () {
        this.$refs.searchForm.resetFields()
        this.refreshList()
      }
    }
  }
</script>