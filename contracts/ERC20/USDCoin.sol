pragma solidity =0.5.16;
import "./FNXCoin.sol";

contract BUSDCoin is FNXCoin {

    constructor () public{
        name = "USDC Coin";
        symbol = "BUSD";
        decimals = 18;
    }
}
