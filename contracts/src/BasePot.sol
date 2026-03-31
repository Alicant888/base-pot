// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IERC20Like {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

contract BasePot {
    enum PotStatus {
        ACTIVE,
        FUNDED,
        FINALIZED,
        CANCELLED,
        EXPIRED,
        REFUNDABLE
    }

    struct Pot {
        address organizer;
        address recipient;
        uint64 deadline;
        uint256 goalAmount;
        uint256 raisedAmount;
        bool cancelled;
        bool finalized;
    }

    IERC20Like public immutable usdc;
    uint256 public nextPotId = 1;

    mapping(uint256 => Pot) private pots;
    mapping(uint256 => mapping(address => uint256)) public contributions;

    error AmountMustBePositive();
    error DeadlineMustBeInFuture();
    error GoalMustBePositive();
    error InvalidRecipient();
    error NotOrganizer();
    error PotAlreadyFinalized();
    error PotAlreadyCancelled();
    error PotExpired();
    error PotNotFound();
    error RefundUnavailable();
    error NothingToRefund();
    error GoalNotMet();
    error TransferFailed();

    event PotCreated(
        uint256 indexed potId,
        address indexed organizer,
        address indexed recipient,
        uint256 goalAmount,
        uint64 deadline
    );
    event ContributionReceived(
        uint256 indexed potId,
        address indexed contributor,
        uint256 amount,
        uint256 totalRaised
    );
    event PotFinalized(uint256 indexed potId, address indexed recipient, uint256 amount);
    event PotCancelled(uint256 indexed potId, address indexed organizer);
    event RefundClaimed(uint256 indexed potId, address indexed contributor, uint256 amount);

    constructor(address usdcAddress) {
        if (usdcAddress == address(0)) revert InvalidRecipient();
        usdc = IERC20Like(usdcAddress);
    }

    function createPot(uint256 goalAmount, uint64 deadline, address recipient) external returns (uint256 potId) {
        if (goalAmount == 0) revert GoalMustBePositive();
        if (deadline <= block.timestamp) revert DeadlineMustBeInFuture();
        if (recipient == address(0)) revert InvalidRecipient();

        potId = nextPotId++;
        pots[potId] = Pot({
            organizer: msg.sender,
            recipient: recipient,
            deadline: deadline,
            goalAmount: goalAmount,
            raisedAmount: 0,
            cancelled: false,
            finalized: false
        });

        emit PotCreated(potId, msg.sender, recipient, goalAmount, deadline);
    }

    function contribute(uint256 potId, uint256 amount) external {
        if (amount == 0) revert AmountMustBePositive();

        Pot storage pot = _requirePot(potId);
        if (pot.finalized) revert PotAlreadyFinalized();
        if (pot.cancelled) revert PotAlreadyCancelled();
        if (block.timestamp >= pot.deadline) revert PotExpired();

        contributions[potId][msg.sender] += amount;
        pot.raisedAmount += amount;

        bool success = usdc.transferFrom(msg.sender, address(this), amount);
        if (!success) revert TransferFailed();

        emit ContributionReceived(potId, msg.sender, amount, pot.raisedAmount);
    }

    function finalize(uint256 potId) external {
        Pot storage pot = _requirePot(potId);
        if (pot.organizer != msg.sender) revert NotOrganizer();
        if (pot.finalized) revert PotAlreadyFinalized();
        if (pot.cancelled) revert PotAlreadyCancelled();
        if (pot.raisedAmount < pot.goalAmount) revert GoalNotMet();

        pot.finalized = true;

        bool success = usdc.transfer(pot.recipient, pot.raisedAmount);
        if (!success) revert TransferFailed();

        emit PotFinalized(potId, pot.recipient, pot.raisedAmount);
    }

    function cancelPot(uint256 potId) external {
        Pot storage pot = _requirePot(potId);
        if (pot.organizer != msg.sender) revert NotOrganizer();
        if (pot.finalized) revert PotAlreadyFinalized();
        if (pot.cancelled) revert PotAlreadyCancelled();

        pot.cancelled = true;

        emit PotCancelled(potId, msg.sender);
    }

    function claimRefund(uint256 potId) external {
        Pot storage pot = _requirePot(potId);
        uint256 contributed = contributions[potId][msg.sender];

        if (!_isRefundable(pot)) revert RefundUnavailable();
        if (contributed == 0) revert NothingToRefund();

        contributions[potId][msg.sender] = 0;
        pot.raisedAmount -= contributed;

        bool success = usdc.transfer(msg.sender, contributed);
        if (!success) revert TransferFailed();

        emit RefundClaimed(potId, msg.sender, contributed);
    }

    function getPot(uint256 potId)
        external
        view
        returns (
            address organizer,
            address recipient,
            uint256 goalAmount,
            uint256 raisedAmount,
            uint64 deadline,
            bool cancelled,
            bool finalized
        )
    {
        Pot storage pot = _requirePot(potId);
        return (
            pot.organizer,
            pot.recipient,
            pot.goalAmount,
            pot.raisedAmount,
            pot.deadline,
            pot.cancelled,
            pot.finalized
        );
    }

    function getPotStatus(uint256 potId) external view returns (PotStatus) {
        Pot storage pot = _requirePot(potId);

        if (pot.finalized) {
            return PotStatus.FINALIZED;
        }

        if (pot.cancelled) {
            return pot.raisedAmount > 0 ? PotStatus.REFUNDABLE : PotStatus.CANCELLED;
        }

        if (block.timestamp >= pot.deadline && pot.raisedAmount < pot.goalAmount) {
            return pot.raisedAmount > 0 ? PotStatus.REFUNDABLE : PotStatus.EXPIRED;
        }

        if (pot.raisedAmount >= pot.goalAmount) {
            return PotStatus.FUNDED;
        }

        return PotStatus.ACTIVE;
    }

    function _isRefundable(Pot storage pot) internal view returns (bool) {
        return pot.cancelled || (block.timestamp >= pot.deadline && pot.raisedAmount < pot.goalAmount);
    }

    function _requirePot(uint256 potId) internal view returns (Pot storage pot) {
        pot = pots[potId];
        if (pot.organizer == address(0)) revert PotNotFound();
    }
}

