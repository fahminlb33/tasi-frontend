<template>
  <div class="container">
    <el-card class="p-0">
      <data-tables
        :data="manufactures"
        :filters="filters"
        :loading="isLoading"
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
        <el-table-column label="Tanggal Selesai">
          <template slot-scope="scope">
            <span style="margin-left: 10px">{{
              scope.row.expectedCompletion | formatDate
            }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Produk">
          <template slot-scope="scope">
            <span size="medium">{{ scope.row.productName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Direncanakan">
          <template slot-scope="scope">
            <span>{{ scope.row.expectedProduce }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Diproduksi">
          <template slot-scope="scope">
            <span size="medium">{{ scope.row.finalProduce }}</span>
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
              title="Apakah Anda yakin akan mereject transaksi ini"
              @confirm="handleDelete(scope.$index, scope.row)"
            >
              <el-button
                slot="reference"
                size="mini"
                icon="el-icon-close"
                type="danger"
                >Tolak</el-button
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
  0: 'Produksi diantrekan.',
  1: 'Produksi sedang dalam proses',
  2: 'Produksi selesai',
  3: 'Produksi Dibatalkan',
}
const order = {
  Queued: 0,
  InProcess: 1,
  Completed: 2,
  Cancelled: 3,
}
export default {
  components: { Toolbar },
  data() {
    return {
      selectedIndex: 0,
      addDrawerShow: false,
      drawerShow: false,
      editDrawerShow: false,
      query: '',
      filters: [{ prop: 'name', value: this.query }],
    }
  },
  computed: {
    ...mapGetters('manufactures', {
      manufactures: 'list',
      isLoading: 'isLoading',
    }),
    ...mapState([
      'route', // vuex-router-sync
    ]),
  },

  async created() {
    await this.$store.dispatch('manufactures/fetchList')
  },
  methods: {
    ...mapActions('manufactures', {
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
        case 'Queued':
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
        case 'Queued':
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
        case 'Queued':
          return 'Diantrikan'
        case 'InProcess':
          return 'Dalam Proses'
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
          return 'Konfirmasi'
        case 'Completed':
          return 'Selesai'
        case 'Cancelled':
          return 'Dibatalkan'
      }
    },
    fetchData() {
      return this.fetchUsers()
    },
    handleDetails(index, row) {
      this.selectedIndex = index
      this.$router.push(`/ops/manufacture/${row.manufactureId}`)
    },
    async handleStepForward(index, row) {
      try {
        const codes = order[row.lastStatus.code] + 1
        if (codes > 2) return
        if (codes === 2) {
          this.$prompt(
            'Mohon masukkan jumlah produksi',
            'Konfirmasi Produksi Selesai',
            {
              confirmButtonText: 'OK',
              cancelButtonText: 'Batal',
              inputPattern: /^[1-9][.\d]*(,\d+)?$/,
              inputErrorMessage: 'Angka tidak valid',
            }
          )
            .then(async ({ value }) => {
              await this.$axios.$post(
                `http://localhost:9000/api/manufacture/${row.manufactureId}/process`,
                { code: codes, message: code[codes], finalProduce: value }
              )
              this.$message({
                type: 'success',
                message: 'Berhasil menyelesaikan produksi',
              })
            })
            .catch(() => {})
          return
        }
        const proses = await this.$axios.$post(
          `http://localhost:9000/api/manufacture/${row.manufactureId}/process`,
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
          `http://localhost:9000/api/manufacture/${row.manufactureId}/process`,
          { code: 4, message: code[4] }
        )
        if (hapus.data) {
          this.$message({
            message: 'Pesanan berhasil dibatalkan.',
            type: 'success',
          })
        }
      } catch (er) {
        this.$message({
          message: er.message,
          type: 'warning',
        })
      }
    },
    handleAdd() {
      this.$router.push('/ops/manufacture/add')
    },
  },
}
</script>
