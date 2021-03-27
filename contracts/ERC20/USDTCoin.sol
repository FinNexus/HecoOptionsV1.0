pragma solidity =0.5.16;
import "./FNXCoin.sol";

contract USDTCoin is FNXCoin {
    constructor () public{
        name = "BUSD-T Coin";
        symbol = "BUSD-T";
        decimals = 18;
    }
}
