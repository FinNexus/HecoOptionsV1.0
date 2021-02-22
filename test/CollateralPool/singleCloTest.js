
const BN = require("bn.js");
const assert = require('assert');
let month = 10;
let ETH = "0x0000000000000000000000000000000000000000";
let {migration ,createAndAddErc20,createAndAddUSDC,AddCollateral0} = require("../testFunction.js");
contract('OptionsManagerV2', function (accounts) {
    let contracts;
    let ethAmount = new BN("10000000000000000000");
    let usdcAmount = 10000000000;

    let payamount = new BN("100000000000000000000");
    let optamount = new BN("2000000000000000000");

    let FNXAmount =  new BN("100000000000000000000");;
    before(async () => {
        contracts = await migration(accounts);
        await AddCollateral0(contracts);
        await createAndAddErc20(contracts);
        await createAndAddUSDC(contracts);
        contracts.FPT.setTimeLimitation(0);
    });

    it('USDC input and redeem', async function () {
        await contracts.USDC.approve(contracts.manager.address, usdcAmount);
        let preBalanceUser0 =await  contracts.USDC.balanceOf(accounts[0]);
        let preBalanceContract =await  contracts.USDC.balanceOf(contracts.collateral.address);
        await contracts.USDC.approve(contracts.manager.address, usdcAmount);
        let tx = await contracts.manager.addCollateral(contracts.USDC.address, usdcAmount);
        assert.equal(tx.receipt.status,true);
        let afterBalanceUser0 =await  contracts.USDC.balanceOf(accounts[0]);
        let afterBalanceContract =await  contracts.USDC.balanceOf(contracts.collateral.address);
        let diffUser = preBalanceUser0.sub(afterBalanceUser0);
        let diffContract = afterBalanceContract.sub(preBalanceContract);
        assert.equal(diffUser.toNumber(),usdcAmount,"user usdc balance error");
        assert.equal(diffUser.toNumber(),diffContract.toNumber(),"manager usdc balance error");

        for (var i=0;i<30;i++){
            await  contracts.FNX.balanceOf(contracts.collateral.address);
        }
        preBalanceUser0 =await  contracts.USDC.balanceOf(accounts[0]);
        preBalanceContract =await  contracts.USDC.balanceOf(contracts.collateral.address);
        let result = await contracts.FPT.balanceOf(accounts[0]);
        await contracts.manager.redeemCollateral(result,contracts.FNX.address);
        afterBalanceUser0 =await  contracts.USDC.balanceOf(accounts[0]);
        afterBalanceContract =await  contracts.USDC.balanceOf(contracts.collateral.address);
        diffUser = afterBalanceUser0.sub(preBalanceUser0);
        diffContract = preBalanceContract.sub(afterBalanceContract);
        assert.equal(diffUser.toNumber(),usdcAmount,"user redeem usdc balance error");
        assert.equal(diffUser.toNumber(),diffContract.toNumber(),"manager redeem usdc balance error");

        result = await contracts.FPT.balanceOf(accounts[0]);
        assert.equal(result,0,"the rest balance is not zero")
    })

    it('FNX input and redeem', async function () {
        await contracts.FNX.approve(contracts.manager.address, FNXAmount);
        let preBalanceUser0 =await  contracts.FNX.balanceOf(accounts[0]);
        let preBalanceContract =await  contracts.FNX.balanceOf(contracts.collateral.address);
        let tx = await contracts.manager.addCollateral(contracts.FNX.address, FNXAmount);
        assert.equal(tx.receipt.status,true);
        let afterBalanceUser0 =await  contracts.FNX.balanceOf(accounts[0]);
        let afterBalanceContract =await  contracts.FNX.balanceOf(contracts.collateral.address);
        let diffUser = preBalanceUser0.sub(afterBalanceUser0);
        let diffContract = afterBalanceContract.sub(preBalanceContract);
        assert.equal(diffUser.toString(10),FNXAmount.toString(10),"user FNX balance error");
        assert.equal(diffUser.toString(10),diffContract.toString(10),"manager FNX balance error");


        preBalanceUser0 =await  contracts.FNX.balanceOf(accounts[0]);
        preBalanceContract =await  contracts.FNX.balanceOf(contracts.collateral.address);
        let result = await contracts.FPT.balanceOf(accounts[0]);
        for (var i=0;i<30;i++){
            await  contracts.FNX.balanceOf(contracts.collateral.address);
        }
        await contracts.manager.redeemCollateral(result,contracts.FNX.address);
        afterBalanceUser0 =await  contracts.FNX.balanceOf(accounts[0]);
        afterBalanceContract =await  contracts.FNX.balanceOf(contracts.collateral.address);
        diffUser = afterBalanceUser0.sub(preBalanceUser0);
        diffContract = preBalanceContract.sub(afterBalanceContract);
        assert.equal(diffUser.toString(10),FNXAmount.toString(10),"user redeem FNX balance error");
        assert.equal(diffUser.toString(10),diffContract.toString(10),"manager redeem FNX balance error");

        result = await contracts.FPT.balanceOf(accounts[0]);
        assert.equal(result,0,"the rest balance is not zero")
    })
    it('ETH input and redeem', async function () {

        let preBalanceUser0 =await  web3.eth.getBalance(accounts[0]);
        preBalanceUser0 = web3.utils.fromWei(preBalanceUser0, "ether");
        let preBalanceContract =await  web3.eth.getBalance(contracts.collateral.address);
        preBalanceContract = web3.utils.fromWei(preBalanceContract, "ether");
        console.log(preBalanceUser0.toString(10));


        let tx = await contracts.manager.addCollateral(ETH,ethAmount,{from:accounts[0],value:ethAmount});
        assert.equal(tx.receipt.status,true);

        let afterBalanceUser0 =await web3.eth.getBalance(accounts[0]);
        afterBalanceUser0 = web3.utils.fromWei(afterBalanceUser0, "ether");
        let afterBalanceContract =await  web3.eth.getBalance(contracts.collateral.address);
        afterBalanceContract = web3.utils.fromWei(afterBalanceContract, "ether");

        diffUser = preBalanceUser0 - afterBalanceUser0;
        console.log("user lose " + diffUser.toString(10));
        let diffContract = afterBalanceContract - preBalanceContract;
        console.log("contract get " + diffContract.toString(10));

        assert.equal(diffContract.toString(10), web3.utils.fromWei(ethAmount, "ether"),"user ETH balance error");

        preBalanceUser0 =await  web3.eth.getBalance(accounts[0]);
        preBalanceUser0 = web3.utils.fromWei(preBalanceUser0, "ether");
        preBalanceContract =await  web3.eth.getBalance(contracts.collateral.address);
        preBalanceContract = web3.utils.fromWei(preBalanceContract, "ether");

        let result = await contracts.FPT.balanceOf(accounts[0]);
        for (var i=0;i<30;i++){
            await  contracts.FNX.balanceOf(contracts.collateral.address);
        }
        tx = await contracts.manager.redeemCollateral(result,contracts.FNX.address);
        assert.equal(tx.receipt.status,true);
        afterBalanceUser0 =await web3.eth.getBalance(accounts[0]);
        afterBalanceUser0 = web3.utils.fromWei(afterBalanceUser0, "ether");
        afterBalanceContract =await  web3.eth.getBalance(contracts.collateral.address);
        afterBalanceContract = web3.utils.fromWei(afterBalanceContract, "ether");

        diffUser = afterBalanceUser0 - preBalanceUser0;
        diffContract = preBalanceContract - afterBalanceContract;
        console.log("user get"+diffUser.toString(10));
        console.log("contract lose" + diffContract.toString(10));
        assert(diffUser+0.2>web3.utils.fromWei(ethAmount, "ether"),true,"user eth balance error");
        assert.equal(diffContract.toString(10), web3.utils.fromWei(ethAmount, "ether"),"contract ETH balance error");

        result = await contracts.FPT.balanceOf(accounts[0]);
        assert.equal(result,0,"the rest balance is not zero")
    })
})