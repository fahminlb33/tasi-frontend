<template>
  <div class="container">
    <el-row :gutter="20">
      <el-col :span="18">
        <el-card
          class="products-card"
          style="height: calc(100vh - 210px); padding-left: 0.5em"
        >
          <order-toolbar
            @select="OnSelectItem($event)"
            @reset="ResetForm()"
          ></order-toolbar>
          <el-row :gutter="20">
            <el-col :span="24">
              <el-table
                :data="tableData"
                style="
                  height: calc(100vh - 210px);
                  padding-left: 0.5em;
                  width: 100%;
                "
              >
                <el-table-column prop="name" label="Item Name" width="180">
                </el-table-column>
                <el-table-column prop="price" label="Price" width="180">
                  <template slot-scope="scope">
                    <el-tag> Rp. {{ scope.row.price }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="Stok">
                  <template slot-scope="scope">
                    <span>{{ scope.row.stock }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="qty" label="Quantity">
                  <template slot-scope="scope">
                    <el-input-number
                      v-model="scope.row.qty"
                      :min="1"
                      value="1"
                      :max="scope.row.stock"
                      size="mini"
                    ></el-input-number>
                  </template>
                </el-table-column>
                <el-table-column label="Sub Total">
                  <template slot-scope="scope">
                    <span>Rp. {{ scope.row.qty * scope.row.price }}</span>
                  </template>
                </el-table-column>
              </el-table>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
      <el-col :span="6">
        <transition name="el-fade-in">
          <el-card
            class="order__card"
            style="height: calc(100vh - 210px); padding-left: 0.5em"
            ><el-container style="height: 100%">
              <el-header><h1 style="margin-left: 0.5em">Pesanan</h1></el-header>
              <el-main>
                <el-form label-position="left" label-width="130px">
                  <el-form-item label="Product">
                    <el-select
                      v-model="ruleForm.productId"
                      clearable
                      placeholder="Pilih produk"
                      style="width: 90%"
                    >
                      <el-option
                        v-for="item in products"
                        :key="item.productId"
                        :label="item.name"
                        :value="item.productId"
                      >
                      </el-option>
                    </el-select>
                  </el-form-item>

                  <el-form-item label="Quantity">
                    <el-input-number
                      v-model="ruleForm.expectedProduce"
                      size="normal"
                      label="Product"
                      :min="1"
                      :max="100"
                      :step="1"
                      :controls="true"
                      controls-position="right"
                      style="width: 90%"
                    >
                    </el-input-number>
                  </el-form-item>
                  <el-form-item label="Completion (ETA)">
                    <el-date-picker
                      v-model="ruleForm.expectedCompletion"
                      type="date"
                      placeholder="Pilih tanggal"
                      style="width: 90%"
                    >
                    </el-date-picker>
                  </el-form-item>

                  <el-button
                    type="success"
                    icon="el-icon-shopping-cart-full"
                    @click="onOrderClick"
                    >Produksi</el-button
                  >
                </el-form>
              </el-main>
              <el-footer></el-footer>
            </el-container>
          </el-card>
        </transition>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { mapGetters, mapState, mapActions } from 'vuex'
import OrderToolbar from '../../../components/OrderToolbar.vue'

export default {
  components: {
    OrderToolbar,
  },
  data() {
    return {
      products: [],
      tableData: [],
      ruleForm: { expectedProduce: '1', expectedCompletion: '', productId: 0 },
    }
  },
  computed: {
    ...mapGetters('products', {
      productById: 'byId',
      isLoading: 'isLoading',
    }),
    ...mapState([
      'route', // vuex-router-sync
    ]),
    OrderMode() {
      if (this.ruleForm.mode === 'Supplier') {
        return true
      } else {
        return false
      }
    },
  },
  mounted() {
    this.FetchUsers()
    this.FetchSuppliers()
    this.FetchProducts()
  },
  methods: {
    ...mapActions('products', {
      fetchProduct: 'fetchSingle',
    }),
    async onOrderClick() {
      const url = 'https://tasi-backend.azurewebsites.net/api/manufacture'
      const products = []
      if (this.tableData.length === 0) {
        this.$message({
          message: 'Anda harus menambahkan minimal satu item.',
          type: 'information',
        })
        return
      }
      for (let index = 0; index < this.tableData.length; index++) {
        const element = this.tableData[index]
        products.push({ productId: element.productId, quantity: element.qty })
      }
      await this.$axios.$post(url, {
        productId: this.ruleForm.productId,
        expectedProduce: this.ruleForm.expectedProduce,
        expectedCompletion: this.ruleForm.expectedCompletion,
        materials: products,
      })
      this.$message({
        message: 'Berhasil Melakukan Request Produksi.',
        type: 'success',
      })

      this.ResetForm()
    },
    async FetchUsers() {
      const users = await this.$axios.$get(
        `https://tasi-backend.azurewebsites.net/api/users?role=3`
      )
      this.users = users.data.data
    },
    async FetchSuppliers() {
      const suppliers = await this.$axios.$get(
        `https://tasi-backend.azurewebsites.net/api/suppliers`
      )
      this.suppliers = suppliers.data.data
    },
    async FetchProducts() {
      const products = await this.$axios.$get(
        `https://tasi-backend.azurewebsites.net/api/products`
      )
      this.products = products.data.data.filter(
        (x) => x.canManufacture === true
      )
    },
    ResetForm() {
      this.tableData = []
      this.ruleForm = { mode: 'Supplier', user: '', supplier: '' }
    },
    async OnSelectItem(item) {
      try {
        const product = await this.$axios.$get(
          `https://tasi-backend.azurewebsites.net/api/products/${item}`
        )
        const a = this.tableData.find(
          (elem) => elem.barcode === product.data.barcode
        )
        if (
          this.tableData.some((elem) => elem.barcode === product.data.barcode)
        ) {
          a.qty += 1
        } else {
          this.tableData = [...this.tableData, { ...product.data, qty: 1 }]
        }
      } catch {
        this.$message({
          message: 'Gagal mengambil detail produk.',
          type: 'warning',
        })
      }
    },
  },
}
</script>

<style>
.products-card .el-card__body {
  height: calc(100% - 2em);
  padding: 0em;
}
.order__card .el-card__body {
  height: calc(100% - 2em);
  padding: 0em;
  padding-bottom: 1em;
}
</style>
