// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {BasePot} from "../src/BasePot.sol";
import {MockUSDC} from "../src/MockUSDC.sol";

interface Vm {
    function prank(address) external;
    function startPrank(address) external;
    function stopPrank() external;
    function warp(uint256) external;
}

contract BasePotTest {
    address internal constant HEVM_ADDRESS = address(uint160(uint256(keccak256("hevm cheat code"))));
    Vm internal constant vm = Vm(HEVM_ADDRESS);

    address internal organizer = address(0xA11CE);
    address internal recipient = address(0xB0B);
    address internal contributorOne = address(0xCAFE);
    address internal contributorTwo = address(0xD00D);

    MockUSDC internal usdc;
    BasePot internal pot;

    function setUp() public {
        usdc = new MockUSDC();
        pot = new BasePot(address(usdc));

        usdc.mint(contributorOne, 500_000_000);
        usdc.mint(contributorTwo, 500_000_000);

        vm.prank(contributorOne);
        usdc.approve(address(pot), type(uint256).max);

        vm.prank(contributorTwo);
        usdc.approve(address(pot), type(uint256).max);
    }

    function testCreatePot() public {
        vm.prank(organizer);
        uint256 potId = pot.createPot(100_000_000, uint64(block.timestamp + 2 days), recipient);

        (
            address storedOrganizer,
            address storedRecipient,
            uint256 goalAmount,
            uint256 raisedAmount,
            uint64 deadline,
            bool cancelled,
            bool finalized
        ) = pot.getPot(potId);

        assertEq(storedOrganizer, organizer);
        assertEq(storedRecipient, recipient);
        assertEq(goalAmount, 100_000_000);
        assertEq(raisedAmount, 0);
        assertTrue(deadline > block.timestamp);
        assertFalse(cancelled);
        assertFalse(finalized);
    }

    function testContributeAndFinalize() public {
        uint256 potId = _createDefaultPot();

        vm.prank(contributorOne);
        pot.contribute(potId, 40_000_000);

        vm.prank(contributorTwo);
        pot.contribute(potId, 60_000_000);

        vm.prank(organizer);
        pot.finalize(potId);

        assertEq(usdc.balanceOf(recipient), 100_000_000);
    }

    function testCancelAndRefund() public {
        uint256 potId = _createDefaultPot();

        vm.prank(contributorOne);
        pot.contribute(potId, 25_000_000);

        vm.prank(organizer);
        pot.cancelPot(potId);

        uint256 balanceBefore = usdc.balanceOf(contributorOne);

        vm.prank(contributorOne);
        pot.claimRefund(potId);

        assertEq(usdc.balanceOf(contributorOne), balanceBefore + 25_000_000);
    }

    function testExpireAndRefund() public {
        uint256 potId = _createDefaultPot();

        vm.prank(contributorTwo);
        pot.contribute(potId, 20_000_000);

        vm.warp(block.timestamp + 3 days);

        uint256 balanceBefore = usdc.balanceOf(contributorTwo);

        vm.prank(contributorTwo);
        pot.claimRefund(potId);

        assertEq(usdc.balanceOf(contributorTwo), balanceBefore + 20_000_000);
    }

    function _createDefaultPot() internal returns (uint256 potId) {
        vm.prank(organizer);
        potId = pot.createPot(100_000_000, uint64(block.timestamp + 2 days), recipient);
    }

    function assertEq(uint256 left, uint256 right) internal pure {
        require(left == right, "uint mismatch");
    }

    function assertEq(address left, address right) internal pure {
        require(left == right, "address mismatch");
    }

    function assertTrue(bool condition) internal pure {
        require(condition, "expected true");
    }

    function assertFalse(bool condition) internal pure {
        require(!condition, "expected false");
    }
}
