<template>
  <div class="container">
    <el-card class="p-0">
      <data-tables
        :data="orders"
        :filters="filters"
        :total="orders.length"
        :loading="isLoading"
        :page-size="20"
        layout="tool, table, pagination"
      >
        <template #tool>
          <toolbar
            :query="query"
            @addItem="handleAdd()"
            @queryChanged="queryChanged($event)"
          ></toolbar>
        </template>
        <el-table-column label="Tanggal Dibuat">
          <template slot-scope="scope">
            <span style="margin-left: 10px">{{
              scope.row.modifiedDate | formatDate
            }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Tipe">
          <template slot-scope="scope">
            <el-tag size="medium">{{ scope.row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="PIC">
          <template slot-scope="scope">
            <span>{{ scope.row.userFullname }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Supplier">
          <template slot-scope="scope">
            <span>{{ scope.row.supplierName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Harga">
          <template slot-scope="scope">
            <span size="medium">{{ scope.row.subTotal | formatCurrency }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Status Terakhir">
          <template slot-scope="scope">
            {{ getStatusInID(scope.row.lastStatus.code) }}
          </template>
        </el-table-column>
        <el-table-column fixed="right" width="350">
          <template slot="header"> Operasi </template>
          <template slot-scope="scope">
            <el-button
              size="mini"
              icon="el-icon-info"
              plain
              @click="handleDetails(scope.$index + 1, scope.row)"
              >Details</el-button
            >
            <el-button
              size="mini"
              plain
              :type="getColorInID(scope.row.lastStatus.code)"
              :icon="getIconInID(scope.row.lastStatus.code)"
              @click="handleStepForward(scope.$index + 1, scope.row)"
            >
              {{ getNextStep(scope.row.lastStatus.code) }}
            </el-button>
            <el-popconfirm
              v-if="getNextStep(scope.row.lastStatus.code) === 'Kirim'"
              confirm-button-text="Ya"
              cancel-button-text="Tidak"
              icon="el-icon-info"
              icon-color="red"
              title="Apakah Anda yakin akan membatalkan transaksi ini"
              @confirm="handleDelete(scope.$index, scope.row)"
            >
              <el-button
                slot="reference"
                size="mini"
                icon="el-icon-close"
                type="danger"
                >Batal</el-button
              >
            </el-popconfirm>
          </template>
        </el-table-column>
      </data-tables>
    </el-card>
    <el-drawer
      ref="drawer"
      :with-header="false"
      :visible.sync="drawerShow"
      size="40%"
      destroy-on-close
      direction="rtl"
    >
    </el-drawer>
  </div>
</template>

<script>
import { mapGetters, mapState, mapActions } from 'vuex'
import Toolbar from '../../../components/Toolbar.vue'
const code = {
  0: 'Pesanan disimpan dan menunggu diproses',
  1: 'Pesanan sedang di proses',
  2: 'Pesanan dalam pengiriman',
  3: 'Pesanan selesai',
  4: 'Pesanan dibatalkan',
}
const order = {
  Requested: 0,
  InProcess: 1,
  Delivery: 2,
  Completed: 3,
  Cancelled: 4,
}
export default {
  components: { Toolbar },
  data() {
    return {
      addDrawerShow: false,
      drawerShow: false,
      editDrawerShow: false,
      query: '',
      filters: [{ prop: 'name', value: this.query }],
    }
  },
  computed: {
    ...mapGetters('orders', {
      orders: 'list',
      isLoading: 'isLoading',
    }),
    ...mapState([
      'route', // vuex-router-sync
    ]),
  },

  async created() {
    await this.$store.dispatch('orders/fetchList')
    await this.loadData()
  },
  methods: {
    ...mapActions('orders', {
      fetchUsers: 'fetchList',
      deleteUser: 'destroy',
    }),
    OnCompleted() {
      this.$refs.drawer.closeDrawer()
    },
    queryChanged(value) {
      this.filters = [{ prop: 'name', value }]
    },
    getIconInID(value) {
      switch (value) {
        case 'Requested':
        case 'InProcess':
        case 'Delivery':
          return 'el-icon-right'
        case 'Completed':
          return 'el-icon-check'
        case 'Cancelled':
          return 'el-icon-close'
      }
    },
    getColorInID(value) {
      switch (value) {
        case 'Requested':
        case 'InProcess':
        case 'Delivery':
          return 'default'
        case 'Completed':
          return 'success'
        case 'Cancelled':
          return 'danger'
      }
    },
    getStatusInID(value) {
      switch (value) {
        case 'Requested':
          return 'Dipesan'
        case 'InProcess':
          return 'Dalam Proses'
        case 'Delivery':
          return 'Dikirim'
        case 'Completed':
          return 'Selesai'
        case 'Cancelled':
          return 'Dibatalkan'
      }
    },
    getNextStep(value) {
      switch (value) {
        case 'Requested':
          return 'Proses'
        case 'InProcess':
          return 'Kirim'
        case 'Delivery':
          return 'Konfirmasi'
        case 'Completed':
          return 'Selesai'
        case 'Cancelled':
          return 'Dibatalkan'
      }
    },
    ActivateDrawer(key) {
      if (key === 'add') {
        this.editDrawerShow = false
        this.addDrawerShow = true
      } else if (key === 'edit') {
        this.editDrawerShow = true
        this.addDrawerShow = false
      }
      this.drawerShow = true
    },
    fetchData() {
      return this.fetchUsers()
    },
    handleDetails(index, row) {
      this.selectedIndex = index
      this.$router.push(`/ops/orders/${row.orderId}`)
    },
    async loadData(queryInfo) {
      const data = await this.$axios.$get(
        `https://tasi-backend.azurewebsites.net/api/orders`
      )
      this.data = data.data.data
      this.total = data.data.totalPages
      return data
    },
    async handleStepForward(index, row) {
      try {
        const codes = order[row.lastStatus.code] + 1
        if (codes > 3) return
        const proses = await this.$axios.$post(
          `http://localhost:9000/api/orders/${row.orderId}/process`,
          { code: codes, message: code[codes] }
        )
        if (proses) {
          this.$message({
            message: 'Pemindahan proses berhasil.',
            type: 'success',
          })
        }
        this.fetchData()
      } catch (er) {
        this.$message({
          message: er.message,
          type: 'warning',
        })
      }
    },
    async handleDelete(index, row) {
      try {
        const hapus = await this.$axios.$post(
          `http://localhost:9000/api/orders/${row.orderId}/process`,
          { code: 4, message: code[4] }
        )
        if (hapus.data) {
          this.$message({
            message: 'Pesanan berhasil dibatalkan.',
            type: 'success',
          })
        }
        this.fetchData()
      } catch (er) {
        this.$message({
          message: er.message,
          type: 'warning',
        })
      }
    },
    handleAdd() {
      this.$router.push('/ops/orders/add')
    },
  },
}
</script>
