// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {BasePot} from "../src/BasePot.sol";
import {MockUSDC} from "../src/MockUSDC.sol";

interface Vm {
    function envUint(string calldata key) external returns (uint256);
    function startBroadcast(uint256 privateKey) external;
    function stopBroadcast() external;
    function serializeAddress(string calldata objectKey, string calldata valueKey, address value) external returns (string memory);
    function serializeUint(string calldata objectKey, string calldata valueKey, uint256 value) external returns (string memory);
    function writeJson(string calldata json, string calldata path) external;
}

contract DeployLocal {
    address internal constant HEVM_ADDRESS = address(uint160(uint256(keccak256("hevm cheat code"))));
    Vm internal constant vm = Vm(HEVM_ADDRESS);

    function run() external returns (address usdcAddress, address potAddress) {
        uint256 deployerKey = vm.envUint("ANVIL_PRIVATE_KEY");

        vm.startBroadcast(deployerKey);
        MockUSDC usdc = new MockUSDC();
        BasePot pot = new BasePot(address(usdc));
        vm.stopBroadcast();

        string memory root = "deployment";
        vm.serializeAddress(root, "usdc", address(usdc));
        vm.serializeAddress(root, "pot", address(pot));
        string memory json = vm.serializeUint(root, "chainId", block.chainid);

        vm.writeJson(json, "./contracts/deployments/local.json");

        return (address(usdc), address(pot));
    }
}
