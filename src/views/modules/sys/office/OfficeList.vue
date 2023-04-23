<template>
  <div>
    <el-row>
      <!-- <el-button v-if="hasPermission('sys:office:add')" type="primary" size="small" icon="el-icon-plus" @click="add()">新增</el-button> -->
      <el-button-group class="pull-right">
        <el-button type="default" size="small" icon="el-icon-refresh" @click="refreshList"> </el-button>
      </el-button-group>
    </el-row>
    <el-treetable @selection-change="selectionChangeHandle" :data="dataList" isBigData max-height="1200" isTreeTable size="medium" v-loading="loading" row-key="id" class="table">
      <el-treetable-column prop="name" header-align="center" show-overflow-tooltip align="left" width="200" label="机构名称"> </el-treetable-column>
      <el-treetable-column prop="code" width="150" label="机构编码"> </el-treetable-column>
      <el-treetable-column width="200" prop="property" label="机构性质">
        <template slot-scope="scope">
          {{ $dictUtils.getDictLabel('office_property', scope.row.property) }}
        </template>
      </el-treetable-column>
      <el-treetable-column width="200" prop="type" label="机构类型">
        <template slot-scope="scope">
          {{ $dictUtils.getDictLabel('sys_office_type', scope.row.type) }}
        </template>
      </el-treetable-column>
      <el-treetable-column prop="useable" label="状态">
        <template slot-scope="scope">
          <el-tag :type="scope.row.useable == '0' ? 'danger' : 'success'">
            {{ $dictUtils.getDictLabel('enable_status', scope.row.useable, '停用') }}
          </el-tag>
        </template>
      </el-treetable-column>
      <el-treetable-column prop="area.name" width="200" label="机构位置"> </el-treetable-column>
      <el-treetable-column prop="userName" width="200" label="创建人"> </el-treetable-column>
      <el-treetable-column prop="createDate" width="200" label="创建日期"> </el-treetable-column>
      <el-treetable-column fixed="right" header-align="center" align="center" width="300" label="操作">
        <template slot-scope="scope">
          <!-- <el-button v-if="hasPermission('sys:office:view')" type="text" icon="el-icon-view" size="small" @click="view(scope.row.id)">查看</el-button> -->
          <el-button :disabled="scope.row.useable === '1'" v-if="hasPermission('sys:office:edit')" type="text" icon="el-icon-edit" size="small" @click="edit(scope.row.id)">修改</el-button>
          <el-button :disabled="scope.row.useable === '1'" v-if="hasPermission('sys:office:del')" type="text" icon="el-icon-delete" size="small" @click="del(scope.row.id)">删除</el-button>
          <el-button v-if="hasPermission('sys:office:add')" type="text" icon="el-icon-circle-plus-outline" size="small" @click="addChild(scope.row.id, scope.row.name)">添加下级机构</el-button>
          <el-button :disabled="scope.row.useable === '1'" type="text" size="small" @click="updateUseable(scope.row, '启用')">启用</el-button>
          <el-button :disabled="scope.row.useable === '0'" type="text" size="small" @click="updateUseable(scope.row, '停用')">停用</el-button>
        </template>
      </el-treetable-column>
    </el-treetable>
    <!-- 弹窗, 新增 / 修改 -->
    <OfficeForm ref="officeForm" @refreshDataList="refreshList"></OfficeForm>
  </div>
</template>

<script>
import OfficeForm from './OfficeForm';

export default {
  data() {
    return {
      loading: false,
      dataList: [],
    };
  },
  components: {
    OfficeForm,
  },
  activated() {
    this.refreshList();
  },
  methods: {
    // 多选
    selectionChangeHandle(val) {
      this.dataListSelections = val;
    },
    // 获取数据列表
    refreshList() {
      this.loading = true;
      this.$http({
        url: '/sys/office/treeData',
      }).then(({ data }) => {
        this.dataList = data.treeData;
        this.loading = false;
      });
    },
    // 新增下级
    addChild(id, name) {
      this.$refs.officeForm.init('addChild', { id: '', parent: { id: id, name: name } });
    },
    // 新增
    add() {
      this.$refs.officeForm.init('add', { id: '', parent: { id: '', name: '' } });
    },
    // 修改
    edit(id) {
      this.$refs.officeForm.init('edit', { id: id, parent: { id: '', name: '' } });
    },
    // 查看
    view(id) {
      this.$refs.officeForm.init('view', { id: id, parent: { id: '', name: '' } });
    },
    // 删除
    del(id) {
      this.$confirm(`确定删除该记录吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        this.loading = true;
        this.$http({
          url: '/sys/office/delete',
          method: 'delete',
          params: { id: id },
        }).then(({ data }) => {
          this.loading = false;
          if (data && data.success) {
            this.$message({
              message: data.msg,
              type: 'success',
              duration: 1500,
            });
            this.refreshList();
          }
        });
      });
    },
    updateUseable(row, name) {
      this.$confirm(`是否同步${name}该机构部门的下级机构、部门及用户?`, '提示', {
        distinguishCancelAndClose: true,
        confirmButtonText: '是',
        cancelButtonText: '否',
        type: 'warning',
      })
        .then(() => {
          this.loading = true;
          this.$http({
            url: '/sys/office/updateUseable',
            method: 'post',
            contentType: 'json',
            data: { useable: name === '启用' ? 1 : 0, choseFlag: 1, office: { ...row, children: undefined } },
          }).then(({ data }) => {
            this.loading = false;
            if (data && data.success) {
              this.$message.success(data.msg);
              this.refreshList();
            }
          });
        })
        .catch((action) => {
          if (action === 'cancel') {
            this.loading = true;
            this.$http({
              url: '/sys/office/updateUseable',
              method: 'post',
              contentType: 'json',
              data: { useable: name === '启用' ? 1 : 0, choseFlag: 0, office: { ...row, children: undefined } },
            }).then(({ data }) => {
              this.loading = false;
              if (data && data.success) {
                this.$message.success(data.msg);
                this.refreshList();
              }
            });
          }
        });
    },
  },
};
</script>
