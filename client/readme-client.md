basic information

client目录是基于nodejs开发的一个对不同合约进行交互测试和信息展示的系统
，
根目录的.env,使用vite来加载和使用变量

目前在开发页面：http://localhost:3008/pages/hero-test.html
我们有nft，metadata和hero合约已经部署（本次测试使用solidity开发的合约，后续会有aptos move合约），地址在env中。
页面要实现
1.查询hero合约中，允许注册hero记录的nft合约列表，显示在页面上
2.如果当前登录钱包地址，经过检查，没有拥有任何nft合约列表中的nft
3.则点击mint nft页面http://localhost:3008/pages/nft-mint.html，选择某个nft合约，支付eth或者指定的erc20代币（env预设了erc20支付接受的地址），mint nft
4.然后用户可以通过持有接受的nft，来注册hero记录，不需要支付


当前遇到的问题
1.如何从hero nft合约获得getAcceptedTokens，就是nft接受哪些代币支付，需要在nft-mint.html页面中查询和显示，然后点击不同button，发起交易，调用钱包支付，mint nft；需要检查nft合约源代码，如果没有这个接口，需要添加，编译，测试，重新部署

2.如何显示hero合约中，接受nft合约列表的对外接口？，在hero合约初始化部署时，已经把第一次部署的nft合约作为第一个接受的nft合约注册到hero合约；这个nft合约地址在env中。目前发现无法调用getRegisteredNFTs，hero合约没有，需要新增这个函数接口，然后编译，测试，发布，从而让nft-mint页面能够获得这个列表，检查登录用户是否拥有注册的nft合约的nft，有就可注册，没有就引导支付mint后再注册等逻辑（上面的逻辑）

3.从合约管理的角度，我们通盘看三个核心合约，是否还需要更多的read接口来展示内部数据情况，大部分write的接口都是核心业务逻辑，请检查合约代码后给出建议