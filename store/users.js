import createCRUDModule, { client } from 'vuex-crud'

client.interceptors.request.use(
  function (config) {
    const token = localStorage.getItem('auth._token.local')
    config.headers = {
      Authorization: token || '',
    }
    return config
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error)
  }
)

const crudModule = createCRUDModule({
  resource: 'users',
  urlRoot: process.env.baseUrl + '/api/users',
  idAttribute: 'userId',
  parseList(res) {
    const data = res.data.data.data
    return Object.assign({}, res, {
      data, // retrieve array from the json response
    })
  },
  parseSingle(response) {
    const { data } = response.data

    return Object.assign({}, response, {
      data, // expecting object with ID
    })
  },
})
const state = () => crudModule.state

const { actions, mutations, getters } = crudModule

export { state, actions, mutations, getters }
