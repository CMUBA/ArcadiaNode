# API Documentation

## Basic Services

### Node Service

#### Get Challenge String

- **Name**: Get Challenge String
- **URL**: `/api/v1/node/get-challenge`
- **Method**: GET
- **JWT Required**: No
- **Description**: Get a random challenge string for node registration signature.
  - Generate a random challenge string using crypto.randomBytes()
  - The challenge string is 32 bytes long (64 characters in hex)
  - The challenge string will be used for node registration signature
  - The challenge string is valid for 5 minutes
  - Each challenge can only be used once
  - Challenge strings are stored in memory and cleaned up automatically
- **Response**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {
      "challenge": "string", // 32 bytes hex string
      "expires": "number"    // timestamp in seconds
    }
  }
  ```

#### Register Node
- **Name**: Node Registration
- **URL**: `/api/v1/node/register`
- **Method**: POST
- **JWT Required**: No
- **Description**: Register a new node to the system.
  - 携带参数：1.node 自己的身份凭证（本地使用 ether.js 生成 keypair）或者从其他节点的 user 注册服务获得身份凭证；凭证目前就是公钥，签名消息原体，user wallet address（公钥 hash 后 20 位字节，40 字符）
  - 2.node 的使用私钥对挑战字符串的签名（或者请求 tee 节点的签名服务，报错此节点的私钥）
  - 3.node 的路由注册信息（默认使用域名，例如：https://node.cmuba.org，可以使用 ip 或者 ens）
  - 4. 默认 api url，例如，（https://node.cmuba.org）/api/v1/node/register
  - 执行逻辑：1. 验证签名是否和公钥匹配
  - 2. 验证钱包地址是否和 node 公钥匹配
  - 3. 验证 node 的注册信息是否正确
  - 4. 如果正确，则将 node 的信息注册到合约中，并返回 node 相关信息
  - 5. TODO:注册是一次性的中心化行为，但实际上是添加到了链上合约中，任何人可以通过合约获取你提供的服务，不再依赖中心化注册 server
  - 6. TODO:stake 到一定额度，都可以作为注册 server 对外提供服务，是无需可进入，不是中心化注册 server
  - 7. TODO:注册成功后，node 会获得一个 ens 域名，可以用于其他服务的注册，这个域名可以是自定义的二级域名，也可以是基于 asset3.eth 的三级域名，默认会返还一个三级域名，此服务待开发
  - 8. TODO:初期 service_list 是由 node 提供的 API 接口提供，后期会支持绑定在 ens 上，去中心化的查询
  - 9. TODO:扮演注册 server 的 node，需要同样提供自己的签名（签名注册 node 的 address），合约会验证是否是已经注册的 node 并且是否对要新增注册 node 的地址证明自己确实注册了 node，此签名要在新增 node 注册信息中，加上自己的合约内的 id？
- **Request Headers**:
  ```
  x-node-address: string
  x-node-sign: string
  ```
- **Request Body**:
  ```json
  {
    "node_address": "string", //wallet address
    "node_url": "string", //node domain url
    "api_url": "string", //api url
    "node_ens": "string", //node ens，注册成功会获得 ens
    "node_ip": "string", //node ip
    "node_service_list": "string", //node service list
    "registry_contract_address": "string", // contract address
    "challenge": "string", // challenge string from getChallenge
    "signature": "string" // signature of challenge
  }
  ```
- **Response**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {
      "nodeId": "string",
      "registry_address": "string"
    }
  }
  ```

#### Node Routes List
- **Name**: Node Discovery
- **URL**: `/api/v1/node/routes_list`
- **Method**: POST
- **JWT Required**: No
- **Request Body**:
  ```json
  {
    "nodeId": "string"
  }
  ```
- **Response**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {
      "routes": [
        {
          "nodeId": "string",
          "address": "string"
        }
      ]
    }
  }
  ```

#### Node Heartbeat
- **Name**: Health Check
- **URL**: `/api/v1/node/heartbeat`
- **Method**: POST
- **JWT Required**: No
- **Request Body**:
  ```json
  {
    "nodeId": "string"
  }
  ```
- **Response**:
  ```json
  {
    "code": 0,
    "message": "success",
    "timestamp": "string"
  }
  ```

### Service Discovery

#### Register Service
- **Name**: Service Registration
- **URL**: `/api/v1/service/register`
- **Method**: POST
- **JWT Required**: No
- **Request Body**:
  ```json
  {
    "serviceId": "string",
    "nodeId": "string",
    "type": "string"
  }
  ```
- **Response**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {
      "serviceId": "string"
    }
  }
  ```

#### List Services
- **Name**: Service Discovery
- **URL**: `/api/v1/service/list`
- **Method**: POST
- **JWT Required**: No
- **Request Body**:
  ```json
  {
    "type": "string"
  }
  ```
- **Response**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {
      "services": [
        {
          "serviceId": "string",
          "nodeId": "string",
          "type": "string"
        }
      ]
    }
  }
  ```

### User Service

#### User Registration
- **Name**: User Registration
- **URL**: `/api/v1/user/register`
- **Method**: POST
- **JWT Required**: No
- **Request Body**:
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Response**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {
      "userId": "string",
      "token": "string"
    }
  }
  ```

#### User Login
- **Name**: User Login
- **URL**: `/api/v1/user/login`
- **Method**: POST
- **JWT Required**: No
- **Request Body**:
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Response**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {
      "token": "string"
    }
  }
  ```

## Extended Services

### Game Service

#### Create Hero
- **Name**: Create Hero
- **URL**: `/apiex/v1/game/hero/create`
- **Method**: POST
- **JWT Required**: Yes
- **Request Body**:
  ```json
  {
    "userId": "string",
    "name": "string"
  }
  ```
- **Response**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {
      "heroId": "string"
    }
  }
  ```

#### Load Hero
- **Name**: Load Hero Data
- **URL**: `/apiex/v1/game/hero/load`
- **Method**: POST
- **JWT Required**: Yes
- **Request Body**:
  ```json
  {
    "userId": "string",
    "heroId": "string"
  }
  ```
- **Response**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {
      "hero": {
        "id": "string",
        "name": "string",
        "data": {}
      }
    }
  }
  ```

### Comment Service

#### Add Comment
- **Name**: Add Comment
- **URL**: `/apiex/v1/comment/add`
- **Method**: POST
- **JWT Required**: Yes
- **Request Body**:
  ```json
  {
    "userId": "string",
    "content": "string"
  }
  ```
- **Response**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {
      "commentId": "string"
    }
  }
  ```

### Item Service

#### List Items
- **Name**: List Items
- **URL**: `/apiex/v1/item/list`
- **Method**: GET
- **JWT Required**: Yes
- **Response**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {
      "items": [
        {
          "id": "string",
          "name": "string",
          "type": "string"
        }
      ]
    }
  }
  ```

### Asset Service

#### Issue Asset
- **Name**: Issue Asset
- **URL**: `/apiex/v1/asset/issue`
- **Method**: POST
- **JWT Required**: Yes
- **Request Body**:
  ```json
  {
    "userId": "string",
    "assetType": "string",
    "amount": "number"
  }
  ```
- **Response**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {
      "assetId": "string"
    }
  }
  ```

## Error Codes

- 1000-1999: System Errors
- 2000-2999: Authentication Errors
- 3000-3999: Business Errors
- 4000-4999: Chain Interaction Errors

## Response Format

### Success Response
```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

### Error Response
```json
{
  "code": number,
  "message": "string",
  "details": {}
}
```