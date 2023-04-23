<template>
  <div>
    <el-form v-show="isSearchCollapse" class="query-form" :inline="true" ref="searchForm" :model="searchForm"
             @keyup.enter.native="refreshList()" label-position="left" @submit.native.prevent>
      <el-row :gutter="10">
        <el-col :xs="24" :sm="24" :md="24" :lg="20" :xl="20">
          <el-form-item label="桥梁编码" prop="code">
            <el-input size="small" v-model="searchForm.code" placeholder="请输入" clearable></el-input>
          </el-form-item>
          <el-form-item label="桥梁名称" prop="name">
            <el-input size="small" v-model="searchForm.name" placeholder="请输入" clearable></el-input>
          </el-form-item>
          <el-form-item label="结构类型" prop="baseTypeId">
            <SelectTree
              :props="{
                        value: 'id', // ID字段名
                        label: 'name', // 显示名称
                        children: 'children', // 子级字段名
                      }"
              :data="dict.structureTree"
              :value="searchForm.baseTypeId"
              :clearable="false"
              :accordion="true"
              @getValue="
                        (value, label) => {
                          searchForm.baseTypeId = value;
                        }
                      "
            />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select size="small" v-model="searchForm.status">
              <el-option key="" label="全部" value=""></el-option>
              <el-option key="1" label="启用" value="1"></el-option>
              <el-option key="0" label="停用" value="0"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="养护单位" prop="maintainOrg.id">
            <SelectTree
              :props="{
                  value: 'id', // ID字段名
                  label: 'name', // 显示名称
                  children: 'children', // 子级字段名
                }"
              :data="dict.curingList"
              :value="searchForm.maintainOrg.id"
              :clearable="false"
              :accordion="true"
              @getValue="(value) => {
                  searchForm.maintainOrg.id = value
                }"
            />
          </el-form-item>
          <el-form-item label="桥梁位置" prop="positionList">
            <el-cascader
              v-if="!positionLoading"
              style="width: 100%"
              ref="cascader"
              :props="{
                  value: 'id',
                  label: 'name',
                  children: 'children',
                  expandTrigger: 'hover',
                }"
              v-model="searchForm.positionList"
              :options="areaList"
              filterable
            ></el-cascader>
            <i class="el-icon-loading" v-else></i>
          </el-form-item>
          <el-form-item label="养护类别" prop="maintainTypeId">
            <SelectTree
              :props="{
                  value: 'id', // ID字段名
                  label: 'name', // 显示名称
                  children: 'children', // 子级字段名
                }"
              :data="dict.curingTree"
              :value="searchForm.maintainTypeId"
              :clearable="false"
              :accordion="true"
              @getValue="
                  (value) => {
                    searchForm.maintainTypeId = value;
                  }
                "
            />
          </el-form-item>
          <el-form-item label="养护等级" prop="maintainLevelId">
            <SelectTree
              :props="{
                  value: 'id', // ID字段名
                  label: 'name', // 显示名称
                  children: 'children', // 子级字段名
                }"
              :data="dict.curingLevelTree"
              :value="searchForm.maintainLevelId"
              :clearable="false"
              :accordion="true"
              @getValue="
                  (value) => {
                    searchForm.maintainLevelId = value;
                  }
                "
            />
          </el-form-item>
          <el-form-item label="管理单位" prop="manageOrgId">
            <SelectTree
              :props="{
                  value: 'id', // ID字段名
                  label: 'name', // 显示名称
                  children: 'children', // 子级字段名
                }"
              :data="dict.manageList"
              :value="searchForm.manageOrg.id"
              :clearable="false"
              :accordion="true"
              @getValue="
                  (value) => {
                    searchForm.manageOrg.id = value;
                  }
                "
            />
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="refreshList()" size="small">查询</el-button>
          <el-button @click="resetSearch()" size="small">重置</el-button>
        </el-col>
      </el-row>
    </el-form>
    <el-row>
      <el-button type="primary" size="small" @click="addNewBridge()" icon="el-icon-plus"> 新增</el-button>
      <el-button-group class="pull-right">
        <el-tooltip class="item" effect="dark" content="搜索" placement="top">
          <el-button type="default" size="small" icon="el-icon-search"
                     @click="(isSearchCollapse = !isSearchCollapse), (isImportCollapse = false)"></el-button>
        </el-tooltip>
        <el-tooltip class="item" effect="dark" content="刷新" placement="top">
          <el-button type="default" size="small" icon="el-icon-refresh" @click="refreshList"></el-button>
        </el-tooltip>
      </el-button-group>
    </el-row>
    <el-table :data="dataList" border size="medium" v-loading="loading" highlight-current-row
              @current-change="handleCurrentRowChange" class="table">
      <el-table-column width="50" prop="code" type="index" show-overflow-tooltip label="序号"></el-table-column>
      <el-table-column prop="code" show-overflow-tooltip label="桥梁编码"></el-table-column>
      <el-table-column prop="name" show-overflow-tooltip label="桥梁名称"></el-table-column>
      <el-table-column prop="parentFullNames" label="桥梁状态">
        <template slot-scope="scope">
          <span>{{ scope.row.status == 1 ? '启用' : '停用' }}</span>
        </template>
      </el-table-column>
      <el-table-column width="180" prop="bridgeTypeNames" show-overflow-tooltip label="桥梁位置">
        <template slot-scope="scope">
          <span>{{ `${scope.row.provinceName + scope.row.cityName + scope.row.districtName}` }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="baseTypeName" label="结构类型"></el-table-column>
      <el-table-column prop="manageOrg.name" label="管理单位"></el-table-column>
      <el-table-column prop="maintainOrg.name" show-overflow-tooltip label="养护单位"></el-table-column>
      <el-table-column prop="maintainTypeName" label="养护类别"></el-table-column>
      <el-table-column prop="maintainLevelName" label="养护等级"></el-table-column>
      <el-table-column prop="roadLevelName" label="道路等级"></el-table-column>
      <el-table-column prop="designLoadName" label="设计荷载"></el-table-column>
      <el-table-column prop="remark" show-overflow-tooltip label="备注"></el-table-column>
      <el-table-column fixed="right" header-align="center" align="center" width="250" label="操作">
        <template slot-scope="scope">
          <el-button size="text" @click.stop="viewBridge(scope.row)">查看</el-button>
          <el-divider direction="vertical"></el-divider>
          <el-button :disabled="scope.row.status == 1" size="text" @click.stop="editBridge(scope.row)">编辑</el-button>
          <el-divider direction="vertical"></el-divider>
          <el-button :disabled="scope.row.status == 1" size="text" @click="delBridge(scope.row)"> 删除</el-button>
          <el-divider direction="vertical"></el-divider>
          <span>
            <el-switch :value="scope.row.status == 1" @change="toggleStatusSwitch(scope.row)"> </el-switch>
            <span class="switch-label">{{ scope.row.status == 1 ? '启用' : '停用' }}</span>
          </span>
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
    <BridgeEditDialog ref="bridgeEditDialog" :dict="dict" :areaList="areaList" :positionLoading="positionLoading"
                      @refreshDataList="refreshList"/>
    <BridgeDetailDialog ref="bridgeDetailDialog"/>
  </div>
</template>

<script>
import SubBridgeList from './SubBridgeList'
import BridgeImageGroup from './BridgeImageGroup'
import BridgeFileComponent from './BridgeFileComponent'
import BridgeEditDialog from './BridgeEditDialog'
import BridgeDetailDialog from './BridgeDetailDialog'
import SelectTree from '@/components/treeSelect/treeSelect.vue'

const getDefaultSearch = () => ({
  name: '',
  dataSourceId: '',
  manageOrg: {
    id: ''
  },
  maintainOrg: {
    id: ''
  },
  positionList: [],
  maintainTypeId: '',
  maintainLevelId: ''
})

export default {
  data() {
    return {
      isSearchCollapse: false,
      searchForm: getDefaultSearch(),
      areaList: [],
      dict: {
        classificationTree: [], // 档案类型
        buildList: [], // 建设单位
        constructionList: [], // 施工列表
        curingLevelTree: [], // 养护等级
        designloadTree: [], // 设计载荷
        curingList: [], // 养护列表
        curingTree: [], // 养护类型
        designList: [], // 设计列表
        manageList: [], // 管理列表
        roadLevelTree: [], // 道路等级
        structureTree: [], // 结构类型
        supervisorList: [] // 监理列表
      },
      dataList: [],
      activeName: 'tab1',
      pageNo: 1,
      pageSize: 10,
      total: 0,
      loading: false,
      positionLoading: false
    }
  },
  components: {
    SubBridgeList,
    BridgeFileComponent,
    BridgeEditDialog,
    BridgeDetailDialog,
    SelectTree,
    BridgeImageGroup
  },
  methods: {
    // 初始化筛选项等数据
    initDictData() {
      this.$http({
        url: '/bridge/bridge/getCompanyByUserGroup',
        method: 'get'
      }).then(({data}) => {
        this.dict = data.map
      })
    },
    initLocationInfoData() {
      this.positionLoading = true
      this.$http({
        url: '/sys/area/treeData'
      }).then(({data}) => {
        this.positionLoading = false
        if (Array.isArray(data.treeData) && data.treeData.length > 0) {
          this.areaList = data.treeData[0].children
        }
      })
    },
    refreshList() {
      this.loading = true
      const params = {
        ...this.searchForm
      }
      if (Array.isArray(params.positionList) && params.positionList.length === 3) {
        params.positionName = {
          id: params.positionList[2]
        }
        delete params.positionList
      }
      this.$http({
        url: `/bridge/bridge/list`,
        method: 'get',
        params: {
          pageNo: this.pageNo,
          pageSize: this.pageSize,
          ...params
        }
      }).then(({data}) => {
        this.dataList = data.page.list
        this.total = data.page.count
        this.loading = false
      })
    },
    viewBridge(row) {
      this.$refs.bridgeDetailDialog.init(row.id)
    },
    editBridge(row) {
      this.$refs.bridgeEditDialog.init('edit', row.id)
    },
    async delBridge(row) {
      const preResult = await this.$http({
        url: `/bridge/bridge/preDeleteCheck?id=${row.id}`,
        method: 'GET'
      })
      // 如果success为false 则说明强制校验不通过，弹出强提示
      if (!preResult.data.success) {
        this.$alert(preResult.data.msg, '提示', {
          confirmButtonText: '确定'
        })
        return
      }
      // 如果success为true 但是msg超过6个字 说明是弱提升，需要用户来进行选择
      const delMessage = preResult.data.msg.length > 6 ? preResult.data.msg : '确定要删除该桥梁吗?'
      await this.$confirm(delMessage, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      this.loading = true
      const result = await this.$http({
        url: `/bridge/bridge/delete?id=${row.id}`,
        method: 'DELETE'
      })
      this.loading = false
      if (result.data.success) {
        this.$message.success('删除成功！')
        this.refreshList()
      } else {
        this.$alert(result.data.msg, '提示', {
          confirmButtonText: '确定'
        })
      }
    },
    handleClick(tab, event) {
      console.log(tab, event)
    },
    // 每页数
    sizeChangeHandle(val) {
      this.pageSize = val
      this.pageNo = 1
      this.refreshList()
    },
    // 当前页
    currentChangeHandle(val) {
      this.pageNo = val
      this.refreshList()
    },
    async toggleStatusSwitch(row) {
      const {id, status} = row
      if (status == 1) {
        const preResult = await this.$http({
          url: `/bridge/bridge/preEndCheck?id=${id}`,
          method: 'get'
        })
        // 如果success为false 则说明强制校验不通过，弹出强提示
        if (!preResult.data.success) {
          this.$alert(preResult.data.msg, '提示', {
            confirmButtonText: '确定'
          })
          return
        }
        // 如果success为false 但是msg超过6个字 说明是弱提升，需要用户来进行选择
        if (preResult.data.msg.length > 6) {
          await this.$confirm(preResult.data.msg, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          })
        }
      }
      this.loading = true
      const url = status == 0 ? '/bridge/bridge/start' : '/bridge/bridge/end'
      this.$http({
        url: `${url}?id=${id}`,
        method: 'get'
      }).then(({data}) => {
        this.loading = false
        const index = this.dataList.findIndex((item) => item.id === id)
        if (index === -1) {
          return
        }
        this.dataList[index].status = status == 0 ? 1 : 0
      })
    },
    resetSearch() {
      this.$refs.searchForm.resetFields()
      this.searchForm = getDefaultSearch()
      this.refreshList()
    },
    addNewBridge() {
      this.$refs.bridgeEditDialog.init()
    }
  },
  mounted() {
    this.initLocationInfoData()
    this.initDictData()
    this.refreshList()
  }
}
</script>

<style lang="scss">
.switch-label {
  margin-left: 5px;
}

.image-wrapper {
  padding: 20px;
}
</style>
