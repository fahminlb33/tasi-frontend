<template>
  <div class="container">
    <el-row :gutter="16">
      <el-col :span="12">
        <el-card shadow="never" :body-style="{ padding: '16px' }">
          <div slot="header">
            <span>Detail Manufaktur</span>
          </div>
          <el-row>
            <el-col :span="12">Hasil yang Direncanakan</el-col>
            <el-col :span="12">{{ data.expectedProduce }}</el-col>
          </el-row>
          <el-row>
            <el-col :span="12">Hasil yang Final</el-col>
            <el-col :span="12">{{ data.finalProduce }}</el-col>
          </el-row>
          <el-divider
            direction="horizontal"
            content-position="left"
          ></el-divider>
          <el-row>
            <el-col :span="12">Tanggal Diubah</el-col>
            <el-col :span="12">{{ data.modifiedDate | formatDate }}</el-col>
          </el-row>
          <el-row>
            <el-col :span="12">Tanggal Estimasi Selesai</el-col>
            <el-col :span="12">{{
              data.expectedCompletion | formatDate
            }}</el-col>
          </el-row>
        </el-card>
        <el-card
          shadow="never"
          style="margin-top: 1em"
          :body-style="{ padding: '0px' }"
        >
          <div slot="header">
            <span>Bahan</span>
          </div>
          <data-tables
            :data="data.materials"
            :loading="$fetchState.pending"
            layout="table"
          >
            <el-table-column label="Nama">
              <template slot-scope="scope">
                {{ scope.row.productName }}
              </template>
            </el-table-column>
            <el-table-column label="Jumlah">
              <template slot-scope="scope">
                {{ scope.row.quantity }}
              </template>
            </el-table-column>
          </data-tables>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never" :body-style="{ padding: '16px' }">
          <div slot="header">
            <span>History</span>
          </div>
          <el-timeline :reverse="true">
            <el-timeline-item
              v-for="item in data.statusHistory"
              :key="item.manufactureStatusId"
              :type="getColorInID(item.code)"
              :timestamp="item.modifiedDate | formatDate"
              placement="top"
              size="normal"
            >
              <el-tag
                :type="getColorInID(item.code)"
                size="medium"
                effect="plain"
              >
                {{ getStatusInID(item.code) }}</el-tag
              >
              {{ item.message }}
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  async asyncData({ params, $axios }) {
    const slug = params.id // Ketika memanggil /abc maka slug akan menjadi "abc"
    const data = await $axios.$get(
      `http://localhost:9000/api/manufacture/${slug}`
    )
    const order = data.data
    return { slug, data: order }
  },
  data() {
    return { products: {} }
  },
  fetch() {
    const products = {}
    if (this.data.materials) {
      this.data.materials.forEach(async (el) => {
        if (!(el.productId in products)) {
          try {
            const pd = await this.$axios.$get(
              `http://localhost:9000/api/products/${el.productId}`
            )
            products[el.productId] = pd.data
          } catch {
            products[el.productId] = ' '
          }
        }
      })
    }
    this.products = products
    this.$forceUpdate()
  },
  methods: {
    getProductById(id) {
      return this.products[id]?.name
    },
    getColorInID(value) {
      switch (value) {
        case 'Queued':
        case 'InProcess':
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
        case 'Queued':
          return 'Proses'
        case 'InProcess':
          return 'Kirim'
        case 'Completed':
          return 'Selesai'
        case 'Cancelled':
          return 'Dibatalkan'
      }
    },
  },
}
</script>

<style></style>
