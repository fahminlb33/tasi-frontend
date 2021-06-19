<template>
  <el-row style="padding: 0.5em" :gutter="16">
    <el-col :xs="18" :sm="16" :md="12" :lg="10" :xl="8">
      <el-autocomplete
        v-model="state"
        :fetch-suggestions="querySearch"
        value-key="productId"
        placeholder="Scan barcode / tambahkan produk"
        size="medium"
        style="width: 100%"
        @select="handleSelect"
      >
        <i
          slot="suffix"
          class="el-icon-search el-input__icon"
          @click="handleIconClick"
        >
        </i>
        <template slot-scope="{ item }">
          <div style="display: flex; flex-orientation: column; gap: 1em">
            <el-tag>{{ item.productId }}</el-tag>
            <div class="value">{{ item.name }}</div>
          </div>
        </template>
      </el-autocomplete>
    </el-col>
    <el-col :xs="0" :sm="2" :md="6" :lg="10" :xl="12"><br /></el-col>
    <el-col :xs="6" :sm="6" :md="6" :lg="4" :xl="4"
      ><el-button size="medium" style="width: 100%" @click="$emit('reset', '')">
        Reset
      </el-button></el-col
    >
  </el-row>
</template>
<script>
import { mapGetters, mapState, mapActions } from 'vuex'
export default {
  name: 'OrderToolbar',
  data() {
    return {
      value: '',
      links: [],
      state: '',
    }
  },
  computed: {
    ...mapGetters('products', {
      products: 'list',
      isLoading: 'isLoading',
    }),
    ...mapState([
      'route', // vuex-router-sync
    ]),
  },
  async created() {
    await this.$store.dispatch('products/fetchList')
  },
  mounted() {
    this.links = this.fetchData()
  },
  methods: {
    ...mapActions('products', {
      fetchProducts: 'fetchList',
      deleteProduct: 'destroy',
    }),
    fetchData() {
      return this.fetchProducts()
    },
    querySearch(queryString, cb) {
      const products = this.products
      if (products) {
        const results = queryString
          ? products.filter(this.createFilter(queryString))
          : products
        // call callback function to return suggestion objects

        clearTimeout(this.timeout)
        this.timeout = setTimeout(() => {
          cb(results)
        }, 30)
      } else {
        const results = {}
        cb(results)
      }
    },
    createFilter(queryString) {
      return (link) => {
        if (link && link.name) {
          return (
            link.name.toLowerCase().indexOf(queryString.toLowerCase()) === 0 &&
            link.canManufacture === false
          )
        } else {
          return true
        }
      }
    },
    handleSelect(item) {
      this.$emit('select', item.productId)
      this.value = ''
      this.state = ''
    },
    handleIconClick(ev) {
      console.log(ev)
    },
  },
}
</script>
<style></style>
